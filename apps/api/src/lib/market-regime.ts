import type { MarketBias, MarketEvent, TradeIdea } from "../types.js";

export function assessMarketRegime(
  events: MarketEvent[],
  tradeIdeas: TradeIdea[]
): {
  marketBias: MarketBias;
  stayInCash: boolean;
  summary: string;
} {
  const highSeverityEvents = events.filter((event) => event.severity === "high").length;
  const bestIdeaScore = tradeIdeas[0]?.confidenceScore ?? 0;

  if (highSeverityEvents >= 2 && bestIdeaScore < 88) {
    return {
      marketBias: "risk-off",
      stayInCash: true,
      summary: "Catalyst risk is elevated and no setup is strong enough to justify exposure. Default posture is cash."
    };
  }

  if (highSeverityEvents >= 1) {
    return {
      marketBias: "mixed",
      stayInCash: bestIdeaScore < 82,
      summary:
        bestIdeaScore < 82
          ? "Conditions are mixed and current setups lack enough confluence. Staying in cash is preferred."
          : "Conditions are selective. Only high-conviction user-defined setups should be considered."
    };
  }

  return {
    marketBias: "risk-on",
    stayInCash: false,
    summary: "Trend and setup quality are supportive enough to take risk when the user-defined trigger is clean."
  };
}
