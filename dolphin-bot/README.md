# 🐬 Delfin Trading Bot

> Automatisierter Krypto-Trading Bot für Bitunix mit modernem React Dashboard

## ✨ Features

- 🤖 **Automatisches Trading** - EMA + RSI + ATR Strategie
- 🎨 **Modernes Dashboard** - React 18 + Vite + Glassmorphism Design
- ⚙️ **Einstellungen** - Persistente SQLite-Datenbank mit Validierung
- 📊 **Live Charts** - Echtzeit-Preisverläufe mit Recharts
- 🔔 **WebSocket** - Live-Status-Updates und Trade-Log
- 🧪 **Dry Run** - Testen ohne echtes Geld
- 🔐 **Sicherheit** - Basic Auth und Secret Masking

## 🚀 Quick Start

### Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/foozy74/bot-dolhine.git
cd dolphin-bot

# 2. Environment einrichten
cp .env.example .env
# .env mit deinen API Keys befüllen!

# 3. Mit Docker starten
docker-compose up --build

# 4. Öffne http://localhost
# Login: admin / admin (oder wie in .env konfiguriert)
```

### Entwicklung (ohne Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Coolify Deployment

### Schritt-für-Schritt Anleitung

1. **Coolify öffnen** → Dein Server auswählen
2. **+ New** → **Resource** → **Docker Compose**
3. **Git Repository** auswählen:
   - Repository: `foozy74/bot-dolhine`
   - Branch: `main`
4. **Build konfigurieren**:
   - Compose File: `docker-compose.yml`
5. **Environment Variables** (aus .env.example):
   ```
   BASIC_AUTH_USER=admin
   BASIC_AUTH_PASS=dein_sicheres_passwort
   BITUNIX_API_KEY=dein_api_key
   BITUNIX_SECRET_KEY=dein_secret_key
   ```
6. **Domain konfigurieren**:
   - Deine Domain eintragen (z.B. `bot.deinedomain.at`)
7. **Deploy** klicken 🚀

### Wichtig für Coolify

- **Volume**: `bot-data` wird automatisch für SQLite persistiert
- **Port**: 80 (wird von Coolify gemappt)
- **Health Check**: `/api/health` muss 200 zurückgeben
- **Nginx**: Kümmert sich um Routing (Frontend + API)

## 📋 Voraussetzungen

- Docker & Docker Compose
- Bitunix Account + API Keys
- Domain (für Coolify Deployment)

## ⚠️ Wichtig

- Niemals API Keys in Git committen!
- Erst mit `DRY_RUN=true` testen
- Nur Kapital einsetzen das du verlieren kannst
- Risiko niemals über 10% (wird validiert)

## 📁 Projektstruktur

```
dolphin-bot/
├── backend/              # FastAPI Backend
│   ├── api/              # API Endpoints
│   │   ├── routes.py     # Bot API
│   │   └── settings.py   # Settings API
│   ├── bot/              # Bot Logik
│   │   ├── bot_manager.py
│   │   ├── strategy.py
│   │   └── bitunix_api.py
│   ├── core/             # Konfiguration
│   │   ├── config.py
│   │   └── database.py
│   ├── models/           # Datenbank Models
│   │   └── setting.py
│   └── services/         # Business Logic
│       └── settings_service.py
├── frontend/             # React Dashboard
│   ├── src/
│   │   ├── components/   # React Components
│   │   ├── hooks/        # Custom Hooks
│   │   ├── pages/        # Dashboard, Settings, Logs
│   │   └── styles/       # Glassmorphism CSS
│   └── dist/             # Build Output
├── doc/                  # Dokumentation
│   └── c4/               # C4 Architektur-Docs
├── nginx/                # Reverse Proxy Config
├── docker-compose.yml    # Docker Compose Config
└── .coolify.yml          # Coolify Config
```

## 🔧 Settings

Alle Einstellungen werden in der SQLite-Datenbank gespeichert und können über das Dashboard geändert werden:

- **Trading**: Symbol, Timeframe, Risk %, Dry Run
- **API**: Bitunix API Keys (masked)
- **Notifications**: Telegram Bot
- **System**: Health Check Interval, WebSocket Config

## 📚 Dokumentation

Die vollständige Architektur-Dokumentation findest du in `doc/c4/`:
- [C1 - System Context](doc/c4/01-context.md)
- [C2 - Container](doc/c4/02-container.md)
- [C3 - Components](doc/c4/03-component-backend.md)
- [C4 - Code](doc/c4/04-code.md)
