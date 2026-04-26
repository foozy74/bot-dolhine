import pandas as pd
import numpy as np
class DolphinStrategy:
    """🐬 Delfin Trading Strategie"""
    def __init__(self):
        self.ema_fast      = 8
        self.ema_slow      = 21
        self.rsi_period    = 14
        self.atr_period    = 14
        self.rsi_ob        = 70   # Overbought
        self.rsi_os        = 30   # Oversold
        self.sl_multiplier = 1.5
        self.tp_multiplier = 3.0

    def prepare_dataframe(self, raw_data: list) -> pd.DataFrame:
        df = pd.DataFrame(
            raw_data,
            columns=['timestamp', 'open', 'high', 'low', 'close', 'volume']
        )
        for col in ['open', 'high', 'low', 'close', 'volume']:
            df[col] = pd.to_numeric(df[col])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df

    def calculate_all(self, df: pd.DataFrame) -> pd.DataFrame:
    # EMA
        df['ema_fast'] = df['close'].ewm(span=self.ema_fast).mean()
        df['ema_slow'] = df['close'].ewm(span=self.ema_slow).mean()

    # RSI
        delta  = df['close'].diff()
        gain   = delta.clip(lower=0).rolling(self.rsi_period).mean()
        loss   = (-delta.clip(upper=0)).rolling(self.rsi_period).mean()
        rs     = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))

    # ATR
        df['tr']  = np.maximum(
            df['high'] - df['low'],
            np.maximum(
                abs(df['high'] - df['close'].shift()),
                abs(df['low']  - df['close'].shift())
            )
        )
        df['atr'] = df['tr'].rolling(self.atr_period).mean()
        return df

    def get_signal(self, df: pd.DataFrame):
        last  = df.iloc[-1]
        prev  = df.iloc[-2]
        signal = None
        info   = {
            "ema_fast": round(last['ema_fast'], 4),
            "ema_slow": round(last['ema_slow'], 4),
            "rsi":      round(last['rsi'], 2),
            "atr":      round(last['atr'], 4),
        }

    # LONG: EMA crossover + RSI nicht überkauft
        ema_cross_long = (
            prev['ema_fast'] <= prev['ema_slow'] and
            last['ema_fast'] >  last['ema_slow']
        )
        if ema_cross_long and last['rsi'] < self.rsi_ob:
            signal = 'LONG'

    # SHORT: EMA crossunder + RSI nicht überverkauft
        ema_cross_short = (
            prev['ema_fast'] >= prev['ema_slow'] and
            last['ema_fast'] <  last['ema_slow']
        )
        if ema_cross_short and last['rsi'] > self.rsi_os:
            signal = 'SHORT'

        return signal, info

    def calculate_levels(self, price: float, atr: float, direction: str):
        if direction == 'LONG':
            sl = round(price - atr * self.sl_multiplier, 4)
            tp = round(price + atr * self.tp_multiplier, 4)
        else:
            sl = round(price + atr * self.sl_multiplier, 4)
            tp = round(price - atr * self.tp_multiplier, 4)
        return sl, tp
