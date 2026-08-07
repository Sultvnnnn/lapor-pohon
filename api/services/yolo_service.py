"""
    This directory is specifically for storing core logic,
    including AI engine loading and inference processes.
    By separating these components, 
    the model will not be loaded repeatedly when the router is called.
"""

from urllib import response

from ultralytics import YOLO
from io import BytesIO
from PIL import Image
import urllib.request

print(f"[INFO] Loading YOLO...")

try:
    model = YOLO("yolov8n.pt")
    print("[SUCCESS] Model YOLOv8 berhasil dimuat dan siap digunakan.")
except Exception as e:
    print(f"[ERROR] Gagal memuat model YOLOv8: {e}")
    model = None

def run_inference(image_url: str) -> dict:
    """
    Run inference on the provided image URL using the YOLO model.

    Args:
        image_url (str): The URL of the image to run inference on.

    Returns:
        dict: A dictionary containing the inference results.
    """

    if model is None:
        raise RuntimeError("[ERROR] Mesin YOLOv8 tidak tersedia atau gagal dimuat.")

    # download image dari URL langsung ke RAM
    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    response = urllib.request.urlopen(req)
    image_bytes = response.read()

    # open dan convert byte menjadi format gambar di dalam RAM
    image = Image.open(BytesIO(image_bytes))

    # Mesin YOLOv8 memproses langsung dari tautan URL
    results = model.predict(image)

    print(results[0].boxes)
    
    # TODO: Ekstraksi bounding box nyata untuk risk_score, canopy_volume, biomass_estimate
    # Placeholder nilai metrik untuk kebutuhan MVP
    return {
        "risk_score": 0.85,
        "canopy_volume": 12.5,
        "biomass_estimate": 350.0,
        "status": "success"
    }