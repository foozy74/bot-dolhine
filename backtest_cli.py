#!/usr/bin/env python3
"""
🐬 Delfin Bot - Backtest CLI

Usage:
    python backtest_cli.py --symbol BTCUSDT --timeframe 5m --days 30
    python backtest_cli.py --symbol ETHUSDT --days 7 --capital 5000
"""

import argparse
import sys
import os

# Backend zum Path hinzufügen
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from bot.backtest import run_backtest_cli, generate_html_report


def main():
    parser = argparse.ArgumentParser(
        description='🐬 Delfin Bot Backtest - Teste deine Trading Strategie',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python backtest_cli.py --symbol BTCUSDT --timeframe 5m --days 7
  python backtest_cli.py --symbol ETHUSDT --days 30 --capital 10000 --risk 0.01
  python backtest_cli.py --symbol BTCUSDT --days 90 --timeframe 1h
  python backtest_cli.py --symbol BTCUSDT --days 7 --html  # Mit HTML Report
        """
    )
    
    parser.add_argument(
        '--symbol', '-s',
        type=str,
        default='BTCUSDT',
        help='Trading Pair (default: BTCUSDT)'
    )
    
    parser.add_argument(
        '--timeframe', '-t',
        type=str,
        default='5m',
        choices=['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
        help='Zeitrahmen (default: 5m)'
    )
    
    parser.add_argument(
        '--days', '-d',
        type=int,
        default=30,
        choices=[7, 30, 90],
        help='Anzahl Tage (default: 30)'
    )
    
    parser.add_argument(
        '--capital', '-c',
        type=float,
        default=10000.0,
        help='Startkapital in USD (default: 10000)'
    )
    
    parser.add_argument(
        '--risk', '-r',
        type=float,
        default=0.02,
        help='Risiko pro Trade als Dezimal (default: 0.02 = 2%%)'
    )
    
    parser.add_argument(
        '--leverage', '-l',
        type=float,
        default=1.0,
        help='Hebel (default: 1.0)'
    )
    
    parser.add_argument(
        '--api-key',
        type=str,
        default='',
        help='Bitunix API Key (optional, für echte Daten)'
    )
    
    parser.add_argument(
        '--secret-key',
        type=str,
        default='',
        help='Bitunix Secret Key (optional, für echte Daten)'
    )
    
    parser.add_argument(
        '--html',
        action='store_true',
        help='Generiere HTML Report mit Charts'
    )
    
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='',
        help='Output Datei für Report (default: backtest_<symbol>_<days>days.json)'
    )
    
    args = parser.parse_args()
    
    # Validierung
    if args.risk < 0.001 or args.risk > 0.1:
        print("⚠️  Risiko sollte zwischen 0.1% und 10% liegen")
        sys.exit(1)
    
    if args.leverage < 1 or args.leverage > 100:
        print("⚠️  Hebel sollte zwischen 1 und 100 liegen")
        sys.exit(1)
    
    # Backtest ausführen
    output_file = args.output if args.output else f"backtest_{args.symbol}_{args.days}days.json"
    
    print("\n" + "🐬 " * 20)
    print("🐬 " + " " * 18 + "🐬")
    print("🐬   DELFIN BOT BACKTEST            🐬")
    print("🐬 " + " " * 18 + "🐬")
    print("🐬 " * 20 + "\n")
    
    result = run_backtest_cli(
        symbol=args.symbol,
        timeframe=args.timeframe,
        days=args.days,
        initial_capital=args.capital,
        risk_per_trade=args.risk,
        api_key=args.api_key,
        secret_key=args.secret_key
    )
    
    # JSON Report speichern
    from bot.backtest import AdvancedBacktester
    backtester = AdvancedBacktester(result.config, args.api_key, args.secret_key)
    backtester.result = result
    backtester.generate_report(output_file)
    
    # HTML Report wenn gewünscht
    if args.html:
        html_file = output_file.replace('.json', '.html')
        generate_html_report(result, html_file)
        print(f"🌐 HTML Report: {html_file}")
    
    print(f"\n✅ Backtest abgeschlossen!")
    print(f"📄 JSON Report: {output_file}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
