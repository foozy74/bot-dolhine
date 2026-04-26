# C4 - Code Diagramme

## Überblick

Diese Ebene zeigt die wichtigsten Klassen und Interfaces des Systems.

## Backend Klassendiagramm

```plantuml
@startuml C4_Backend_Classes

skinparam classAttributeIconSize 0
skinparam class {
    BackgroundColor<<Model>> LightBlue
    BackgroundColor<<Service>> LightGreen
    BackgroundColor<<API>> LightCoral
    BackgroundColor<<Strategy>> LightYellow
}

package "Models" <<Model>> {
    class Setting {
        +id: int
        +category: str
        +key: str
        +value: str
        +value_type: str
        +is_secret: bool
        +description: str
        +min_value: float
        +max_value: float
        +created_at: datetime
        +updated_at: datetime
    }
}

package "Services" <<Service>> {
    class SettingsService {
        +session: AsyncSession
        +initialize_defaults()
        +get_all_settings(): dict
        +get_setting(key): dict
        +update_setting(key, value): dict
        +reset_to_defaults(): list
        -_parse_value(value, type): any
        -_validate_value(value, setting): any
    }
}

package "Bot" <<Strategy>> {
    class BotManager {
        -_running: bool
        +api: BitunixAPI
        +strategy: DolphinStrategy
        +status: dict
        +trade_log: list
        +is_running(): bool
        +get_status(): dict
        +start(config, broadcast_fn)
        +stop()
        -_tick(config, sleep_time)
        -_open_position(signal, price, atr, config)
        -_check_exit(price)
    }
    
    class DolphinStrategy {
        +ema_fast: int = 8
        +ema_slow: int = 21
        +rsi_period: int = 14
        +atr_period: int = 14
        +prepare_dataframe(raw_data): DataFrame
        +calculate_all(df): DataFrame
        +get_signal(df): tuple
        +calculate_levels(price, atr, direction): tuple
    }
    
    class BitunixAPI {
        +api_key: str
        +secret_key: str
        +base_url: str
        +get_klines(symbol, interval): dict
        +get_ticker(symbol): dict
        +get_balance(): dict
        +place_order(symbol, side, qty): dict
        -_sign(timestamp, method, endpoint): str
        -_headers(method, endpoint): dict
    }
}

package "API" <<API>> {
    class SettingsRouter {
        +get_all_settings()
        +get_settings_by_category(category)
        +get_setting(key)
        +update_setting(key, request)
        +update_settings_batch(request)
        +reset_to_defaults()
        +get_settings_schema()
        +initialize_settings()
    }
    
    class BotRouter {
        +status()
        +health()
        +start(config)
        +stop()
        +trades()
        +websocket(ws)
    }
}

SettingsService ..> Setting : uses
SettingsRouter ..> SettingsService : uses
BotManager ..> BitunixAPI : uses
BotManager ..> DolphinStrategy : uses
BotRouter ..> BotManager : uses

@enduml
```

## Frontend Klassendiagramm

