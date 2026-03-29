import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  addDefaultWatchlistSymbol,
  removeDefaultWatchlistSymbol
} from "../db/dashboard-repository.js";
import { getDashboardData } from "../lib/fixtures.js";

const addTickerSchema = z.object({
  symbol: z.string().trim().min(1).max(10)
});

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/dashboard", async () => getDashboardData());
  app.get("/api/dashboard/overview", async () => getDashboardData());

  app.get("/api/scans", async () => {
    const dashboard = await getDashboardData();

    return {
      generatedAt: dashboard.generatedAt,
      stayInCash: dashboard.stayInCash,
      marketBias: dashboard.marketBias,
      tradeIdeas: dashboard.tradeIdeas
    };
  });

  app.get("/api/watchlists/default", async () => {
    const dashboard = await getDashboardData();
    return {
      name: "Core Growth",
      symbols: dashboard.watchlist
    };
  });

  app.post("/api/watchlists/default/tickers", async (request, reply) => {
    const parsed = addTickerSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.status(400);
      return {
        error: "Invalid ticker payload"
      };
    }

    const symbols = await addDefaultWatchlistSymbol(parsed.data.symbol);

    if (!symbols) {
      reply.status(503);
      return {
        error: "Database is not configured or reachable"
      };
    }

    return {
      name: "Core Growth",
      symbols
    };
  });

  app.delete("/api/watchlists/default/tickers/:symbol", async (request, reply) => {
    const paramsSchema = z.object({
      symbol: z.string().trim().min(1).max(10)
    });
    const parsed = paramsSchema.safeParse(request.params);

    if (!parsed.success) {
      reply.status(400);
      return {
        error: "Invalid ticker parameter"
      };
    }

    const symbols = await removeDefaultWatchlistSymbol(parsed.data.symbol);

    if (!symbols) {
      reply.status(503);
      return {
        error: "Database is not configured or reachable"
      };
    }

    return {
      name: "Core Growth",
      symbols
    };
  });

  app.get("/api/journal", async () => {
    const dashboard = await getDashboardData();
    return dashboard.journal;
  });
}
