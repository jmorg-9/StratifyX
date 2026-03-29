# StratifyX

StratifyX is a low-cost full-stack trading dashboard for evaluating stock tickers with The Strat and user-defined setups. Phase 1 establishes a runnable monorepo with a React frontend, Fastify backend, PostgreSQL schema, and a mock-backed rule engine that can rank trade ideas and recommend staying in cash.

## Active Agents

- Architect Agent: system design, stack selection, and phase planning
- Backend Agent: APIs, mock ingestion, scanner orchestration, and simulation endpoints
- Frontend Agent: dashboard UI, chart visualization, and responsive presentation
- Data Agent: PostgreSQL schema and storage boundaries
- Trading Logic Agent: setup detection, plugin contracts, and market-regime evaluation
- News & Events Agent: catalyst and high-risk-day interfaces
- Scoring Agent: confidence, grade, and opportunity ranking
- Simulation Agent: risk/reward and PnL preview calculations
- Notification Agent: alert thresholds and outbound channels in later phases
- DevOps Agent: local setup and low-cost deployment posture
- Documentation Agent: README and `/docs`
- Git/Logging Agent: `CHANGELOG.md` and commit hygiene

## Phase 1 Stack

### Recommended

- Frontend: React + Vite + TypeScript
- Backend: Fastify + TypeScript
- Database: PostgreSQL with SQL migrations
- Hosting path later: Vercel or S3/CloudFront for the frontend, Fly.io/Render/AWS Lightsail for the API, Neon/Supabase/Postgres locally for data

### Alternative

- Backend alternative: ASP.NET Core
  - Pros: strong built-in dependency injection, strong performance, good background job story
  - Cons: heavier local setup than the current Node.js baseline in this repo, slower initial iteration for this empty codebase

The current implementation defaults to `Node.js + TypeScript`. If you want `.NET`, the product architecture can stay the same and only the API layer needs to change.

## Architecture Summary

- `apps/web`: dark-theme trading dashboard with scanner, regime panel, chart, setup notes, journal, and simulation card
- `apps/api`: Fastify API with setup evaluators, scoring, market-regime evaluation, scan endpoints, watchlist endpoint, and simulation
- `packages/db`: PostgreSQL schema and seed SQL
- `docs/architecture.md`: deeper system design
- `docs/trading-logic.md`: implemented setup rules, scoring factors, and stay-in-cash logic

## Phase 1 Features

- Watchlist scan endpoint with ranked trade ideas
- Rule-based user-defined setup detection for:
  - `3-2-2 First Live`
  - `4H Retrigger`
  - `12H 1-3-1 (Miyagi)`
  - `9F (Failed 9)`
  - `30M ORB`
- Structured trade-idea output using `ticker`, `setup`, `timeframe`, `entry`, `stop`, `target`, `grade`, `confidenceScore`, and `notes`
- Market regime evaluation with explicit stay-in-cash recommendation
- Simulation endpoint for risk/reward and PnL preview
- Dashboard UI with ranked setups, catalysts, chart context, setup notes, and journal context
- Initial PostgreSQL schema for users, watchlists, candles, setups, scans, trades, alerts, and logs

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 15+ or a hosted PostgreSQL connection

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

This starts:

- API: `http://localhost:3001`
- Web: `http://localhost:5173`

### Build

```bash
npm run build
```

### Verify

```bash
npm run typecheck
```

### Database

Apply the initial schema in `packages/db/schema.sql` to your PostgreSQL instance.
Then optionally apply `packages/db/seed.sql` for demo records.

## Current API Surface

- `GET /health`
- `GET /api/dashboard`
- `GET /api/dashboard/overview`
- `GET /api/scans`
- `GET /api/watchlists/default`
- `POST /api/simulate`

## Current Assumptions

- Market, earnings, and macro catalyst data are mocked in Phase 1 so the system stays runnable without paid feeds.
- Authentication is represented in the schema but not yet implemented in the API.
- The live scanner is still fixture-backed in Phase 1, but it now evaluates your five supplied setups through dedicated detectors.
- `12H 1-3-1 (Miyagi)` currently uses trigger-bar extremes as the stop approximation because the supplied midpoint-stop rule is still ambiguous.

## Next Phase Targets

- Replace mock feeds with live market/news/calendar providers
- Persist watchlists, scans, trades, and journal entries in PostgreSQL
- Add authentication, alerts, scheduled scans, and notification delivery
- Lock in precise thresholds for fair value gaps, `4H Retrigger` wick confirmation, and `30M ORB` fake-break invalidation
