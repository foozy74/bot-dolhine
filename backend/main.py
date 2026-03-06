from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from api.settings import router as settings_router
from core.config import get_settings
from core.database import init_db
from contextlib import asynccontextmanager
import os

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown

app = FastAPI(
    title="🐬 Delfin Bot",
    version="1.0.0",
    description="Bitunix Trading Bot",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(router, prefix="/api")
app.include_router(settings_router, prefix="/api")

# Frontend - React build (wenn vorhanden, sonst statische Dateien)
frontend_path = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    # Fallback: statisches Frontend
    app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
