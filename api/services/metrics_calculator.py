"""
This module handles all ecological metric calculations
derived from YOLOv8 bounding boxes.

Final version:
- Chave 2014 (dengan wood density + tinggi) untuk biomassa,
  fallback Chave 2005 jika tinggi tidak tersedia.
- DBH power-law heuristic dari canopy diameter.
- Volume tajuk ellipsoid dengan fraksi tinggi tajuk.
- Risk score multi-faktor (bukan cuma coverage bbox).
- Kalibrasi skala berbasis posisi kaki manusia (bottom-y).
"""

import math
import logging
from typing import Dict, List, Tuple, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================
# CALIBRATION CONSTANTS
# ============================================================

DEFAULT_FRAME_WIDTH_M = 10.0
HUMAN_HEIGHT_M = 1.65

# Naikkan ke 1.05-1.10 jika bbox manusia sering terlalu longgar.
HUMAN_BBOX_CORRECTION = 1.0

MIN_M_PER_PIXEL = 0.0005
MAX_M_PER_PIXEL = 0.10
MIN_PERSON_HEIGHT_PX = 15


# ============================================================
# TREE LOGICAL LIMITS
# ============================================================

MAX_DBH_CM = 80.0
MAX_CANOPY_DIAMETER_M = 25.0
MAX_TREE_HEIGHT_M = 30.0
CROWN_HEIGHT_FRACTION = 0.65
MAX_BIOMASS_KG = 100000.0


# ============================================================
# DBH HEURISTIC
# ============================================================

DBH_POWER_K = 2.0
DBH_POWER_EXP = 1.30
DEFAULT_WOOD_DENSITY = 0.55


# ============================================================
# RISK SCORE WEIGHTS
# ============================================================

RISK_WEIGHT_HEIGHT = 0.30
RISK_WEIGHT_DBH = 0.25
RISK_WEIGHT_CANOPY = 0.20
RISK_WEIGHT_VOLUME = 0.10
RISK_WEIGHT_COVERAGE = 0.15
RISK_COVERAGE_FULL = 0.50


MAX_CANOPY_VOLUME_M3 = (
    (math.pi / 6.0)
    * (MAX_CANOPY_DIAMETER_M ** 2)
    * (MAX_TREE_HEIGHT_M * CROWN_HEIGHT_FRACTION)
)


def _clamp(value: float, min_value: float = 0.0, max_value: float = 1.0) -> float:
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
    Meter-per-pixel dari manusia referensi.
    Memilih orang berdasarkan posisi kaki (bottom-y), bukan cuma jarak x.
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
        p for p in person_bboxes
        if float(p.get("height_px", 0)) >= min_person_height_px
    ]
    if not candidates:
        candidates = list(person_bboxes)
    if not candidates:
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

        person_bottom_y = float(person.get("y_center", 0)) + person_height_px / 2.0
        vertical_distance = abs(tree_bottom_y - person_bottom_y)
        horizontal_distance = abs(
            float(tree_bbox.get("x_center", 0))
            - float(person.get("x_center", 0))
        )
        score = vertical_distance + 0.35 * horizontal_distance

        if score < best_score:
            best_score = score
            best_person = person

    if best_person is None or float(best_person.get("height_px", 0)) <= 0:
        return fallback_scale, "estimated_default"

    effective_human_height = HUMAN_HEIGHT_M * HUMAN_BBOX_CORRECTION
    meter_per_pixel = effective_human_height / float(best_person["height_px"])
    meter_per_pixel = _clamp(meter_per_pixel, MIN_M_PER_PIXEL, MAX_M_PER_PIXEL)

    logger.info(
        f"[INFO] Kalibrasi manusia berhasil. "
        f"meter_per_pixel: {meter_per_pixel:.6f}"
    )
    return meter_per_pixel, "person_reference"


# ============================================================
# CANOPY VOLUME
# ============================================================

def calculate_canopy_volume(canopy_diameter_m: float, tree_height_m: float) -> float:
    """Volume tajuk ellipsoid: V = pi/6 * D^2 * H_tajuk."""
    if canopy_diameter_m <= 0 or tree_height_m <= 0:
        return 0.0

    canopy_diameter_m = _clamp(canopy_diameter_m, 0.0, MAX_CANOPY_DIAMETER_M)
    tree_height_m = _clamp(tree_height_m, 0.0, MAX_TREE_HEIGHT_M)

    crown_height_m = tree_height_m * CROWN_HEIGHT_FRACTION
    volume = (math.pi / 6.0) * (canopy_diameter_m ** 2) * crown_height_m

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
    """DBH (cm) dari canopy diameter via power-law heuristic."""
    if canopy_diameter_m <= 0:
        return 0.0

    canopy_diameter_m = _clamp(canopy_diameter_m, 0.0, MAX_CANOPY_DIAMETER_M)
    raw_dbh_cm = DBH_POWER_K * (canopy_diameter_m ** DBH_POWER_EXP)

    if raw_dbh_cm > MAX_DBH_CM:
        logger.warning(
            f"[WARNING] DBH tidak wajar terdeteksi ({raw_dbh_cm:.2f} cm). "
            f"Dipotong menjadi batas maksimal {MAX_DBH_CM} cm."
        )

    return round(_clamp(raw_dbh_cm, 0.0, MAX_DBH_CM), 2)


# ============================================================
# BIOMASS
# ============================================================

def calculate_biomass_estimate(
    dbh_cm: float,
    tree_height_m: float = 0.0,
    wood_density: float = DEFAULT_WOOD_DENSITY,
) -> float:
    """
    Chave et al. 2014: AGB = 0.0673 * (rho * DBH^2 * H)^0.976
    Fallback Chave et al. 2005 (moist forest) jika tinggi tidak ada.
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
    """Risk score heuristic multi-faktor, 0 sampai 1."""
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
# ORCHESTRATOR
# ============================================================

def calculate_all_metrics(
    tree_bbox: dict,
    person_bboxes: list,
    image_width_px: int,
    image_height_px: int,
) -> dict:
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

    canopy_diameter_m = _clamp(
        box_width_px * meter_per_pixel, 0.0, MAX_CANOPY_DIAMETER_M
    )
    tree_height_m = _clamp(
        box_height_px * meter_per_pixel, 0.0, MAX_TREE_HEIGHT_M
    )

    canopy_volume = calculate_canopy_volume(canopy_diameter_m, tree_height_m)
    dbh_cm = estimate_dbh_from_canopy(canopy_diameter_m)
    biomass_estimate = calculate_biomass_estimate(dbh_cm, tree_height_m)
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