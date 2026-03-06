FROM python:3.12-slim
# System Dependencies
RUN apt-get update && apt-get install -y     curl     && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Dependencies zuerst (Layer Caching)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
# App Code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
WORKDIR /app/backend
EXPOSE 8000
# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3     CMD curl -f http://localhost:8000/api/status || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
