#!/bin/bash
echo "🔍 Delfin Bot Diagnostics"
echo ""

if [ -f "/app/scripts/diagnose_bot.py" ]; then
    python3 /app/scripts/diagnose_bot.py "$@"
else
    cd "$(dirname "$0")"
    python3 diagnose_bot.py "$@"
fi
