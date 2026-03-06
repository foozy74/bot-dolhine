from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from core.config import get_settings
settings = get_settings()
app = FastAPI(
    title="🐬 Delfin Bot",
    version="1.0.0",
    description="Bitunix Trading Bot"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],
    allow_methods=[""],
    allow_headers=["*"],
)
# API Routes
app.include_router(router, prefix="/api")
# Frontend
app.mount(
    "/",
    StaticFiles(directory="../frontend", html=True),
    name="frontend"
)
