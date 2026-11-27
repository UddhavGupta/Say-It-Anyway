# Say It Anyway

A premium digital conversation card game. Skip the small talk — go somewhere real.

Three game modes, 850 cards, shared real-time rooms. No login required.

> Personal project under testing. Not for commercial use or public distribution without prior permission.

---

## Deploy (Vercel, single project)

The repo deploys to Vercel as one project: the Vite SPA as static files and the Express API as a serverless function at `/api/*`. `vercel.json` points the build at `artifacts/api-server/vercel-build.mjs`, which writes `.vercel/output` (Build Output API v3) and, when `DATABASE_URL` is set, syncs the Drizzle schema first.

1. Vercel: **Add New > Project**, import this repo. Leave framework/build settings alone; `vercel.json` sets them.
2. Project **Storage** tab: add **Neon** Postgres (Marketplace) and connect it to the project. This injects `DATABASE_URL`.
3. Deploy. The schema is pushed during the build. Check `https://<project>.vercel.app/api/healthz` returns `{"status":"ok"}`.

Do not set `VITE_API_BASE_URL`; frontend and API share an origin. Optional env: `PG_POOL_MAX` (default 3), `LOG_LEVEL` (default `info`).

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

Edit `.env` and set at minimum:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/sayitanyway
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
| `PORT` | No | Port to listen on — most hosts set this automatically |

### Frontend (build time)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Full URL of the API server when hosted on a **different origin** from the frontend (e.g. `https://api.yourdomain.com`). Leave unset when both services share the same origin. |
| `PORT` | No | Vite dev server port (default: `5173`). Not used at build time. |
| `BASE_PATH` | No | URL base path (default: `/`). Only needed if serving from a sub-path. |

---

## Project Structure

```
say-it-anyway/
├── artifacts/
│   ├── say-it-anyway/              # React + Vite frontend
│   │   ├── src/
│   │   │   ├── data/cardData.ts    # All 850 cards (committed, no DB needed)
│   │   │   ├── pages/              # Home.tsx, Room.tsx
│   │   │   ├── hooks/              # useGameLogic.ts, usePlayerSync.ts
│   │   │   └── components/         # PromptCard, ModeSelector, etc.
│   │   └── public/                 # Icons, manifest, opengraph image
│   └── api-server/                 # Express 5 API
│       └── src/routes/rooms.ts     # All game endpoints
├── lib/
│   ├── api-spec/openapi.yaml       # API contract (source of truth)
│   ├── api-client-react/           # Generated React Query hooks
│   ├── api-zod/                    # Generated Zod schemas
│   └── db/                         # Drizzle ORM schema + client
├── .env.example                    # Environment variable template
├── pnpm-workspace.yaml
└── README.md
```
