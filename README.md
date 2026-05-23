# Say It Anyway

A premium digital conversation card game. Skip the small talk — go somewhere real.

Three game modes, 850 cards, shared real-time rooms. No login required.

> Personal project under testing. Not for commercial use or public distribution without prior permission.

---

## Is this static-site deployable?

**No.** The app has two required services:

| Service | What it does | Deployable to |
|---|---|---|
| **Frontend** (`artifacts/say-it-anyway`) | React + Vite SPA | Cloudflare Pages, Vercel, Netlify |
| **API Server** (`artifacts/api-server`) | Express 5 — rooms, players, card state | Railway, Render, Fly.io, any Node.js host |

The frontend is a fully static SPA after build — but it talks to the API server over `/api/*` for every game action (create room, join room, draw card, sync players). Both services must be deployed. The API server requires a **PostgreSQL database**.

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

## Build reference

| | Value |
|---|---|
| **Frontend build command** | `pnpm --filter @workspace/say-it-anyway run build` |
| **Frontend output directory** | `artifacts/say-it-anyway/dist/public` |
| **API build command** | `pnpm --filter @workspace/api-server run build` |
| **API start command** | `pnpm --filter @workspace/api-server run start` |
| **Install command** | `pnpm install` |

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
| `PORT` | No | Port to listen on — most hosts set this automatically |

### Frontend (build time)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Full URL of the API server when hosted on a **different origin** from the frontend (e.g. `https://api.yourdomain.com`). Leave unset when both services share the same origin. |
| `PORT` | No | Vite dev server port (default: `5173`). Not used at build time. |
| `BASE_PATH` | No | URL base path (default: `/`). Only needed if serving from a sub-path. |

---

## Deployment

### Option A — Split deployment (recommended for static hosting)

Deploy the frontend to a static host and the API to a Node.js host separately. Set `VITE_API_BASE_URL` at build time to point the frontend at the API.

### Option B — Combined deployment

Serve the built frontend from the Express API server. After `pnpm run build`, `artifacts/say-it-anyway/dist/public` is a regular static directory that Express can serve with `express.static()`.

---

### Frontend — Cloudflare Pages

1. Push the repo to GitHub
2. In Cloudflare Pages dashboard: **New project → Connect to Git → select repo**
3. Configure the build:
   - **Framework preset**: None (custom)
   - **Build command**: `pnpm --filter @workspace/say-it-anyway run build`
   - **Build output directory**: `artifacts/say-it-anyway/dist/public`
   - **Install command**: `pnpm install`
4. Add environment variables (**Settings → Environment variables**):
   - `VITE_API_BASE_URL` → `https://your-api-server.example.com`
5. Deploy.

> If the API is on a different domain, configure CORS on the API server to allow your Cloudflare Pages domain.

---

### Frontend — Vercel

1. Push the repo to GitHub
2. In Vercel dashboard: **Add New → Project → import repo**
3. Configure the build (**Project Settings → Build & Output Settings**):
   - **Framework Preset**: Vite
   - **Build command**: `pnpm --filter @workspace/say-it-anyway run build`
   - **Output directory**: `artifacts/say-it-anyway/dist/public`
   - **Install command**: `pnpm install`
4. Add environment variables (**Project Settings → Environment Variables**):
   - `VITE_API_BASE_URL` → `https://your-api-server.example.com`
5. Deploy.

---

### API Server — Railway / Render / Fly.io

1. Connect your GitHub repo in the host's dashboard
2. Set environment variables:
   - `DATABASE_URL` — production Postgres connection string
   - `SESSION_SECRET` — a long random string
   - `PORT` — usually set automatically by the host
3. **Build command**: `pnpm --filter @workspace/api-server run build`
4. **Start command**: `pnpm --filter @workspace/api-server run start`
5. Run schema migration once against your production database:
   ```bash
   DATABASE_URL=<prod-url> pnpm --filter @workspace/db run push
   ```
6. Verify `/api/healthz` returns `200 OK`.

---

## Replit-specific dependencies

The project uses three `@replit/*` Vite dev plugins. They are:

- **Only loaded during local development inside Replit** — guarded by `process.env.REPL_ID !== undefined`
- **Never loaded during production build** — guarded by `process.env.NODE_ENV !== "production"`
- **Never included in the built output** — they are `devDependencies`

Outside Replit (local machine, Cloudflare Pages, Vercel, Railway) these packages are installed but never imported or executed. They cause no breakage and can be left in place.

To remove them entirely: delete the three `@replit/*` entries from `artifacts/say-it-anyway/package.json` and the matching `catalog:` entries from `pnpm-workspace.yaml`, then remove the conditional block from `artifacts/say-it-anyway/vite.config.ts`.

---

## GitHub Backup Checklist

- [ ] Confirm `.env` is in `.gitignore` (it is — never commit secrets)
- [ ] Confirm `.replit` and `.replitignore` are in `.gitignore` (they are)
- [ ] `git add . && git commit -m "initial commit"`
- [ ] Create a GitHub repository
- [ ] `git remote add origin https://github.com/your-username/say-it-anyway.git`
- [ ] `git push -u origin main`
- [ ] Verify `node_modules/`, `dist/`, `.env` are absent from the pushed repo

### App-critical files confirmed in repo

- [x] `artifacts/say-it-anyway/src/data/cardData.ts` — all 850 cards
- [x] `artifacts/say-it-anyway/public/` — icons, manifest, robots.txt, opengraph image
- [x] `artifacts/say-it-anyway/src/` — all app source and styles
- [x] `lib/api-spec/openapi.yaml` — API contract
- [x] `lib/db/src/schema/` — database schema
- [x] `.env.example` — environment variable template

---

## Deployment Checklist

### Cloudflare Pages (Frontend)

- [ ] Push repo to GitHub
- [ ] Cloudflare Pages: New project → Connect to Git → select repo
- [ ] Build command: `pnpm --filter @workspace/say-it-anyway run build`
- [ ] Output directory: `artifacts/say-it-anyway/dist/public`
- [ ] Add `VITE_API_BASE_URL` pointing to your API server
- [ ] Deploy and verify the app loads

### Vercel (Frontend)

- [ ] Push repo to GitHub
- [ ] Vercel: Add New → Project → import repo
- [ ] Framework: Vite
- [ ] Build command: `pnpm --filter @workspace/say-it-anyway run build`
- [ ] Output directory: `artifacts/say-it-anyway/dist/public`
- [ ] Add `VITE_API_BASE_URL` pointing to your API server
- [ ] Deploy and verify the app loads

### API Server (Node.js host)

- [ ] Choose Railway, Render, or Fly.io
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
