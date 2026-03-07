#!/bin/bash

# Backend Start Script für Delfin Bot

echo "🐬 Starte Delfin Bot Backend..."

# In das Projektverzeichnis wechseln
cd "$(dirname "$0")"

# Virtuelle Umgebung aktivieren, falls vorhanden
if [ -f "venv/bin/activate" ]; then
    echo "Aktiviere virtuelle Umgebung..."
    source venv/bin/activate
fi

# Dependencies installieren
echo "Installiere Dependencies..."
pip install -r backend/requirements.txt

# Backend starten
echo "Starte Backend auf Port 8000..."
export APP_PORT=8000
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
cd backend
python main.py