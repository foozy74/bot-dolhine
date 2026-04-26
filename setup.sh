#!/bin/bash

# ═══════════════════════════════════════════════════
#   🐬 DELFIN BOT - Projekt Setup Script
#   Erstellt die komplette Ordnerstruktur
# ═══════════════════════════════════════════════════

set -e  # Bei Fehler stoppen

# ─── Farben ─────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Banner ──────────────────────────────────────────
print_banner() {
    echo -e "${CYAN}"
    echo "  ██████╗ ███████╗██╗     ███████╗██╗███╗   ██╗"
    echo "  ██╔══██╗██╔════╝██║     ██╔════╝██║████╗  ██║"
    echo "  ██║  ██║█████╗  ██║     █████╗  ██║██╔██╗ ██║"
    echo "  ██║  ██║██╔══╝  ██║     ██╔══╝  ██║██║╚██╗██║"
    echo "  ██████╔╝███████╗███████╗██║     ██║██║ ╚████║"
    echo "  ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝"
    echo ""
    echo "         🐬 Trading Bot - Project Setup"
    echo -e "${NC}"
}

# ─── Helper Funktionen ───────────────────────────────
log_info()    { echo -e "${GREEN}  ✅ $1${NC}"; }
log_warn()    { echo -e "${YELLOW}  ⚠️  $1${NC}"; }
log_error()   { echo -e "${RED}  ❌ $1${NC}"; }
log_section() { echo -e "\n${BLUE}${BOLD}  📁 $1${NC}"; }
log_file()    { echo -e "${CYAN}     ├── $1${NC}"; }

