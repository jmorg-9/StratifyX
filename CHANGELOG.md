# Changelog

## 0.1.0 - 2026-03-29

- scaffolded a full-stack monorepo with `apps/api`, `apps/web`, and `packages/db`
- added a Fastify API with health, dashboard, watchlist, scan, and simulation endpoints
- implemented rule-based evaluators for `3-2-2 First Live`, `4H Retrigger`, `12H 1-3-1 (Miyagi)`, `9F`, and `30M ORB`
- added structured trade-idea output with `ticker`, `setup`, `timeframe`, `entry`, `stop`, `target`, `grade`, `confidenceScore`, and `notes`
- implemented Phase 1 market-regime, scoring, and stay-in-cash services using mock data
- added a responsive dark-theme React dashboard wired to the backend
- created an initial PostgreSQL schema covering users, watchlists, candles, scans, setups, trades, alerts, and logs
- documented architecture, trading logic, setup instructions, and current assumptions
