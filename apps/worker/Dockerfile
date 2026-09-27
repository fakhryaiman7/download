# Multi-stage Dockerfile for VideoDrop Worker
FROM node:22-bookworm-slim AS base

# Install system dependencies: python3 (required by yt-dlp), ffmpeg, curl, ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

# Copy root workspace configurations
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/worker/package*.json ./apps/worker/

# Install dependencies
RUN npm install --workspace=@videodrop/shared --workspace=@videodrop/worker

# Copy source files
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

# Build shared package and worker
RUN npm run build:shared
RUN npm run build:worker

# Production container
ENV NODE_ENV=production
ENV WORKER_PORT=8080
ENV WORKER_HOST=0.0.0.0
ENV TEMP_STORAGE_DIR=/tmp/video-downloader

EXPOSE 8080

CMD ["node", "apps/worker/dist/index.js"]
