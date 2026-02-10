# CLAUDE.md

## Overview

HatRack is a full-stack productivity app. Users add recurring activities ("hats") to a rack, then start focus sessions — a random hat is selected, a random timer (1–25 min) rolls, and completing a session earns 500 points. Data persists across sessions via PostgreSQL.

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
- **`App.tsx`** — Routes: `/` (protected HatRack), `/history` (session history), `/login`, `/signup`.
- **Components**: `Layout`, `HatRack`, `HatItem`, `FocusSession`, `Timer`, `ScoreDisplay`, `SessionHistory`, `AuthForm`, `ProtectedRoute`.
- **Hooks**: `useAuth` (JWT in localStorage, React context), `useTimer` (setInterval countdown).
- **`lib/api.ts`** — Typed fetch wrapper; attaches JWT Bearer header automatically.

### Server (`server/`)
- **`index.ts`** — Express app. JSON body parser, API routes, static file serving in production.
- **`db.ts`** — Prisma client singleton.
- **`middleware/auth.ts`** — JWT verification middleware + `signToken` helper.
- **Routes**: `auth.ts` (signup/login), `hats.ts` (CRUD, soft delete), `sessions.ts` (create, list with hat names, score aggregate).

### Database (`prisma/schema.prisma`)
- `User` — id, email (unique), password (bcrypt hash), name
- `Hat` — id, name, done, deletedAt (soft delete), userId (FK)
- `FocusSession` — id, durationSeconds, score, hatId (FK), userId (FK)

## Key Patterns

- Vite proxies `/api/*` to Express in dev; in production Express serves `client/dist/`.
- All API routes under `/api/hats` and `/api/sessions` require JWT auth middleware.
- Auth routes (`/api/auth/*`) are public.
- Focus session flow: random hat selection → random timer roll → countdown → +500 points on completion.
- React modals replace the old `alert()`/`prompt()` interactions.
