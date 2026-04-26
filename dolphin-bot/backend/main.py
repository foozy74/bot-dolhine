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
    
    # Initialize default settings
    from core.database import async_session_maker
    from services.settings_service import SettingsService
    async with async_session_maker() as session:
        service = SettingsService(session)
        await service.initialize_defaults()
        
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

# Note: Frontend wird von nginx geserved, nicht vom Backend
# Backend dient nur API-Endpunkte unter /api/
