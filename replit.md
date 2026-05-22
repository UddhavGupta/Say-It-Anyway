# Say It Anyway

A premium digital conversation card game for real humans. Skip the small talk — go somewhere real. Three game modes, 850 cards, shared real-time rooms.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/say-it-anyway run dev` — run the frontend (port 25416)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — DB schema: rooms.ts, players.ts, cardHistory.ts
- `artifacts/api-server/src/routes/rooms.ts` — all game routes
- `artifacts/say-it-anyway/src/data/cardData.ts` — all 850 cards (auto-generated from CSV)
- `artifacts/say-it-anyway/src/pages/` — Home.tsx, Room.tsx
- `artifacts/say-it-anyway/src/hooks/` — useGameLogic.ts, usePlayerSync.ts

## Architecture decisions

- Card data lives entirely in the frontend (cardData.ts). The API only stores room state (mode, level, filter, shuffled deck order of card IDs, current index, afterDarkUnlocked) and player presence. This avoids seeding 850 cards into the DB and makes the app work even if the API is briefly unavailable.
- Real-time sync via polling: `useGetRoom` polls every 2s, `useGetPlayers` every 5s. All players in a room see the same card/state because every state change is immediately written to the API and picked up by others' polls.
- The fixed SAYIT room is seeded at startup — any player who enters "SAYIT" joins the same canonical shared room.
- After Dark is hidden by default; it requires a settings action or the phrase "AFTERDARK" to unlock, with a consent modal.

## Product

- **Classic** (450 cards): Three levels — Read the Room (playful), Beneath the Surface (deeper), Say It Anyway (vulnerable)
- **The Long Game** (200 cards): Advanced relationship prompts with filters: All / Couples / Close Friends / Dating
- **After Dark** (200 cards): Adult-only spicy mode, hidden until unlocked per-room
- **Shared rooms**: Fixed room SAYIT or custom 6-character codes, real-time synced

## User preferences

- Personal project under testing — not for commercial use or public distribution without prior permission
- This language appears in the footer and About modal

## Gotchas

- After changing DB schema: run `pnpm --filter @workspace/db run push` then `pnpm run typecheck:libs`
- After changing OpenAPI spec: run `pnpm --filter @workspace/api-spec run codegen`
- cardData.ts is auto-generated — run the generation script (see below) if CSV changes
- Room codes are uppercase; the API normalizes code lookups to uppercase automatically

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
