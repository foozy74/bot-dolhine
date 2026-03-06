# 🐬 Delfin Bot - C4 Architektur-Dokumentation

Diese Dokumentation beschreibt die Architektur des Delfin Trading Bots nach dem [C4 Model](https://c4model.com/) von Simon Brown.

## Übersicht

Das C4-Model besteht aus 4 Ebenen:

1. **Context** (System Context) - Das große Ganze
2. **Container** - Anwendungen und Datenbanken
3. **Components** - Interne Komponenten
4. **Code** - Klassen und Interfaces

---

## 📁 Dokumente

| Ebene | Datei | Beschreibung |
|-------|-------|--------------|
| C1 | [01-context.md](./01-context.md) | System Context - User und externe Systeme |
| C2 | [02-container.md](./02-container.md) | Container - Apps, Services, DBs |
| C3 | [03-component-backend.md](./03-component-backend.md) | Backend-Komponenten |
| C3 | [03-component-frontend.md](./03-component-frontend.md) | Frontend-Komponenten |
| C4 | [04-code.md](./04-code.md) | Klassendiagramme |

---

## 🎯 Zusammenfassung

**Delfin Bot** ist ein automatisierter Krypto-Trading Bot mit:

- **FastAPI Backend** - Trading-Logik und API
- **React Frontend** - Modernes Dashboard
- **SQLite Datenbank** - Persistente Einstellungen
- **WebSocket** - Echtzeit-Updates
- **Docker** - Container-Deployment

### Technologie-Stack

```
Frontend:     React 18 + Vite + Recharts
Backend:      Python + FastAPI + SQLAlchemy
Database:     SQLite (async via aiosqlite)
Websocket:    Native WebSocket (Frontend) / FastAPI (Backend)
Deployment:   Docker + Docker Compose + Nginx
```

---

## 🚀 Schnellstart

### C4 Diagramme anzeigen

Die Diagramme sind in PlantUML geschrieben. Du kannst sie anzeigen mit:

1. **VS Code** - Mit PlantUML Extension
2. **IntelliJ** - Mit PlantUML Integration
3. **Online** - Auf [PlantUML Server](http://www.plantuml.com/plantuml/)
4. **Local** - Mit `plantuml` CLI

### Generieren

```bash
# PlantUML installieren (macOS)
brew install plantuml

# Alle Diagramme generieren
plantuml doc/c4/*.puml
```

---

## 📊 Architektur-Entscheidungen

### Warum FastAPI?
- Native async/await Unterstützung
- Automatische OpenAPI/Swagger Docs
- WebSocket Unterstützung
- Hohe Performance

### Warum React + Vite?
- Schnelles Development
- Kleine Bundle-Größe
- Moderne Features (Hooks, Context)
- Einfaches Deployment

### Warum SQLite?
- Keine separate DB-Instanz nötig
- Perfekt für Single-User-Apps
- Einfache Backups
- Ausreichend für Settings & Trade-History

### Warum Glassmorphism Design?
- Moderne Ästhetik
- Hohe Lesbarkeit
- Passt zu Trading/FinTech
- Gute UX

---

## 🔐 Sicherheit

- **Basic Auth** - Nginx schützt alle Endpoints
- **Secret Masking** - API Keys werden nie im Klartext angezeigt
- **Dry Run Mode** - Testen ohne echtes Geld
- **Input Validation** - Frontend + Backend Validierung

---

## 📈 Skalierung

Aktuell optimiert für:
- **1 User** - Personal Trading Bot
- **Low Latency** - 1m-1h Timeframes
- **Single Symbol** - Ein Trading-Paar

Für Multi-User:
- PostgreSQL statt SQLite
- Redis für Caching
- Separate Worker-Queues

---

## 🔄 Architektur-Updates

### 2026-03-06 - Frontend/Backend Separation

**Änderung**: Frontend ist jetzt separater Container, nicht mehr im Backend gemountet.

**Vorher:**
```python
# backend/main.py
app.mount("/", StaticFiles(directory="../frontend", html=True))
```

**Nachher:**
```python
# backend/main.py - Kein Static File Serving mehr
# Frontend läuft als eigener Container
```

**Docker Compose:**
- `frontend` - Eigener Container mit React Build
- `nginx` - Proxy zu Frontend (Static Files) und Backend (API)
- `backend` - Nur API Endpoints

**Vorteile:**
- Backend startet auch ohne Frontend-Build
- Bessere Separation of Concerns
- Einfacheres Debugging

---

*Dokumentation erstellt am: 2025-03-06*
*Version: 1.0.1*
