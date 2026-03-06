# Coolify Docker Compose Build
# Dieses Dockerfile startet docker-compose mit allen Services

FROM docker/compose:latest

WORKDIR /app

# Kopiere alle Dateien
COPY . .

# Port 80 für Nginx
EXPOSE 80

# Starte docker-compose
CMD ["docker-compose", "up", "--build"]
