FROM nginx:alpine

# Install apache2-utils for htpasswd
RUN apk add --no-cache apache2-utils

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Create entrypoint script
RUN echo '#!/bin/sh\n\
htpasswd -b -c /etc/nginx/.htpasswd ${BASIC_AUTH_USER:-admin} ${BASIC_AUTH_PASS:-admin}\n\
nginx -g "daemon off;"' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]