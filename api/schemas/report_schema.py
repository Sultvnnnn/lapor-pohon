"""
    This directory specifically stores data type definitions
    and validations using Pydantic.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict


class ReportRequest(BaseModel):
    image_url: str
    latitude: float
    longitude: float
    description: str


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float
    label: str = "tree"


class PersonBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float
    label: str = "person"
    x_center: float
    y_center: float
    width_px: float
    height_px: float


class RiskBreakdown(BaseModel):
    height_score: float
    dbh_score: float
    canopy_score: float
    volume_score: float
    coverage_score: float
    coverage_ratio: float


class AnalyzeResponse(BaseModel):
    risk_score: float
    canopy_volume: float
    biomass_estimate: float

    estimated_dbh_cm: Optional[float] = None
    estimated_tree_height_m: Optional[float] = None
    estimated_canopy_diameter_m: Optional[float] = None
    meter_per_pixel: Optional[float] = None
    calibration_method: Optional[str] = None

    detections: int
    avg_confidence: Optional[float] = None

    bounding_boxes: List[BoundingBox] = []
    person_boxes: List[PersonBox] = []

    risk_breakdown: Optional[RiskBreakdown] = None

    status: str

    latitude: float
    longitude: float
    description: str