# ─── Projekt Name abfragen ───────────────────────────
get_project_name() {
    echo -e "${YELLOW}${BOLD}"
    read -p "  Projektname eingeben [dolphin-bot]: " PROJECT_NAME
    echo -e "${NC}"
    PROJECT_NAME=${PROJECT_NAME:-dolphin-bot}
    
    # Leerzeichen ersetzen
    PROJECT_NAME=$(echo "$PROJECT_NAME" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
    
    echo -e "${GREEN}  📦 Projekt: ${BOLD}$PROJECT_NAME${NC}\n"
}

# ═══════════════════════════════════════════════════
#   ORDNER ERSTELLEN
# ═══════════════════════════════════════════════════
create_directories() {
    log_section "Erstelle Ordnerstruktur..."

    dirs=(
        "$PROJECT_NAME"
        "$PROJECT_NAME/backend"
        "$PROJECT_NAME/backend/bot"
        "$PROJECT_NAME/backend/api"
        "$PROJECT_NAME/backend/core"
        "$PROJECT_NAME/frontend"
        "$PROJECT_NAME/frontend/assets"
        "$PROJECT_NAME/nginx"
        "$PROJECT_NAME/.github/workflows"
        "$PROJECT_NAME/scripts"
        "$PROJECT_NAME/tests"
        "$PROJECT_NAME/data"
    )

    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        log_info "Ordner erstellt: $dir"
    done
}

# ═══════════════════════════════════════════════════
#   DATEIEN ERSTELLEN
# ═══════════════════════════════════════════════════

# ─── .gitignore ──────────────────────────────────────
create_gitignore() {
    log_section "Erstelle .gitignore"
    cat > "$PROJECT_NAME/.gitignore" << 'EOF'
# ─── Secrets ───────────────────────────────────────
.env
*.env
!.env.example
config.json
secrets/

# ─── Python ────────────────────────────────────────
__pycache__/
*.py[cod]
*$py.class
*.pyc
.venv/
venv/
env/
.Python
dist/
build/
*.egg-info/

# ─── Docker ────────────────────────────────────────
*.log
docker-compose.override.yml

# ─── Daten ─────────────────────────────────────────
data/*.db
data/*.sqlite
data/*.json
!data/.gitkeep

# ─── IDE ───────────────────────────────────────────
.vscode/
.idea/
*.swp
*.swo
.DS_Store
Thumbs.db
EOF
    log_file ".gitignore"
}

# ─── .env.example ────────────────────────────────────
create_env_example() {
    log_section "Erstelle .env.example"
    cat > "$PROJECT_NAME/.env.example" << 'EOF'
# ═══════════════════════════════════════════════════
#   🐬 DELFIN BOT - Umgebungsvariablen
#   Kopiere diese Datei als .env und fülle sie aus!
#   cp .env.example .env
# ═══════════════════════════════════════════════════

# ─── Bitunix API ────────────────────────────────────
BITUNIX_API_KEY=dein_api_key_hier
BITUNIX_SECRET_KEY=dein_secret_key_hier
BITUNIX_BASE_URL=https://api.bitunix.com

# ─── Bot Einstellungen ──────────────────────────────
DEFAULT_SYMBOL=BTCUSDT
DEFAULT_TIMEFRAME=5m
RISK_PCT=0.02
DRY_RUN=true

# ─── App Einstellungen ──────────────────────────────
APP_PORT=8000
APP_ENV=production
SECRET_KEY=aendere_diesen_schluessel

# ─── Telegram (Optional) ────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ─── Datenbank ──────────────────────────────────────
DATABASE_URL=sqlite:///./data/dolphin.db
EOF
    log_file ".env.example"
}

# ─── README.md ───────────────────────────────────────
create_readme() {
    log_section "Erstelle README.md"
    cat > "$PROJECT_NAME/README.md" << 'EOF'
# 🐬 Delfin Trading Bot

> Automatisierter Krypto-Trading Bot für Bitunix

## 🚀 Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/dein-user/dolphin-bot.git
cd dolphin-bot

# 2. Environment einrichten
cp .env.example .env
# .env mit deinen API Keys befüllen!

# 3. Mit Docker starten
docker-compose up --build
📋 Voraussetzungen

Docker & Docker Compose
Bitunix Account + API Keys
Domain (für Coolify Deployment)

🌐 Coolify Deployment

Coolify → New Resource → Docker Compose
GitHub Repository verbinden
Branch: main
Environment Variables aus .env.example eintragen
Domain konfigurieren
Deploy klicken 🚀

⚠️ Wichtig

Niemals API Keys in Git committen!
Erst mit DRY_RUN=true testen
Nur Kapital einsetzen das du verlieren kannst

📁 Projektstruktur
dolphin-bot/
├── backend/          # FastAPI Backend
│   ├── bot/          # Bot Logik
│   ├── api/          # API Endpoints
│   └── core/         # Konfiguration
├── frontend/         # Web Dashboard
├── nginx/            # Reverse Proxy
├── scripts/          # Hilfsskripte
└── tests/            # Tests
EOF
    log_file "README.md"
}
# ─── docker-compose.yml ──────────────────────────────
create_docker_compose() {
    log_section "Erstelle docker-compose.yml"
    cat > "$PROJECT_NAME/docker-compose.yml" << 'EOF'
version: '3.8'
services:
# ─── Backend ──────────────────────────────────────
  dolphin-bot:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: dolphin-bot
    restart: unless-stopped
    env_file: .env
    environment:
      - APP_ENV=production
    volumes:
      - bot-data:/app/data
    networks:
      - dolphin-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/status"]
      interval: 30s
      timeout: 10s
      retries: 3
# ─── Nginx ────────────────────────────────────────
  nginx:
    image: nginx:alpine
    container_name: dolphin-nginx
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - dolphin-bot
    networks:
      - dolphin-network
volumes:
  bot-data:
    driver: local
networks:
  dolphin-network:
    driver: bridge
EOF
    log_file "docker-compose.yml"
}
# ─── backend/Dockerfile ──────────────────────────────
create_dockerfile() {
    log_section "Erstelle backend/Dockerfile"
    cat > "$PROJECT_NAME/backend/Dockerfile" << 'EOF'
FROM python:3.12-slim
# System Dependencies
RUN apt-get update && apt-get install -y     curl     && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Dependencies zuerst (Layer Caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# App Code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
EXPOSE 8000
# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3     CMD curl -f http://localhost:8000/api/status || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF
    log_file "backend/Dockerfile"
}
# ─── backend/requirements.txt ────────────────────────
create_requirements() {
    log_section "Erstelle requirements.txt"
    cat > "$PROJECT_NAME/backend/requirements.txt" << 'EOF'
# Web Framework
fastapi==0.111.0
uvicorn==0.30.0
websockets==12.0
python-multipart==0.0.9
# Data
pandas==2.2.2
numpy==1.26.4
requests==2.32.3
# Validation
pydantic==2.7.1
pydantic-settings==2.3.4
python-dotenv==1.0.1
# Datenbank
sqlalchemy==2.0.30
aiosqlite==0.20.0
# Technische Analyse
ta==0.11.0
EOF
    log_file "backend/requirements.txt"
}
# ─── Python init Dateien ─────────────────────────
create_init_files() {
    log_section "Erstelle init.py Dateien"
for pkg in "bot" "api" "core"; do
    cat > "$PROJECT_NAME/backend/$pkg/__init__.py" << EOF
# 🐬 Delfin Bot - $pkg
EOF
        log_file "backend/$pkg/init.py"
    done
}
# ─── backend/core/config.py ──────────────────────────
create_config() {
    log_section "Erstelle core/config.py"
    cat > "$PROJECT_NAME/backend/core/config.py" << 'EOF'
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
EOF
    log_file "backend/core/config.py"
}
# ─── backend/main.py ─────────────────────────────────
create_main() {
    log_section "Erstelle backend/main.py"
    cat > "$PROJECT_NAME/backend/main.py" << 'EOF'
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from core.config import get_settings
settings = get_settings()
app = FastAPI(
    title="🐬 Delfin Bot",
    version="1.0.0",
    description="Bitunix Trading Bot"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[""],
    allow_methods=[""],
    allow_headers=["*"],
)
# API Routes
app.include_router(router, prefix="/api")
# Frontend
app.mount(
    "/",
    StaticFiles(directory="../frontend", html=True),
    name="frontend"
)
EOF
    log_file "backend/main.py"
}
# ─── backend/api/routes.py ───────────────────────────
create_routes() {
    log_section "Erstelle api/routes.py"
    cat > "$PROJECT_NAME/backend/api/routes.py" << 'EOF'
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from bot.bot_manager import BotManager
import asyncio
router      = APIRouter()
bot_manager = BotManager()
clients: list[WebSocket] = []
# ─── Models ──────────────────────────────────────────
class BotConfig(BaseModel):
        api_key:    str
        secret_key: str
        symbol:     str   = "BTCUSDT"
        timeframe:  str   = "5m"
        risk_pct:   float = 0.02
        dry_run:    bool  = True
    # ─── Endpoints ───────────────────────────────────────
    @router.get("/status")
    async def status():
        return bot_manager.get_status()
    @router.get("/health")
    async def health():
        return {"status": "ok"}
    @router.post("/bot/start")
    async def start(config: BotConfig):
        if bot_manager.is_running():
            raise HTTPException(400, "Bot läuft bereits!")
        asyncio.create_task(bot_manager.start(config.dict(), broadcast))
        return {"message": "Bot gestartet ✅"}
    @router.post("/bot/stop")
    async def stop():
        await bot_manager.stop()
        return {"message": "Bot gestoppt ⛔"}
    @router.get("/trades")
    async def trades():
        return bot_manager.get_trade_log()
    # ─── WebSocket ───────────────────────────────────────
    @router.websocket("/ws")
    async def websocket(ws: WebSocket):
        await ws.accept()
        clients.append(ws)
        try:
            await ws.send_json(bot_manager.get_status())
            while True:
                await asyncio.sleep(1)
        except WebSocketDisconnect:
            clients.remove(ws)
    async def broadcast(data: dict):
        dead = []
        for c in clients:
            try:
                await c.send_json(data)
            except:
                dead.append(c)
        for c in dead:
            clients.remove(c)
EOF
    log_file "backend/api/routes.py"
}
# ─── backend/bot/ Dateien ────────────────────────────
create_bot_files() {
    log_section "Erstelle bot/ Dateien"
# bitunix_api.py
cat > "$PROJECT_NAME/backend/bot/bitunix_api.py" << 'EOF'
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
        return r.json()

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
EOF
    log_file "backend/bot/bitunix_api.py"
# strategy.py
cat > "$PROJECT_NAME/backend/bot/strategy.py" << 'EOF'
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
EOF
    log_file "backend/bot/strategy.py"
# bot_manager.py
cat > "$PROJECT_NAME/backend/bot/bot_manager.py" << 'EOF'
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
        self.api        = BitunixAPI(config['api_key'], config['secret_key'])
        self.status.update({
            "running": True,
            "symbol":  config['symbol'],
            "dry_run": config['dry_run'],
        })

        interval_map = {'1m':60,'3m':180,'5m':300,'15m':900,'1h':3600}
        sleep_time   = interval_map.get(config['timeframe'], 300)

        await self._log(f"🐬 Bot gestartet | {config['symbol']} | {config['timeframe']}")

        while self._running:
            try:
                await self._tick(config, sleep_time)
            except Exception as e:
                await self._log(f"❌ Fehler: {e}", "error")
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
EOF
    log_file "backend/bot/bot_manager.py"
}
# ─── nginx/nginx.conf ────────────────────────────────
create_nginx_conf() {
    log_section "Erstelle nginx/nginx.conf"
    cat > "$PROJECT_NAME/nginx/nginx.conf" << 'EOF'
events { worker_connections 1024; }
http {
    upstream dolphin_backend {
        server dolphin-bot:8000;
    }
server {
    listen 80;
    server_name _;

    # WebSocket
    location /ws {
        proxy_pass         http://dolphin_backend;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
    }

    # API & Frontend
    location / {
        proxy_pass       http://dolphin_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
}
EOF
    log_file "nginx/nginx.conf"
}
# ─── GitHub Actions ──────────────────────────────────
create_github_actions() {
    log_section "Erstelle GitHub Actions"
    cat > "$PROJECT_NAME/.github/workflows/deploy.yml" << 'EOF'
name: 🐬 Deploy to Coolify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Coolify Webhook
        run: |
          curl -fsSL -X POST             -H "Authorization: Bearer ${{ secrets.COOLIFY_WEBHOOK_TOKEN }}"             "${{ secrets.COOLIFY_WEBHOOK_URL }}"
  - name: Deploy Status
    run: echo "✅ Deployment ausgelöst!"
EOF
    log_file ".github/workflows/deploy.yml"
}
# ─── Hilfsskripte ────────────────────────────────────
create_scripts() {
    log_section "Erstelle Hilfsskripte"
# start.sh
cat > "$PROJECT_NAME/scripts/start.sh" << 'EOF'
#!/bin/bash
echo "🐬 Delfin Bot starten..."
docker-compose up --build -d
echo "✅ Bot läuft auf http://localhost"
EOF
# stop.sh
cat > "$PROJECT_NAME/scripts/stop.sh" << 'EOF'
#!/bin/bash
echo "⛔ Delfin Bot stoppen..."
docker-compose down
echo "✅ Bot gestoppt"
EOF
# logs.sh
cat > "$PROJECT_NAME/scripts/logs.sh" << 'EOF'
#!/bin/bash
docker-compose logs -f dolphin-bot
EOF
# restart.sh
cat > "$PROJECT_NAME/scripts/restart.sh" << 'EOF'
#!/bin/bash
echo "🔄 Neustart..."
docker-compose restart dolphin-bot
echo "✅ Neugestartet"
EOF
chmod +x "$PROJECT_NAME/scripts/"*.sh
log_file "scripts/start.sh"
log_file "scripts/stop.sh"
log_file "scripts/logs.sh"
log_file "scripts/restart.sh"
}
# ─── data/.gitkeep ───────────────────────────────────
create_data_dir() {
    touch "$PROJECT_NAME/data/.gitkeep"
    log_info "data/.gitkeep erstellt"
}
# ─── Frontend Placeholder ────────────────────────────
create_frontend_placeholder() {
    log_section "Erstelle Frontend Platzhalter"
    cat > "$PROJECT_NAME/frontend/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>🐬 Delfin Bot</title>
    <style>
        body {
            background: #0d1117;
            color: #e6edf3;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .center { text-align: center; }
        h1 { font-size: 3rem; }
        p  { color: #7d8590; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="center">
        <h1>🐬</h1>
        <h2>Delfin Bot</h2>
        <p>Frontend wird hier eingebunden...</p>
    </div>
</body>
</html>
EOF
    log_file "frontend/index.html"
    touch "$PROJECT_NAME/frontend/app.js"
    touch "$PROJECT_NAME/frontend/style.css"
    log_file "frontend/app.js"
    log_file "frontend/style.css"
}

# ═══════════════════════════════════════════════════
# ABSCHLUSS
# ═══════════════════════════════════════════════════
print_summary() {
    echo -e "\n${GREEN}${BOLD}"
    echo "  ╔═══════════════════════════════════════╗"
    echo "  ║   ✅ Projekt erfolgreich erstellt!    ║"
    echo "  ╚═══════════════════════════════════════╝"
    echo -e "${NC}"
echo -e "${CYAN}  📁 Projektpfad: ${BOLD}./$PROJECT_NAME${NC}\n"

echo -e "${YELLOW}  📋 Nächste Schritte:${NC}"
echo -e "  ${BOLD}1.${NC} cd $PROJECT_NAME"
echo -e "  ${BOLD}2.${NC} cp .env.example .env"
echo -e "  ${BOLD}3.${NC} .env mit API Keys befüllen"
echo -e "  ${BOLD}4.${NC} git init && git add . && git commit -m '🐬 Initial'"
echo -e "  ${BOLD}5.${NC} GitHub Repo erstellen & pushen"
echo -e "  ${BOLD}6.${NC} In Coolify deployen\n"

echo -e "${YELLOW}  🐳 Lokal testen:${NC}"
echo -e "  ${BOLD}docker-compose up --build${NC}\n"
}
# ═══════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════
main() {
    clear
    print_banner
    get_project_name
echo -e "${YELLOW}  ⏳ Erstelle Projektstruktur...${NC}\n"

create_directories
create_gitignore
create_env_example
create_readme
create_docker_compose
create_dockerfile
create_requirements
create_init_files
create_config
create_main
create_routes
create_bot_files
create_nginx_conf
create_github_actions
create_scripts
create_data_dir
create_frontend_placeholder

print_summary
}
main