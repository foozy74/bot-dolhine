#!/bin/sh
set -e

echo "=== Nginx Startup ==="
echo "Checking environment variables..."

# Check if environment variables are set
if [ -z "$BASIC_AUTH_USER" ]; then
    echo "WARNING: BASIC_AUTH_USER not set, using default 'admin'"
    AUTH_USER="admin"
else
    AUTH_USER="$BASIC_AUTH_USER"
    echo "BASIC_AUTH_USER is set"
fi

if [ -z "$BASIC_AUTH_PASS" ]; then
    echo "WARNING: BASIC_AUTH_PASS not set, using default 'admin'"
    AUTH_PASS="admin"
else
    AUTH_PASS="$BASIC_AUTH_PASS"
    echo "BASIC_AUTH_PASS is set"
fi

echo "Creating .htpasswd file for user: $AUTH_USER"

# Create directory if it doesn't exist
mkdir -p /etc/nginx

# Create .htpasswd file
if htpasswd -b -c /etc/nginx/.htpasswd "$AUTH_USER" "$AUTH_PASS"; then
    echo "Successfully created /etc/nginx/.htpasswd"
    ls -la /etc/nginx/.htpasswd
else
    echo "ERROR: Failed to create .htpasswd file"
    exit 1
fi

# Test nginx configuration
echo "Testing nginx configuration..."
if nginx -t; then
    echo "Nginx configuration OK"
else
    echo "ERROR: Nginx configuration test failed"
    exit 1
fi

echo "Starting nginx..."
exec nginx -g "daemon off;"