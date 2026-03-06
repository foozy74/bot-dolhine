# C2 - Container Diagram

## Überblick

Das Container Diagram zeigt die High-Level-Technologie-Entscheidungen und wie die Anwendungen und Datenbanken zusammenspielen.

```plantuml
@startuml C2_Container_Diagram
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title Container Diagram - Delfin Trading Bot

Person(trader, "Trader", "Nutzer des Trading Bots")

System_Boundary(delfin, "Delfin Bot System") {
    
    Container(nginx, "Nginx", "Nginx Alpine", "Reverse Proxy & Static File Server")
    
    Container_Boundary(frontend, "Frontend") {
        Container(react, "React App", "React 18 + Vite", "Single Page Application")
    }
    
    Container_Boundary(backend, "Backend") {
        Container(fastapi, "FastAPI", "Python 3.12", "REST API & WebSocket")
        Container(bot_engine, "Bot Engine", "Python", "Trading-Logik & Strategie")
        Container(bitunix_client, "Bitunix Client", "Python", "Exchange API Client")
    }
    
    ContainerDb(sqlite, "SQLite", "SQLite 3", "Settings & Trade History")
}

System_Ext(bitunix, "Bitunix Exchange", "Krypto-Börse")
System_Ext(telegram, "Telegram", "Push-Notifications")

Rel(trader, nginx, "HTTPS", "Browser")
Rel(nginx, react, "HTTP", "Static Files")
Rel(nginx, fastapi, "HTTP/WS", "API Proxy")

Rel(react, fastapi, "HTTP/WebSocket", "JSON")
Rel(fastapi, sqlite, "SQL", "aiosqlite")
Rel(fastapi, bot_engine, "In-Process", "Function Calls")
Rel(bot_engine, bitunix_client, "In-Process", "API Calls")
Rel(bitunix_client, bitunix, "HTTPS", "REST API")

Rel(fastapi, telegram, "HTTPS", "Bot API")

SHOW_LEGEND()

@enduml
```

## Container Beschreibung

### Nginx (Reverse Proxy)
- **Technologie**: Nginx Alpine
- **Port**: 80 (HTTP)
- **Aufgaben**:
  - Reverse Proxy für Backend API
  - Statischer File-Server für Frontend
  - Basic Authentication
  - WebSocket Proxy
  - Load Balancing (optional)

### Frontend (React App)
- **Technologie**: React 18 + Vite
- **Build**: Production-Build wird von Nginx serviert
- **Port**: 80 (via Nginx)
- **Aufgaben**:
  - Dashboard UI
  - Settings Management
  - Echtzeit-Charts (Recharts)
  - WebSocket Client

### Backend (FastAPI)
- **Technologie**: Python 3.12 + FastAPI
- **Port**: 8000 (intern)
- **Aufgaben**:
  - REST API Endpoints
  - WebSocket Server
  - Settings Management
  - Bot Lifecycle Management

### Bot Engine
- **Technologie**: Python
- **Aufgaben**:
  - Trading-Strategie (EMA + RSI + ATR)
  - Position Management
  - Risk Management
  - Signal Generierung

### Bitunix Client
- **Technologie**: Python + requests
- **Aufgaben**:
  - API Authentication (HMAC-SHA256)
  - Market Data (Klines, Ticker)
  - Order Management
  - Balance Abfragen

### SQLite Datenbank
- **Technologie**: SQLite 3 + aiosqlite
- **Speicherort**: `/app/data/dolphin.db`
- **Aufgaben**:
  - Persistente Settings
  - Trade History
  - Konfigurations-Schema

## Kommunikationsfluss

### 1. Initial Page Load
```
User → Nginx → React App (Static Files)
```

### 2. API Request
```
React → Nginx → FastAPI → SQLite
```

### 3. WebSocket Connection
```
React → Nginx → FastAPI (WS Upgrade)
```

### 4. Trading Tick
```
Bot Engine → Bitunix Client → Bitunix API
                    ↓
              FastAPI (Update)
                    ↓
              WebSocket Broadcast
                    ↓
              React (UI Update)
```

## Ports & URLs

| Service | Extern | Intern | Beschreibung |
|---------|--------|--------|--------------|
| Nginx | 80 | - | Einstiegspunkt |
| Frontend | - | 80 | Static files |
| Backend | - | 8000 | API Server |
| SQLite | - | File | Datenbank |

## Technologie-Entscheidungen

### Warum Nginx?
- **Reverse Proxy**: Einheitlicher Einstiegspunkt
- **Static Files**: Effizientes Serving von React Build
- **Basic Auth**: Einfache Authentifizierung
- **WebSocket**: Transparentes Proxying

### Warum FastAPI + SQLite?
- **Single Container**: Keine separate DB nötig
- **Async**: aiosqlite für non-blocking I/O
- **Zero Config**: Keine DB-Setup-Overhead
- **Backup**: Einfache Datei-Kopie

### Warum React + Vite?
- **Performance**: Schnelles HMR in Dev
- **Bundle**: Kleine Production-Builds
- **Modern**: Aktuelle React Features
- **Charts**: Recharts für Trading-Charts

## Deployment

```yaml
# Docker Compose Services
- nginx: Port 80 (öffentlich)
- frontend: Port 80 (intern)
- backend: Port 8000 (intern)
- sqlite: Volume (persistiert)
```

Alle Container laufen in einem Docker-Netzwerk (`dolphin-network`).
