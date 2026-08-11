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
    print(f"[SUCCESS] Model YOLOv8 (LaporPohon custom) berhasil dimuat dari {MODEL_PATH}.")
except Exception as e:
    print(f"[ERROR] Gagal memuat model YOLOv8: {e}")
    print(f"[DEBUG] MODEL_PATH yang dicoba: {MODEL_PATH}")
    print(f"[DEBUG] Apakah file ada? {os.path.exists(MODEL_PATH)}")
    model = None
    
def run_inference(image_url: str) -> dict:
    """
    Run inference on the provided image URL using the YOLO model,
    then calculate derived metrics from the detected bounding box.
    """
    if model is None:
        raise RuntimeError("[ERROR] Mesin YOLOv8 tidak tersedia atau gagal dimuat.")

    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    image_bytes = response.read()

    image = Image.open(BytesIO(image_bytes))
    image_width_px, image_height_px = image.width, image.height

    results = model.predict(image)
    boxes = results[0].boxes

    print(f"[INFO] Jumlah objek pohon terdeteksi: {len(boxes)}")

    if len(boxes) == 0:
        return {
            "risk_score": 0.0,
            "canopy_volume": 0.0,
            "biomass_estimate": 0.0,
            "detections": 0,
            "status": "no_tree_detected"
        }

    confidences = boxes.conf.tolist()
    best_idx = confidences.index(max(confidences))
    best_box = boxes.xywh[best_idx]  # format: center_x, center_y, width, height

    box_width_px = float(best_box[2])
    box_height_px = float(best_box[3])
    avg_confidence = sum(confidences) / len(confidences)

    metrics = calculate_all_metrics(box_width_px, box_height_px, image_width_px, image_height_px)

    return {
        **metrics,
        "detections": len(boxes),
        "avg_confidence": round(avg_confidence, 3),
        "status": "success"
    }