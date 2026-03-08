# HatRack

#### Build a habit. Wear your many hats.

HatRack™ is a personal productivity app for habit formation and timed focus sessions, created by Owen Temple. Put your recurring activities — your "hats" — on the rack. Writing, Meditating, Reading, Drawing, Coding — whatever you want to make progress on. Start a focus session, and HatRack draws a hat at random with a timer of varying length. Earn points for every focused minute. Track your progress over time.

[![HatRack at hatrack.it](images/screenshots/hatrack-2026.png)](https://hatrack.it)
*hatrack.it, 2026*

HatRack was originally launched at hatrackapp.com in July 2015 (see the [legacy hatrack-app repo](https://github.com/owentemple/hatrack-app)). A phone-friendly version is also available at m.hatrackapp.com. This repo is the current version, rebuilt from the ground up and live at [hatrack.it](https://hatrack.it).

## Tech Stack

- **Frontend**: React 19 + TypeScript, built with Vite
- **Backend**: Express + TypeScript, run with tsx
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env

# Run database migrations
npx prisma migrate deploy

# Start development servers (Vite + Express)
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies API requests to the Express server on port 4000.

### Production

```bash
npm run build   # Builds the React client + generates Prisma client
npm start       # Runs migrations and starts the server
```

## Project Structure

```
client/
  src/
    components/   # React components
    hooks/        # useAuth, useTimer
    lib/api.ts    # Fetch wrapper for API calls
  index.html      # Vite entry point
  vite.config.ts
server/
  index.ts        # Express app
  db.ts           # Prisma client
  routes/         # auth, hats, sessions
  middleware/      # JWT auth
prisma/
  schema.prisma   # Database schema
```

© 2015 HatRack, LLC
