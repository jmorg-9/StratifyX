# StratifyX

StratifyX is a trading dashboard for scanning stock tickers, detecting rule-based setups, ranking trade ideas, previewing risk, and recommending when market conditions are poor enough to stay in cash.

## Current Status

The repository currently contains a runnable Phase 1 foundation:

- React dashboard
- Fastify API
- PostgreSQL schema
- rule-based setup detection for five user-defined setups
- mock market/event data so the app can run locally without a paid data feed

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
- PostgreSQL if you want to use the schema outside the current demo flow

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

The current app does not require a live PostgreSQL connection because Phase 1 uses mock-backed scanner data.

## What Works Today

- dashboard loads ranked trade ideas from the API
- setup detection runs for the five supplied user-defined setups
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
