"""
    This module handles all ecological metric calculations 
    derived from YOLOv8 bounding boxes. Now supports dynamic
    perspective calibration using human reference objects
    and dynamic tree height estimation.
"""

import math
import logging

# Config logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

#? ECOLOGICAL & CALIBRATION CONSTANTS
DEFAULT_FRAME_WIDTH_M = 10.0      # Fallback constraint if no human is detected
HUMAN_HEIGHT_M = 1.65             # Average human height reference in meters

DBH_TO_CANOPY_RATIO = 0.065       # Biological ratio estimate (6.5%)
ALLOMETRIC_A = 0.11               # Chave et al. (2005) constant for tropical forest
ALLOMETRIC_B = 2.62               # Chave et al. (2005) constant for tropical forest

#? THRESHOLD CONSTANTS (Batas Aman Logis)
MAX_DBH_CM = 150.0                # Batas maksimal diameter batang pohon kota (150 cm)
MAX_CANOPY_DIAMETER_M = 25.0      # Batas maksimal lebar kanopi (25 meter)
MAX_TREE_HEIGHT_M = 30.0          # Batas maksimal tinggi pohon (30 meter)

def calculate_dynamic_scale(tree_bbox: dict, person_bboxes: list, image_width_px: int) -> tuple[float, str]:
    """
    Calculates the meter-per-pixel scale based on the closest human reference.
    Returns the scale and the calibration method used.
    """
    if not person_bboxes:
        logger.warning("[WARNING] No person detected for calibration. Falling back to default frame width.")
        fallback_scale = DEFAULT_FRAME_WIDTH_M / image_width_px
        return fallback_scale, "estimated_default"
    
    tree_center_x = tree_bbox["x_center"]
    selected_person = None
    min_distance = float('inf')
    
    # Find the person closest to the tree trunk to minimize perspective distortion
    for person in person_bboxes:
        person_center_x = person["x_center"]
        distance = abs(tree_center_x - person_center_x)
        
        if distance < min_distance:
            min_distance = distance
            selected_person = person
            
    logger.info(f"[INFO] Calibration successful. Reference person distance from tree: {min_distance:.2f}px.")
    
    meter_per_pixel = HUMAN_HEIGHT_M / selected_person["height_px"]
    return meter_per_pixel, "person_reference"


def calculate_canopy_volume(box_width_px: float, box_height_px: float, meter_per_pixel: float) -> float:
    """Estimates canopy volume (m3) using dynamic tree height with logical clamping."""
    canopy_diameter_m = box_width_px * meter_per_pixel
    tree_height_m = box_height_px * meter_per_pixel
    
    # Penahan batas maksimal (Clamping)
    if canopy_diameter_m > MAX_CANOPY_DIAMETER_M:
        logger.warning(f"[WARNING] Diameter kanopi melebihi batas logis ({canopy_diameter_m:.2f} m). Dipotong menjadi {MAX_CANOPY_DIAMETER_M} m.")
        canopy_diameter_m = MAX_CANOPY_DIAMETER_M
        
    if tree_height_m > MAX_TREE_HEIGHT_M:
        logger.warning(f"[WARNING] Tinggi pohon melebihi batas logis ({tree_height_m:.2f} m). Dipotong menjadi {MAX_TREE_HEIGHT_M} m.")
        tree_height_m = MAX_TREE_HEIGHT_M
    
    canopy_radius_m = canopy_diameter_m / 2

    # Hemisphere volume calculation
    volume = (2 / 3) * math.pi * (canopy_radius_m ** 2) * tree_height_m
    return round(volume, 2)


def estimate_dbh_from_canopy(box_width_px: float, meter_per_pixel: float) -> float:
    """Estimates Diameter at Breast Height (DBH) in cm with logical clamping."""
    canopy_diameter_m = box_width_px * meter_per_pixel
    
    if canopy_diameter_m > MAX_CANOPY_DIAMETER_M:
        canopy_diameter_m = MAX_CANOPY_DIAMETER_M
        
    dbh_m = canopy_diameter_m * DBH_TO_CANOPY_RATIO
    dbh_cm = dbh_m * 100
    
    # Penahan batas maksimal DBH
    if dbh_cm > MAX_DBH_CM:
        logger.warning(f"[WARNING] DBH tidak wajar terdeteksi ({dbh_cm:.2f} cm). Dipotong menjadi batas maksimal {MAX_DBH_CM} cm.")
        dbh_cm = MAX_DBH_CM
        
    return round(dbh_cm, 2)


def calculate_biomass_estimate(dbh_cm: float) -> float:
    """Estimates above-ground biomass (kg) using Chave et al. (2005) allometric equation."""
    if dbh_cm <= 0:
        return 0.0
    biomass_kg = ALLOMETRIC_A * (dbh_cm ** ALLOMETRIC_B)
    return round(biomass_kg, 2)


def calculate_risk_score(box_width_px: float, box_height_px: float, image_width_px: int, image_height_px: int) -> float:
    """Calculates heuristic risk score based on relative frame coverage."""
    frame_area = image_width_px * image_height_px
    box_area = box_width_px * box_height_px
    relative_size = box_area / frame_area
    
    # Heuristic normalization: >40% frame coverage implies high risk
    risk = min(relative_size / 0.4, 1.0)
    return round(risk, 2)


def calculate_all_metrics(tree_bbox: dict, person_bboxes: list, image_width_px: int, image_height_px: int) -> dict:
    """
    Main orchestrator for metric calculations.
    Returns a dictionary of all calculated metrics.
    """
    box_width_px = tree_bbox["width_px"]
    box_height_px = tree_bbox["height_px"]

    # 1. Get dynamic scale
    meter_per_pixel, calibration_method = calculate_dynamic_scale(tree_bbox, person_bboxes, image_width_px)

    # 2. Calculate ecological metrics
    canopy_volume = calculate_canopy_volume(box_width_px, box_height_px, meter_per_pixel)
    dbh_cm = estimate_dbh_from_canopy(box_width_px, meter_per_pixel)
    biomass_estimate = calculate_biomass_estimate(dbh_cm)
    risk_score = calculate_risk_score(box_width_px, box_height_px, image_width_px, image_height_px)

    return {
        "canopy_volume": canopy_volume,
        "estimated_dbh_cm": dbh_cm,
        "biomass_estimate": biomass_estimate,
        "risk_score": risk_score,
        "calibration_method": calibration_method
    }