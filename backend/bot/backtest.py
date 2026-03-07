"""
🐬 Delfin Bot - Fortgeschrittener Backtest

Backtest-Engine für die Dolphin Trading Strategie mit:
- Historische Daten von Bitunix API
- Slippage-Simulation
- Dynamische Fee-Berechnung
- Position Sizing
- Umfassende Performance-Metriken
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
import json

from .strategy import DolphinStrategy
from .bitunix_api import BitunixAPI


@dataclass
class Trade:
    """Repräsentiert einen einzelnen Trade"""
    entry_time: datetime
    exit_time: Optional[datetime]
    direction: str  # LONG oder SHORT
    entry_price: float
    exit_price: Optional[float]
    size: float
    pnl: float = 0.0
    pnl_percent: float = 0.0
    fees: float = 0.0
    slippage: float = 0.0
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    max_profit: float = 0.0
    max_loss: float = 0.0
    duration_minutes: float = 0.0
    exit_reason: str = ""  # TP, SL, SIGNAL, STOP


@dataclass
class BacktestConfig:
    """Backtest-Konfiguration"""
    symbol: str = "BTCUSDT"
    timeframe: str = "5m"
    days: int = 30
    initial_capital: float = 10000.0
    risk_per_trade: float = 0.02  # 2%
    leverage: float = 1.0
    fee_rate: float = 0.0004  # 0.04% pro Trade
    slippage_rate: float = 0.0001  # 0.01% Slippage
    enable_slippage: bool = True
    enable_fees: bool = True


@dataclass
class BacktestResult:
    """Backtest-Ergebnisse"""
    config: BacktestConfig
    trades: List[Trade]
    equity_curve: pd.DataFrame
    metrics: Dict
    daily_returns: pd.Series


class AdvancedBacktester:
    """Fortgeschrittene Backtest-Engine"""
    
    def __init__(self, config: BacktestConfig, api_key: str = "", secret_key: str = ""):
        self.config = config
        self.strategy = DolphinStrategy()
        self.api = BitunixAPI(api_key, secret_key) if api_key and secret_key else None
        
        # State Variables
        self.capital = config.initial_capital
        self.position = None
        self.trades: List[Trade] = []
        self.equity_curve = []
        self.df = None
        
    def load_historical_data(self, symbol: str, timeframe: str, days: int) -> pd.DataFrame:
        """
        Lädt historische Kline-Daten von Bitunix API
        
        Args:
            symbol: Trading Pair (z.B. BTCUSDT)
            timeframe: Zeitrahmen (1m, 5m, 15m, 1h, etc.)
            days: Anzahl der Tage
            
        Returns:
            DataFrame mit historischen Daten
        """
        if self.api is None:
            # Mock-Daten für Tests ohne API-Key
            return self._generate_mock_data(days, timeframe)
        
        # Berechne Anzahl der Kerzen basierend auf Timeframe
        timeframe_minutes = {
            '1m': 1, '5m': 5, '15m': 15, '30m': 30,
            '1h': 60, '4h': 240, '1d': 1440
        }
        
        minutes_per_candle = timeframe_minutes.get(timeframe, 5)
        candles_per_day = (24 * 60) // minutes_per_candle
        total_candles = min(candles_per_day * days, 200)  # API Limit
        
        # Hole Daten von API
        print(f"📊 Lade historische Daten für {symbol} ({timeframe}, {days} Tage)...")
        raw_data = self.api.get_klines(symbol, timeframe, limit=total_candles)
        
        if not raw_data or len(raw_data) == 0:
            print("⚠️ Keine Daten von API erhalten, verwende Mock-Daten")
            return self._generate_mock_data(days, timeframe)
        
        # Daten in DataFrame konvertieren
        df = self.strategy.prepare_dataframe(raw_data)
        print(f"✅ {len(df)} Kerzen geladen")
        
        return df
    
    def _generate_mock_data(self, days: int, timeframe: str) -> pd.DataFrame:
        """Generiert realistische Mock-Daten für Tests"""
        np.random.seed(42)
        
        # Timeframe in Minuten
        timeframe_minutes = {'1m': 1, '5m': 5, '15m': 15, '30m': 30, '1h': 60, '4h': 240, '1d': 1440}
        minutes_per_candle = timeframe_minutes.get(timeframe, 5)
        total_candles = (days * 24 * 60) // minutes_per_candle
        
        # BTC-ähnliche Preisbewegung simulieren
        base_price = 50000
        returns = np.random.normal(0.0001, 0.02, total_candles)  # Daily return ~0.01%, Volatility 2%
        price_series = base_price * np.cumprod(1 + returns)
        
        # OHLC Daten generieren
        data = []
        for i in range(total_candles):
            open_price = price_series[i]
            close_price = price_series[i] * (1 + np.random.normal(0, 0.005))
            high_price = max(open_price, close_price) * (1 + abs(np.random.normal(0, 0.003)))
            low_price = min(open_price, close_price) * (1 - abs(np.random.normal(0, 0.003)))
            volume = np.random.randint(1000, 10000)
            
            data.append({
                'timestamp': datetime.now() - timedelta(minutes=minutes_per_candle * (total_candles - i)),
                'open': open_price,
                'high': high_price,
                'low': low_price,
                'close': close_price,
                'volume': volume
            })
        
        df = pd.DataFrame(data)
        return df
    
    def run_backtest(self) -> BacktestResult:
        """
        Führt den Backtest durch
        
        Returns:
            BacktestResult mit allen Ergebnissen
        """
        print(f"\n🚀 Starte Backtest für {self.config.symbol}...")
        print(f"   Zeitraum: {self.config.days} Tage")
        print(f"   Startkapital: ${self.config.initial_capital:,.2f}")
        print(f"   Risiko pro Trade: {self.config.risk_per_trade * 100}%")
        
        # Lade Daten
        self.df = self.load_historical_data(
            self.config.symbol,
            self.config.timeframe,
            self.config.days
        )
        
        # Berechne Indikatoren
        self.df = self.strategy.calculate_all(self.df)
        
        # Initialisiere State
        self.capital = self.config.initial_capital
        self.position = None
        self.trades = []
        self.equity_curve = []
        
        # Durchlaufe alle Datenpunkte
        print("\n📈 Simuliere Trades...")
        for i in range(50, len(self.df)):  # Starte nach 50 Kerzen für Indikator-Berechnung
            current_row = self.df.iloc[i]
            self._process_bar(i, current_row)
            
            # Equity Curve aktualisieren
            current_equity = self.capital + self._calculate_unrealized_pnl(current_row)
            self.equity_curve.append({
                'timestamp': current_row['timestamp'],
                'equity': current_equity,
                'price': current_row['close']
            })
        
        # Offene Position am Ende schließen
        if self.position:
            self._close_position(self.df.iloc[-1], "END_OF_BACKTEST")
        
        # Ergebnisse berechnen
        print("\n📊 Berechne Metriken...")
        equity_df = pd.DataFrame(self.equity_curve)
        daily_returns = self._calculate_daily_returns(equity_df)
        metrics = self._calculate_metrics(daily_returns)
        
        # Ergebnis zusammenstellen
        result = BacktestResult(
            config=self.config,
            trades=self.trades,
            equity_curve=equity_df,
            metrics=metrics,
            daily_returns=daily_returns
        )
        
        self._print_results(metrics)
        
        return result
    
    def _process_bar(self, index: int, row: pd.Series):
        """Verarbeitet eine einzelne Kerze"""
        signal, info = self.strategy.get_signal(self.df.iloc[:index+1])
        
        # Position schließen wenn Signal gegenteilig
        if self.position:
            should_close = False
            exit_reason = ""
            
            # Check Stop Loss / Take Profit
            if row['high'] >= self.position.take_profit or row['low'] <= self.position.stop_loss:
                should_close = True
                exit_reason = "TP" if row['high'] >= self.position.take_profit else "SL"
            
            # Check gegenteiliges Signal
            elif signal and signal != self.position.direction:
                should_close = True
                exit_reason = "SIGNAL"
            
            if should_close:
                self._close_position(row, exit_reason)
        
        # Neue Position eröffnen
        if not self.position and signal:
            self._open_position(index, row, signal, info)
    
    def _open_position(self, index: int, row: pd.Series, signal: str, info: Dict):
        """Eröffnet eine neue Position"""
        # Position Size berechnen (Risk-based)
        risk_amount = self.capital * self.config.risk_per_trade
        atr = info['atr']
        
        # Stop Loss und Take Profit
        sl, tp = self.strategy.calculate_levels(row['close'], atr, signal)
        
        # Position Size basierend auf Risiko
        if signal == 'LONG':
            risk_per_unit = row['close'] - sl
        else:
            risk_per_unit = sl - row['close']
        
        position_size = risk_amount / risk_per_unit if risk_per_unit > 0 else 0
        
        # Mit Leverage anpassen
        position_size *= self.config.leverage
        
        # Slippage anwenden
        if self.config.enable_slippage:
            slippage = row['close'] * self.config.slippage_rate
            entry_price = row['close'] + slippage if signal == 'LONG' else row['close'] - slippage
        else:
            entry_price = row['close']
            slippage = 0
        
        # Fee beim Entry
        if self.config.enable_fees:
            entry_fee = position_size * entry_price * self.config.fee_rate
        else:
            entry_fee = 0
        
        self.position = Trade(
            entry_time=row['timestamp'],
            exit_time=None,
            direction=signal,
            entry_price=entry_price,
            exit_price=None,
            size=position_size,
            fees=entry_fee,
            slippage=slippage,
            stop_loss=sl,
            take_profit=tp,
            max_profit=0.0,
            max_loss=0.0
        )
    
    def _close_position(self, row: pd.Series, exit_reason: str):
        """Schließt eine offene Position"""
        if not self.position:
            return
        
        # Slippage anwenden
        if self.config.enable_slippage:
            slippage = row['close'] * self.config.slippage_rate
            exit_price = row['close'] - slippage if self.position.direction == 'LONG' else row['close'] + slippage
        else:
            exit_price = row['close']
            slippage = 0
        
        # Fee beim Exit
        if self.config.enable_fees:
            exit_fee = self.position.size * exit_price * self.config.fee_rate
        else:
            exit_fee = 0
        
        # PnL berechnen
        if self.position.direction == 'LONG':
            gross_pnl = (exit_price - self.position.entry_price) * self.position.size
        else:
            gross_pnl = (self.position.entry_price - exit_price) * self.position.size
        
        total_fees = self.position.fees + exit_fee
        net_pnl = gross_pnl - total_fees
        pnl_percent = (net_pnl / (self.position.size * self.position.entry_price)) * 100
        
        # Position aktualisieren
        self.position.exit_time = row['timestamp']
        self.position.exit_price = exit_price
        self.position.pnl = net_pnl
        self.position.pnl_percent = pnl_percent
        self.position.fees = total_fees
        self.position.slippage = self.position.slippage + slippage
        self.position.exit_reason = exit_reason
        self.position.duration_minutes = (row['timestamp'] - self.position.entry_time).total_seconds() / 60
        
        # Capital aktualisieren
        self.capital += net_pnl
        
        # Zur Trade-Liste hinzufügen
        self.trades.append(self.position)
        self.position = None
    
    def _calculate_unrealized_pnl(self, row: pd.Series) -> float:
        """Berechnet unrealisierten Gewinn/Verlust"""
        if not self.position:
            return 0.0
        
        if self.position.direction == 'LONG':
            unrealized = (row['close'] - self.position.entry_price) * self.position.size
        else:
            unrealized = (self.position.entry_price - row['close']) * self.position.size
        
        # Track max profit/loss
        if unrealized > self.position.max_profit:
            self.position.max_profit = unrealized
        elif unrealized < self.position.max_loss:
            self.position.max_loss = unrealized
        
        return unrealized
    
    def _calculate_daily_returns(self, equity_df: pd.DataFrame) -> pd.Series:
        """Berechnet tägliche Renditen"""
        equity_df['date'] = pd.to_datetime(equity_df['timestamp']).dt.date
        daily_equity = equity_df.groupby('date')['equity'].last()
        daily_returns = daily_equity.pct_change().dropna()
        return daily_returns
    
    def _calculate_metrics(self, daily_returns: pd.Series) -> Dict:
        """Berechnet umfassende Performance-Metriken"""
        if len(daily_returns) == 0:
            return {}
        
        # Basis-Metriken
        total_return = ((1 + daily_returns).prod() - 1) * 100
        
        # Win Rate
        winning_trades = [t for t in self.trades if t.pnl > 0]
        losing_trades = [t for t in self.trades if t.pnl <= 0]
        win_rate = (len(winning_trades) / len(self.trades) * 100) if self.trades else 0
        
        # Profit Factor
        gross_profit = sum(t.pnl for t in winning_trades)
        gross_loss = abs(sum(t.pnl for t in losing_trades))
        profit_factor = gross_profit / gross_loss if gross_loss > 0 else float('inf')
        
        # Max Drawdown
        cumulative = (1 + daily_returns).cumprod()
        running_max = cumulative.cummax()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min() * 100
        
        # Sharpe Ratio (annualisiert)
        sharpe_ratio = (daily_returns.mean() / daily_returns.std()) * np.sqrt(252) if daily_returns.std() > 0 else 0
        
        # Durchschnittliche Trades
        avg_win = np.mean([t.pnl for t in winning_trades]) if winning_trades else 0
        avg_loss = np.mean([t.pnl for t in losing_trades]) if losing_trades else 0
        avg_win_loss_ratio = abs(avg_win / avg_loss) if avg_loss != 0 else float('inf')
        
        # Trade-Statistiken
        total_trades = len(self.trades)
        avg_trade_duration = np.mean([t.duration_minutes for t in self.trades]) if self.trades else 0
        
        # Fees und Slippage
        total_fees = sum(t.fees for t in self.trades)
        total_slippage = sum(t.slippage * t.size for t in self.trades)
        
        return {
            'total_return': total_return,
            'total_return_pct': f"{total_return:.2f}%",
            'win_rate': win_rate,
            'win_rate_pct': f"{win_rate:.2f}%",
            'profit_factor': profit_factor,
            'max_drawdown': max_drawdown,
            'max_drawdown_pct': f"{max_drawdown:.2f}%",
            'sharpe_ratio': sharpe_ratio,
            'total_trades': total_trades,
            'winning_trades': len(winning_trades),
            'losing_trades': len(losing_trades),
            'avg_win': avg_win,
            'avg_loss': avg_loss,
            'avg_win_loss_ratio': avg_win_loss_ratio,
            'avg_trade_duration_min': avg_trade_duration,
            'total_fees': total_fees,
            'total_slippage': total_slippage,
            'final_capital': self.capital,
            'initial_capital': self.config.initial_capital
        }
    
    def _print_results(self, metrics: Dict):
        """Gibt die Backtest-Ergebnisse aus"""
        print("\n" + "="*60)
        print("📊 BACKTEST ERGEBNISSE")
        print("="*60)
        
        print(f"\n💰 Kapital:")
        print(f"   Start: ${metrics['initial_capital']:,.2f}")
        print(f"   Ende:  ${metrics['final_capital']:,.2f}")
        print(f"   Total Return: {metrics['total_return_pct']}")
        
        print(f"\n📈 Performance:")
        print(f"   Win Rate: {metrics['win_rate_pct']}")
        print(f"   Profit Factor: {metrics['profit_factor']:.2f}")
        print(f"   Sharpe Ratio: {metrics['sharpe_ratio']:.2f}")
        print(f"   Max Drawdown: {metrics['max_drawdown_pct']}")
        
        print(f"\n📊 Trades:")
        print(f"   Total: {metrics['total_trades']}")
        print(f"   Gewinner: {metrics['winning_trades']}")
        print(f"   Verlierer: {metrics['losing_trades']}")
        print(f"   Avg Win/Loss Ratio: {metrics['avg_win_loss_ratio']:.2f}")
        print(f"   Avg Duration: {metrics['avg_trade_duration_min']:.1f} Minuten")
        
        print(f"\n💸 Kosten:")
        print(f"   Total Fees: ${metrics['total_fees']:.2f}")
        print(f"   Total Slippage: ${metrics['total_slippage']:.2f}")
        
        print("="*60)
    
    def generate_report(self, output_file: str = "backtest_report.json"):
        """Generiert einen JSON-Bericht"""
        if not hasattr(self, 'result'):
            print("❌ Kein Backtest durchgeführt!")
            return
        
        report = {
            'config': {
                'symbol': self.config.symbol,
                'timeframe': self.config.timeframe,
                'days': self.config.days,
                'initial_capital': self.config.initial_capital,
                'risk_per_trade': self.config.risk_per_trade,
                'leverage': self.config.leverage,
                'fee_rate': self.config.fee_rate,
                'slippage_rate': self.config.slippage_rate
            },
            'metrics': self.result.metrics,
            'trades': [
                {
                    'entry_time': str(t.entry_time),
                    'exit_time': str(t.exit_time),
                    'direction': t.direction,
                    'entry_price': t.entry_price,
                    'exit_price': t.exit_price,
                    'pnl': t.pnl,
                    'pnl_percent': t.pnl_percent,
                    'fees': t.fees,
                    'exit_reason': t.exit_reason
                }
                for t in self.result.trades
            ],
            'equity_curve': self.result.equity_curve.to_dict('records')
        }
        
        with open(output_file, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print(f"\n📄 Bericht gespeichert: {output_file}")


def run_backtest_cli(
    symbol: str = "BTCUSDT",
    timeframe: str = "5m",
    days: int = 30,
    initial_capital: float = 10000.0,
    risk_per_trade: float = 0.02,
    api_key: str = "",
    secret_key: str = ""
):
    """CLI-Funktion zum Ausführen eines Backtests"""
    
    config = BacktestConfig(
        symbol=symbol,
        timeframe=timeframe,
        days=days,
        initial_capital=initial_capital,
        risk_per_trade=risk_per_trade
    )
    
    backtester = AdvancedBacktester(config, api_key, secret_key)
    result = backtester.run_backtest()
    backtester.result = result  # Für Report-Generierung
    backtester.generate_report(f"backtest_{symbol}_{days}days.json")
    
    return result


if __name__ == "__main__":
    # Beispiel-Nutzung
    result = run_backtest_cli(
        symbol="BTCUSDT",
        timeframe="5m",
        days=7,
        initial_capital=10000.0,
        risk_per_trade=0.02
    )


def generate_html_report(result: BacktestResult, output_file: str = "backtest_report.html"):
    """Generiert einen HTML-Bericht mit Charts"""
    
    metrics = result.metrics
    trades_data = [
        {
            'entry': t.entry_time.strftime('%Y-%m-%d %H:%M'),
            'exit': t.exit_time.strftime('%Y-%m-%d %H:%M') if t.exit_time else 'Open',
            'direction': t.direction,
            'pnl': t.pnl,
            'pnl_pct': t.pnl_percent,
            'exit_reason': t.exit_reason
        }
        for t in result.trades
    ]
    
    html = f'''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐬 Delfin Bot Backtest Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        .header {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }}
        .header h1 {{
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }}
        .metric-card {{
            background: rgba(255,255,255,0.95);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }}
        .metric-label {{
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .metric-value {{
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .metric-value.positive {{
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .metric-value.negative {{
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .chart-container {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }}
        .chart-container h2 {{
            margin-bottom: 1.5rem;
            color: #333;
        }}
        .trades-table {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            overflow-x: auto;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }}
        td {{
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
        }}
        tr:hover {{
            background: #f8f9fa;
        }}
        .badge {{
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }}
        .badge-long {{
            background: #d1fae5;
            color: #065f46;
        }}
        .badge-short {{
            background: #fee2e2;
            color: #991b1b;
        }}
        .badge-tp {{
            background: #d1fae5;
            color: #065f46;
        }}
        .badge-sl {{
            background: #fee2e2;
            color: #991b1b;
        }}
        .positive {{ color: #10b981; }}
        .negative {{ color: #ef4444; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐬 Delfin Bot Backtest Report</h1>
            <p style="color: #666; margin-top: 0.5rem;">
                {result.config.symbol} | {result.config.timeframe} | {result.config.days} Tage | 
                Startkapital: ${result.config.initial_capital:,.2f}
            </p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Return</div>
                <div class="metric-value {'positive' if metrics['total_return'] > 0 else 'negative'}">
                    {metrics['total_return_pct']}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value negative">{metrics['max_drawdown_pct']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value">{metrics['win_rate_pct']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Profit Factor</div>
                <div class="metric-value">{metrics['profit_factor']:.2f}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value">{metrics['sharpe_ratio']:.2f}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Trades</div>
                <div class="metric-value">{metrics['total_trades']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Final Capital</div>
                <div class="metric-value {'positive' if metrics['final_capital'] > metrics['initial_capital'] else 'negative'}">
                    ${metrics['final_capital']:,.2f}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Fees</div>
                <div class="metric-value">${metrics['total_fees']:.2f}</div>
            </div>
        </div>

        <div class="chart-container">
            <h2>📈 Equity Curve</h2>
            <canvas id="equityChart" height="80"></canvas>
        </div>

        <div class="chart-container">
            <h2>📉 Drawdown</h2>
            <canvas id="drawdownChart" height="80"></canvas>
        </div>

        <div class="trades-table">
            <h2>📊 Letzte Trades</h2>
            <table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Direction</th>
                        <th>PnL</th>
                        <th>PnL %</th>
                        <th>Exit Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join([f"""
                    <tr>
                        <td>{t['entry']}</td>
                        <td>{t['exit']}</td>
                        <td><span class="badge {'badge-long' if t['direction'] == 'LONG' else 'badge-short'}">{t['direction']}</span></td>
                        <td class="{'positive' if t['pnl'] > 0 else 'negative'}">${t['pnl']:.2f}</td>
                        <td class="{'positive' if t['pnl'] > 0 else 'negative'}">{t['pnl_pct']:.2f}%</td>
                        <td><span class="badge {'badge-tp' if t['exit_reason'] == 'TP' else 'badge-sl'}">{t['exit_reason']}</span></td>
                    </tr>
                    """ for t in trades_data[-20:]])}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Equity Curve Chart
        const equityCtx = document.getElementById('equityChart').getContext('2d');
        new Chart(equityCtx, {{
            type: 'line',
            data: {{
                labels: {result.equity_curve['timestamp'].tolist()[-100:]},
                datasets: [{{
                    label: 'Equity ($)',
                    data: {result.equity_curve['equity'].tolist()[-100:]},
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    x: {{ display: false }},
                    y: {{ beginAtZero: false }}
                }}
            }}
        }});

        // Drawdown Chart
        const drawdownCtx = document.getElementById('drawdownChart').getContext('2d');
        const cumulative = {list(result.daily_returns.add(1).cumprod())};
        const runningMax = cumulative.map((v, i) => Math.max(...cumulative.slice(0, i+1)));
        const drawdown = cumulative.map((v, i) => (v - runningMax[i]) / runningMax[i] * 100);
        
        new Chart(drawdownCtx, {{
            type: 'line',
            data: {{
                labels: {result.daily_returns.index.tolist()[-100:]},
                datasets: [{{
                    label: 'Drawdown (%)',
                    data: drawdown.slice(-100),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    x: {{ display: false }},
                    y: {{ beginAtZero: true }}
                }}
            }}
        }});
    </script>
</body>
</html>'''
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"📄 HTML Report gespeichert: {output_file}")


def generate_html_report(result: BacktestResult, output_file: str = "backtest_report.html"):
    """Generiert einen HTML-Bericht mit Charts"""
    
    metrics = result.metrics
    trades_data = [
        {
            'entry': t.entry_time.strftime('%Y-%m-%d %H:%M'),
            'exit': t.exit_time.strftime('%Y-%m-%d %H:%M') if t.exit_time else 'Open',
            'direction': t.direction,
            'pnl': t.pnl,
            'pnl_pct': t.pnl_percent,
            'exit_reason': t.exit_reason
        }
        for t in result.trades
    ]
    
    html = f'''<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🐬 Delfin Bot Backtest Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        .header {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 16px;
            margin-bottom: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }}
        .header h1 {{
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }}
        .metric-card {{
            background: rgba(255,255,255,0.95);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }}
        .metric-label {{
            font-size: 0.875rem;
            color: #666;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .metric-value {{
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .metric-value.positive {{
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .metric-value.negative {{
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        .chart-container {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }}
        .chart-container h2 {{
            margin-bottom: 1.5rem;
            color: #333;
        }}
        .trades-table {{
            background: rgba(255,255,255,0.95);
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            overflow-x: auto;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        th {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
        }}
        td {{
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
        }}
        tr:hover {{
            background: #f8f9fa;
        }}
        .badge {{
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }}
        .badge-long {{
            background: #d1fae5;
            color: #065f46;
        }}
        .badge-short {{
            background: #fee2e2;
            color: #991b1b;
        }}
        .badge-tp {{
            background: #d1fae5;
            color: #065f46;
        }}
        .badge-sl {{
            background: #fee2e2;
            color: #991b1b;
        }}
        .positive {{ color: #10b981; }}
        .negative {{ color: #ef4444; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐬 Delfin Bot Backtest Report</h1>
            <p style="color: #666; margin-top: 0.5rem;">
                {result.config.symbol} | {result.config.timeframe} | {result.config.days} Tage | 
                Startkapital: ${result.config.initial_capital:,.2f}
            </p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Return</div>
                <div class="metric-value {'positive' if metrics['total_return'] > 0 else 'negative'}">
                    {metrics['total_return_pct']}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Max Drawdown</div>
                <div class="metric-value negative">{metrics['max_drawdown_pct']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Win Rate</div>
                <div class="metric-value">{metrics['win_rate_pct']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Profit Factor</div>
                <div class="metric-value">{metrics['profit_factor']:.2f}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Sharpe Ratio</div>
                <div class="metric-value">{metrics['sharpe_ratio']:.2f}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Trades</div>
                <div class="metric-value">{metrics['total_trades']}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Final Capital</div>
                <div class="metric-value {'positive' if metrics['final_capital'] > metrics['initial_capital'] else 'negative'}">
                    ${metrics['final_capital']:,.2f}
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Total Fees</div>
                <div class="metric-value">${metrics['total_fees']:.2f}</div>
            </div>
        </div>

        <div class="chart-container">
            <h2>📈 Equity Curve</h2>
            <canvas id="equityChart" height="80"></canvas>
        </div>

        <div class="chart-container">
            <h2>📉 Drawdown</h2>
            <canvas id="drawdownChart" height="80"></canvas>
        </div>

        <div class="trades-table">
            <h2>📊 Letzte Trades</h2>
            <table>
                <thead>
                    <tr>
                        <th>Entry</th>
                        <th>Exit</th>
                        <th>Direction</th>
                        <th>PnL</th>
                        <th>PnL %</th>
                        <th>Exit Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {''.join([f"""
                    <tr>
                        <td>{t['entry']}</td>
                        <td>{t['exit']}</td>
                        <td><span class="badge {'badge-long' if t['direction'] == 'LONG' else 'badge-short'}">{t['direction']}</span></td>
                        <td class="{'positive' if t['pnl'] > 0 else 'negative'}">${t['pnl']:.2f}</td>
                        <td class="{'positive' if t['pnl'] > 0 else 'negative'}">{t['pnl_pct']:.2f}%</td>
                        <td><span class="badge {'badge-tp' if t['exit_reason'] == 'TP' else 'badge-sl'}">{t['exit_reason']}</span></td>
                    </tr>
                    """ for t in trades_data[-20:]])}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Equity Curve Chart
        const equityCtx = document.getElementById('equityChart').getContext('2d');
        new Chart(equityCtx, {{
            type: 'line',
            data: {{
                labels: {result.equity_curve['timestamp'].tolist()[-100:]},
                datasets: [{{
                    label: 'Equity ($)',
                    data: {result.equity_curve['equity'].tolist()[-100:]},
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    x: {{ display: false }},
                    y: {{ beginAtZero: false }}
                }}
            }}
        }});

        // Drawdown Chart
        const drawdownCtx = document.getElementById('drawdownChart').getContext('2d');
        const cumulative = {list(result.daily_returns.add(1).cumprod())};
        const runningMax = cumulative.map((v, i) => Math.max(...cumulative.slice(0, i+1)));
        const drawdown = cumulative.map((v, i) => (v - runningMax[i]) / runningMax[i] * 100);
        
        new Chart(drawdownCtx, {{
            type: 'line',
            data: {{
                labels: {result.daily_returns.index.tolist()[-100:]},
                datasets: [{{
                    label: 'Drawdown (%)',
                    data: drawdown.slice(-100),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{ display: false }}
                }},
                scales: {{
                    x: {{ display: false }},
                    y: {{ beginAtZero: true }}
                }}
            }}
        }});
    </script>
</body>
</html>'''
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"📄 HTML Report gespeichert: {output_file}")
