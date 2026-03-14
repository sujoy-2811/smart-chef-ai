# SmartChef AI

SmartChef AI is a PERN-style monorepo with:

- `backend/`: Express API
- `frontend/`: React + Vite frontend (UI-first)

The current frontend contains complete screens and navigation with dummy/mock behavior for several flows. The backend is a minimal Express starter API.

## Project Structure

```txt
smartchef-ai/
├─ backend/
│  ├─ app.js
│  ├─ server.js
│  └─ package.json
├─ frontend/
│  ├─ src/
│  ├─ package.json
│  └─ vite.config.js
└─ package.json
```

## Prerequisites

- Node.js 24+
- npm 11+

## Install

Install dependencies in all required locations.

```bash
# root (for concurrently)
npm install

# backend deps
cd backend
npm install

# frontend deps
cd ../frontend
npm install
```

## Run The App

### Run backend + frontend together (recommended)

From project root:

```bash
cd smartchef-ai
npm run dev
```

You should see named logs:

- `API` -> backend
- `APP` -> frontend

### Run each project separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Default URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

Quick backend test:

```bash
curl http://localhost:8000/
```

Expected response:

```txt
API running
```

## Production Deployment (Docker)

This repository includes a production-ready container setup:

- Multi-stage Docker build (frontend build + backend runtime)
- Single deployable image containing backend and built frontend assets
- Compose health check endpoint at `/api/health`
- Container hardening basics with `restart: unless-stopped` and `init: true`

### Build Image

From project root:

```bash
docker build -t smartchef-ai:latest .
```

### Run Image Directly

```bash
docker run --env-file backend/.env -p 8003:8003 smartchef-ai:latest
```

### Run With Docker Compose

```bash
docker compose --env-file backend/.env up -d
```

This starts service `smartchef-ai` with:

- port mapping `${PORT:-8003}:${PORT:-8003}`
- environment from `backend/.env`
- health checks against `http://localhost:${PORT}/api/health`

### Stop Compose Deployment

```bash
docker compose down
```

### Compose Notes

- Current compose file uses an external Docker network named `npm-network`.
- Create it once before first run if it does not already exist:

```bash
docker network create npm-network
```

- `PORT` is used in container runtime and port publishing. Pass it using `--env-file backend/.env`.
- You can rebuild image on startup when needed:

```bash
docker compose --env-file backend/.env up --build -d
```

## Available Scripts

Root (`package.json`):

- `npm run dev` -> run frontend + backend with `concurrently`
- `npm run dev:backend` -> run backend only from root
- `npm run dev:frontend` -> run frontend only from root
- `npm run dev:fronted` -> compatibility alias for old command

Backend (`backend/package.json`):

- `npm run dev` -> start Express server (`node server.js`)

Frontend (`frontend/package.json`):

- `npm run dev` -> start Vite dev server
- `npm run build` -> production build
- `npm run preview` -> preview build

## Notes

- Folder name is `frontend`.
- Current backend is a starter API and can be expanded with routes/controllers/services.
- Frontend UI is ready for iterative backend integration.
