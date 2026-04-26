"""Tests für den Settings Service"""
import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from backend.models.setting import Setting, Base
from backend.services.settings_service import SettingsService, DEFAULT_SETTINGS


@pytest.fixture
async def db_session():
    """Erstellt eine Test-Datenbank-Session"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def settings_service(db_session):
    """Erstellt einen SettingsService mit Test-Session"""
    service = SettingsService(db_session)
    await service.initialize_defaults()
    return service


class TestSettingsService:
    @pytest.mark.asyncio
    async def test_initialize_defaults(self, settings_service):
        """Testet Initialisierung der Default-Settings"""
        settings = await settings_service.get_all_settings(include_secrets=True)

        # Prüfe Kategorien
        assert "trading" in settings
        assert "api" in settings
        assert "notifications" in settings
        assert "system" in settings

        # Prüfe Trading-Settings
        assert "symbol" in settings["trading"]
        assert settings["trading"]["symbol"]["value"] == "BTCUSDT"

    @pytest.mark.asyncio
    async def test_get_all_settings_masks_secrets(self, settings_service):
        """Testet, dass Secrets maskiert werden"""
        settings = await settings_service.get_all_settings(include_secrets=False)

        api_key = settings["api"]["bitunix_api_key"]["value"]
        assert api_key == "••••••••"

    @pytest.mark.asyncio
    async def test_get_all_settings_includes_secrets(self, settings_service):
        """Testet, dass Secrets mit include_secrets=True sichtbar sind"""
        # Setze zuerst einen Wert
        await settings_service.update_setting("bitunix_api_key", "test_api_key_123")

        settings = await settings_service.get_all_settings(include_secrets=True)
        assert settings["api"]["bitunix_api_key"]["value"] == "test_api_key_123"

    @pytest.mark.asyncio
    async def test_update_setting(self, settings_service):
        """Testet Update eines Settings"""
        result = await settings_service.update_setting("symbol", "ETHUSDT")

        assert result["key"] == "symbol"
        assert result["value"] == "ETHUSDT"

        # Prüfe, dass es persistiert wurde
        setting = await settings_service.get_setting("symbol")
        assert setting["value"] == "ETHUSDT"

    @pytest.mark.asyncio
    async def test_update_setting_validation_min_max(self, settings_service):
        """Testet Validierung mit min/max Werten"""
        # Zu kleiner Wert
        with pytest.raises(ValueError, match="below minimum"):
            await settings_service.update_setting("risk_pct", 0.005)

        # Zu großer Wert
        with pytest.raises(ValueError, match="exceeds maximum"):
            await settings_service.update_setting("risk_pct", 0.20)

    @pytest.mark.asyncio
    async def test_update_setting_type_conversion(self, settings_service):
        """Testet Typ-Konvertierung beim Update"""
        # String zu bool
        result = await settings_service.update_setting("dry_run", "false")
        assert result["value"] == False

        # String zu int
        result = await settings_service.update_setting("ema_fast", "10")
        assert result["value"] == 10

        # String zu float
        result = await settings_service.update_setting("risk_pct", "0.05")
        assert result["value"] == 0.05

    @pytest.mark.asyncio
    async def test_update_setting_not_found(self, settings_service):
        """Testet Update eines nicht existierenden Settings"""
        with pytest.raises(ValueError, match="Setting 'nonexistent' not found"):
            await settings_service.update_setting("nonexistent", "value")

    @pytest.mark.asyncio
    async def test_get_setting(self, settings_service):
        """Testet Abruf eines einzelnen Settings"""
        setting = await settings_service.get_setting("symbol")

        assert setting["value"] == "BTCUSDT"
        assert setting["type"] == "string"
        assert setting["is_secret"] == False

    @pytest.mark.asyncio
    async def test_get_setting_not_found(self, settings_service):
        """Testet Abruf eines nicht existierenden Settings"""
        result = await settings_service.get_setting("nonexistent")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_settings_by_category(self, settings_service):
        """Testet Abruf aller Settings einer Kategorie"""
        trading_settings = await settings_service.get_settings_by_category("trading")

        assert "symbol" in trading_settings
        assert "timeframe" in trading_settings
        assert "risk_pct" in trading_settings

    @pytest.mark.asyncio
    async def test_update_settings_batch(self, settings_service):
        """Testet Batch-Update"""
        updates = {
            "symbol": "ETHUSDT",
            "timeframe": "15m"
        }

        results = await settings_service.update_settings_batch(updates)

        assert len(results) == 2
        assert all(r["status"] == "success" for r in results)

        # Prüfe Persistenz
        settings = await settings_service.get_all_settings()
        assert settings["trading"]["symbol"]["value"] == "ETHUSDT"
        assert settings["trading"]["timeframe"]["value"] == "15m"

    @pytest.mark.asyncio
    async def test_reset_to_defaults(self, settings_service):
        """Testet Reset auf Default-Werte"""
        # Ändere ein Setting
        await settings_service.update_setting("symbol", "ETHUSDT")

        # Reset
        results = await settings_service.reset_to_defaults()

        assert len(results) > 0
        assert all(r["status"] == "success" for r in results)

        # Prüfe, dass zurückgesetzt wurde
        setting = await settings_service.get_setting("symbol")
        assert setting["value"] == "BTCUSDT"

    @pytest.mark.asyncio
    async def test_get_settings_schema(self, settings_service):
        """Testet Abruf des Schemas für UI-Generierung"""
        schema = await settings_service.get_settings_schema()

        assert "trading" in schema
        assert "symbol" in schema["trading"]

        symbol_schema = schema["trading"]["symbol"]
        assert symbol_schema["type"] == "string"
        assert symbol_schema["default"] == "BTCUSDT"
        assert "description" in symbol_schema

    @pytest.mark.asyncio
    async def test_parse_value_bool(self, settings_service):
        """Testet Bool-Parsing"""
        service = settings_service

        assert service._parse_value("true", "bool") == True
        assert service._parse_value("false", "bool") == False
        assert service._parse_value("1", "bool") == True
        assert service._parse_value("0", "bool") == False
        assert service._parse_value("yes", "bool") == True
        assert service._parse_value("on", "bool") == True
