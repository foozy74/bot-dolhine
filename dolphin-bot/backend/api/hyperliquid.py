from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import time
from bot.hyperliquid_api import HyperliquidAPI

router = APIRouter(prefix="/hyperliquid", tags=["Hyperliquid L1"])
hl_api = HyperliquidAPI()

class PrepareOrderRequest(BaseModel):
    coin: str = "BTC"
    is_buy: bool = True
    size: float = 0.01
    price: Optional[float] = None
    reduce_only: bool = False

class PaperOrderRequest(BaseModel):
    coin: str = "BTC"
    is_buy: bool = True
    size: float = 0.01
    price: Optional[float] = None
    wallet_address: Optional[str] = None

@router.get("/status")
async def get_status():
    """Get Hyperliquid network connectivity and config"""
    return {
        "status": "online",
        **hl_api.get_network_info()
    }

@router.get("/mids")
async def get_mids():
    """Get all current mid prices from Hyperliquid L1"""
    mids = hl_api.get_all_mids()
    return {
        "count": len(mids),
        "mids": mids
    }

@router.get("/meta")
async def get_meta():
    """Get Hyperliquid perpetuals universe metadata"""
    meta = hl_api.get_meta()
    return {
        "assets": meta
    }

@router.get("/account/{address}")
async def get_account_state(address: str):
    """Get clearinghouse margin, cash, and open positions for a connected wallet"""
    if not address.startswith("0x") or len(address) != 42:
        raise HTTPException(status_code=400, detail="Ungültige Ethereum / Hyperliquid Wallet-Adresse")
    
    state = hl_api.get_account_state(address)
    return state

@router.get("/candles")
async def get_candles(
    coin: str = Query("BTC", description="Coin symbol, e.g. BTC, ETH, SOL"),
    interval: str = Query("5m", description="Candle interval (1m, 5m, 15m, 1h, 4h, 1d)"),
    limit: int = Query(50, description="Number of candles")
):
    """Get historical candles from Hyperliquid"""
    candles = hl_api.get_candles(coin=coin, interval=interval, limit=limit)
    return {
        "coin": coin.upper(),
        "interval": interval,
        "count": len(candles),
        "candles": candles
    }

@router.post("/order/prepare")
async def prepare_order(req: PrepareOrderRequest):
    """Prepare EIP-712 payload for browser wallet signing"""
    price = req.price
    if price is None or price <= 0:
        mids = hl_api.get_all_mids()
        price = mids.get(req.coin.upper(), 0.0)
        if price <= 0:
            raise HTTPException(status_code=400, detail=f"Kein Live-Preis für {req.coin} gefunden")

    payload = hl_api.prepare_order_payload(
        coin=req.coin,
        is_buy=req.is_buy,
        size=req.size,
        price=price,
        reduce_only=req.reduce_only
    )
    return payload

@router.post("/order/paper")
async def execute_paper_order(req: PaperOrderRequest):
    """Execute a simulated paper trade on Hyperliquid live price feed"""
    mids = hl_api.get_all_mids()
    current_price = mids.get(req.coin.upper(), req.price or 0.0)
    
    if current_price <= 0:
        raise HTTPException(status_code=400, detail=f"Live-Kurs für {req.coin} nicht verfügbar")

    simulated_trade = {
        "mode": "paper_trading",
        "platform": "Hyperliquid L1",
        "coin": req.coin.upper(),
        "action": "BUY" if req.is_buy else "SELL",
        "size": req.size,
        "execution_price": current_price,
        "notional_value": round(req.size * current_price, 2),
        "wallet": req.wallet_address or "0xSIMULATED_WALLET",
        "status": "FILLED_SIMULATED",
        "timestamp": int(time.time() * 1000)
    }
    return simulated_trade
