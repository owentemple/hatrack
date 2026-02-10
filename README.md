# HatRack App

#### Wear your many hats.

A productivity app to improve focus and encourage deliberate practice.

## What It Does

For most of us, life and work requires "wearing multiple hats" — performing multiple roles or task categories on a daily basis. HatRack helps you maintain balance across all of them.

Add your recurring activities ("hats") to the rack, then click **Focus Session**. A hat is drawn at random, a timer from 1–25 minutes is rolled, and you focus on that activity until the timer completes. Earn 500 points per session.

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