```plantuml
@startuml C4_Frontend_Classes

skinparam classAttributeIconSize 0
skinparam class {
    BackgroundColor<<Component>> LightBlue
    BackgroundColor<<Hook>> LightGreen
    BackgroundColor<<Service>> LightCoral
    BackgroundColor<<Context>> LightYellow
}

package "Components" <<Component>> {
    class App {
        +isLoading: boolean
        +initializeSettings()
        +render()
    }
    
    class Layout {
        +isSidebarOpen: boolean
        +menuItems: array
        +toggleSidebar()
    }
    
    class Dashboard {
        +priceHistory: array
        +isStarting: boolean
        +isStopping: boolean
        +config: object
        +handleStart()
        +handleStop()
    }
    
    class Settings {
        +activeCategory: string
        +pendingChanges: object
        +handleSettingChange(key, value)
        +handleSaveSetting(key, value)
    }
    
    class Logs {
        +filter: string
        +filteredLogs: array
    }
}

package "Hooks" <<Hook>> {
    class useWebSocket {
        +ws: WebSocket
        +status: object
        +trades: array
        +logs: array
        +isConnected: boolean
        +connect()
        +sendMessage(message)
    }
    
    class useSettings {
        +settings: object
        +schema: object
        +loading: boolean
        +error: string
        +saveStatus: object
        +fetchSettings()
        +updateSetting(key, value)
        +resetToDefaults()
    }
}

package "Services" <<Service>> {
    class api {
        +get(url): Promise
        +post(url, data): Promise
        +put(url, data): Promise
    }
}

package "Context" <<Context>> {
    class WebSocketContext {
        +Provider
        +Consumer
    }
}

App --> Layout : renders
Layout --> Dashboard : routes
Layout --> Settings : routes
Layout --> Logs : routes

Dashboard ..> useWebSocket : uses
Dashboard ..> api : uses
Settings ..> useSettings : uses
Settings ..> api : uses
Logs ..> useWebSocket : uses

useWebSocket ..> WebSocketContext : provides

@enduml
```

## Datenbank Schema

```plantuml
@startuml C4_Database_Schema

entity Setting {
    * id : INTEGER <<PK>>
    --
    * category : TEXT
    * key : TEXT <<UNIQUE>>
    * value : TEXT
    * value_type : TEXT
    is_secret : BOOLEAN
    description : TEXT
    min_value : FLOAT
    max_value : FLOAT
    created_at : TIMESTAMP
    updated_at : TIMESTAMP
}

entity TradeLog {
    * id : INTEGER <<PK>>
    --
    time : TIMESTAMP
    action : TEXT
    symbol : TEXT
    price : FLOAT
    side : TEXT
    qty : FLOAT
    pnl : FLOAT
}

@enduml
```

## API Endpoints

```plantuml
@startuml C4_API_Endpoints

package "Settings API" {
    class GET_SETTINGS {
        Method: GET
        Path: /api/settings/
        Response: { category: { key: { value, type, ... } } }
    }
    
    class GET_SETTING {
        Method: GET
        Path: /api/settings/key/{key}
        Response: { value, type, is_secret, ... }
    }
    
    class UPDATE_SETTING {
        Method: PUT
        Path: /api/settings/key/{key}
        Body: { value }
        Response: { key, value, message }
    }
    
    class BATCH_UPDATE {
        Method: PUT
        Path: /api/settings/batch
        Body: { settings: { key: value } }
        Response: [{ key, status, message }]
    }
    
    class RESET_DEFAULTS {
        Method: POST
        Path: /api/settings/reset
        Response: [{ key, status, message }]
    }
    
    class GET_SCHEMA {
        Method: GET
        Path: /api/settings/schema/form
        Response: { category: { key: { type, default, ... } } }
    }
}

package "Bot API" {
    class GET_STATUS {
        Method: GET
        Path: /api/status
        Response: BotStatus
    }
    
    class POST_START {
        Method: POST
        Path: /api/bot/start
        Body: BotConfig
        Response: { message }
    }
    
    class POST_STOP {
        Method: POST
        Path: /api/bot/stop
        Response: { message }
    }
    
    class GET_TRADES {
        Method: GET
        Path: /api/trades
        Response: [Trade]
    }
    
    class WEBSOCKET {
        Type: WebSocket
        Path: /api/ws
        Messages: status, trade, log
    }
}

@enduml
```

## WebSocket Nachrichten

```plantuml
@startuml C4_WebSocket_Messages

package "Client → Server" {
    note right
      Aktuell: Keine Client → Server Nachrichten
      (Nur Verbindungsaufbau)
    end note
}

package "Server → Client" {
    class StatusMessage {
        type: "status"
        running: boolean
        position: string
        entry_price: float
        current_price: float
        stop_loss: float
        take_profit: float
        pnl: float
        total_pnl: float
        symbol: string
        dry_run: boolean
    }
    
    class TradeMessage {
        type: "trade"
        message: string
        time: datetime
        action: string
        price: float
        stop_loss: float
        take_profit: float
        pnl: float
    }
    
    class LogMessage {
        type: "log"
        level: string
        message: string
    }
}

@enduml
```

