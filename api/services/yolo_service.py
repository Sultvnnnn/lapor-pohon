"""
    This directory is specifically for storing core logic,
    including AI engine loading and inference processes.
    By separating these components, 
    the model will not be loaded repeatedly when the router is called.
"""

import time
from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import urllib.request
import os

from services.metrics_calculator import calculate_all_metrics

print(f"[INFO] Loading YOLO...")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best.pt")

try:
    model = YOLO(MODEL_PATH)
    print(f"[SUCCESS] Model YOLOv8 (LaporPohon custom) berhasil diload dari {MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Gagal meload model YOLOv8: {e}")
    model = None

def run_inference(image_url: str) -> dict:
    if model is None:
        raise RuntimeError("[ERROR] Model tidak tersedia atau gagal diload.")

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

    results = model.predict(image, conf=0.4, imgsz=640)
    t3 = time.time()
    print(f"[TIMING] Inference YOLO: {t3 - t2:.2f}s")
    print(f"[TIMING] Total: {t3 - t0:.2f}s")

    boxes = results[0].boxes
    print(f"[INFO] Jumlah objek pohon terdeteksi: {len(boxes)}")

    if len(boxes) == 0:
        return {
            "risk_score": 0.0,
            "canopy_volume": 0.0,
            "biomass_estimate": 0.0,
            "detections": 0,
            "bounding_boxes": [],
            "status": "no_tree_detected"
        }

    confidences = boxes.conf.tolist()
    xywh_all = boxes.xywh.tolist()

    bounding_boxes = []
    for (cx, cy, w, h), conf in zip(xywh_all, confidences):
        x_norm = (cx - w / 2) / image_width_px
        y_norm = (cy - h / 2) / image_height_px
        width_norm = w / image_width_px
        height_norm = h / image_height_px

        bounding_boxes.append({
            "x": round(x_norm, 4),
            "y": round(y_norm, 4),
            "width": round(width_norm, 4),
            "height": round(height_norm, 4),
            "confidence": round(conf, 3)
        })

    areas = [w * h for (_, _, w, h) in xywh_all]
    main_idx = areas.index(max(areas))
    main_box = xywh_all[main_idx]

    box_width_px = float(main_box[2])
    box_height_px = float(main_box[3])
    avg_confidence = sum(confidences) / len(confidences)

    metrics = calculate_all_metrics(box_width_px, box_height_px, image_width_px, image_height_px)

    return {
        **metrics,
        "detections": len(boxes),
        "avg_confidence": round(avg_confidence, 3),
        "bounding_boxes": bounding_boxes,
        "status": "success"
    }