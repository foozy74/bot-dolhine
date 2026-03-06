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
