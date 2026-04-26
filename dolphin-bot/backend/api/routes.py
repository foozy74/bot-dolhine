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


# ─── Backtest Endpoints ───────────────────────────────────────
class BacktestConfig(BaseModel):
    symbol: str = "BTCUSDT"
    timeframe: str = "5m"
    days: int = 30
    initial_capital: float = 10000.0
    risk_per_trade: float = 0.02
    leverage: float = 1.0


@router.post("/backtest/run")
async def run_backtest(config: BacktestConfig):
    """Führt einen Backtest mit echten API-Daten durch"""
    try:
        # API Keys aus Settings laden
        async for session in get_session():
            settings_service = SettingsService(session)
            api_key_setting = await settings_service.get_setting('bitunix_api_key', include_secrets=True)
            secret_key_setting = await settings_service.get_setting('bitunix_secret_key', include_secrets=True)
            
            if not api_key_setting or not api_key_setting.get('value'):
                raise HTTPException(400, "API Key nicht konfiguriert!")
            if not secret_key_setting or not secret_key_setting.get('value'):
                raise HTTPException(400, "Secret Key nicht konfiguriert!")
            
            api_key = api_key_setting['value']
            secret_key = secret_key_setting['value']
        
        # Backtest ausführen
        from bot.backtest import AdvancedBacktester, BacktestConfig as BTConfig, generate_html_report
        
        bt_config = BTConfig(
            symbol=config.symbol,
            timeframe=config.timeframe,
            days=config.days,
            initial_capital=config.initial_capital,
            risk_per_trade=config.risk_per_trade,
            leverage=config.leverage
        )
        
        backtester = AdvancedBacktester(bt_config, api_key, secret_key)
        result = backtester.run_backtest()
        backtester.result = result
        
        # Ergebnisse extrahieren
        trades_summary = [
            {
                'entry_time': str(t.entry_time),
                'exit_time': str(t.exit_time) if t.exit_time else None,
                'direction': t.direction,
                'entry_price': t.entry_price,
                'exit_price': t.exit_price,
                'pnl': t.pnl,
                'pnl_percent': t.pnl_percent,
                'fees': t.fees,
                'exit_reason': t.exit_reason
            }
            for t in result.trades[-50:]  # Letzte 50 Trades
        ]
        
        # Equity Curve für Chart (alle 10 Datenpunkte für Performance)
        equity_data = result.equity_curve.iloc[::max(1, len(result.equity_curve)//100)].to_dict('records')
        
        return {
            'success': True,
            'metrics': result.metrics,
            'trades': trades_summary,
            'equity_curve': equity_data,
            'config': {
                'symbol': config.symbol,
                'timeframe': config.timeframe,
                'days': config.days,
                'initial_capital': config.initial_capital,
                'risk_per_trade': config.risk_per_trade
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Backtest Error: {str(e)}")
        raise HTTPException(500, f"Backtest fehlgeschlagen: {str(e)}")


@router.get("/backtest/config")
async def get_backtest_config():
    """Gibt Standard-Backtest-Konfiguration zurück"""
    return {
        'symbol': 'BTCUSDT',
        'timeframe': '5m',
        'days_options': [7, 30, 90],
        'initial_capital': 10000.0,
        'risk_per_trade': 0.02,
        'leverage': 1.0,
        'fee_rate': 0.0004,
        'slippage_rate': 0.0001
    }


# ─── Backtest Endpoints ───────────────────────────────────────
class BacktestConfig(BaseModel):
    symbol: str = "BTCUSDT"
    timeframe: str = "5m"
    days: int = 30
    initial_capital: float = 10000.0
    risk_per_trade: float = 0.02
    leverage: float = 1.0


@router.post("/backtest/run")
async def run_backtest(config: BacktestConfig):
    """Führt einen Backtest mit echten API-Daten durch"""
    try:
        # API Keys aus Settings laden
        async for session in get_session():
            settings_service = SettingsService(session)
            api_key_setting = await settings_service.get_setting('bitunix_api_key', include_secrets=True)
            secret_key_setting = await settings_service.get_setting('bitunix_secret_key', include_secrets=True)
            
            if not api_key_setting or not api_key_setting.get('value'):
                raise HTTPException(400, "API Key nicht konfiguriert!")
            if not secret_key_setting or not secret_key_setting.get('value'):
                raise HTTPException(400, "Secret Key nicht konfiguriert!")
            
            api_key = api_key_setting['value']
            secret_key = secret_key_setting['value']
        
        # Backtest ausführen
        from bot.backtest import AdvancedBacktester, BacktestConfig as BTConfig, generate_html_report
        
        bt_config = BTConfig(
            symbol=config.symbol,
            timeframe=config.timeframe,
            days=config.days,
            initial_capital=config.initial_capital,
            risk_per_trade=config.risk_per_trade,
            leverage=config.leverage
        )
        
        backtester = AdvancedBacktester(bt_config, api_key, secret_key)
        result = backtester.run_backtest()
        backtester.result = result
        
        # Ergebnisse extrahieren
        trades_summary = [
            {
                'entry_time': str(t.entry_time),
                'exit_time': str(t.exit_time) if t.exit_time else None,
                'direction': t.direction,
                'entry_price': t.entry_price,
                'exit_price': t.exit_price,
                'pnl': t.pnl,
                'pnl_percent': t.pnl_percent,
                'fees': t.fees,
                'exit_reason': t.exit_reason
            }
            for t in result.trades[-50:]  # Letzte 50 Trades
        ]
        
        # Equity Curve für Chart (alle 10 Datenpunkte für Performance)
        equity_data = result.equity_curve.iloc[::max(1, len(result.equity_curve)//100)].to_dict('records')
        
        return {
            'success': True,
            'metrics': result.metrics,
            'trades': trades_summary,
            'equity_curve': equity_data,
            'config': {
                'symbol': config.symbol,
                'timeframe': config.timeframe,
                'days': config.days,
                'initial_capital': config.initial_capital,
                'risk_per_trade': config.risk_per_trade
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Backtest Error: {str(e)}")
        raise HTTPException(500, f"Backtest fehlgeschlagen: {str(e)}")


@router.get("/backtest/config")
async def get_backtest_config():
    """Gibt Standard-Backtest-Konfiguration zurück"""
    return {
        'symbol': 'BTCUSDT',
        'timeframe': '5m',
        'days_options': [7, 30, 90],
        'initial_capital': 10000.0,
        'risk_per_trade': 0.02,
        'leverage': 1.0,
        'fee_rate': 0.0004,
        'slippage_rate': 0.0001
    }
