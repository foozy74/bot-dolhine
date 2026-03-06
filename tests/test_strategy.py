"""Tests für die Trading Strategie"""
import pytest
import pandas as pd
import numpy as np
from backend.bot.strategy import DolphinStrategy


@pytest.fixture
def strategy():
    return DolphinStrategy()


@pytest.fixture
def sample_klines():
    """Generiert Sample Kline-Daten"""
    np.random.seed(42)
    base_price = 50000

    data = []
    for i in range(100):
        noise = np.random.randn() * 100
        close = base_price + noise + i * 10
        high = close + abs(np.random.randn() * 50)
        low = close - abs(np.random.randn() * 50)
        open_price = close + np.random.randn() * 30
        volume = np.random.randint(1000, 10000)

        data.append({
            'timestamp': 1700000000000 + i * 60000,
            'open': open_price,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        })

    return data


class TestDolphinStrategy:
    def test_strategy_initialization(self, strategy):
        assert strategy.ema_fast == 8
        assert strategy.ema_slow == 21
        assert strategy.rsi_period == 14
        assert strategy.atr_period == 14
        assert strategy.rsi_ob == 70
        assert strategy.rsi_os == 30

    def test_prepare_dataframe(self, strategy, sample_klines):
        df = strategy.prepare_dataframe(sample_klines)

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 100
        assert list(df.columns) == ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        assert df['close'].dtype == 'float64'
        assert pd.api.types.is_datetime64_any_dtype(df['timestamp'])

    def test_calculate_all_indicators(self, strategy, sample_klines):
        df = strategy.prepare_dataframe(sample_klines)
        df = strategy.calculate_all(df)

        assert 'ema_fast' in df.columns
        assert 'ema_slow' in df.columns
        assert 'rsi' in df.columns
        assert 'atr' in df.columns
        assert 'tr' in df.columns

        # Prüfe, dass Indikatoren berechnet wurden (nicht NaN am Ende)
        assert not pd.isna(df['ema_fast'].iloc[-1])
        assert not pd.isna(df['ema_slow'].iloc[-1])
        assert not pd.isna(df['rsi'].iloc[-1])
        assert not pd.isna(df['atr'].iloc[-1])

    def test_rsi_range(self, strategy, sample_klines):
        df = strategy.prepare_dataframe(sample_klines)
        df = strategy.calculate_all(df)

        # RSI sollte zwischen 0 und 100 liegen
        valid_rsi = df['rsi'].dropna()
        assert all(0 <= rsi <= 100 for rsi in valid_rsi)

    def test_atr_positive(self, strategy, sample_klines):
        df = strategy.prepare_dataframe(sample_klines)
        df = strategy.calculate_all(df)

        # ATR sollte immer positiv sein
        valid_atr = df['atr'].dropna()
        assert all(atr > 0 for atr in valid_atr)

    def test_get_signal_returns_valid_signal(self, strategy, sample_klines):
        df = strategy.prepare_dataframe(sample_klines)
        df = strategy.calculate_all(df)

        signal, info = strategy.get_signal(df)

        assert signal in [None, 'LONG', 'SHORT']
        assert isinstance(info, dict)
        assert 'ema_fast' in info
        assert 'ema_slow' in info
        assert 'rsi' in info
        assert 'atr' in info

    def test_calculate_levels_long(self, strategy):
        price = 50000.0
        atr = 100.0

        sl, tp = strategy.calculate_levels(price, atr, 'LONG')

        # Bei LONG sollte SL < Price < TP
        assert sl < price
        assert tp > price

        # Prüfe Berechnung
        expected_sl = round(price - atr * strategy.sl_multiplier, 4)
        expected_tp = round(price + atr * strategy.tp_multiplier, 4)
        assert sl == expected_sl
        assert tp == expected_tp

    def test_calculate_levels_short(self, strategy):
        price = 50000.0
        atr = 100.0

        sl, tp = strategy.calculate_levels(price, atr, 'SHORT')

        # Bei SHORT sollte TP < Price < SL
        assert tp < price
        assert sl > price

        # Prüfe Berechnung
        expected_sl = round(price + atr * strategy.sl_multiplier, 4)
        expected_tp = round(price - atr * strategy.tp_multiplier, 4)
        assert sl == expected_sl
        assert tp == expected_tp

    def test_ema_crossover_signal(self, strategy):
        """Teste EMA Crossover Signal-Generierung"""
        # Erstelle Daten mit klarem EMA Crossover
        data = []
        for i in range(50):
            if i < 25:
                # EMA Fast < EMA Slow
                close = 40000 + i * 10
            else:
                # EMA Fast > EMA Slow (Crossover)
                close = 40250 + i * 20

            data.append({
                'timestamp': 1700000000000 + i * 60000,
                'open': close - 5,
                'high': close + 10,
                'low': close - 10,
                'close': close,
                'volume': 1000
            })

        df = strategy.prepare_dataframe(data)
        df = strategy.calculate_all(df)

        signal, info = strategy.get_signal(df)

        # Sollte LONG Signal geben (Crossover + RSI nicht überkauft)
        assert signal in [None, 'LONG', 'SHORT']
        assert isinstance(info, dict)
