#!/bin/sh
set -e

# Use environment variables or defaults
AUTH_USER="${BASIC_AUTH_USER:-admin}"
AUTH_PASS="${BASIC_AUTH_PASS:-admin}"

echo "Setting up Basic Auth for user: $AUTH_USER"
htpasswd -b -c /etc/nginx/.htpasswd "$AUTH_USER" "$AUTH_PASS"

echo "Starting nginx..."
nginx -g "daemon off;"