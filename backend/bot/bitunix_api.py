import requests
import hashlib
import hmac
import time
import pandas as pd
class BitunixAPI:
    def __init__(self, api_key: str, secret_key: str):
            self.api_key    = api_key
            self.secret_key = secret_key
            self.base_url   = "https://api.bitunix.com"
            self.session    = requests.Session()
    def _sign(self, timestamp: str, method: str, endpoint: str, body: str = "") -> str:
        msg = f"{timestamp}{method.upper()}{endpoint}{body}"
        return hmac.new(
            self.secret_key.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()

    def _headers(self, method: str, endpoint: str, body: str = "") -> dict:
        ts = str(int(time.time() * 1000))
        return {
            "Content-Type": "application/json",
            "X-API-KEY":    self.api_key,
            "X-TIMESTAMP":  ts,
            "X-SIGNATURE":  self._sign(ts, method, endpoint, body),
        }

    def get_klines(self, symbol: str, interval: str = "5m", limit: int = 100):
        endpoint = "/api/v1/market/klines"
        r = self.session.get(
            self.base_url + endpoint,
            params={"symbol": symbol, "interval": interval, "limit": limit}
        )
        try:
            data = r.json()
            if isinstance(data, dict):
                return data.get("data", [])
            return data
        except Exception as e:
            print(f"[{r.status_code}] API Error: {r.text[:100]}")
            return []

    def get_ticker(self, symbol: str):
        r = self.session.get(
            f"{self.base_url}/api/v1/ticker/price",
            params={"symbol": symbol}
        )
        return r.json()

    def get_balance(self):
        endpoint = "/api/v1/account/balance"
        r = self.session.get(
            self.base_url + endpoint,
            headers=self._headers("GET", endpoint)
        )
        return r.json()

    def place_order(self, symbol: str, side: str, qty: float, dry_run: bool = True):
        if dry_run:
            return {"dry_run": True, "symbol": symbol, "side": side, "qty": qty}
        endpoint = "/api/v1/order"
        body = f'{{"symbol":"{symbol}","side":"{side}","qty":{qty}}}'
        r = self.session.post(
            self.base_url + endpoint,
            headers=self._headers("POST", endpoint, body),
            data=body
        )
        return r.json()
