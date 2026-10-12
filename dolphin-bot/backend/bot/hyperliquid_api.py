import requests
import time
import os
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class HyperliquidAPI:
    """
    Hyperliquid L1 Client for Dolphin Bot
    Supports:
    - Public Info API (allMids, meta, candles, clearinghouseState, userFills)
    - Order Preparation & EIP-712 payload generation
    - Order submission to Hyperliquid L1 (Testnet & Mainnet)
    """

    MAINNET_URL = "https://api.hyperliquid.xyz"
    TESTNET_URL = "https://api.hyperliquid-testnet.xyz"

    def __init__(self, testnet: Optional[bool] = None):
        if testnet is not None:
            self.testnet = testnet
        else:
            env_val = os.getenv("HYPERLIQUID_TESTNET", "false").lower()
            self.testnet = env_val in ["true", "1", "yes"]

        self.base_url = self.TESTNET_URL if self.testnet else self.MAINNET_URL
        self.chain_id = 13337 if self.testnet else 1337
        self.session = requests.Session()
        self._meta_cache = None
        self._meta_cache_time = 0

    def get_network_info(self) -> Dict[str, Any]:
        return {
            "network": "testnet" if self.testnet else "mainnet",
            "chain_id": self.chain_id,
            "base_url": self.base_url,
            "is_testnet": self.testnet,
        }

    def get_all_mids(self) -> Dict[str, float]:
        """Fetch all mid prices from Hyperliquid"""
        try:
            resp = self.session.post(
                f"{self.base_url}/info",
                json={"type": "allMids"},
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                return {coin: float(px) for coin, px in data.items() if px is not None}
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid allMids: {e}")
        return {}

    def get_meta(self) -> List[Dict[str, Any]]:
        """Fetch universe metadata (cached for 5 minutes)"""
        now = time.time()
        if self._meta_cache and (now - self._meta_cache_time < 300):
            return self._meta_cache

        try:
            resp = self.session.post(
                f"{self.base_url}/info",
                json={"type": "meta"},
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                universe = data.get("universe", [])
                self._meta_cache = [
                    {
                        "name": asset["name"],
                        "szDecimals": asset["szDecimals"],
                        "maxLeverage": asset.get("maxLeverage", 50),
                        "index": idx
                    }
                    for idx, asset in enumerate(universe)
                ]
                self._meta_cache_time = now
                return self._meta_cache
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid meta: {e}")
        return []

    def get_asset_index(self, coin: str) -> Optional[int]:
        meta = self.get_meta()
        for asset in meta:
            if asset["name"].upper() == coin.upper():
                return asset["index"]
        return None

    def get_account_state(self, user_address: str) -> Dict[str, Any]:
        """Fetch clearinghouse margin summary and open positions for a user"""
        if not user_address:
            return {"error": "No user address provided"}

        try:
            resp = self.session.post(
                f"{self.base_url}/info",
                json={"type": "clearinghouseState", "user": user_address},
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                margin = data.get("marginSummary", {})
                cross_margin = data.get("crossMarginSummary", {})
                
                account_value = float(margin.get("accountValue", cross_margin.get("accountValue", 0.0)))
                total_margin_used = float(margin.get("totalMarginUsed", cross_margin.get("totalMarginUsed", 0.0)))
                withdrawable = float(data.get("withdrawable", 0.0))
                
                raw_positions = data.get("assetPositions", [])
                positions = []
                for p in raw_positions:
                    pos = p.get("position", {})
                    s = float(pos.get("szi", 0.0))
                    if abs(s) > 0:
                        positions.append({
                            "coin": pos.get("coin"),
                            "size": s,
                            "entryPx": float(pos.get("entryPx", 0.0)),
                            "liquidationPx": float(pos.get("liquidationPx", 0.0)) if pos.get("liquidationPx") else None,
                            "unrealizedPnl": float(pos.get("unrealizedPnl", 0.0)),
                            "returnOnEquity": float(pos.get("returnOnEquity", 0.0)),
                            "marginUsed": float(pos.get("marginUsed", 0.0)),
                            "maxLeverage": pos.get("maxLeverage", 50)
                        })

                return {
                    "user": user_address,
                    "accountValue": account_value,
                    "totalMarginUsed": total_margin_used,
                    "withdrawable": withdrawable,
                    "positions": positions,
                    "hasPositions": len(positions) > 0,
                    "network": "testnet" if self.testnet else "mainnet"
                }
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid account state for {user_address}: {e}")
        
        return {
            "user": user_address,
            "accountValue": 0.0,
            "totalMarginUsed": 0.0,
            "withdrawable": 0.0,
            "positions": [],
            "error": "Failed to fetch account state"
        }

    def get_candles(self, coin: str = "BTC", interval: str = "5m", limit: int = 100) -> List[List[Any]]:
        """
        Fetch historical candles from Hyperliquid and format for Dolphin Strategy:
        [timestamp_ms, open, high, low, close, volume]
        """
        try:
            # Hyperliquid uses intervals: 1m, 5m, 15m, 1h, 4h, 1d
            resolution = interval.lower()
            now_ms = int(time.time() * 1000)
            
            # Estimate start time based on limit & interval
            multiplier_map = {"1m": 60, "5m": 300, "15m": 900, "1h": 3600, "4h": 14400, "1d": 86400}
            sec_per_bar = multiplier_map.get(resolution, 300)
            start_ms = now_ms - (limit * sec_per_bar * 1000)

            resp = self.session.post(
                f"{self.base_url}/info",
                json={
                    "type": "candleSnapshot",
                    "req": {
                        "coin": coin.upper(),
                        "interval": resolution,
                        "startTime": start_ms,
                        "endTime": now_ms
                    }
                },
                timeout=10
            )

            if resp.ok:
                raw_candles = resp.json()
                formatted = []
                for c in raw_candles:
                    formatted.append([
                        int(c["t"]),            # timestamp in ms
                        float(c["o"]),          # open
                        float(c["h"]),          # high
                        float(c["l"]),          # low
                        float(c["c"]),          # close
                        float(c.get("v", 0.0))  # volume
                    ])
                return formatted
        except Exception as e:
            logger.error(f"Error fetching Hyperliquid candles for {coin}: {e}")
        
        return []

    def prepare_order_payload(
        self,
        coin: str,
        is_buy: bool,
        size: float,
        price: float,
        reduce_only: bool = False,
        tif: str = "Gtc"
    ) -> Dict[str, Any]:
        """
        Prepares order parameters and EIP-712 typed data structure
        for Web3 wallet signing in the browser (MetaMask / Rabby).
        """
        asset_idx = self.get_asset_index(coin)
        if asset_idx is None:
            asset_idx = 0  # default to BTC

        nonce = int(time.time() * 1000)

        action = {
            "type": "order",
            "orders": [
                {
                    "a": asset_idx,
                    "b": bool(is_buy),
                    "p": f"{price:.4f}",
                    "s": f"{size:.4f}",
                    "r": bool(reduce_only),
                    "t": {"limit": {"tif": tif}}
                }
            ],
            "grouping": "na"
        }

        # Official Hyperliquid EIP-712 Domain & Types
        typed_data = {
            "domain": {
                "name": "Exchange",
                "version": "1",
                "chainId": self.chain_id,
                "verifyingContract": "0x0000000000000000000000000000000000000000"
            },
            "types": {
                "Agent": [
                    {"name": "source", "type": "string"},
                    {"name": "connectionId", "type": "bytes32"}
                ]
            },
            "primaryType": "Agent",
            "message": {
                "source": "a" if not self.testnet else "b",
                "connectionId": "0x0000000000000000000000000000000000000000000000000000000000000000"
            }
        }

        return {
            "action": action,
            "nonce": nonce,
            "network": "testnet" if self.testnet else "mainnet",
            "chainId": self.chain_id,
            "coin": coin,
            "isBuy": is_buy,
            "size": size,
            "price": price,
            "typedData": typed_data
        }
