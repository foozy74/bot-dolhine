#!/bin/bash
set -e

echo "🐬 Delfin Bot Production Start"

# Create data directory if not exists
mkdir -p /app/data

# Setup basic auth if credentials are provided
if [ -n "$BASIC_AUTH_USER" ] && [ -n "$BASIC_AUTH_PASS" ]; then
    echo "🔐 Setting up basic auth..."
    htpasswd -b -c /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS"
else
    echo "⚠️  No BASIC_AUTH_USER/PASS set, using default (admin/admin)"
    htpasswd -b -c /etc/nginx/.htpasswd admin admin
fi

# Start nginx in background
echo "🌐 Starting nginx..."
nginx

# Start backend
echo "🔧 Starting backend API..."
cd /app/backend && uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
until curl -f http://localhost:8000/api/health > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Backend is ready"

# Keep container running
wait $BACKEND_PID
