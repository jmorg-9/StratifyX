import type { FastifyInstance } from "fastify";
import { getDashboardData } from "../lib/fixtures.js";

export async function registerDashboardRoutes(app: FastifyInstance): Promise<void> {
  app.get("/api/dashboard", async () => getDashboardData());
  app.get("/api/dashboard/overview", async () => getDashboardData());
  app.get("/api/scans", async () => {
    const dashboard = getDashboardData();

    return {
      generatedAt: dashboard.generatedAt,
      stayInCash: dashboard.stayInCash,
      marketBias: dashboard.marketBias,
      tradeIdeas: dashboard.tradeIdeas
    };
  });
  app.get("/api/watchlists/default", async () => ({
    name: "Core Growth",
    symbols: getDashboardData().watchlist
  }));
}
