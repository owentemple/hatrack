# CLAUDE.md

## Overview

HatRack is a full-stack productivity app. Users add recurring activities ("hats") to a rack, then start focus sessions — a random hat is selected, a random timer (1–25 min) rolls, and completing a session earns points equal to the minutes on the timer (no points if ended early). Data persists across sessions via PostgreSQL.

## Running the App

```bash
npm install                  # Install deps
cp .env.example .env         # Set DATABASE_URL, JWT_SECRET
npx prisma migrate deploy    # Run migrations
npm run dev                  # Starts Vite (5173) + Express (4000) concurrently
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router
- **Backend**: Express, TypeScript, tsx (runtime)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT (jsonwebtoken) + bcrypt

## Architecture

### Client (`client/src/`)
- **`main.tsx`** — Entry point. BrowserRouter + AuthProvider + App.
- **`App.tsx`** — Routes: `/` (protected HatRack), `/history` (session history), `/settings` (Beeminder config), `/login`, `/signup`.
- **Components**: `Layout`, `HatRack`, `HatItem`, `FocusSession`, `Timer`, `ScoreDisplay`, `SessionHistory`, `AuthForm`, `ProtectedRoute`, `Settings`.
- **Hooks**: `useAuth` (JWT in localStorage, React context), `useTimer` (setInterval countdown).
- **`lib/api.ts`** — Typed fetch wrapper; attaches JWT Bearer header automatically.

### Server (`server/`)
- **`index.ts`** — Express app. JSON body parser, API routes, static file serving in production.
- **`db.ts`** — Prisma client singleton.
- **`middleware/auth.ts`** — JWT verification middleware + `signToken` helper.
- **`services/beeminder.ts`** — `sendDatapoint()` POSTs to Beeminder API; `isBeeminderConfigured()` type guard.
- **Routes**: `auth.ts` (signup/login), `hats.ts` (CRUD, soft delete), `sessions.ts` (create, list with hat names, score aggregate, Beeminder sync), `settings.ts` (Beeminder credentials CRUD).

### Database (`prisma/schema.prisma`)
- `User` — id, email (unique), password (bcrypt hash), name, beeminderUsername?, beeminderAuthToken?, beeminderGoalSlug?
- `Hat` — id, name, done, doneAt (auto-reset timestamp), deletedAt (soft delete), userId (FK)
- `FocusSession` — id, durationSeconds, score, hatId (FK), userId (FK)

## Key Patterns

- Vite proxies `/api/*` to Express in dev; in production Express serves `client/dist/`.
- All API routes under `/api/hats`, `/api/sessions`, and `/api/settings` require JWT auth middleware.
- Auth routes (`/api/auth/*`) are public.
- Focus session flow: random hat selection → random timer roll → countdown → points = rolled minutes on completion; 0 points if stopped early.
- React modals replace the old `alert()`/`prompt()` interactions.
- Daily auto-reset: GET `/api/hats` resets any hats marked done before today (UTC midnight) back to `done: false`. The `doneAt` timestamp tracks when a hat was checked off.
- Beeminder integration: On session complete with score > 0, fire-and-forget sends datapoint to Beeminder API. Auth token stored in DB but never returned to client. Uses `requestid` for idempotency. No new npm deps (native `fetch`).

## Deployment

- **Hosting**: Railway (auto-deploys from `master` branch)
- **Production URL**: https://hatrack-app-production.up.railway.app/
- **Deploy process**: Push to `master` → Railway builds → runs `prisma migrate deploy` (via `start` script) → starts server
- **Database**: Railway-hosted PostgreSQL (connection string configured in Railway environment variables)
