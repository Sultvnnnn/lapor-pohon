"""
    This directory is specifically for storing core logic,
    including AI engine loading and inference processes.
    Now enhanced with Dual-YOLO loading for Tree Detection 
    and Human Calibration.
"""

from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import time
import urllib.request
import os
import torch
import gc

from services.metrics_calculator import calculate_all_metrics

print("[INFO] Initiating global memory allocation for models...")

#! LOAD MODEL 1: TREE DETECTOR (YOLOv8)
TREE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "model_v4_1.pt")
try:
    tree_model = YOLO(TREE_MODEL_PATH)
    print(f"[SUCCESS] Tree detection model successfully loaded from {TREE_MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Failed to load the tree detection model. Details: {e}")
    tree_model = None

#! LOAD MODEL 2: HUMAN DETECTOR (Pre-trained COCO)
PERSON_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")
try:
    person_model = YOLO(PERSON_MODEL_PATH)
    print(f"[SUCCESS] Human calibration model successfully loaded from {PERSON_MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Failed to load the human calibration model. Details: {e}")
    person_model = None

def run_inference(image_url: str) -> dict:
    if tree_model is None:
        raise RuntimeError("[ERROR] The primary tree detection model is unavailable or failed to initialize.")

    try:
        # Matikan kalkulasi gradien PyTorch untuk menghemat RAM secara drastis
        with torch.no_grad():
            t0 = time.time()
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=10)
            image_bytes = response.read()
            t1 = time.time()
            print(f"[TIMING] Image download completed in {t1 - t0:.2f} seconds.")

            image = Image.open(BytesIO(image_bytes))
            image_width_px, image_height_px = image.width, image.height
            t2 = time.time()
            print(f"[TIMING] Image decoding ({image_width_px}x{image_height_px}) completed in {t2 - t1:.2f} seconds.")

            #! INFERENSI 1: CARI POHON (imgsz dinaikkan ke 640 untuk resolusi HD)
            tree_results = tree_model.predict(
                image,
                conf=0.4,
                imgsz=640, 
                max_det=5,
                device="cpu",
            )
            t3 = time.time()
            print(f"[TIMING] Tree inference completed in {t3 - t2:.2f} seconds.")

            tree_boxes = tree_results[0].boxes
            print(f"[INFO] Total tree objects detected: {len(tree_boxes)}")

            if len(tree_boxes) == 0:
                # Bersihkan memori sebelum return jika pohon tidak ditemukan
                del tree_results
                gc.collect()
                return {
                    "risk_score": 0.0,
                    "canopy_volume": 0.0,
                    "biomass_estimate": 0.0,
                    "detections": 0,
                    "bounding_boxes": [],
                    "status": "no_tree_detected",
                    "calibration_method": "none"
                }

            # Ambil pohon terbesar (fokus utama)
            xywh_all = tree_boxes.xywh.tolist()
            confidences = tree_boxes.conf.tolist()
            areas = [w * h for (_, _, w, h) in xywh_all]
            main_idx = areas.index(max(areas))
            main_tree_box = xywh_all[main_idx]

            tree_bbox_data = {
                "x_center": float(main_tree_box[0]),
                "y_center": float(main_tree_box[1]),
                "width_px": float(main_tree_box[2]),
                "height_px": float(main_tree_box[3])
            }

            #! INFERENSI 2: CARI MANUSIA (KALIBRASI)
            person_bboxes = []
            normalized_person_boxes = []
            if person_model is not None:
                person_results = person_model.predict(
                    image,
                    conf=0.25,
                    imgsz=640,
                    classes=[0], 
                    device="cpu"
                )
                t4 = time.time()
                print(f"[TIMING] Human calibration inference completed in {t4 - t3:.2f} seconds.")
                
                p_boxes = person_results[0].boxes
                for box in p_boxes:
                    px, py, pw, ph = box.xywh[0].tolist()
                    p_conf = float(box.conf[0].item()) if hasattr(box.conf[0], 'item') else float(box.conf[0])
                    
                    person_bboxes.append({
                        "x_center": float(px),
                        "y_center": float(py),
                        "width_px": float(pw),
                        "height_px": float(ph)
                    })

                    normalized_person_boxes.append({
                        "x": round((px - pw / 2) / image_width_px, 4),
                        "y": round((py - ph / 2) / image_height_px, 4),
                        "width": round(pw / image_width_px, 4),
                        "height": round(ph / image_height_px, 4),
                        "confidence": round(p_conf, 3),
                        "label": "person",
                        "x_center": float(px),
                        "y_center": float(py),
                        "width_px": float(pw),
                        "height_px": float(ph)
                    })
                
                # Hapus variabel hasil person_model dari memori
                del person_results

            #! HITUNG METRIK EKOLOGI
            metrics = calculate_all_metrics(
                tree_bbox=tree_bbox_data,
                person_bboxes=person_bboxes,
                image_width_px=image_width_px,
                image_height_px=image_height_px
            )

            # Format bounding boxes untuk dikirim ke frontend
            bounding_boxes = []
            for (cx, cy, w, h), conf in zip(xywh_all, confidences):
                bounding_boxes.append({
                    "x": round((cx - w / 2) / image_width_px, 4),
                    "y": round((cy - h / 2) / image_height_px, 4),
                    "width": round(w / image_width_px, 4),
                    "height": round(h / image_height_px, 4),
                    "confidence": round(conf, 3),
                    "label": "tree"
                })

            avg_confidence = sum(confidences) / len(confidences)

            response_data = {
                **metrics,
                "detections": len(tree_boxes),
                "avg_confidence": round(avg_confidence, 3),
                "bounding_boxes": bounding_boxes,
                "person_boxes": normalized_person_boxes if len(normalized_person_boxes) > 0 else person_bboxes,
                "status": "success"
            }

            # Bersihkan variabel besar dan paksa garbage collector berjalan
            del tree_results
            del image
            gc.collect()

            return response_data

    except Exception as e:
        print(f"[ERROR] A critical failure occurred during image inference processing. Details: {e}")
        raise e