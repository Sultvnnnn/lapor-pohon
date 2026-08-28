"""
This directory is specifically for storing core logic,
including AI engine loading and inference processes.

Hybrid Memory Approach:
- Tree model (ONNX prioritas, fallback .pt) is cached globally.
- Human model is cached lazily (loaded on first use, yolov8n kecil).
"""

import os
import gc
import time
import urllib.request
from io import BytesIO
from typing import List, Dict

import torch
from PIL import Image
from ultralytics import YOLO

from services.metrics_calculator import calculate_all_metrics

torch.set_num_threads(1)

print("[INFO] Menginisiasi modul layanan YOLO. Menerapkan pendekatan memori hybrid.")


# ============================================================
# MODEL PATH & DEVICE
# ============================================================

TREE_MODEL_ONNX_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "model_v4_1.onnx")
)
TREE_MODEL_PT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "model_v4_1.pt")
)

PERSON_MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "models", "yolov8n.pt")
)

DEVICE = "cpu"


# ============================================================
# LOAD TREE MODEL (ONNX prioritas, fallback .pt)
# ============================================================

tree_model = None
try:
    TREE_MODEL_PATH = (
        TREE_MODEL_ONNX_PATH
        if os.path.exists(TREE_MODEL_ONNX_PATH)
        else TREE_MODEL_PT_PATH
    )
    print(f"[INFO] Memuat model utama (pohon) dari {TREE_MODEL_PATH}.")
    tree_model = YOLO(TREE_MODEL_PATH, task="detect")
    print("[SUCCESS] Model deteksi pohon berhasil dimuat dan disiagakan di RAM.")
except Exception as e:
    print(f"[ERROR] Gagal memuat model deteksi pohon. Detail: {e}")
    tree_model = None


person_model = None

def _get_person_model():
    """Cache model manusia biar nggak load-delete tiap request (fragmentasi RAM)."""
    global person_model
    if person_model is None:
        print(f"[INFO] Memuat model kalibrasi manusia dari {PERSON_MODEL_PATH}.")
        person_model = YOLO(PERSON_MODEL_PATH)
    return person_model


# ============================================================
# HELPERS
# ============================================================

def _empty_response(status: str, calibration_method: str = "none") -> dict:
    return {
        "risk_score": 0.0,
        "canopy_volume": 0.0,
        "estimated_dbh_cm": 0.0,
        "biomass_estimate": 0.0,
        "detections": 0,
        "avg_confidence": 0.0,
        "bounding_boxes": [],
        "person_boxes": [],
        "status": status,
        "calibration_method": calibration_method,
        "estimated_tree_height_m": 0.0,
        "estimated_canopy_diameter_m": 0.0,
        "meter_per_pixel": 0.0,
        "risk_breakdown": {},
    }


