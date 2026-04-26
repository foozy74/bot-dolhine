import requests
import hashlib
import time
import pandas as pd
import uuid
from typing import Dict, Optional

class BitunixAPI:
    def __init__(self, api_key: str, secret_key: str):
        self.api_key = api_key
        self.secret_key = secret_key
        self.base_url = "https://fapi.bitunix.com"
        self.session = requests.Session()
    
    def _get_nonce(self) -> str:
        """Generate a random 32-character nonce"""
        return str(uuid.uuid4()).replace('-', '')
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in milliseconds"""
        return str(int(time.time() * 1000))
    
    def _sort_params(self, params: Dict) -> str:
        """Sort parameters and concatenate them for signature"""
        if not params:
            return ""
        return ''.join(f"{k}{v}" for k, v in sorted(params.items()))
    
    def _generate_signature(self, nonce: str, timestamp: str, query_params: str = "", body: str = "") -> str:
        """
        Generate signature according to Bitunix OpenAPI documentation
        
        Args:
            nonce: Random string
            timestamp: Timestamp in milliseconds
            query_params: Sorted query string
            body: Raw JSON string
            
        Returns:
            str: SHA256 signature
        """
        digest_input = nonce + timestamp + self.api_key + query_params + body
        digest = hashlib.sha256(digest_input.encode('utf-8')).hexdigest()
        sign_input = digest + self.secret_key
        sign = hashlib.sha256(sign_input.encode('utf-8')).hexdigest()
        return sign
    
    def _headers(self, method: str, query_params: Dict = None, body: str = "") -> dict:
        """Generate authentication headers"""
        nonce = self._get_nonce()
        timestamp = self._get_timestamp()
        
        query_string = self._sort_params(query_params) if query_params else ""
        
        sign = self._generate_signature(
            nonce=nonce,
            timestamp=timestamp,
            query_params=query_string,
            body=body
        )
        
        return {
            "api-key": self.api_key,
            "sign": sign,
            "nonce": nonce,
            "timestamp": timestamp,
            "Content-Type": "application/json"
        }
    
    def get_klines(self, symbol: str, interval: str = "5m", limit: int = 100):
        """
        Get K-line data for a symbol
        
        Args:
            symbol: Trading pair (e.g., BTCUSDT)
            interval: K-line interval (1m, 5m, 15m, 30m, 1h, 4h, 1d)
            limit: Number of data points (max 200)
            
        Returns:
            List of K-line data
        """
        endpoint = "/api/v1/futures/market/kline"
        params = {
            "symbol": symbol,
            "interval": interval,
            "limit": limit,
            "type": "LAST_PRICE"
        }
        
        headers = self._headers("GET", params)
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                params=params,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return []
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return []
            
            return data.get("data", [])
            
        except Exception as e:
            print(f"[ERROR] Exception in get_klines: {str(e)}")
            return []
    
    def get_ticker(self, symbol: str):
        """
        Get ticker price for a symbol
        
        Args:
            symbol: Trading pair (e.g., BTCUSDT)
            
        Returns:
            Ticker data
        """
        endpoint = "/api/v1/futures/market/ticker"
        params = {"symbol": symbol}
        
        headers = self._headers("GET", params)
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                params=params,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return None
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return None
            
            return data.get("data")
            
        except Exception as e:
            print(f"[ERROR] Exception in get_ticker: {str(e)}")
            return None
    
    def get_tickers(self, symbols: str = None):
        """
        Get tickers for multiple symbols
        
        Args:
            symbols: Comma-separated symbols (e.g., "BTCUSDT,ETHUSDT")
            
        Returns:
            List of ticker data
        """
        endpoint = "/api/v1/futures/market/tickers"
        params = {}
        if symbols:
            params["symbols"] = symbols
        
        headers = self._headers("GET", params)
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                params=params,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return []
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return []
            
            return data.get("data", [])
            
        except Exception as e:
            print(f"[ERROR] Exception in get_tickers: {str(e)}")
            return []
    
    def get_depth(self, symbol: str, limit: int = 100):
        """
        Get order book depth
        
        Args:
            symbol: Trading pair
            limit: Depth quantity (default 100)
            
        Returns:
            Order book data
        """
        endpoint = "/api/v1/futures/market/depth"
        params = {
            "symbol": symbol,
            "limit": limit
        }
        
        headers = self._headers("GET", params)
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                params=params,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return None
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return None
            
            return data.get("data")
            
        except Exception as e:
            print(f"[ERROR] Exception in get_depth: {str(e)}")
            return None
    
    def get_balance(self):
        """
        Get account balance
        
        Returns:
            Balance data
        """
        endpoint = "/api/v1/futures/account/balance"
        headers = self._headers("GET")
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return None
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return None
            
            return data.get("data")
            
        except Exception as e:
            print(f"[ERROR] Exception in get_balance: {str(e)}")
            return None
    
    def place_order(self, symbol: str, side: str, qty: float, order_type: str = "LIMIT", 
                    price: Optional[float] = None, dry_run: bool = True):
        """
        Place an order
        
        Args:
            symbol: Trading pair
            side: BUY or SELL
            qty: Order quantity
            order_type: LIMIT or MARKET
            price: Price for LIMIT orders
            dry_run: If True, don't actually place the order
            
        Returns:
            Order response
        """
        if dry_run:
            return {"dry_run": True, "symbol": symbol, "side": side, "qty": qty, "type": order_type}
        
        endpoint = "/api/v1/futures/order"
        body_dict = {
            "symbol": symbol,
            "side": side.upper(),
            "quantity": qty,
            "type": order_type.upper()
        }
        
        if price and order_type.upper() == "LIMIT":
            body_dict["price"] = price
        
        body = str(body_dict).replace("'", '"')
        headers = self._headers("POST", body=body)
        
        try:
            response = self.session.post(
                self.base_url + endpoint,
                headers=headers,
                json=body_dict
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return None
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return None
            
            return data.get("data")
            
        except Exception as e:
            print(f"[ERROR] Exception in place_order: {str(e)}")
            return None
    
    def cancel_order(self, symbol: str, order_id: str):
        """
        Cancel an order
        
        Args:
            symbol: Trading pair
            order_id: Order ID to cancel
            
        Returns:
            Cancel response
        """
        endpoint = "/api/v1/futures/order"
        body_dict = {
            "symbol": symbol,
            "orderId": order_id
        }
        
        body = str(body_dict).replace("'", '"')
        headers = self._headers("DELETE", body=body)
        
        try:
            response = self.session.delete(
                self.base_url + endpoint,
                headers=headers,
                json=body_dict
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return None
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return None
            
            return data.get("data")
            
        except Exception as e:
            print(f"[ERROR] Exception in cancel_order: {str(e)}")
            return None
    
    def get_positions(self, symbol: str = None):
        """
        Get current positions
        
        Args:
            symbol: Optional trading pair filter
            
        Returns:
            Positions data
        """
        endpoint = "/api/v1/futures/account/positions"
        params = {}
        if symbol:
            params["symbol"] = symbol
        
        headers = self._headers("GET", params)
        
        try:
            response = self.session.get(
                self.base_url + endpoint,
                params=params,
                headers=headers
            )
            
            data = response.json()
            if response.status_code != 200:
                print(f"[{response.status_code}] API Error: {response.text[:200]}")
                return []
            
            if data.get("code") != 0:
                print(f"[{data.get('code')}] API Error: {data.get('msg', 'Unknown error')}")
                return []
            
            return data.get("data", [])
            
        except Exception as e:
            print(f"[ERROR] Exception in get_positions: {str(e)}")
            return []
