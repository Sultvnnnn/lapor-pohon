"""
    This directory is specifically for storing core logic,
    including AI engine loading and inference processes.
    Hybrid Memory Approach: Tree model is cached globally, 
    while Human model is loaded dynamically to save RAM.
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

print("[INFO] Menginisiasi modul layanan YOLO. Menerapkan pendekatan memori hybrid.")

#! TREE MODEL
TREE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "model_v4_1.pt")
try:
    print(f"[INFO] Memuat model utama (pohon) ke memori global dari {TREE_MODEL_PATH}.")
    tree_model = YOLO(TREE_MODEL_PATH)
    print("[SUCCESS] Model deteksi pohon berhasil dimuat dan disiagakan di RAM.")
except Exception as e:
    print(f"[ERROR] Gagal memuat model deteksi pohon. Detail: {e}")
    tree_model = None

#! HUMAN CALIBRATION MODEL
PERSON_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")

def run_inference(image_url: str) -> dict:
    if tree_model is None:
        raise RuntimeError("[ERROR] Model utama deteksi pohon tidak tersedia.")

    try:
        # Matikan kalkulasi gradien PyTorch
        with torch.no_grad():
            t0 = time.time()
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req, timeout=10)
            image_bytes = response.read()
            t1 = time.time()
            print(f"[TIMING] Pengunduhan gambar selesai dalam {t1 - t0:.2f} detik.")

            image = Image.open(BytesIO(image_bytes))
            image_width_px, image_height_px = image.width, image.height
            t2 = time.time()
            print(f"[TIMING] Dekode gambar ({image_width_px}x{image_height_px}) selesai dalam {t2 - t1:.2f} detik.")

            #! TAHAP 1: DETEKSI POHON
            print("[INFO] Memulai inferensi pohon menggunakan model global.")
            tree_results = tree_model.predict(
                image,
                conf=0.4,
                iou=0.3,
                imgsz=640, 
                max_det=5,
                device="cpu",
            )
            t3 = time.time()
            print(f"[TIMING] Inferensi pohon selesai dalam {t3 - t2:.2f} detik.")

            tree_boxes = tree_results[0].boxes
            print(f"[INFO] Total objek pohon yang terdeteksi: {len(tree_boxes)}")
            
            xywh_all = tree_boxes.xywh.tolist()
            confidences = tree_boxes.conf.tolist()
            
            # Hapus hasil prediksi pohon dari memori lokal
            del tree_results
            gc.collect()

            if len(tree_boxes) == 0:
                del image
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

            areas = [w * h for (_, _, w, h) in xywh_all]
            main_idx = areas.index(max(areas))
            main_tree_box = xywh_all[main_idx]

            tree_bbox_data = {
                "x_center": float(main_tree_box[0]),
                "y_center": float(main_tree_box[1]),
                "width_px": float(main_tree_box[2]),
                "height_px": float(main_tree_box[3])
            }

            #! TAHAP 2: DETEKSI MANUSIA (dinamis)
            print(f"[INFO] Memuat model kalibrasi manusia secara dinamis dari {PERSON_MODEL_PATH}.")
            person_model = YOLO(PERSON_MODEL_PATH)
            
            person_results = person_model.predict(
                image,
                conf=0.25,
                imgsz=640,
                classes=[0], 
                device="cpu"
            )
            t4 = time.time()
            print(f"[TIMING] Inferensi kalibrasi manusia selesai dalam {t4 - t3:.2f} detik.")
            
            p_boxes = person_results[0].boxes
            person_bboxes = []
            for box in p_boxes:
                px, py, pw, ph = box.xywh[0].tolist()
                person_bboxes.append({
                    "x_center": float(px),
                    "y_center": float(py),
                    "width_px": float(pw),
                    "height_px": float(ph)
                })
            
            # Segera delete human calibraiton model dari RAM
            del person_model
            del person_results
            gc.collect()
            print("[SUCCESS] Model kalibrasi manusia berhasil dihapus dari memori untuk menghemat RAM.")

            #! TAHAP 3: KALKULASI METRIK
            metrics = calculate_all_metrics(
                tree_bbox=tree_bbox_data,
                person_bboxes=person_bboxes,
                image_width_px=image_width_px,
                image_height_px=image_height_px
            )

            bounding_boxes = []
            for (cx, cy, w, h), conf in zip(xywh_all, confidences):
                bounding_boxes.append({
                    "x": round((cx - w / 2) / image_width_px, 4),
                    "y": round((cy - h / 2) / image_height_px, 4),
                    "width": round(w / image_width_px, 4),
                    "height": round(h / image_height_px, 4),
                    "confidence": round(conf, 3)
                })

            avg_confidence = sum(confidences) / len(confidences)

            response_data = {
                **metrics,
                "detections": len(tree_boxes),
                "avg_confidence": round(avg_confidence, 3),
                "bounding_boxes": bounding_boxes,
                "person_boxes": person_bboxes,
                "status": "success"
            }

            del image
            gc.collect()
            
            print("[SUCCESS] Seluruh proses analisis selesai. Mengirimkan data ke klien.")
            return response_data

    except Exception as e:
        print(f"[ERROR] Terjadi kegagalan kritis selama proses inferensi gambar. Detail: {e}")
        gc.collect()
        raise e