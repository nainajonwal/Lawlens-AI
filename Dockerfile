# Stage 1: Build React Frontend SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend with FastAPI
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

# Copy application source code
COPY backend/ ./backend/
COPY sample_documents/ ./sample_documents/

# Copy compiled frontend from Stage 1 into the exact location backend expects
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Set runtime environment
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
EXPOSE 8000

WORKDIR /app/backend

# Launch FastAPI on Render's assigned $PORT
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
