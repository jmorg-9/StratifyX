export type OpportunityGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export interface PricePoint {
  label: string;
  value: number;
}

export interface ConfluenceSignals {
  timeframeContinuity: boolean;
  fairValueGap: boolean;
  nearKeyLevel: boolean;
  volumeConfirmation: boolean;
  marketConditions: "trending" | "mixed" | "choppy";
  eventRisk: "low" | "medium" | "high";
}

export interface TradeIdea {
  ticker: string;
  setup: string;
  timeframe: string;
  direction: "long" | "short";
  entry: number;
  stop: number;
  target: number;
  grade: OpportunityGrade;
  confidenceScore: number;
  notes: string;
  chart: PricePoint[];
  confluence: ConfluenceSignals;
}

export interface MarketEvent {
  name: string;
  type: string;
  severity: "low" | "medium" | "high";
  dateLabel: string;
}

export interface JournalEntry {
  date: string;
  ticker: string;
  notes: string;
  pnl: number;
}

export interface DashboardResponse {
  generatedAt: string;
  marketBias: "risk-on" | "mixed" | "risk-off";
  stayInCash: boolean;
  marketSummary: string;
  watchlist: string[];
  events: MarketEvent[];
  tradeIdeas: TradeIdea[];
  journal: JournalEntry[];
}

export interface SimulationResponse {
  quantity: number;
  riskPerShare: number;
  rewardPerShare: number;
  riskRewardRatio: number;
  potentialProfit: number;
  potentialLoss: number;
}
