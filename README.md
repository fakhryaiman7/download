# VideoDrop — Production Video Downloader & Media Processor

VideoDrop is a production-ready, high-performance web application designed for content creators, educators, and archivists to download publicly accessible videos they own or are authorized to download.

It features a decoupled architecture separating a lightweight Next.js edge/serverless frontend from an isolated background worker running `yt-dlp` and `FFmpeg`.

---

## Architecture Overview

```
[ Browser Client ]
        │
        ▼ (HTTP / JSON)
[ Next.js Frontend (Vercel) ]
  ├── App Router (SSR & Static Pages)
  ├── Route Handlers (/api/analyze, /api/download, /api/download/:jobId)
  └── Rate Limiting & Input Validation (Zod)
        │
        ▼ (Authenticated Internal API: Bearer Token)
[ Downloader Worker Service (Node.js VPS / Docker Container) ]
  ├── SSRF Protection & DNS Rebind Defense
  ├── Source Adapter Registry (YouTube, Vimeo, TikTok, Direct Streams)
  ├── yt-dlp Process Supervisor (Safe spawn with argument arrays)
  ├── FFmpeg Transcoding & Stream-Copy Engine
  ├── In-Memory Job Store (Redis-ready interface)
  └── Automated Ephemeral Storage Cleanup (TTL Worker)
        │
        ▼ (Temporary /tmp/video-downloader/<jobId>)
[ Direct Browser Download ]
```

---

## Features

- **Dark Cinematic Interface**: Designed with tailwind styling, glassmorphism, responsive controls, and micro-animations.
- **Decoupled Processing**: Serverless Next.js functions never run long-running downloads or block CPU; jobs run on dedicated background workers.
- **Intelligent Analysis**: Extracts thumbnail, title, formatted duration, source badges, and real available video resolutions (1080p, 720p, 480p, 360p, Best) and audio (MP3).
- **Zero Hallucination / No Silent Downgrades**: If a requested quality is not available, it displays a clear error rather than downloading a random resolution.
- **SSRF & DNS Rebind Defense**: Blocks internal IPv4, IPv6, loopbacks, link-local, cloud metadata (`169.254.169.254`), and performs DNS lookups prior to connection.
- **Strict Rate Limiting & Concurrency Caps**: Configurable per-IP rate limits and global worker concurrency limits.
- **Ephemeral Storage**: Media files are automatically cleaned up from temporary disk storage after the configured TTL (`JOB_TTL_MINUTES=30`).

---

## System Requirements

- **Node.js**: v20+ or v22+
- **yt-dlp**: Latest version installed and available on `PATH`
- **FFmpeg**: v5+ (with `libmp3lame` and `x264` support)
- **Docker & Docker Compose** (optional, for containerized deployment)

---

## Installing System Dependencies

### macOS (Homebrew)
```bash
brew install yt-dlp ffmpeg
```

### Linux (Ubuntu / Debian)
```bash
sudo apt-get update
sudo apt-get install -y python3 ffmpeg curl
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

---

## Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public web application URL | `http://localhost:3000` |
| `DOWNLOADER_API_URL` | Worker service endpoint URL | `http://localhost:8080` |
| `DOWNLOADER_API_KEY` | Shared secret key for worker authentication | `dev-secret-api-key-12345` |
| `WORKER_PORT` | Port for the background worker service | `8080` |
| `WORKER_HOST` | Host interface for worker service | `0.0.0.0` |
| `MAX_CONCURRENT_JOBS` | Maximum simultaneous active download jobs | `2` |
| `JOB_TTL_MINUTES` | Time-To-Live before downloaded files are wiped | `30` |
| `RATE_LIMIT_ANALYZE` | Maximum analyze requests per IP per hour | `20` |
| `RATE_LIMIT_DOWNLOAD`| Maximum download jobs per IP per hour | `10` |
| `TEMP_STORAGE_DIR` | Temporary storage directory for media | `/tmp/video-downloader` |

