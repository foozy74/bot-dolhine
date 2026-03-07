import asyncio
from datetime import datetime
from .bitunix_api import BitunixAPI
from .strategy    import DolphinStrategy
class BotManager:
    def __init__(self):
            self._running  = False
            self.api       = None
            self.strategy  = DolphinStrategy()
            self._broadcast = None
            self.trade_log = []
            self.status    = {
                "running":      False,
                "position":     None,
                "entry_price":  0,
                "current_price":0,
                "stop_loss":    0,
                "take_profit":  0,
                "pnl":          0,
                "total_pnl":    0,
                "last_signal":  None,
                "last_update":  None,
                "symbol":       None,
                "dry_run":      True,
            }
    def is_running(self)    -> bool: return self._running
    def get_status(self)    -> dict: return {**self.status, "type": "status"}
    def get_trade_log(self) -> list: return self.trade_log

    async def start(self, config: dict, broadcast_fn):
        self._running   = True
        self._broadcast = broadcast_fn
        
        # Validate API keys before starting
        if not config.get('api_key') or config['api_key'] in ['', 'dein_api_key_hier']:
            await self._log("❌ Fehler: Bitunix API Key nicht konfiguriert!", "error")
            self._running = False
            self.status['running'] = False
            return
        
        try:
            self.api = BitunixAPI(config['api_key'], config['secret_key'])
            # Test API connection
            await self._log("🔌 Teste Bitunix API Verbindung...")
            test_data = self.api.get_klines(config['symbol'], config['timeframe'], limit=5)
            if not test_data or len(test_data) == 0:
                await self._log("❌ Fehler: Konnte keine Daten von Bitunix API abrufen", "error")
                self._running = False
                self.status['running'] = False
                return
            await self._log(f"✅ API Verbindung OK - {len(test_data)} Candlesticks empfangen")
        except Exception as e:
            await self._log(f"❌ API Fehler: {str(e)}", "error")
            self._running = False
            self.status['running'] = False
            return
        
        self.status.update({
            "running": True,
            "symbol":  config['symbol'],
            "dry_run": config['dry_run'],
        })

        interval_map = {'1m':60,'3m':180,'5m':300,'15m':900,'1h':3600}
        sleep_time   = interval_map.get(config['timeframe'], 300)

        await self._log(f"🐬 Bot gestartet | {config['symbol']} | {config['timeframe']}")
        await self._broadcast(self.get_status())

        while self._running:
            try:
                await self._tick(config, sleep_time)
            except Exception as e:
                error_msg = f"❌ Fehler in Trading Loop: {str(e)}"
                await self._log(error_msg, "error")
                print(error_msg)  # Also print to container logs
                await asyncio.sleep(30)

    async def stop(self):
        self._running = False
        self.status['running'] = False
        await self._log("⛔ Bot gestoppt")

    async def _tick(self, config, sleep_time):
        raw   = self.api.get_klines(config['symbol'], config['timeframe'])
        df    = self.strategy.prepare_dataframe(raw)
        df    = self.strategy.calculate_all(df)
        price = float(df['close'].iloc[-1])

        self.status.update({
            "current_price": price,
            "last_update":   datetime.now().isoformat()
        })

        if self.status['position']:
            entry = self.status['entry_price']
            pct   = (price - entry) / entry * 100
            self.status['pnl'] = round(
                pct if self.status['position'] == 'LONG' else -pct, 2
            )

        await self._check_exit(price)

        signal, info = self.strategy.get_signal(df)
        self.status['last_signal'] = signal

        if signal and not self.status['position']:
            atr = float(df['atr'].iloc[-1])
            await self._open_position(signal, price, atr, config)

        await self._broadcast(self.get_status())
        await asyncio.sleep(sleep_time)

    async def _open_position(self, signal, price, atr, config):
        sl, tp = self.strategy.calculate_levels(price, atr, signal)
        self.status.update({
            "position":    signal,
            "entry_price": price,
            "stop_loss":   sl,
            "take_profit": tp,
            "pnl":         0
        })
        trade = {
            "time": datetime.now().isoformat(),
            "action": f"OPEN_{signal}",
            "price": price,
            "stop_loss": sl,
            "take_profit": tp
        }
        self.trade_log.append(trade)
        await self._broadcast({"type": "trade", "message": f"🐬 {signal} @ {price:.4f}", **trade})

    async def _check_exit(self, price):
        pos = self.status['position']
        if not pos:
            return
        reason = None
        if pos == 'LONG':
            if price <= self.status['stop_loss']:   reason = 'STOP_LOSS'
            elif price >= self.status['take_profit']: reason = 'TAKE_PROFIT'
        elif pos == 'SHORT':
            if price >= self.status['stop_loss']:   reason = 'STOP_LOSS'
            elif price <= self.status['take_profit']: reason = 'TAKE_PROFIT'

        if reason:
            pnl = self.status['pnl']
            self.status['total_pnl'] = round(self.status['total_pnl'] + pnl, 2)
            trade = {"time": datetime.now().isoformat(), "action": f"CLOSE_{reason}", "price": price, "pnl": pnl}
            self.trade_log.append(trade)
            await self._broadcast({"type": "trade", "message": f"{'🟢' if pnl > 0 else '🔴'} {reason} | PnL: {pnl:+.2f}%", **trade})
            self.status.update({"position": None, "entry_price": 0, "stop_loss": 0, "take_profit": 0, "pnl": 0})

    async def _log(self, msg: str, level: str = "info"):
        if self._broadcast:
            await self._broadcast({"type": "log", "level": level, "message": msg})
