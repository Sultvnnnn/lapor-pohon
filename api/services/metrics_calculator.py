"""
    This module handles all ecological metric calculations
    derived from YOLOv8 bounding boxes.

    Rewrite notes:
    - Fix logging syntax.
    - Improve scale calibration using human bottom position.
    - Improve DBH estimation.
    - Use more realistic biomass equation.
    - Improve canopy volume calculation.
    - Make risk score based on multiple ecological proxies,
    not just bounding-box frame coverage.
"""

import math
import logging
from typing import Dict, List, Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================
# CALIBRATION CONSTANTS
# ============================================================

# Fallback jika tidak ada manusia terdeteksi.
# Asumsi awal: lebar gambar mewakili sekitar 10 meter.
DEFAULT_FRAME_WIDTH_M = 10.0

# Tinggi manusia referensi dalam meter.
HUMAN_HEIGHT_M = 1.65

# Jika bounding box manusia sering terlalu besar / longgar,
# naikkan nilai ini sedikit, misalnya 1.05 atau 1.10.
# Default 1.0 supaya tidak menambah asumsi baru secara agresif.
HUMAN_BBOX_CORRECTION = 1.0

# Batas skala meter-per-pixel agar tidak ekstrem.
MIN_M_PER_PIXEL = 0.0005
MAX_M_PER_PIXEL = 0.10

# Orang yang terlalu kecil biasanya jauh / kurang reliable.
MIN_PERSON_HEIGHT_PX = 15


# ============================================================
# TREE LOGICAL LIMITS
# ============================================================

MAX_DBH_CM = 80.0
MAX_CANOPY_DIAMETER_M = 25.0
MAX_TREE_HEIGHT_M = 30.0

# Tidak semua tinggi bbox adalah tajuk penuh.
# Sebagian bisa berupa batang, background, atau area kosong.
CROWN_HEIGHT_FRACTION = 0.65

MAX_BIOMASS_KG = 100000.0


# ============================================================
# DBH HEURISTIC
# ============================================================

# DBH diestimasi dari canopy diameter.
# Ini tetap heuristic, tapi lebih masuk akal daripada rasio linier tunggal.
#
# Contoh perilaku:
# canopy 1 m  -> DBH sekitar 2 cm
# canopy 5 m  -> DBH sekitar 16 cm
# canopy 10 m -> DBH sekitar 41 cm
# canopy 20 m -> DBH sekitar 96 cm, lalu clamp ke 80 cm
DBH_POWER_K = 2.0
DBH_POWER_EXP = 1.30

# Wood density default untuk pohon tropis campur.
# Jika nanti ada data spesies, buat mapping wood density per spesies.
DEFAULT_WOOD_DENSITY = 0.55


# ============================================================
# RISK SCORE WEIGHTS
# ============================================================

RISK_WEIGHT_HEIGHT = 0.30
RISK_WEIGHT_DBH = 0.25
RISK_WEIGHT_CANOPY = 0.20
RISK_WEIGHT_VOLUME = 0.10
RISK_WEIGHT_COVERAGE = 0.15

# Coverage 50% dari frame dianggap sudah sangat dominan.
RISK_COVERAGE_FULL = 0.50


MAX_CANOPY_VOLUME_M3 = (
    (math.pi / 6.0)
    * (MAX_CANOPY_DIAMETER_M ** 2)
    * (MAX_TREE_HEIGHT_M * CROWN_HEIGHT_FRACTION)
)


# ============================================================
# UTILS
# ============================================================

