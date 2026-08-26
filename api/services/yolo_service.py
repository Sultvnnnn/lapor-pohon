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

from services.metrics_calculator import calculate_all_metrics

print(f"[INFO] Loading the model...")

#! LOAD MODEL 1: TREE DETECTOR (YOLOv8)
TREE_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "model_v4_1.pt")
try:
    tree_model = YOLO(TREE_MODEL_PATH)
    print(f"[SUCCESS] Model YOLOv8 (Pohon) berhasil diload dari {TREE_MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Gagal meload model Pohon: {e}")
    tree_model = None

#! LOAD MODEL 2: HUMAN DETECTOR (Pre-trained COCO)
PERSON_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")
try:
    person_model = YOLO(PERSON_MODEL_PATH)
    print(f"[SUCCESS] Model YOLOv8 nano version (Kalibrasi) berhasil diload dari {PERSON_MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Gagal meload model Kalibrasi: {e}")
    person_model = None

def run_inference(image_url: str) -> dict:
    if tree_model is None:
        raise RuntimeError("[ERROR] Model pohon tidak tersedia atau gagal diload.")

    t0 = time.time()
    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req, timeout=10)
    image_bytes = response.read()
    t1 = time.time()
    print(f"[TIMING] Download gambar: {t1 - t0:.2f}s")

    image = Image.open(BytesIO(image_bytes))
    image_width_px, image_height_px = image.width, image.height
    t2 = time.time()
    print(f"[TIMING] Decode gambar ({image_width_px}x{image_height_px}): {t2 - t1:.2f}s")

    #! INFERENSI 1: CARI POHON
    tree_results = tree_model.predict(
        image,
        conf=0.4,
        imgsz=320,
        max_det=5,
        device="cpu",
    )
    t3 = time.time()
    print(f"[TIMING] Inference YOLO (Pohon): {t3 - t2:.2f}s")

    tree_boxes = tree_results[0].boxes
    print(f"[INFO] Jumlah objek pohon terdeteksi: {len(tree_boxes)}")

    if len(tree_boxes) == 0:
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
    if person_model is not None:
        person_results = person_model.predict(
            image,
            conf=0.25,
            imgsz=640,
            classes=[0], 
            device="cpu"
        )
        t4 = time.time()
        print(f"[TIMING] Inference YOLO (Manusia): {t4 - t3:.2f}s")
        
        p_boxes = person_results[0].boxes
        for box in p_boxes:
            px, py, pw, ph = box.xywh[0].tolist()
            person_bboxes.append({
                "x_center": float(px),
                "y_center": float(py),
                "width_px": float(pw),
                "height_px": float(ph)
            })

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
            "confidence": round(conf, 3)
        })

    avg_confidence = sum(confidences) / len(confidences)

    return {
        **metrics,
        "detections": len(tree_boxes),
        "avg_confidence": round(avg_confidence, 3),
        "bounding_boxes": bounding_boxes,
        "person_boxes": person_bboxes,
        "status": "success"
    }