# LaporPohon (MVP DSDC ANFORCOM 2026)

LaporPohon adalah sebuah platform berstandar industri yang dirancang untuk mengelola ekosistem pohon perkotaan secara sirkular. Sistem ini memanfaatkan kecerdasan buatan (AI) untuk menganalisis risiko bahaya pohon, menghitung volume kanopi, dan mengestimasi potensi biomassa kayu yang dapat dimanfaatkan oleh UMKM, sekaligus mencatat "hutang tanam" (replant debt) demi kelestarian lingkungan.

## Arsitektur & Tech Stack

Proyek ini menggunakan pendekatan **Monorepo** yang memisahkan beban kerja komputasi AI dengan antarmuka pengguna.

- **Frontend & Routing:** Next.js (TypeScript, App Router) dengan eksekutor Bun.
- **UI & Styling:** Tailwind CSS, shadcn/ui (Radix UI), Framer Motion.
- **State & Data Fetching:** Zustand (Client) & TanStack Query (Server).
- **Backend AI (Microservice):** FastAPI (Python) & YOLOv8.
- **Database & BaaS:** Supabase (PostgreSQL, PostGIS, Auth, Storage, RLS).
- **Deployment:** Vercel (Frontend) & Hugging Face Spaces (Backend AI).

## Struktur Direktori

```text
lapor-pohon/
├── web/                  # Lingkungan Frontend (Next.js & Bun)
│   ├── src/              # Kode sumber UI, Form, dan Integrasi Supabase
│   └── package.json      # Dependensi Frontend
├── api/                  # Lingkungan Backend AI (FastAPI & Python)
│   ├── main.py           # Endpoint inferensi YOLOv8
│   └── requirements.txt  # Dependensi Machine Learning
└── README.md             # Dokumentasi Proyek
```

## Cara Menjalankan Proyek

Pastikan Anda memiliki [Bun](https://bun.sh/) dan [Python](https://python.org) terinstal di sistem Anda.

### 1. Menjalankan Frontend (Web)

```bash
cd web
bun install
bun run dev
# Aplikasi web akan berjalan di http://localhost:3000
```

### 2. Menjalankan Backend AI (API)

```bash
cd api
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn main:app --reload
# Dokumentasi API interaktif (Swagger UI) akan tersedia di http://localhost:8000/docs
```

## Tim Pengembang

- **Mayang Putri Mutiara**

Teknologi Informasi, Institut Teknologi Tangerang Selatan

- **Sultan Abdul Fatah**

Informatika, Institut Teknologi Tangerang Selatan

- **Sahrul Solihin**

Informatika, Institut Teknologi Tangerang Selatan
