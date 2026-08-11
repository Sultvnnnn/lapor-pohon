"""
    This module handles all metric calculations derived from
    YOLOv8 detection results (bounding boxes).
    Kept separate from yolo_service.py so the AI inference logic
    and the calculation/heuristic logic don't get mixed together.

    IMPORTANT NOTES ON ACCURACY:
    - canopy_volume: rough estimate, NOT calibrated to real camera distance.
      Needs a reference object/marker in the photo for real accuracy.
    - biomass_estimate: uses a real allometric equation (Chave et al., 2005,
      generic tropical forest constants), but DBH itself is estimated from
      canopy width ratio — this ratio is still an assumption, not measured.
    - risk_score: rule-based heuristic from relative tree size in frame,
      NOT a validated risk model. There is currently no public dataset for
      tree damage/hazard detection, so this is a placeholder approach for MVP.
"""

import math

# konstanta
ASSUMED_TREE_HEIGHT_M = 6.0       # asumsi tinggi rata-rata pohon perkotaan
ASSUMED_FRAME_WIDTH_M = 10.0      # asumsi lebar pandangan gambar (BUTUH kalibrasi jarak kamera nyata)

DBH_TO_CANOPY_RATIO = 0.065       # DBH biasanya ~5-8% dari lebar kanopi pohon dewasa, ambil titik tengah 6.5%

# Konstanta allometric Chave et al. 2005, untuk hutan tropis generik (B = a * DBH^b)
# NOTE: idealnya diganti per spesies kalau data spesies pohon tersedia
ALLOMETRIC_A = 0.11
ALLOMETRIC_B = 2.62

def calculate_canopy_volume(box_width_px: float, image_width_px: int) -> float:
    """
    Estimasi kasar volume kanopi (m3) dari lebar bounding box.
    NOTE: px_to_m mengasumsikan lebar gambar = ASSUMED_FRAME_WIDTH_M.
    Ini keterbatasan riil tanpa data jarak kamera aktual.
    """
    px_to_m = ASSUMED_FRAME_WIDTH_M / image_width_px
    canopy_diameter_m = box_width_px * px_to_m
    canopy_radius_m = canopy_diameter_m / 2

    # Kanopi didekati sebagai setengah bola (hemisphere)
    volume = (2 / 3) * math.pi * (canopy_radius_m ** 2) * ASSUMED_TREE_HEIGHT_M
    return round(volume, 2)


def estimate_dbh_from_canopy(box_width_px: float, image_width_px: int) -> float:
    """
    Estimasi DBH (diameter batang setinggi dada, cm) dari lebar kanopi.
    NOTE: pakai rasio umum botani, BUKAN pengukuran langsung.
    """
    px_to_m = ASSUMED_FRAME_WIDTH_M / image_width_px
    canopy_diameter_m = box_width_px * px_to_m
    dbh_m = canopy_diameter_m * DBH_TO_CANOPY_RATIO
    dbh_cm = dbh_m * 100
    return round(dbh_cm, 2)


def calculate_biomass_estimate(dbh_cm: float) -> float:
    """
    Estimasi biomassa (kg) pakai rumus allometric Chave et al. 2005: B = a * DBH^b
    Ini rumus tervalidasi secara ilmiah, TAPI input DBH-nya masih estimasi
    (lihat estimate_dbh_from_canopy), jadi hasil akhirnya tetap perkiraan.
    """
    if dbh_cm <= 0:
        return 0.0
    biomass_kg = ALLOMETRIC_A * (dbh_cm ** ALLOMETRIC_B)
    return round(biomass_kg, 2)


def calculate_risk_score(box_width_px: float, box_height_px: float, image_width_px: int, image_height_px: int) -> float:
    """
    Risk score heuristik (0-1) dari ukuran relatif pohon terhadap frame.
    Logika: pohon yang porsinya besar di frame (kemungkinan dekat kamera/
    dekat infrastruktur) dianggap berisiko lebih tinggi.
    NOTE: ini BUKAN analisis kondisi fisik pohon (retak/lapuk/miring).
    Placeholder sampai ada dataset kondisi pohon yang valid.
    """
    frame_area = image_width_px * image_height_px
    box_area = box_width_px * box_height_px
    relative_size = box_area / frame_area

    # Normalisasi kasar: pohon yang menutupi >40% frame dianggap risk tinggi
    risk = min(relative_size / 0.4, 1.0)
    return round(risk, 2)


def calculate_all_metrics(box_width_px: float, box_height_px: float, image_width_px: int, image_height_px: int) -> dict:
    """
    Fungsi utama yang dipanggil dari yolo_service.py.
    Menggabungkan semua kalkulasi jadi satu return dict.
    """
    canopy_volume = calculate_canopy_volume(box_width_px, image_width_px)
    dbh_cm = estimate_dbh_from_canopy(box_width_px, image_width_px)
    biomass_estimate = calculate_biomass_estimate(dbh_cm)
    risk_score = calculate_risk_score(box_width_px, box_height_px, image_width_px, image_height_px)

    return {
        "canopy_volume": canopy_volume,
        "estimated_dbh_cm": dbh_cm,
        "biomass_estimate": biomass_estimate,
        "risk_score": risk_score
    }