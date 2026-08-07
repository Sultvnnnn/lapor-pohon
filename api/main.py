import uvicorn
from fastapi import FastAPI
from routers import analyze

app = FastAPI(title="LaporPohon AI Inference Engine")

# router
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])

if __name__ == "__main__":
    print("[INFO] Starting FastAPI...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)