import type { DashboardResponse } from "../types.js";
import { demoEvents, demoSnapshots } from "./demo-market-data.js";
import { assessMarketRegime } from "./market-regime.js";
import { scanUserDefinedSetups } from "./user-setups.js";

export function getDashboardData(): DashboardResponse {
  const tradeIdeas = scanUserDefinedSetups(demoSnapshots);
  const regime = assessMarketRegime(demoEvents, tradeIdeas);

  return {
    generatedAt: new Date().toISOString(),
    marketBias: regime.marketBias,
    stayInCash: regime.stayInCash,
    marketSummary: regime.summary,
    watchlist: demoSnapshots.map((snapshot) => snapshot.ticker),
    events: demoEvents,
    tradeIdeas,
    journal: [
      {
        date: "2026-03-27",
        ticker: "NVDA",
        notes: "Skipped a lower-quality continuation because CPI risk was too close.",
        pnl: 0
      },
      {
        date: "2026-03-26",
        ticker: "AMD",
        notes: "Retrigger reversal respected the plan and paid into prior structure.",
        pnl: 412
      }
    ]
  };
}
