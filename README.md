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

- Node.js 18+
- npm 9+

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
- Backend: `http://localhost:5001`

Quick backend test:

```bash
curl http://localhost:5001/
```

Expected response:

```txt
API running
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
