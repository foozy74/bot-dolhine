from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_session, init_db
from services.settings_service import SettingsService
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field, validator
from decimal import Decimal

router = APIRouter(prefix="/settings", tags=["Settings"])

class UpdateSettingRequest(BaseModel):
    value: Any

class UpdateSettingsBatchRequest(BaseModel):
    settings: Dict[str, Any]

class SettingResponse(BaseModel):
    key: str
    value: Any
    type: str
    is_secret: bool
    description: Optional[str]
    min: Optional[float]
    max: Optional[float]

async def get_settings_service(session: AsyncSession = Depends(get_session)) -> SettingsService:
    return SettingsService(session)

@router.get("/", response_model=Dict[str, Dict[str, Any]])
async def get_all_settings(
    include_secrets: bool = Query(False, description="Include secret values"),
    service: SettingsService = Depends(get_settings_service)
):
    """Get all settings organized by category"""
    return await service.get_all_settings(include_secrets=include_secrets)

@router.get("/{category}", response_model=Dict[str, Dict[str, Any]])
async def get_settings_by_category(
    category: str,
    include_secrets: bool = Query(False, description="Include secret values"),
    service: SettingsService = Depends(get_settings_service)
):
    """Get all settings for a specific category"""
    valid_categories = ["trading", "api", "notifications", "system"]
    if category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}")
    
    return await service.get_settings_by_category(category, include_secrets=include_secrets)

@router.get("/key/{key}", response_model=Dict[str, Any])
async def get_setting(
    key: str,
    include_secrets: bool = Query(False, description="Include secret value"),
    service: SettingsService = Depends(get_settings_service)
):
    """Get a single setting by key"""
    setting = await service.get_setting(key, include_secrets=include_secrets)
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    return setting

@router.put("/key/{key}", response_model=Dict[str, Any])
async def update_setting(
    key: str,
    request: UpdateSettingRequest,
    service: SettingsService = Depends(get_settings_service)
):
    """Update a single setting"""
    try:
        result = await service.update_setting(key, request.value)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/batch", response_model=List[Dict[str, Any]])
async def update_settings_batch(
    request: UpdateSettingsBatchRequest,
    service: SettingsService = Depends(get_settings_service)
):
    """Update multiple settings at once"""
    return await service.update_settings_batch(request.settings)

@router.post("/reset", response_model=List[Dict[str, Any]])
async def reset_to_defaults(
    service: SettingsService = Depends(get_settings_service)
):
    """Reset all settings to their default values"""
    return await service.reset_to_defaults()

@router.get("/schema/form", response_model=Dict[str, Any])
async def get_settings_schema(
    service: SettingsService = Depends(get_settings_service)
):
    """Get settings schema for UI form generation"""
    return await service.get_settings_schema()

@router.post("/initialize")
async def initialize_settings(
    service: SettingsService = Depends(get_settings_service)
):
    """Initialize database with default settings (run once on startup)"""
    await service.initialize_defaults()
    return {"message": "Settings initialized successfully"}
