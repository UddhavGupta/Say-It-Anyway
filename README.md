# Say It Anyway

A premium digital conversation card game. Skip the small talk — go somewhere real.

Three game modes, 850 cards, shared real-time rooms. No login required.

> Personal project under testing. Not for commercial use or public distribution without prior permission.

---

## Architecture

This is a **full-stack monorepo** (pnpm workspaces). Two services must run for the app to work:

| Service | Path | What it does |
|---|---|---|
| **Frontend** | `artifacts/say-it-anyway` | React + Vite SPA — serves the UI |
| **API Server** | `artifacts/api-server` | Express 5 — manages rooms, players, card state |

The frontend talks to the API server via `/api/*` routes. In production, both must be accessible from the same origin (or you configure `VITE_API_BASE_URL`).

All 850 card prompts live in `artifacts/say-it-anyway/src/data/cardData.ts` — committed in the repo, no database seeding required.

---

## Stack

- **Runtime**: Node.js 24, pnpm 10
- **Frontend**: React 19, Vite 7, Tailwind CSS 4, Framer Motion, TanStack Query
- **API**: Express 5, Pino logging
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API contract**: OpenAPI spec → Orval codegen (React Query hooks + Zod schemas)
- **Language**: TypeScript 5.9 throughout

---

## Local Setup

### Prerequisites

- Node.js 24+
- pnpm 10+ (`npm install -g pnpm`)
- PostgreSQL database (local or hosted — Supabase, Neon, Railway all work)

### 1. Clone and install

```bash
git clone https://github.com/your-username/say-it-anyway.git
cd say-it-anyway
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sayitanyway
SESSION_SECRET=your-long-random-secret
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This creates all tables (`rooms`, `players`, `card_history`) and seeds the fixed SAYIT room.

### 4. Run locally

Open two terminals:

```bash
# Terminal 1 — API server (port 8080)
PORT=8080 pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend dev server (port 5173)
pnpm --filter @workspace/say-it-anyway run dev
```

Open http://localhost:5173 in your browser.

### Other useful commands

```bash
# Full typecheck across all packages
pnpm run typecheck

# Build everything
pnpm run build

# Regenerate API client hooks from OpenAPI spec (after editing lib/api-spec/openapi.yaml)
pnpm --filter @workspace/api-spec run codegen

# Push DB schema changes to production
pnpm --filter @workspace/db run push
```

---

## Environment Variables

### API Server

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ Yes | Express session signing secret |
| `PORT` | No | Port to listen on (default: `8080`) |

### Frontend (build time)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Full URL of the API server if hosted on a different origin (e.g. `https://api.yourdomain.com`). Leave unset if frontend and API share the same origin. |
| `PORT` | No | Vite dev server port (default: `5173`). Not used at build time. |
| `BASE_PATH` | No | URL base path (default: `/`). Only needed if serving from a sub-path. |

---

## Deployment

### Overview

You need two deployments:

1. **API Server** — a Node.js host (Railway, Render, Fly.io, etc.)
2. **Frontend** — a static host (Cloudflare Pages, Vercel, Netlify, etc.)

Both can also be combined on a single Node.js host by serving the built frontend from Express.

---

### API Server — Railway / Render / Fly.io

1. **Build command**: `pnpm --filter @workspace/api-server run build`
2. **Start command**: `pnpm --filter @workspace/api-server run start`
3. **Environment variables** to set in your host's dashboard:
   - `DATABASE_URL` — your production Postgres connection string
   - `SESSION_SECRET` — a long random string
   - `PORT` — usually set automatically by the host
4. Run migrations against the production DB once:
   ```bash
   DATABASE_URL=<prod-url> pnpm --filter @workspace/db run push
   ```

---

### Frontend — Cloudflare Pages

1. Connect your GitHub repo in the Cloudflare Pages dashboard
2. Set the following:
   - **Framework preset**: None (custom)
   - **Build command**: `pnpm --filter @workspace/say-it-anyway run build`
   - **Build output directory**: `artifacts/say-it-anyway/dist/public`
3. Environment variables (in Pages → Settings → Environment variables):
   - `VITE_API_BASE_URL` → `https://your-api-server.example.com` (if separate origin)
4. Deploy. Cloudflare will run the build and publish the output directory.

> **Note**: If your API is on a different domain you must also configure CORS on the API server to allow your Cloudflare Pages domain.

---

### Frontend — Vercel

1. Import the GitHub repo in the Vercel dashboard
2. Set the following in Project Settings → Build & Output:
   - **Framework Preset**: Vite
   - **Build command**: `pnpm --filter @workspace/say-it-anyway run build`
   - **Output directory**: `artifacts/say-it-anyway/dist/public`
   - **Install command**: `pnpm install`
3. Environment variables (in Project Settings → Environment Variables):
   - `VITE_API_BASE_URL` → `https://your-api-server.example.com` (if separate origin)
4. Deploy.

---

## Deployment Checklist

### GitHub Backup

- [ ] `git init` (if not already a repo)
- [ ] Confirm `.env` is in `.gitignore` (it is — never commit secrets)
- [ ] `git add . && git commit -m "initial commit"`
- [ ] Create a GitHub repository
- [ ] `git remote add origin https://github.com/your-username/say-it-anyway.git`
- [ ] `git push -u origin main`

### Cloudflare Pages (Frontend)

- [ ] Push repo to GitHub
- [ ] In Cloudflare Pages: New project → Connect to Git → select repo
- [ ] Build command: `pnpm --filter @workspace/say-it-anyway run build`
- [ ] Output directory: `artifacts/say-it-anyway/dist/public`
- [ ] Add `VITE_API_BASE_URL` env var if API is on a different domain
- [ ] Deploy and verify the app loads

### Vercel (Frontend)

- [ ] Push repo to GitHub
- [ ] In Vercel: Add New → Project → import repo
- [ ] Framework: Vite
- [ ] Build command: `pnpm --filter @workspace/say-it-anyway run build`
- [ ] Output directory: `artifacts/say-it-anyway/dist/public`
- [ ] Add `VITE_API_BASE_URL` env var if API is on a different domain
- [ ] Deploy and verify the app loads

### API Server (separate Node.js host)

- [ ] Choose a host: Railway, Render, or Fly.io all work well
- [ ] Set `DATABASE_URL`, `SESSION_SECRET`, `PORT` in the host dashboard
- [ ] Build: `pnpm --filter @workspace/api-server run build`
- [ ] Start: `pnpm --filter @workspace/api-server run start`
- [ ] Run `pnpm --filter @workspace/db run push` once against production DB
- [ ] Verify `/api/healthz` returns 200

---

## Project Structure

```
say-it-anyway/
├── artifacts/
│   ├── say-it-anyway/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── data/cardData.ts    # All 850 cards (committed, no DB needed)
│   │   │   ├── pages/              # Home.tsx, Room.tsx
│   │   │   ├── hooks/              # useGameLogic.ts, usePlayerSync.ts
│   │   │   └── components/         # PromptCard, ModeSelector, etc.
│   │   └── public/                 # Icons, manifest
│   └── api-server/             # Express 5 API
│       └── src/routes/rooms.ts     # All game endpoints
├── lib/
│   ├── api-spec/openapi.yaml   # API contract (source of truth)
│   ├── api-client-react/       # Generated React Query hooks
│   ├── api-zod/                # Generated Zod schemas
│   └── db/                     # Drizzle ORM schema + client
├── .env.example                # Environment variable template
├── pnpm-workspace.yaml
└── README.md
```