def _load_image_from_url(image_url: str) -> Image.Image:
    req = urllib.request.Request(
        image_url,
        headers={"User-Agent": "Mozilla/5.0"},
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        image_bytes = response.read()
    return Image.open(BytesIO(image_bytes)).convert("RGB")


def _detect_person_bboxes(image: Image.Image) -> List[Dict[str, float]]:
    person_bboxes: List[Dict[str, float]] = []

    if not os.path.exists(PERSON_MODEL_PATH):
        print(
            f"[WARNING] Model manusia tidak ditemukan di {PERSON_MODEL_PATH}. "
            "Kalibrasi akan memakai fallback."
        )
        return person_bboxes

    person_results = None

    try:
        person_results = _get_person_model().predict(
            image,
            conf=0.25,
            imgsz=320,
            classes=[0],
            device=DEVICE,
            verbose=False,
        )

        if not person_results:
            return person_bboxes

        boxes = person_results[0].boxes
        if boxes is None:
            return person_bboxes

        for box in boxes:
            px, py, pw, ph = box.xywh[0].tolist()
            p_conf = float(box.conf[0].item()) if hasattr(box.conf[0], "item") else float(box.conf[0])

            if float(pw) <= 0 or float(ph) <= 0:
                continue

            person_bboxes.append({
                "x_center": float(px),
                "y_center": float(py),
                "width_px": float(pw),
                "height_px": float(ph),
                "confidence": p_conf,
            })

    except Exception as e:
        print(f"[WARNING] Deteksi manusia gagal. Melanjutkan tanpa kalibrasi manusia. Detail: {e}")

    finally:
        # Hapus HASILnya saja. Modelnya tetap di-cache.
        if person_results is not None:
            del person_results
        gc.collect()

    return person_bboxes


# ============================================================
# MAIN INFERENCE
# ============================================================

def run_inference(image_url: str) -> dict:
    if tree_model is None:
        raise RuntimeError("[ERROR] Model utama deteksi pohon tidak tersedia.")

    image = None
    tree_results = None

    try:
        with torch.no_grad():
            t0 = time.time()

            image = _load_image_from_url(image_url)
            image_width_px, image_height_px = image.width, image.height

            t1 = time.time()
            print(
                f"[TIMING] Download + dekode gambar "
                f"({image_width_px}x{image_height_px}) "
                f"selesai dalam {t1 - t0:.2f} detik."
            )

            print("[INFO] Memulai inferensi pohon menggunakan model global.")
            tree_results = tree_model.predict(
                image,
                conf=0.4,
                iou=0.6,
                imgsz=640,
                max_det=5,
                device=DEVICE,
                verbose=False,
            )

            t2 = time.time()
            print(f"[TIMING] Inferensi pohon selesai dalam {t2 - t1:.2f} detik.")

            if not tree_results:
                return _empty_response("no_tree_detected")

            boxes = tree_results[0].boxes
            detections = 0 if boxes is None else len(boxes)

            if detections == 0:
                return _empty_response("no_tree_detected")

            xywh_all = boxes.xywh.tolist()
            confidences = boxes.conf.tolist()

            del boxes
            del tree_results
            tree_results = None
            gc.collect()

            print(f"[INFO] Total objek pohon yang terdeteksi: {detections}")

            areas = [float(w) * float(h) for (_, _, w, h) in xywh_all]
            main_idx = max(range(len(areas)), key=lambda i: areas[i])
            cx, cy, w, h = xywh_all[main_idx]

            tree_bbox_data = {
                "x_center": float(cx),
                "y_center": float(cy),
                "width_px": float(w),
                "height_px": float(h),
            }

            print("[INFO] Memulai deteksi manusia untuk kalibrasi skala.")
            person_bboxes = _detect_person_bboxes(image)

            t3 = time.time()
            print(f"[TIMING] Deteksi manusia selesai dalam {t3 - t2:.2f} detik.")

            # Format person boxes untuk frontend (dengan label dan koordinat relatif)
            normalized_person_boxes = []
            for pbox in person_bboxes:
                px = pbox["x_center"]
                py = pbox["y_center"]
                pw = pbox["width_px"]
                ph = pbox["height_px"]
                normalized_person_boxes.append({
                    "x": round((px - pw / 2) / image_width_px, 4),
                    "y": round((py - ph / 2) / image_height_px, 4),
                    "width": round(pw / image_width_px, 4),
                    "height": round(ph / image_height_px, 4),
                    "confidence": round(pbox.get("confidence", 1.0), 3),
                    "label": "person",
                    "x_center": px,
                    "y_center": py,
                    "width_px": pw,
                    "height_px": ph,
                })

            metrics = calculate_all_metrics(
                tree_bbox=tree_bbox_data,
                person_bboxes=person_bboxes,
                image_width_px=image_width_px,
                image_height_px=image_height_px,
            )

            # Format bounding box relatif untuk frontend.
            bounding_boxes = []
            for (bcx, bcy, bw, bh), conf in zip(xywh_all, confidences):
                bounding_boxes.append({
                    "x": round((bcx - bw / 2) / image_width_px, 4),
                    "y": round((bcy - bh / 2) / image_height_px, 4),
                    "width": round(bw / image_width_px, 4),
                    "height": round(bh / image_height_px, 4),
                    "confidence": round(float(conf), 3),
                    "label": "tree",
                })

            avg_confidence = sum(confidences) / len(confidences)

            response_data = {
                **metrics,
                "detections": detections,
                "avg_confidence": round(avg_confidence, 3),
                "bounding_boxes": bounding_boxes,
                "person_boxes": normalized_person_boxes,
                "status": "success",
            }

            t4 = time.time()
            print(f"[TIMING] Total proses analisis selesai dalam {t4 - t0:.2f} detik.")
            print("[SUCCESS] Seluruh proses analisis selesai. Mengirimkan data ke klien.")

            return response_data

    except Exception as e:
        print(f"[ERROR] Terjadi kegagalan kritis selama proses inferensi gambar. Detail: {e}")
        raise

    finally:
        if tree_results is not None:
            del tree_results
        if image is not None:
            del image
        gc.collect()