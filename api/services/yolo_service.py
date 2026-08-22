"""
    This directory is specifically for storing core logic,
    including AI engine loading and inference processes.
    By separating these components, 
    the model will not be loaded repeatedly when the router is called.
"""

from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import urllib.request
import os

from services.metrics_calculator import calculate_all_metrics

print(f"[INFO] Loading YOLO...")

# path ke model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "best.pt")

try:
    model = YOLO(MODEL_PATH)
    print(f"[SUCCESS] Model YOLOv8 (LaporPohon custom) berhasil diload dari {MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Gagal meload model YOLOv8: {e}")
    model = None

def run_inference(image_url: str) -> dict:
    """
    Run inference on the provided image URL using the YOLO model,
    then calculate derived metrics from ALL detected bounding boxes.
    """
    if model is None:
        raise RuntimeError("[ERROR] Model tidak tersedia atau gagal diload.")

    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    image_bytes = response.read()

    image = Image.open(BytesIO(image_bytes))
    image_width_px, image_height_px = image.width, image.height

    results = model.predict(image, conf=0.4, imgsz=640)
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
    xywh_all = boxes.xywh.tolist()  # semua box, format: [center_x, center_y, width, height] per box

    # Susun bounding box untuk SEMUA deteksi (dinormalisasi 0-1)
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

    # --- Metrik (risk_score, canopy_volume, biomass_estimate) tetap dihitung dari box PALING BESAR ---
    # Asumsi: pohon dengan box terbesar = pohon utama yang jadi fokus laporan warga,
    # bukan box dengan confidence tertinggi (karena pohon kecil di background bisa
    # kebetulan confidence-nya tinggi tapi bukan itu yang dimaksud pelapor).
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