"""
    This directory acts as a traffic controller.
    It receives requests, calls service modules, 
    and returns responses to clients.
"""

from fastapi import APIRouter, HTTPException
from schemas.report_schema import ReportRequest
from services.yolo_service import run_inference

router = APIRouter()

@router.post("/analyze")
async def analyze_tree(request: ReportRequest):
    print(f"[INFO] Menerima permintaan analisis. Tautan gambar: {request.image_url}")
    
    try:
        print("[INFO] Memulai proses inferensi gambar dengan mesin YOLOv8...")
        
        # Meneruskan tugas komputasi ke modul service
        metrics = run_inference(request.image_url)
        
        print("[SUCCESS] Inferensi awal selesai. Mengembalikan metrik estimasi ke klien.")
        return metrics
        
    except Exception as e:
        print(f"[ERROR] Terjadi kegagalan kritis saat proses inferensi: {e}")
        raise HTTPException(
            status_code=500, 
            detail="[ERROR] Failed to process the image for AI analysis. Please verify the URL or image format."
        )