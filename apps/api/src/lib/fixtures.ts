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
      { date: "2026-03-03", ticker: "NVDA", notes: "Stayed flat ahead of FOMC. No clean entry.", pnl: 0 },
      { date: "2026-03-05", ticker: "AAPL", notes: "ORB follow-through hit first target and paid into strength.", pnl: 268 },
      { date: "2026-03-09", ticker: "TSLA", notes: "Failed 9 setup reversed, but size was too aggressive.", pnl: -145 },
      { date: "2026-03-12", ticker: "AMD", notes: "4H retrigger respected structure and closed green.", pnl: 412 },
      { date: "2026-03-16", ticker: "MSFT", notes: "Miyagi trigger was valid, but follow-through stalled.", pnl: -88 },
      { date: "2026-03-19", ticker: "NVDA", notes: "Strong continuation. Trimmed near target.", pnl: 356 },
      { date: "2026-03-23", ticker: "SPY", notes: "Breadth was weak. Stayed in cash.", pnl: 0 },
      { date: "2026-03-26", ticker: "AMD", notes: "Retrigger reversal respected the plan and paid into prior structure.", pnl: 412 },
      { date: "2026-03-27", ticker: "NVDA", notes: "Skipped a lower-quality continuation because CPI risk was too close.", pnl: 0 }
    ]
  };
}
