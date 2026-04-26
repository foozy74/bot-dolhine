from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from models.setting import Setting
from typing import Optional, List, Dict, Any
import json

# Default Settings mit Validierungsregeln
DEFAULT_SETTINGS = {
    "trading": {
        "symbol": {"value": "BTCUSDT", "type": "string", "description": "Trading pair symbol"},
        "timeframe": {"value": "5m", "type": "string", "description": "Candle timeframe (1m, 5m, 15m, 1h)"},
        "risk_pct": {"value": 0.02, "type": "float", "description": "Risk percentage per trade (0.01-0.10)", "min": 0.01, "max": 0.10},
        "dry_run": {"value": True, "type": "bool", "description": "Test mode without real trades"},
        "ema_fast": {"value": 8, "type": "int", "description": "Fast EMA period", "min": 5, "max": 50},
        "ema_slow": {"value": 21, "type": "int", "description": "Slow EMA period", "min": 10, "max": 100},
        "rsi_period": {"value": 14, "type": "int", "description": "RSI calculation period", "min": 5, "max": 30},
        "rsi_overbought": {"value": 70, "type": "int", "description": "RSI overbought level", "min": 60, "max": 90},
        "rsi_oversold": {"value": 30, "type": "int", "description": "RSI oversold level", "min": 10, "max": 40},
    },
    "api": {
        "bitunix_api_key": {"value": "", "type": "string", "is_secret": True, "description": "Bitunix API Key"},
        "bitunix_secret_key": {"value": "", "type": "string", "is_secret": True, "description": "Bitunix Secret Key"},
        "bitunix_base_url": {"value": "https://api.bitunix.com", "type": "string", "description": "Bitunix API Base URL"},
    },
    "notifications": {
        "telegram_bot_token": {"value": "", "type": "string", "is_secret": True, "description": "Telegram Bot Token"},
        "telegram_chat_id": {"value": "", "type": "string", "description": "Telegram Chat ID"},
        "enable_telegram": {"value": False, "type": "bool", "description": "Enable Telegram notifications"},
    },
    "system": {
        "health_check_interval": {"value": 30, "type": "int", "description": "Health check interval in seconds", "min": 10, "max": 300},
        "websocket_reconnect_delay": {"value": 5, "type": "int", "description": "WebSocket reconnect delay in seconds", "min": 1, "max": 60},
        "max_trade_history": {"value": 1000, "type": "int", "description": "Maximum trade history to keep", "min": 100, "max": 10000},
    }
}

class SettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def initialize_defaults(self):
        """Initialize database with default settings"""
        for category, settings in DEFAULT_SETTINGS.items():
            for key, config in settings.items():
                existing = await self.session.execute(
                    select(Setting).where(Setting.key == key)
                )
                if not existing.scalar_one_or_none():
                    setting = Setting(
                        category=category,
                        key=key,
                        value=str(config["value"]),
                        value_type=config["type"],
                        is_secret=config.get("is_secret", False),
                        description=config.get("description"),
                        min_value=config.get("min"),
                        max_value=config.get("max")
                    )
                    self.session.add(setting)
        await self.session.commit()
    
    async def get_all_settings(self, include_secrets: bool = False) -> Dict[str, Any]:
        """Get all settings organized by category"""
        result = await self.session.execute(select(Setting))
        settings = result.scalars().all()
        
        organized = {}
        for setting in settings:
            if setting.category not in organized:
                organized[setting.category] = {}
            
            value = self._parse_value(setting.value, setting.value_type)
            
            # Mask secrets if not explicitly requested
            if setting.is_secret and not include_secrets:
                value = "••••••••"
            
            organized[setting.category][setting.key] = {
                "value": value,
                "type": setting.value_type,
                "is_secret": setting.is_secret,
                "description": setting.description,
                "min": setting.min_value,
                "max": setting.max_value
            }
        
        return organized
    
    async def get_setting(self, key: str, include_secrets: bool = False) -> Optional[Dict[str, Any]]:
        """Get a single setting by key"""
        result = await self.session.execute(
            select(Setting).where(Setting.key == key)
        )
        setting = result.scalar_one_or_none()
        
        if not setting:
            return None
        
        value = self._parse_value(setting.value, setting.value_type)
        
        if setting.is_secret and not include_secrets:
            value = "••••••••"
        
        return {
            "value": value,
            "type": setting.value_type,
            "is_secret": setting.is_secret,
            "description": setting.description,
            "min": setting.min_value,
            "max": setting.max_value
        }
    
    async def get_settings_by_category(self, category: str, include_secrets: bool = False) -> Dict[str, Any]:
        """Get all settings for a specific category"""
        result = await self.session.execute(
            select(Setting).where(Setting.category == category)
        )
        settings = result.scalars().all()
        
        return {
            setting.key: {
                "value": self._parse_value(setting.value, setting.value_type) if not (setting.is_secret and not include_secrets) else "••••••••",
                "type": setting.value_type,
                "is_secret": setting.is_secret,
                "description": setting.description,
                "min": setting.min_value,
                "max": setting.max_value
            }
            for setting in settings
        }
    
    async def update_setting(self, key: str, value: Any) -> Dict[str, Any]:
        """Update a single setting with validation"""
        result = await self.session.execute(
            select(Setting).where(Setting.key == key)
        )
        setting = result.scalar_one_or_none()
        
        if not setting:
            raise ValueError(f"Setting '{key}' not found")
        
        # Validate value
        validated_value = self._validate_value(value, setting)
        
        # Update
        setting.value = str(validated_value)
        await self.session.commit()
        
        return {
            "key": key,
            "value": validated_value,
            "message": f"Setting '{key}' updated successfully"
        }
    
    async def update_settings_batch(self, updates: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Update multiple settings at once"""
        results = []
        for key, value in updates.items():
            try:
                result = await self.update_setting(key, value)
                results.append({"key": key, "status": "success", "message": result["message"]})
            except ValueError as e:
                results.append({"key": key, "status": "error", "message": str(e)})
        
        return results
    
    async def reset_to_defaults(self) -> List[Dict[str, Any]]:
        """Reset all settings to defaults"""
        results = []
        
        for category, settings in DEFAULT_SETTINGS.items():
            for key, config in settings.items():
                try:
                    await self.update_setting(key, config["value"])
                    results.append({"key": key, "status": "success", "message": f"Reset to default: {config['value']}"})
                except ValueError as e:
                    results.append({"key": key, "status": "error", "message": str(e)})
        
        return results
    
    def _parse_value(self, value: str, value_type: str) -> Any:
        """Parse string value to correct type"""
        if value_type == "bool":
            return value.lower() in ("true", "1", "yes", "on")
        elif value_type == "int":
            return int(value)
        elif value_type == "float":
            return float(value)
        return value
    
    def _validate_value(self, value: Any, setting: Setting) -> Any:
        """Validate value against setting constraints"""
        # Type conversion
        if setting.value_type == "bool":
            if isinstance(value, str):
                value = value.lower() in ("true", "1", "yes", "on")
            value = bool(value)
        elif setting.value_type == "int":
            value = int(value)
        elif setting.value_type == "float":
            value = float(value)
        
        # Range validation for numeric types
        if setting.value_type in ("int", "float"):
            if setting.min_value is not None and value < setting.min_value:
                raise ValueError(
                    f"Value {value} is below minimum {setting.min_value} for setting '{setting.key}'"
                )
            if setting.max_value is not None and value > setting.max_value:
                raise ValueError(
                    f"Value {value} exceeds maximum {setting.max_value} for setting '{setting.key}'"
                )
        
        return value
    
    async def get_settings_schema(self) -> Dict[str, Any]:
        """Get settings schema for UI form generation"""
        schema = {}
        for category, settings in DEFAULT_SETTINGS.items():
            schema[category] = {
                key: {
                    "type": config["type"],
                    "is_secret": config.get("is_secret", False),
                    "description": config.get("description"),
                    "min": config.get("min"),
                    "max": config.get("max"),
                    "default": config["value"]
                }
                for key, config in settings.items()
            }
        return schema
