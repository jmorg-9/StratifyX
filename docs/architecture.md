# StratifyX Architecture

## Objectives

- keep local setup simple and safe for a work environment
- keep infrastructure cost low
- stay runnable without premium data subscriptions during early development
- allow future plug-in strategies, alerts, and persistence without reworking the core

## System Overview

StratifyX uses a modular monorepo:

- `apps/web`: user-facing dashboard
- `apps/api`: scanner, scoring, simulation, and market-regime API
- `packages/db`: SQL schema and seed data for the upcoming persistence layer

```text
React dashboard -> Fastify API -> domain services -> repositories/providers -> PostgreSQL
                                        |
                                        -> setup registry -> scoring engine
                                        -> events service -> market regime
                                        -> simulation service
```

## Agent Ownership

- Architect Agent: module boundaries, stack decisions, and phase sequencing
- Backend Agent: route composition, services, and provider abstractions
- Frontend Agent: responsive UI and dashboard composition
- Data Agent: schema design, persistence mapping, and migrations
- Trading Logic Agent: setup interfaces, Strat evaluation, and custom rule priority
- News & Events Agent: catalyst ingestion and risk-day flags
- Scoring Agent: confidence model and grade mapping
- Simulation Agent: position sizing and scenario math
- Notification Agent: alert contracts and delivery workflow
- DevOps Agent: local run scripts and low-cost deployment profile
- Documentation Agent: project docs and setup instructions
- Git/Logging Agent: changelog, progress notes, and commit hygiene

## Recommended Stack

### Node.js + TypeScript + Fastify + React

Pros:

- matches the existing machine setup
- fast local iteration
- small operational surface area
- consistent TypeScript contracts across backend and frontend
- low-friction hosting on low-cost providers

Cons:

- fewer batteries included than ASP.NET Core
- background scheduling and long-running jobs need extra libraries later

### ASP.NET Core Alternative

Pros:

- strong defaults for dependency injection and observability
- excellent performance
- clean background service model

Cons:

- heavier pivot for this empty repo and current local context
- less synergy with a React-first frontend when moving quickly in Phase 1

## Service Boundaries

### API layer

- validates requests
- exposes contracts for frontend and future automation jobs
- currently serves mock-backed data

### Domain services

- `scanner`: evaluates trade ideas from fixture-backed market snapshots
- `market`: determines risk regime and stay-in-cash guidance
- `events`: flags macro and market catalysts
- `scoring`: produces confidence and grades from confluence factors
- `simulation`: computes reward/risk and position outcomes

### Data layer

Phase 1 uses in-memory fixtures so the app remains runnable immediately. The schema in `packages/db` establishes the production storage layout for later phases.

## API Surface

- `GET /health`
- `GET /api/dashboard`
- `GET /api/dashboard/overview`
- `GET /api/watchlists/default`
- `GET /api/scans`
- `POST /api/simulate`
- `POST /api/simulations`

## Database Domains

- identity: users and sessions
- market data: instruments, candle bars, catalysts, market snapshots
- scanner: setup definitions, scan runs, scan candidates
- execution: trade plans, journal entries, simulations
- notifications: alerts and delivery logs
- observability: ingestion logs and job runs

## Low-Cost Deployment Path

- Frontend: Vercel or S3 + CloudFront
- API: Fly.io, Render Starter, or AWS Lightsail container
- PostgreSQL: Neon, Supabase, or self-managed Postgres
- Scheduled scans later: GitHub Actions, server cron, or provider-native jobs

## Phase Plan

### Phase 1

- monorepo scaffolding
- mock-backed scanner API
- dashboard UI
- schema, seed data, and docs

### Phase 2

- persistence via PostgreSQL
- auth and per-user watchlists
- live market/news/event data ingestion

### Phase 3

- notifications and scheduled scans
- richer chart overlays
- journaling, analytics, and pattern similarity
