"""Integration Tests für die API"""
import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app


@pytest_asyncio.fixture
async def client():
    """Erstellt einen Test-Client"""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as ac:
        yield ac


class TestHealth:
    @pytest.mark.asyncio
    async def test_health_endpoint(self, client):
        """Testet Health Check"""
        response = await client.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestSettings:
    @pytest.mark.asyncio
    async def test_initialize_settings(self, client):
        """Testet Settings Initialisierung"""
        response = await client.post("/api/settings/initialize")
        assert response.status_code == 200
        assert "initialized" in response.json()["message"].lower() or "success" in response.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_get_settings_schema(self, client):
        """Testet Schema-Abruf"""
        response = await client.get("/api/settings/schema/form")
        assert response.status_code == 200
        data = response.json()
        assert "trading" in data
        assert "api" in data


class TestBot:
    @pytest.mark.asyncio
    async def test_get_status_not_running(self, client):
        """Testet Status ohne laufenden Bot"""
        response = await client.get("/api/status")
        assert response.status_code == 200
        data = response.json()
        assert data["running"] == False
        assert "symbol" in data

    @pytest.mark.asyncio
    async def test_start_bot_dry_run(self, client):
        """Testet Bot-Start im Dry-Run Mode"""
        config = {
            "api_key": "test_key",
            "secret_key": "test_secret",
            "symbol": "BTCUSDT",
            "timeframe": "5m",
            "risk_pct": 0.02,
            "dry_run": True
        }
        response = await client.post("/api/bot/start", json=config)
        assert response.status_code == 200
        assert "gestartet" in response.json()["message"].lower() or "started" in response.json()["message"].lower()

        # Status prüfen
        response = await client.get("/api/status")
        assert response.status_code == 200
        data = response.json()
        assert data["running"] == True
        assert data["symbol"] == "BTCUSDT"

    @pytest.mark.asyncio
    async def test_stop_bot(self, client):
        """Testet Bot-Stop"""
        response = await client.post("/api/bot/stop")
        assert response.status_code == 200
        assert "gestoppt" in response.json()["message"].lower() or "stopped" in response.json()["message"].lower()

        # Status prüfen
        response = await client.get("/api/status")
        assert response.status_code == 200
        data = response.json()
        assert data["running"] == False
