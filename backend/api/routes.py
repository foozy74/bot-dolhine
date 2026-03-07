from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from bot.bot_manager import BotManager
from services.settings_service import SettingsService
from core.database import get_session
import asyncio

router      = APIRouter()
bot_manager = BotManager()
clients: list[WebSocket] = []

# ─── Models ──────────────────────────────────────────
class BotConfig(BaseModel):
    api_key:    str
    secret_key: str
    symbol:     str   = "BTCUSDT"
    timeframe:  str   = "5m"
    risk_pct:   float = 0.02
    dry_run:    bool  = True

# ─── Endpoints ───────────────────────────────────────
@router.get("/status")
async def status():
    return bot_manager.get_status()

@router.get("/health")
async def health():
    return {"status": "ok"}

@router.post("/bot/start")
async def start(config: BotConfig):
    if bot_manager.is_running():
        raise HTTPException(400, "Bot läuft bereits!")
    
    # Load API keys from database if not provided
    async for session in get_session():
        settings_service = SettingsService(session)
        if not config.api_key or config.api_key == '':
            api_key_setting = await settings_service.get_setting('bitunix_api_key', include_secrets=True)
            if api_key_setting and api_key_setting.get('value'):
                config.api_key = api_key_setting['value']
        if not config.secret_key or config.secret_key == '':
            secret_key_setting = await settings_service.get_setting('bitunix_secret_key', include_secrets=True)
            if secret_key_setting and secret_key_setting.get('value'):
                config.secret_key = secret_key_setting['value']
    
    asyncio.create_task(bot_manager.start(config.dict(), broadcast))
    return {"message": "Bot gestartet ✅"}

@router.post("/bot/stop")
async def stop():
    await bot_manager.stop()
    return {"message": "Bot gestoppt ⛔"}

@router.get("/trades")
async def trades():
    return bot_manager.get_trade_log()

# ─── WebSocket ───────────────────────────────────────
@router.websocket("/ws")
async def websocket(ws: WebSocket):
    await ws.accept()
    clients.append(ws)
    try:
        await ws.send_json(bot_manager.get_status())
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        clients.remove(ws)

async def broadcast(data: dict):
    dead = []
    for c in clients:
        try:
            await c.send_json(data)
        except:
            dead.append(c)
    for c in dead:
        clients.remove(c)
