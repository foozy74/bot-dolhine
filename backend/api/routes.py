from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from bot.bot_manager import BotManager
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