---

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Shared Package
```bash
npm run build:shared
```

### 3. Start Both Web and Worker Concurrently
```bash
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Worker service
npm run dev:worker

# Terminal 2: Next.js Web frontend
npm run dev:web
```

Open `http://localhost:3000` in your browser.

---

## Docker Deployment

To run both services locally via Docker Compose:

```bash
docker compose up --build -d
```

Check logs:
```bash
docker compose logs -f
```

Stop services:
```bash
docker compose down
```

---

## Deploying to Production

### Deploying the Web App to Vercel

1. Push your repository to GitHub or GitLab.
2. In the Vercel dashboard, click **Add New Project** and select the repository.
3. Configure the Root Directory to `apps/web`.
4. Add the following Environment Variables in Vercel:
   - `NEXT_PUBLIC_APP_URL`: Your production domain (e.g. `https://videodrop.app`)
   - `DOWNLOADER_API_URL`: Your worker public domain (e.g. `https://worker.yourdomain.com`)
   - `DOWNLOADER_API_KEY`: A strong random secret key (e.g. `openssl rand -hex 32`)
5. Click **Deploy**.

> **Note**: Vercel only executes the UI, Next.js route handlers, and proxy forwarders. It does **not** run `yt-dlp` or `FFmpeg`.

### Deploying the Worker (VPS / Container Host)

Deploy the worker to any Linux VPS (Ubuntu, Debian), DigitalOcean Droplet, AWS EC2, or Railway/Render using Docker:

```bash
# Build and run the worker container
docker build -f apps/worker/Dockerfile -t videodrop-worker .
docker run -d \
  --name videodrop-worker \
  -p 8080:8080 \
  -e DOWNLOADER_API_KEY="your-strong-production-key" \
  -e MAX_CONCURRENT_JOBS=4 \
  -e JOB_TTL_MINUTES=30 \
  -v /tmp/video-downloader:/tmp/video-downloader \
  --restart unless-stopped \
  videodrop-worker
```

Set up Nginx or Caddy with Let's Encrypt SSL in front of port 8080:
```caddy
worker.yourdomain.com {
    reverse_proxy localhost:8080
}
```

---

## Running Automated Tests

Run the test suite:
```bash
npm run test --workspace=@videodrop/worker
```

To run typechecking:
```bash
npm run typecheck
```

---

## Supported Sources

- **YouTube** (`youtube.com`, `youtu.be`, `m.youtube.com`)
- **Vimeo** (`vimeo.com`, `player.vimeo.com`)
- **TikTok** (`tiktok.com`, `vm.tiktok.com`)
- **Direct Video Streams** (`.mp4`, `.webm`, `.mov`, `.mp3`)

---

## Security Policy & Protections

- **Authorized Media Only**: Designed strictly for users with rights or permissions to preserve their content.
- **No DRM or Paywall Circumvention**: If a video is protected, private, or requires a login, the request is cleanly rejected.
- **SSRF Blocklist**: Rejects private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`, `::1`), link-local (`169.254.169.254`), and non-HTTP protocols.
- **Safe Process Spawning**: All `yt-dlp` and `FFmpeg` invocations use fixed parameter arrays (`child_process.spawn`). No arbitrary shell string execution.
- **Credential Protection**: Redacts Authorization headers and tokens from all log outputs.

---

## Known Limitations

- **Platforms Requiring User Logins**: Video platforms that mandate an active user account or private cookies (such as private Vimeo or members-only videos) cannot be downloaded and return a clear user error.
- **In-Memory Job Store**: The MVP uses an in-memory job store designed for a single worker instance. For multi-worker horizontal scaling across clusters, substitute `MemoryJobStore` with a Redis-backed `JobStore` implementation.
- **File Size Limit**: Downloads are capped at 500MB per video to safeguard worker memory and network throughput.