def _clamp(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
    """
    Clamp value ke rentang tertentu.
    Jika NaN / Inf / None, kembalikan min_value.
    """
    if value is None or math.isnan(value) or math.isinf(value):
        return min_value

    return max(min_value, min(float(value), max_value))


# ============================================================
# SCALE CALIBRATION
# ============================================================

def calculate_dynamic_scale(
    tree_bbox: dict,
    person_bboxes: list,
    image_width_px: int,
    image_height_px: Optional[int] = None,
) -> Tuple[float, str]:
    """
    Hitung meter-per-pixel berdasarkan manusia referensi.

    Perbaikan:
    - Tidak hanya memilih orang dengan jarak x terdekat.
    - Memilih orang berdasarkan posisi bawah / kaki (bottom-y),
      karena orang yang berdiri pada bidang tanah mirip dengan pohon
      lebih relevan untuk kalibrasi perspektif.
    """
    fallback_scale = DEFAULT_FRAME_WIDTH_M / float(max(image_width_px, 1))
    fallback_scale = _clamp(fallback_scale, MIN_M_PER_PIXEL, MAX_M_PER_PIXEL)

    if not person_bboxes:
        logger.warning(
            "[WARNING] Tidak ada manusia terdeteksi untuk kalibrasi. "
            "Menggunakan estimasi lebar bingkai bawaan."
        )
        return fallback_scale, "estimated_default"

    min_person_height_px = MIN_PERSON_HEIGHT_PX
    if image_height_px:
        min_person_height_px = max(
            MIN_PERSON_HEIGHT_PX,
            int(image_height_px * 0.015),
        )

    candidates = [
        person
        for person in person_bboxes
        if float(person.get("height_px", 0)) >= min_person_height_px
    ]

    if not candidates:
        candidates = list(person_bboxes)

    if not candidates:
        logger.warning(
            "[WARNING] Kandidat manusia tidak valid. "
            "Menggunakan estimasi lebar bingkai bawaan."
        )
        return fallback_scale, "estimated_default"

    tree_bottom_y = (
        float(tree_bbox.get("y_center", 0))
        + float(tree_bbox.get("height_px", 0)) / 2.0
    )

    best_person = None
    best_score = float("inf")

    for person in candidates:
        person_height_px = float(person.get("height_px", 0))
        if person_height_px <= 0:
            continue

        person_bottom_y = (
            float(person.get("y_center", 0))
            + person_height_px / 2.0
        )

        vertical_distance = abs(tree_bottom_y - person_bottom_y)
        horizontal_distance = abs(
            float(tree_bbox.get("x_center", 0))
            - float(person.get("x_center", 0))
        )

        # Bottom-y lebih penting daripada x.
        score = vertical_distance + 0.35 * horizontal_distance

        if score < best_score:
            best_score = score
            best_person = person

    if best_person is None or float(best_person.get("height_px", 0)) <= 0:
        logger.warning(
            "[WARNING] Tidak menemukan manusia referensi yang valid. "
            "Menggunakan estimasi lebar bingkai bawaan."
        )
        return fallback_scale, "estimated_default"

    effective_human_height = HUMAN_HEIGHT_M * HUMAN_BBOX_CORRECTION
    meter_per_pixel = effective_human_height / float(best_person["height_px"])
    meter_per_pixel = _clamp(meter_per_pixel, MIN_M_PER_PIXEL, MAX_M_PER_PIXEL)

    logger.info(
        f"[INFO] Kalibrasi manusia berhasil. "
        f"Skor kedekatan: {best_score:.2f}px, "
        f"tinggi bbox manusia: {float(best_person['height_px']):.2f}px, "
        f"meter_per_pixel: {meter_per_pixel:.6f}"
    )

    return meter_per_pixel, "person_reference"


# ============================================================
# TREE DIMENSION & CANOPY VOLUME
# ============================================================

def calculate_canopy_volume(canopy_diameter_m: float, tree_height_m: float) -> float:
    """
    Estimasi volume tajuk dengan pendekatan ellipsoid.

    V = pi/6 * D^2 * H

    Tinggi yang dipakai bukan tinggi total bbox penuh,
    tetapi tinggi tajuk hasil kali CROWN_HEIGHT_FRACTION.
    """
    if canopy_diameter_m <= 0 or tree_height_m <= 0:
        return 0.0

    canopy_diameter_m = _clamp(canopy_diameter_m, 0.0, MAX_CANOPY_DIAMETER_M)
    tree_height_m = _clamp(tree_height_m, 0.0, MAX_TREE_HEIGHT_M)

    crown_height_m = tree_height_m * CROWN_HEIGHT_FRACTION

    volume = (
        (math.pi / 6.0)
        * (canopy_diameter_m ** 2)
        * crown_height_m
    )

    if volume > MAX_CANOPY_VOLUME_M3:
        logger.warning(
            f"[WARNING] Volume tajuk melebihi batas logis "
            f"({volume:.2f} m3). Dipotong menjadi {MAX_CANOPY_VOLUME_M3:.2f} m3."
        )
        volume = MAX_CANOPY_VOLUME_M3

    return round(volume, 2)


# ============================================================
# DBH ESTIMATION
# ============================================================

def estimate_dbh_from_canopy(canopy_diameter_m: float) -> float:
    """
    Estimasi DBH dalam cm dari canopy diameter.

    Masih heuristic, tetapi memakai power-law yang lebih
    masuk akal dibanding rasio linier tetap.
    """
    if canopy_diameter_m <= 0:
        return 0.0

    canopy_diameter_m = _clamp(canopy_diameter_m, 0.0, MAX_CANOPY_DIAMETER_M)

    raw_dbh_cm = DBH_POWER_K * (canopy_diameter_m ** DBH_POWER_EXP)

    if raw_dbh_cm > MAX_DBH_CM:
        logger.warning(
            f"[WARNING] DBH tidak wajar terdeteksi ({raw_dbh_cm:.2f} cm). "
            f"Dipotong menjadi batas maksimal {MAX_DBH_CM} cm."
        )

    dbh_cm = _clamp(raw_dbh_cm, 0.0, MAX_DBH_CM)

    return round(dbh_cm, 2)


# ============================================================
# BIOMASS ESTIMATION
# ============================================================

def calculate_biomass_estimate(
    dbh_cm: float,
    tree_height_m: float = 0.0,
    wood_density: float = DEFAULT_WOOD_DENSITY,
) -> float:
    """
    Estimasi above-ground biomass.

    Jika tinggi tersedia, pakai persamaan pantropical Chave et al. 2014:

        AGB = 0.0673 * (rho * DBH^2 * H)^0.976

    Jika tinggi tidak tersedia, fallback ke Chave et al. 2005
    tropical moist forest model.
    """
    if dbh_cm <= 0:
        return 0.0

    dbh_cm = _clamp(dbh_cm, 0.0, MAX_DBH_CM)

    if dbh_cm <= 0:
        return 0.0

    wood_density = _clamp(wood_density, 0.05, 1.20)

    if tree_height_m > 0:
        tree_height_m = _clamp(tree_height_m, 0.0, MAX_TREE_HEIGHT_M)

        biomass_kg = 0.0673 * (
            (wood_density * (dbh_cm ** 2) * tree_height_m) ** 0.976
        )
    else:
        # Fallback Chave et al. 2005 tropical moist forest.
        ln_dbh = math.log(max(dbh_cm, 0.1))

        ln_agb = (
            -1.4994
            + 2.149 * ln_dbh
            + 0.207 * (ln_dbh ** 2)
            - 0.0281 * (ln_dbh ** 3)
        )

        biomass_kg = math.exp(ln_agb)

    if biomass_kg > MAX_BIOMASS_KG:
        logger.warning(
            f"[WARNING] Biomassa melebihi batas logis "
            f"({biomass_kg:.2f} kg). Dipotong menjadi {MAX_BIOMASS_KG} kg."
        )
        biomass_kg = MAX_BIOMASS_KG

    return round(biomass_kg, 2)


# ============================================================
# RISK SCORE
# ============================================================

def calculate_risk_score(
    canopy_diameter_m: float,
    tree_height_m: float,
    dbh_cm: float,
    canopy_volume_m3: float,
    box_width_px: float,
    box_height_px: float,
    image_width_px: int,
    image_height_px: int,
) -> Tuple[float, Dict[str, float]]:
    """
    Risk score heuristic.

    Bukan risk score ekologis absolut, tetapi jauh lebih masuk akal
    daripada hanya memakai rasio luas bbox terhadap frame.

    Komponen:
    - Tinggi pohon
    - DBH
    - Diameter tajuk
    - Volume tajuk
    - Dominasi visual / coverage dalam frame
    """
    frame_area = max(1.0, float(image_width_px) * float(image_height_px))
    box_area = max(0.0, float(box_width_px) * float(box_height_px))

    coverage = box_area / frame_area

    height_score = _clamp(tree_height_m / MAX_TREE_HEIGHT_M)
    dbh_score = _clamp(dbh_cm / MAX_DBH_CM)
    canopy_score = _clamp(canopy_diameter_m / MAX_CANOPY_DIAMETER_M)
    volume_score = _clamp(canopy_volume_m3 / MAX_CANOPY_VOLUME_M3)
    coverage_score = _clamp(coverage / RISK_COVERAGE_FULL)

    risk = (
        RISK_WEIGHT_HEIGHT * height_score
        + RISK_WEIGHT_DBH * dbh_score
        + RISK_WEIGHT_CANOPY * canopy_score
        + RISK_WEIGHT_VOLUME * volume_score
        + RISK_WEIGHT_COVERAGE * coverage_score
    )

    risk = _clamp(risk, 0.0, 1.0)

    breakdown = {
        "height_score": round(height_score, 3),
        "dbh_score": round(dbh_score, 3),
        "canopy_score": round(canopy_score, 3),
        "volume_score": round(volume_score, 3),
        "coverage_score": round(coverage_score, 3),
        "coverage_ratio": round(coverage, 4),
    }

    return round(risk, 2), breakdown


# ============================================================
# MAIN ORCHESTRATOR
# ============================================================

def calculate_all_metrics(
    tree_bbox: dict,
    person_bboxes: list,
    image_width_px: int,
    image_height_px: int,
) -> dict:
    """
    Orkestrasi perhitungan semua metrik ekologis.
    """
    image_width_px = max(1, int(image_width_px))
    image_height_px = max(1, int(image_height_px))

    box_width_px = float(tree_bbox.get("width_px", 0))
    box_height_px = float(tree_bbox.get("height_px", 0))

    if box_width_px <= 0 or box_height_px <= 0:
        logger.warning("[WARNING] Bounding box pohon tidak valid.")
        return {
            "canopy_volume": 0.0,
            "estimated_dbh_cm": 0.0,
            "biomass_estimate": 0.0,
            "risk_score": 0.0,
            "calibration_method": "invalid_bbox",
            "estimated_tree_height_m": 0.0,
            "estimated_canopy_diameter_m": 0.0,
            "meter_per_pixel": 0.0,
            "risk_breakdown": {},
        }

    meter_per_pixel, calibration_method = calculate_dynamic_scale(
        tree_bbox=tree_bbox,
        person_bboxes=person_bboxes,
        image_width_px=image_width_px,
        image_height_px=image_height_px,
    )

    canopy_diameter_m = box_width_px * meter_per_pixel
    tree_height_m = box_height_px * meter_per_pixel

    canopy_diameter_m = _clamp(canopy_diameter_m, 0.0, MAX_CANOPY_DIAMETER_M)
    tree_height_m = _clamp(tree_height_m, 0.0, MAX_TREE_HEIGHT_M)

    canopy_volume = calculate_canopy_volume(
        canopy_diameter_m=canopy_diameter_m,
        tree_height_m=tree_height_m,
    )

    dbh_cm = estimate_dbh_from_canopy(canopy_diameter_m)

    biomass_estimate = calculate_biomass_estimate(
        dbh_cm=dbh_cm,
        tree_height_m=tree_height_m,
        wood_density=DEFAULT_WOOD_DENSITY,
    )

    risk_score, risk_breakdown = calculate_risk_score(
        canopy_diameter_m=canopy_diameter_m,
        tree_height_m=tree_height_m,
        dbh_cm=dbh_cm,
        canopy_volume_m3=canopy_volume,
        box_width_px=box_width_px,
        box_height_px=box_height_px,
        image_width_px=image_width_px,
        image_height_px=image_height_px,
    )

    return {
        "canopy_volume": canopy_volume,
        "estimated_dbh_cm": dbh_cm,
        "biomass_estimate": biomass_estimate,
        "risk_score": risk_score,
        "calibration_method": calibration_method,
        "estimated_tree_height_m": round(tree_height_m, 2),
        "estimated_canopy_diameter_m": round(canopy_diameter_m, 2),
        "meter_per_pixel": round(meter_per_pixel, 6),
        "risk_breakdown": risk_breakdown,
    }