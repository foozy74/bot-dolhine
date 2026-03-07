# C3 - Backend Component Diagram

## Überblick

Dieses Diagramm zeigt die internen Komponenten des FastAPI Backends.

```plantuml
@startuml C3_Backend_Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Backend Component Diagram - Delfin Trading Bot

Container_Boundary(fastapi, "FastAPI Backend") {
    
    Component(api_routes, "API Routes", "FastAPI Router", "REST Endpoints & WebSocket")
    Component(settings_api, "Settings API", "FastAPI Router", "Settings CRUD Endpoints")
    
    Component(bot_manager, "Bot Manager", "Python Class", "Bot Lifecycle & State Management")
    Component(strategy, "Trading Strategy", "Python Class", "EMA + RSI + ATR Strategie")
    
    Component(bitunix_api, "Bitunix API", "Python Class", "Exchange API Client")
    Component(ws_handler, "WebSocket Handler", "FastAPI WS", "Broadcast & Real-time Updates")
    
    Component(settings_service, "Settings Service", "Python Class", "Settings Business Logic")
    Component(settings_repo, "Settings Repository", "SQLAlchemy", "Settings Data Access")
    
    Component(config, "Config", "Pydantic", "Umgebungsvariablen & Settings")
}

ContainerDb(sqlite, "SQLite", "Database", "Settings & History")
System_Ext(bitunix, "Bitunix Exchange", "External API")
Container(frontend, "Frontend", "React App", "Dashboard")

Rel(api_routes, bot_manager, "uses")
Rel(api_routes, settings_api, "includes")
Rel(api_routes, ws_handler, "uses")

Rel(bot_manager, strategy, "uses")
Rel(bot_manager, bitunix_api, "uses")
Rel(bot_manager, ws_handler, "broadcasts")
Rel(bot_manager, settings_service, "reads config")

Rel(settings_api, settings_service, "uses")
Rel(settings_service, settings_repo, "uses")
Rel(settings_repo, sqlite, "reads/writes")

Rel(bitunix_api, bitunix, "HTTPS", "REST API")
Rel(ws_handler, frontend, "WebSocket", "JSON Messages")

SHOW_LEGEND()

@enduml
```

## Komponenten Beschreibung

### API Routes (`api/routes.py`)
- **Typ**: FastAPI Router
- **Endpoints**:
  - `GET /api/status` - Bot Status
  - `POST /api/bot/start` - Bot starten
  - `POST /api/bot/stop` - Bot stoppen
  - `GET /api/trades` - Trade History
  - `WS /api/ws` - WebSocket Endpoint

### Settings API (`api/settings.py`)
- **Typ**: FastAPI Router
- **Endpoints**:
  - `GET /api/settings/` - Alle Settings
  - `GET /api/settings/{category}` - Settings nach Kategorie
  - `GET /api/settings/key/{key}` - Einzelnes Setting
  - `PUT /api/settings/key/{key}` - Setting aktualisieren
  - `PUT /api/settings/batch` - Batch Update
  - `POST /api/settings/reset` - Reset to Defaults
  - `GET /api/settings/schema/form` - UI Schema

### Bot Manager (`bot/bot_manager.py`)
- **Typ**: Python Klasse (Singleton)
- **Verantwortung**:
  - Bot Start/Stop Lifecycle
  - Status Management
  - Trading Loop
  - Trade Log
  - WebSocket Broadcast

### Trading Strategy (`bot/strategy.py`)
- **Typ**: Python Klasse
- **Algorithmus**:
  - EMA 8/21 Crossover
  - RSI Filter (30/70)
  - ATR-basiertes Risk Management
  - SL/TP Berechnung

### Bitunix API (`bot/bitunix_api.py`)
- **Typ**: Python Klasse
- **Authentication**: SHA256 mit Nonce (Bitunix OpenAPI Standard)
- **API Base**: https://fapi.bitunix.com
- **Methoden**:
  - `get_klines()` - Candlestick Daten (Futures Market)
  - `get_ticker()` - Aktueller Preis
  - `get_tickers()` - Mehrere Preise gleichzeitig
  - `get_depth()` - Orderbuch Tiefe
  - `get_balance()` - Kontostand
  - `get_positions()` - Offene Positionen
  - `place_order()` - Order platzieren (Limit/Market)
  - `cancel_order()` - Order stornieren
- **Signature Generation**:
  ```python
  digest = SHA256(nonce + timestamp + api_key + query_params + body)
  sign = SHA256(digest + secret_key)
  ```
  - `get_balance()` - Kontostand
  - `place_order()` - Order platzieren
- **Auth**: SHA256 mit Nonce (Bitunix OpenAPI Standard)

### WebSocket Handler
- **Typ**: FastAPI WebSocket
- **Funktion**:
  - Client Connections verwalten
  - Broadcast an alle Clients
  - Status Updates
  - Trade Notifications

### Settings Service (`services/settings_service.py`)
- **Typ**: Python Klasse
- **Funktion**:
  - Business Logic für Settings
  - Validierung (min/max Werte)
  - Type Konvertierung
  - Default-Werte Management
  - Reset to Defaults

### Settings Repository (`models/setting.py`)
- **Typ**: SQLAlchemy Model
- **Schema**:
  ```sql
  id: INTEGER PRIMARY KEY
  category: TEXT (trading/api/notifications/system)
  key: TEXT UNIQUE
  value: TEXT
  value_type: TEXT (string/int/float/bool)
  is_secret: BOOLEAN
  description: TEXT
  min_value: FLOAT
  max_value: FLOAT
  ```

### Config (`core/config.py`)
- **Typ**: Pydantic Settings
- **Quellen**:
  - Umgebungsvariablen (.env)
  - Default Werte
  - SQLite Settings (Fallback)

## Datenfluss

### Settings Lesen
```
Frontend → Settings API → Settings Service → Settings Repo → SQLite
```

### Settings Schreiben
```
Frontend → Settings API → Settings Service (Validation) → Settings Repo → SQLite
```

### Trading Tick
```
Bot Manager → Strategy.calculate_all() → Signal?
                                         ↓
                    Position öffnen → Bitunix API → Exchange
                                         ↓
                              WebSocket Broadcast → Frontend
```

### WebSocket Broadcast
```
Bot Manager → ws_handler.broadcast() → Alle verbundene Clients
```

## Abhängigkeiten

```
api/routes.py
├── bot/bot_manager.py
│   ├── bot/strategy.py
│   ├── bot/bitunix_api.py
│   └── services/settings_service.py
├── api/settings.py
│   └── services/settings_service.py
│       ├── models/setting.py
│       └── core/config.py
└── core/config.py
```

## State Management

### Bot Status
```python
{
    running: bool,
    position: str | null,      # "LONG" | "SHORT"
    entry_price: float,
    current_price: float,
    stop_loss: float,
    take_profit: float,
    pnl: float,                 # Aktueller PnL %
    total_pnl: float,           # Gesamt PnL %
    last_signal: str | null,
    last_update: datetime,
    symbol: str,
    dry_run: bool
}
```

### Settings Cache
- **Lazy Loading**: Settings werden bei Bedarf geladen
- **Validation**: Bei jedem Update
- **Persistence**: Automatisch in SQLite

## Fehlerbehandlung

- **API Errors**: HTTP Exception mit Detail
- **Validation Errors**: 400 Bad Request
- **WebSocket Errors**: Silent reconnect
- **Trading Errors**: Log + Notification
