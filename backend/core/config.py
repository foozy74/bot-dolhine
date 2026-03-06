from pydantic_settings import BaseSettings
from functools import lru_cache
class Settings(BaseSettings):
    # Bitunix
        bitunix_api_key:    str = ""
        bitunix_secret_key: str = ""
        bitunix_base_url:   str = "https://api.bitunix.com"
    # Bot
        default_symbol:   str   = "BTCUSDT"
        default_timeframe: str  = "5m"
        risk_pct:         float = 0.02
        dry_run:          bool  = True

    # App
        app_port:   int = 8000
        app_env:    str = "development"
        secret_key: str = "change-me"

    # Telegram
        telegram_bot_token: str = ""
        telegram_chat_id:   str = ""

    # DB
        database_url: str = "sqlite:///./data/dolphin.db"

class Config:
        env_file = ".env"
        extra    = "ignore"
    @lru_cache()
    def get_settings() -> Settings:
        return Settings()
