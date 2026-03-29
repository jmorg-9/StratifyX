import type { FastifyInstance } from "fastify";
import { z } from "zod";
import type { SimulationResponse } from "../types.js";

const simulationSchema = z.object({
  entry: z.number().positive(),
  stop: z.number().positive(),
  target: z.number().positive(),
  riskAmount: z.number().positive()
});

const buildSimulationResponse = (entry: number, stop: number, target: number, riskAmount: number): SimulationResponse => {
  const riskPerShare = Math.abs(entry - stop);
  const rewardPerShare = Math.abs(target - entry);
  const quantity = Number((riskAmount / riskPerShare).toFixed(2));

  return {
    quantity,
    riskPerShare: Number(riskPerShare.toFixed(2)),
    rewardPerShare: Number(rewardPerShare.toFixed(2)),
    riskRewardRatio: Number((rewardPerShare / riskPerShare).toFixed(2)),
    potentialProfit: Number((quantity * rewardPerShare).toFixed(2)),
    potentialLoss: Number((quantity * riskPerShare).toFixed(2))
  };
};

export async function registerSimulationRoutes(app: FastifyInstance): Promise<void> {
  const handler = async (request: { body: unknown }, reply: { status: (code: number) => void }) => {
    const parsed = simulationSchema.safeParse(request.body);

    if (!parsed.success) {
      reply.status(400);
      return {
        error: "Invalid simulation payload",
        details: parsed.error.flatten()
      };
    }

    const { entry, stop, target, riskAmount } = parsed.data;
    return buildSimulationResponse(entry, stop, target, riskAmount);
  };

  app.post("/api/simulate", handler);
  app.post("/api/simulations", handler);
}