## Konfigurationsobjekte

### BotConfig (Backend)
```python
{
    api_key: str
    secret_key: str
    symbol: str = "BTCUSDT"
    timeframe: str = "5m"
    risk_pct: float = 0.02
    dry_run: bool = True
}
```

### Settings (Frontend)
```javascript
{
    trading: {
        symbol: { value: "BTCUSDT", type: "string" },
        risk_pct: { value: 0.02, type: "float", min: 0.01, max: 0.10 },
        dry_run: { value: true, type: "bool" }
    },
    api: {
        bitunix_api_key: { value: "***", type: "string", is_secret: true }
    }
}
```

## DTOs (Data Transfer Objects)

### SettingResponse
```python
{
    value: Any
    type: str  # "string" | "int" | "float" | "bool"
    is_secret: bool
    description: str | None
    min: float | None
    max: float | None
}
```

### UpdateSettingRequest
```python
{
    value: Any
}
```

### BotStatus
```python
{
    running: bool
    position: str | None
    entry_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    pnl: float
    total_pnl: float
    last_signal: str | None
    last_update: str  # ISO datetime
    symbol: str
    dry_run: bool
}
```

## Interfaces

### SettingsService Interface
```typescript
interface ISettingsService {
    initialize_defaults(): Promise<void>
    get_all_settings(include_secrets?: boolean): Promise<SettingsMap>
    get_setting(key: string, include_secrets?: boolean): Promise<Setting>
    update_setting(key: string, value: any): Promise<UpdateResult>
    update_settings_batch(updates: Record<string, any>): Promise<UpdateResult[]>
    reset_to_defaults(): Promise<UpdateResult[]>
}
```

### BotManager Interface
```typescript
interface IBotManager {
    is_running(): boolean
    get_status(): BotStatus
    get_trade_log(): Trade[]
    start(config: BotConfig, broadcast_fn: Function): Promise<void>
    stop(): Promise<void>
}
```

## Validierungsregeln

### Settings Validation
```python
# Risk Percentage
min: 0.01  # 1%
max: 0.10  # 10%

# EMA Periods
ema_fast: min=5, max=50
ema_slow: min=10, max=100

# RSI Levels
rsi_overbought: min=60, max=90
rsi_oversold: min=10, max=40

# Timeframes
allowed: ["1m", "5m", "15m", "1h"]
```

## Type Mappings

### Database → Python
```
sqlite TEXT     → Python str
sqlite INTEGER  → Python int
sqlite REAL     → Python float
sqlite BOOLEAN  → Python bool
sqlite TIMESTAMP → Python datetime
```

### Python → JSON
```
Python str      → JSON string
Python int      → JSON number
Python float    → JSON number
Python bool     → JSON boolean
Python datetime → JSON string (ISO format)
Python None     → JSON null
```

## Wichtige Dateien

### Backend
```
backend/
├── models/
│   └── setting.py          # Setting Model
├── services/
│   └── settings_service.py # Business Logic
├── api/
│   ├── settings.py         # API Routes
│   └── routes.py           # Bot Routes
├── bot/
│   ├── bot_manager.py      # Bot Lifecycle
│   ├── strategy.py         # Trading Logic
│   └── bitunix_api.py      # Exchange Client
└── core/
    ├── config.py           # Configuration
    └── database.py         # DB Connection
```

### Frontend
```
frontend/src/
├── hooks/
│   ├── useWebSocket.jsx    # WS Hook
│   └── useSettings.jsx     # Settings Hook
├── pages/
│   ├── Dashboard.jsx       # Main Dashboard
│   ├── Settings.jsx        # Settings Page
│   └── Logs.jsx            # Logs Page
├── components/
│   └── layout/
│       └── Layout.jsx      # App Layout
├── services/
│   └── api.js              # API Client
└── styles/
    └── glassmorphism.css   # Design System
```
