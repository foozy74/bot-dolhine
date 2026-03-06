# All-in-One Dockerfile für Coolify
# Baut Backend, Frontend und Nginx in einem Container

# ─── Stage 1: Build Frontend ─────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ─── Stage 2: Python Backend ─────────────────────────
FROM python:3.12-slim AS backend

RUN apt-get update && apt-get install -y curl nginx apache2-utils && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python Dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Backend Code
COPY backend/ ./backend/
WORKDIR /app/backend

# Kopiere Frontend Build
COPY --from=frontend-builder /app/frontend/dist ../frontend/dist

# Kopiere Nginx Config
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Kopiere Start-Script
COPY <<'EOF' /start.sh
#!/bin/bash
set -e

# Erstelle htpasswd für Basic Auth
htpasswd -b -c /etc/nginx/.htpasswd "${BASIC_AUTH_USER:-admin}" "${BASIC_AUTH_PASS:-admin}"

# Starte Nginx im Hintergrund
nginx

# Starte FastAPI im Vordergrund (für Health Checks)
exec uvicorn main:app --host 0.0.0.0 --port 8000 --workers 1
EOF

RUN chmod +x /start.sh

EXPOSE 80 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

CMD ["/start.sh"]
