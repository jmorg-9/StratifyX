# StratifyX

StratifyX is a trading dashboard for scanning stock tickers, detecting rule-based setups, ranking trade ideas, previewing risk, and recommending when market conditions are poor enough to stay in cash.

## Current Status

The repository currently contains a runnable Phase 1 foundation plus the first Phase 2 database slice:

- React dashboard
- Fastify API
- PostgreSQL schema
- rule-based setup detection for five user-defined setups
- mock market/event data so the app can run locally without a paid data feed
- optional local PostgreSQL integration for watchlist and journal reads/writes

This is not yet the full production feature set. It is a working scaffold that demonstrates the main app flow end to end.

## Implemented Setups

- `3-2-2 First Live`
- `4H Retrigger`
- `12H 1-3-1 (Miyagi)`
- `9F (Failed 9)`
- `30M ORB`

The scanner currently evaluates these setups using fixture-backed OHLC data and returns structured trade ideas with:

- ticker
- setup
- timeframe
- entry
- stop
- target
- grade
- confidence score
- notes

## Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Fastify + TypeScript
- Database: PostgreSQL

## Repository Layout

```text
apps/
  api/    Fastify API
  web/    React dashboard
packages/
  db/     PostgreSQL schema and seed SQL
docs/     Architecture, trading logic, and progress notes
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL only if you want the Phase 2 local database features

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

This starts:

- API: `http://localhost:3001`
- Web: `http://localhost:5173`

If `DATABASE_URL` is not configured, the app falls back to fixture data.

## Local Database Setup

Nothing in this repo deploys or hosts PostgreSQL for you. The app only connects to the database instance you explicitly point it at with `DATABASE_URL`.

Recommended local-only setup:

1. Install PostgreSQL locally on your machine.
2. Create a database named `stratifyx`.
3. Copy `.env.example` to `.env`.
4. Set `DATABASE_URL` to your local instance, for example:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/stratifyx
```

5. Apply the schema:

```bash
npm run db:init
```

6. Optionally apply the seed file:

```bash
npm run db:seed
```

If you do not run PostgreSQL locally, the app still runs, but watchlist persistence and DB-backed journal reads will fall back to fixture behavior.

## Verify

```bash
npm run typecheck
npm run build
```

## Current API Endpoints

- `GET /health`
- `GET /api/dashboard`
- `GET /api/dashboard/overview`
- `GET /api/scans`
- `GET /api/watchlists/default`
- `POST /api/simulate`

## Database

The initial PostgreSQL schema is in `packages/db/schema.sql`.

Optional seed data is in `packages/db/seed.sql`.

The current app does not require a live PostgreSQL connection. When the database is available, the API uses it for watchlist and journal data. Scanner market data is still fixture-backed at this stage.

## What Works Today

- dashboard loads ranked trade ideas from the API
- setup detection runs for the five supplied user-defined setups
- watchlist changes can persist to a local PostgreSQL instance when configured
- stay-in-cash logic is surfaced in the UI
- catalysts and event risk are shown
- trade simulation returns sizing and risk/reward preview
- the project builds and typechecks cleanly

## Outstanding Work

- replace mock data with live market, earnings, and macro-event providers
- persist watchlists, scans, trades, and journal entries in PostgreSQL
- add authentication and user-specific data
- implement alert delivery
- define exact thresholds for fair value gaps, wick confirmation, and fake-break invalidation
- finalize the exact stop logic for `12H 1-3-1 (Miyagi)`

## Additional Docs

- `docs/architecture.md`
- `docs/trading-logic.md`
- `docs/progress.md`
- `CHANGELOG.md`
