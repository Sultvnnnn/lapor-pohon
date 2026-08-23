import os
from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze

app = FastAPI(title="LaporPohon AI Inference Engine")
origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "LaporPohon AI Inference Engine"}

# router
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])

if __name__ == "__main__":
    print("[INFO] Starting FastAPI...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)