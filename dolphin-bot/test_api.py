from backend.bot.bitunix_api import BitunixAPI

api = BitunixAPI("some_key", "some_secret")
r = api.session.get(
    api.base_url + "/api/v1/market/klines",
    params={"symbol": "BTCUSDT", "interval": "5m", "limit": 5}
)
print(f"Status: {r.status_code}")
print(f"Text: {r.text[:500]}")
