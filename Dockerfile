# Multi-stage Dockerfile for Crypto Price Monitor
# Supports both Node.js and Python collectors

# Stage 1: Node.js base
FROM node:18-alpine AS node-collector

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production || npm install

# Copy application files
COPY collector.js ./
COPY auto-collector.html ./

# Create data directory
RUN mkdir -p data

# Stage 2: Python base
FROM python:3.11-alpine AS python-collector

WORKDIR /app

# Install Python dependencies
COPY requirements.txt* ./
RUN pip install --no-cache-dir requests || echo "No requirements.txt found"

# Copy Python collector
COPY collector.py ./

# Create data directory
RUN mkdir -p data

# Stage 3: Final multi-runtime image
FROM alpine:3.18

# Install Node.js, Python, git, and cron
RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    py3-pip \
    git \
    dcron \
    bash \
    tzdata

# Set timezone (change as needed)
ENV TZ=UTC

WORKDIR /app

# Copy from build stages
COPY --from=node-collector /app/node_modules ./node_modules
COPY --from=python-collector /usr/local/lib/python*/site-packages /usr/local/lib/python3.11/site-packages

# Copy all application files
COPY . .

# Install Python requests in final image
RUN pip3 install --no-cache-dir requests || true

# Create data directory and set permissions
RUN mkdir -p data && \
    chmod -R 755 /app

# Create cron job for automated collection
RUN echo "0 */6 * * * cd /app && node collector.js >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Create entrypoint script
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'echo "Crypto Price Monitor Docker Container"' >> /app/entrypoint.sh && \
    echo 'echo "======================================="' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Run initial collection' >> /app/entrypoint.sh && \
    echo 'echo "Running initial price collection..."' >> /app/entrypoint.sh && \
    echo 'node collector.js' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Start cron daemon' >> /app/entrypoint.sh && \
    echo 'echo "Starting cron daemon for scheduled collections..."' >> /app/entrypoint.sh && \
    echo 'crond -f -l 2' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Expose port for web interface (optional)
EXPOSE 8080

# Volume for persistent data
VOLUME ["/app/data"]

# Default command
CMD ["/app/entrypoint.sh"]