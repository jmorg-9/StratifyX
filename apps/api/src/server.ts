import Fastify from "fastify";
import cors from "@fastify/cors";
import { registerDashboardRoutes } from "./routes/dashboard.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerSimulationRoutes } from "./routes/simulate.js";

export async function createServer() {
  const app = Fastify({
    logger: false
  });

  await app.register(cors, {
    origin: true
  });

  await registerHealthRoutes(app);
  await registerDashboardRoutes(app);
  await registerSimulationRoutes(app);

  return app;
}
