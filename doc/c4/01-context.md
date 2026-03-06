# C1 - System Context Diagram

## Überblick

Das System Context Diagram zeigt das Delfin Bot System in seiner Umgebung - welche User und externe Systeme interagieren damit.

```plantuml
@startuml C1_System_Context
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

title System Context Diagram - Delfin Trading Bot

Person(trader, "Trader", "Nutzer des Trading Bots")

System_Boundary(delfin, "Delfin Bot System") {
    System(backend, "Delfin Backend", "FastAPI Trading Engine")
    System(frontend, "Delfin Frontend", "React Dashboard")
}

System_Ext(bitunix, "Bitunix Exchange", "Krypto-Börse für Trading")
System_Ext(telegram, "Telegram", "Push-Benachrichtigungen")

Rel(trader, frontend, "Konfiguriert & Überwacht", "HTTPS/Browser")
Rel(frontend, backend, "API Calls & WebSocket", "HTTP/WS")
Rel(backend, bitunix, "Trading API", "REST API + HMAC Auth")
Rel(backend, telegram, "Sendet Benachrichtigungen", "Bot API")

SHOW_LEGEND()

@enduml
```

## Beschreibung

### User
- **Trader**: Nutzer des Systems, konfiguriert Trading-Strategien und überwacht den Bot

### Delfin Bot System
- **Frontend**: React + Vite Single Page Application
- **Backend**: FastAPI mit Trading-Engine, API und WebSocket

### Externe Systeme
- **Bitunix Exchange**: Krypto-Börse für Live-Trading und Marktdaten
- **Telegram**: Push-Benachrichtigungen über Trades und Alerts

## Datenfluss

1. Trader öffnet das Dashboard im Browser
2. Frontend kommuniziert mit Backend via REST API und WebSocket
3. Backend führt Trading-Strategie aus und kommuniziert mit Bitunix
4. Trading-Ereignisse werden via WebSocket an Frontend gestreamt
5. Optionale Telegram-Benachrichtigungen bei wichtigen Events

## Schnittstellen

| Von | Zu | Protokoll | Daten |
|-----|-----|-----------|-------|
| Browser | Frontend | HTTPS | UI Rendering |
| Frontend | Backend | HTTP/REST | API Calls |
| Frontend | Backend | WebSocket | Live-Updates |
| Backend | Bitunix | HTTPS/REST | Trading & Market Data |
| Backend | Telegram | HTTPS/REST | Notifications |

## Sicherheit

- **Basic Auth**: Alle Zugriffe werden durch Nginx mit Basic Auth geschützt
- **HMAC**: Bitunix API nutzt HMAC-SHA256 Signatur
- **Secrets**: API Keys werden verschlüsselt gespeichert
