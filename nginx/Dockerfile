FROM nginx:alpine

# Install apache2-utils for htpasswd
RUN apk add --no-cache apache2-utils

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create entrypoint script with better error handling
RUN echo '#!/bin/sh
set -e

# Use environment variables or defaults
AUTH_USER="${BASIC_AUTH_USER:-admin}"
AUTH_PASS="${BASIC_AUTH_PASS:-admin}"

echo "Setting up Basic Auth for user: $AUTH_USER"
htpasswd -b -c /etc/nginx/.htpasswd "$AUTH_USER" "$AUTH_PASS"

echo "Starting nginx..."
nginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]