# ---- Base image ----
FROM python:3.14-slim

# Dependencies sistem yang dibutuhin OpenCV/ultralytics (libgl, dll)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements dulu (biar layer cache-nya optimal, ga rebuild semua tiap ganti kode)
COPY requirements.txt .

# --no-cache-dir biar image lebih kecil (penting buat free tier)
RUN pip install --no-cache-dir -r requirements.txt

# Copy sisa source code (termasuk models/best.pt)
COPY . .

# Render inject $PORT secara dinamis, WAJIB pakai env var, bukan hardcode 8000
# --workers 1 karena RAM terbatas (512MB di free tier), model YOLOv8 lumayan makan memori
CMD uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1