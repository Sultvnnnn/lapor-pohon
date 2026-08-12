"""
    This directory acts as a traffic controller.
    It receives requests, calls service modules, 
    and returns responses to clients.
"""

from fastapi import APIRouter, HTTPException
from schemas.report_schema import ReportRequest, AnalyzeResponse
from services.yolo_service import run_inference

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_tree(request: ReportRequest):
    print(f"[INFO] Menerima permintaan analisis. Tautan gambar: {request.image_url}")
    print(f"[INFO] Lokasi laporan: ({request.latitude}, {request.longitude})")
    
    try:
        print("[INFO] Memulai proses inferensi gambar dengan mesin YOLOv8...")
        
        metrics = run_inference(request.image_url)
        
        # Gabungkan hasil AI dengan metadata laporan (lokasi & deskripsi)
        response = {
            **metrics,
            "latitude": request.latitude,
            "longitude": request.longitude,
            "description": request.description
        }
        
        print("[SUCCESS] Inferensi awal selesai. Mengembalikan hasil lengkap ke klien.")
        return response
        
    except Exception as e:
        print(f"[ERROR] Terjadi kegagalan kritis saat proses inferensi: {e}")
        raise HTTPException(
            status_code=500, 
            detail="[ERROR] Failed to process the image for AI analysis. Please verify the URL or image format."
        )