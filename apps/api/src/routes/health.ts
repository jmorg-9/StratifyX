import type { FastifyInstance } from "fastify";
import { hasDatabaseConfig, isDatabaseReachable } from "../db/client.js";

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => ({
    status: "ok",
    service: "stratifyx-api",
    timestamp: new Date().toISOString(),
    databaseConfigured: hasDatabaseConfig(),
    databaseReachable: await isDatabaseReachable()
  }));
}
