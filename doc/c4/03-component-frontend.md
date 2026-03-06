# C3 - Frontend Component Diagram

## Überblick

Dieses Diagramm zeigt die internen Komponenten der React Frontend-Anwendung.

```plantuml
@startuml C3_Frontend_Components
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

title Frontend Component Diagram - Delfin Trading Bot

Container_Boundary(react_app, "React App") {
    
    Component(app, "App", "React Component", "Root Component & Routing")
    Component(layout, "Layout", "React Component", "Sidebar & Navigation")
    
    Component_Boundary(pages, "Pages") {
        Component(dashboard, "Dashboard", "React Component", "Main Trading Dashboard")
        Component(settings, "Settings Page", "React Component", "Configuration UI")
        Component(logs, "Logs Page", "React Component", "System Logs")
    }
    
    Component_Boundary(hooks, "Custom Hooks") {
        Component(useWebSocket, "useWebSocket", "React Hook", "WebSocket Connection")
        Component(useSettings, "useSettings", "React Hook", "Settings Management")
    }
    
    Component_Boundary(services, "Services") {
        Component(api_client, "API Client", "JavaScript", "HTTP Requests")
        Component(ws_service, "WebSocket Service", "JavaScript", "WS Management")
    }
    
    Component(styles, "Styles", "CSS", "Glassmorphism Design System")
}

Container(backend, "Backend", "FastAPI", "API & WebSocket")

Rel(app, layout, "renders")
Rel(app, pages, "routes")

Rel(dashboard, useWebSocket, "uses")
Rel(dashboard, api_client, "uses")

Rel(settings, useSettings, "uses")
Rel(settings, api_client, "uses")

Rel(logs, useWebSocket, "uses")

Rel(useWebSocket, ws_service, "uses")
Rel(useSettings, api_client, "uses")

Rel(ws_service, backend, "WebSocket", "WS Connection")
Rel(api_client, backend, "HTTP", "REST API")

SHOW_LEGEND()

@enduml
```

## Komponenten Beschreibung

### App (`App.jsx`)
- **Typ**: React Root Component
- **Verantwortung**:
  - React Router Setup
  - WebSocket Provider
  - Settings Initialisierung
  - Loading State

### Layout (`components/layout/Layout.jsx`)
- **Typ**: React Component
- **Features**:
  - Sidebar Navigation
  - Mobile Responsive
  - Navigation Menu
  - Version Info

### Pages

#### Dashboard (`pages/Dashboard.jsx`)
- **Typ**: React Component
- **Features**:
  - Status Cards (Status, Preis, Position, PnL)
  - Price Chart (Recharts AreaChart)
  - Trading Controls (Start/Stop)
  - Configuration Form (Symbol, Timeframe, Risk)
  - Recent Trades Table
  - WebSocket Live Updates

#### Settings Page (`pages/Settings.jsx`)
- **Typ**: React Component
- **Features**:
  - Category Navigation (Trading, API, Notifications, System)
  - Dynamic Form Generation
  - Input Validation (min/max)
  - Secret Masking (API Keys)
  - Auto-Save
  - Reset to Defaults
  - Success/Error Feedback

#### Logs Page (`pages/Logs.jsx`)
- **Typ**: React Component
  - Log Filter (All, Info, Success, Warning, Error)
  - Real-time Log Stream
  - Connection Status
  - Empty State

### Custom Hooks

#### useWebSocket (`hooks/useWebSocket.jsx`)
- **Typ**: React Hook
- **Funktion**:
  ```javascript
  const { 
    status,      // Bot Status
    trades,      // Trade History
    logs,        // System Logs
    isConnected, // WS Status
    sendMessage  // Send to Server
  } = useWebSocket();
  ```
- **Features**:
  - Auto-Reconnect (5s delay)
  - Connection State
  - Message Parsing
  - Context Provider

#### useSettings (`hooks/useSettings.jsx`)
- **Typ**: React Hook
- **Funktion**:
  ```javascript
  const {
    settings,        // Alle Settings
    schema,          // UI Schema
    loading,         // Loading State
    error,           // Error State
    saveStatus,      // Save Feedback
    updateSetting,   // Single Update
    updateSettingsBatch, // Batch Update
    resetToDefaults  // Reset
  } = useSettings();
  ```
- **Features**:
  - Auto-fetch on mount
  - Validation
  - Error Handling
  - Success Feedback

### Services

#### API Client (`services/api.js`)
- **Typ**: JavaScript Module
- **Methoden**:
  ```javascript
  api.get('/settings/')
  api.put('/settings/key/{key}', { value })
  api.post('/bot/start', config)
  api.post('/bot/stop')
  api.get('/trades')
  ```

#### WebSocket Service (`services/websocket.js`)
- **Typ**: JavaScript Module
- **Funktion**:
  - Connection Management
  - Message Handling
  - Error Recovery
  - Reconnect Logic

### Styles (`styles/glassmorphism.css`)
- **Typ**: CSS
- **Design System**:
  - CSS Variables für Farben
  - Glass Card Component
  - Glass Button Variants
  - Glass Input Styles
  - Glass Toggle Switch
  - Typography
  - Animations
  - Utility Classes

## State Management

### Local State (useState)
- Form Inputs
- UI State (Modals, Dropdowns)
- Loading States

### Global State (Context)
- WebSocket Connection
- Bot Status
- Settings

### Server State
- Settings (SQLite)
- Trade History
- Logs

## Datenfluss

### Initial Load
```
App → useSettings.fetchSettings() → API → Backend → SQLite
App → useSettings.fetchSchema() → API → Backend
```

### WebSocket Connection
```
Dashboard → useWebSocket → ws_service → Backend (WS)
Backend → ws_service → useWebSocket → Dashboard (Update)
```

### Setting Update
```
Settings → useSettings.updateSetting() → API → Backend → SQLite
                                   ↓
                              Success/Error Feedback
```

### Bot Start
```
Dashboard → api_client.post('/bot/start') → Backend
                                    ↓
                             WebSocket Broadcast
                                    ↓
                             Dashboard (Status Update)
```

## Component Hierarchy

```
App
├── WebSocketProvider
│   └── Layout
│       ├── Sidebar
│       └── Routes
│           ├── Dashboard
│           │   ├── StatusCards
│           │   ├── PriceChart
│           │   ├── Controls
│           │   └── TradeLog
│           ├── Settings
│           │   ├── CategoryNav
│           │   └── SettingsForm
│           └── Logs
│               └── LogList
```

## Design System

### Colors
```css
--bg-primary: #0a0e14      /* Hintergrund */
--bg-secondary: #111820    /* Karten-Hintergrund */
--accent-primary: #3b82f6  /* Primäre Akzente */
--accent-success: #22c55e  /* Erfolg/Long */
--accent-danger: #ef4444   /* Fehler/Short */
--text-primary: #f0f6fc    /* Text */
```

### Components
- **Glass Card**: Blur-Effekt, border, padding
- **Button**: Primary, Success, Danger Varianten
- **Input**: Text, Number, Password, Select
- **Toggle**: Switch für Boolean-Werte

### Responsive Breakpoints
- Mobile: < 768px (Sidebar collapsible)
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance

- **Code Splitting**: React.lazy für Pages
- **Memoization**: useMemo für teure Berechnungen
- **Debouncing**: Input-Validierung
- **Virtualization**: Große Listen (wenn nötig)
