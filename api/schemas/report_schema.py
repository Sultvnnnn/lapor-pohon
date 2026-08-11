"""
    This directory specifically stores data type definitions 
    and validations using Pydantic
"""

from pydantic import BaseModel

class ReportRequest(BaseModel):
    image_url: str
    latitude: float
    longitude: float
    description: str