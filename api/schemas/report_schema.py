"""
    This directory specifically stores data type definitions 
    and validations using Pydantic
"""

from pydantic import BaseModel
from typing import Optional, List

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

class AnalyzeResponse(BaseModel):
    risk_score: float
    canopy_volume: float
    biomass_estimate: float
    estimated_dbh_cm: Optional[float] = None
    detections: int
    avg_confidence: Optional[float] = None
    bounding_boxes: List[BoundingBox] = []
    status: str
    latitude: float
    longitude: float
    description: str