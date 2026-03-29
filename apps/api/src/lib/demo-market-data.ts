import type { MarketEvent, MarketSnapshot } from "../types.js";

export const demoEvents: MarketEvent[] = [
  { name: "CPI", type: "macro", severity: "high", dateLabel: "Tomorrow 8:30 ET" },
  { name: "OPEX", type: "market", severity: "medium", dateLabel: "Friday close" },
  { name: "NVDA earnings", type: "earnings", severity: "medium", dateLabel: "Next week" }
];

export const demoSnapshots: MarketSnapshot[] = [
  {
    ticker: "NVDA",
    keyLevels: [930, 924, 978.8, 990],
    volumeConfirmation: true,
    fairValueGap: true,
    timeframeContinuity: true,
    marketConditions: "trending",
    eventRisk: "medium",
    candlesByTimeframe: {
      "1H": [
        { timestamp: "2026-03-29T07:00:00-04:00", label: "07:00", open: 932, high: 938, low: 928, close: 931, volume: 120000 },
        { timestamp: "2026-03-29T08:00:00-04:00", label: "08:00", open: 931, high: 944, low: 924, close: 940, volume: 138000 },
        { timestamp: "2026-03-29T09:00:00-04:00", label: "09:00", open: 940, high: 946, low: 936, close: 945, volume: 151000 },
        { timestamp: "2026-03-29T10:00:00-04:00", label: "10:00", open: 944, high: 945, low: 930, close: 932, volume: 184000 }
      ]
    }
  },
  {
    ticker: "AMD",
    keyLevels: [160, 166, 176],
    volumeConfirmation: true,
    fairValueGap: false,
    timeframeContinuity: true,
    marketConditions: "trending",
    eventRisk: "low",
    candlesByTimeframe: {
      "4H": [
        { timestamp: "2026-03-29T00:00:00-04:00", label: "00:00", open: 166, high: 172, low: 164, close: 165, volume: 86000 },
        { timestamp: "2026-03-29T04:00:00-04:00", label: "04:00", open: 165, high: 176, low: 165, close: 174, volume: 98000 },
        { timestamp: "2026-03-29T08:00:00-04:00", label: "08:00", open: 170, high: 171.5, low: 161, close: 162.2, volume: 124000 }
      ]
    }
  },
  {
    ticker: "MSFT",
    keyLevels: [199, 205, 212],
    volumeConfirmation: true,
    fairValueGap: true,
    timeframeContinuity: false,
    marketConditions: "mixed",
    eventRisk: "low",
    candlesByTimeframe: {
      "12H": [
        { timestamp: "2026-03-27T00:00:00-04:00", label: "Bar 0", open: 204, high: 210, low: 200, close: 206, volume: 240000 },
        { timestamp: "2026-03-27T12:00:00-04:00", label: "Bar 1", open: 205, high: 208, low: 202, close: 206, volume: 210000 },
        { timestamp: "2026-03-28T00:00:00-04:00", label: "Bar 2", open: 206, high: 211, low: 199, close: 209, volume: 270000 },
        { timestamp: "2026-03-28T12:00:00-04:00", label: "Bar 3", open: 206, high: 209, low: 201, close: 204, volume: 215000 },
        { timestamp: "2026-03-29T00:00:00-04:00", label: "Trigger", open: 204.8, high: 207, low: 201, close: 203.7, volume: 298000 }
      ]
    }
  },
  {
    ticker: "TSLA",
    keyLevels: [170, 175, 184],
    volumeConfirmation: true,
    fairValueGap: false,
    timeframeContinuity: false,
    marketConditions: "mixed",
    eventRisk: "high",
    candlesByTimeframe: {
      "1H": [
        { timestamp: "2026-03-29T08:00:00-04:00", label: "08:00", open: 173, high: 180, low: 170, close: 176, volume: 155000 },
        { timestamp: "2026-03-29T09:00:00-04:00", label: "09:00", open: 176, high: 184, low: 176, close: 183, volume: 201000 }
      ],
      "30M": [
        { timestamp: "2026-03-29T09:30:00-04:00", label: "09:30", open: 178, high: 179, low: 172, close: 173, volume: 229000 }
      ]
    }
  },
  {
    ticker: "AAPL",
    keyLevels: [211, 214, 218.5],
    volumeConfirmation: true,
    fairValueGap: true,
    timeframeContinuity: true,
    marketConditions: "trending",
    eventRisk: "medium",
    candlesByTimeframe: {
      "30M": [
        { timestamp: "2026-03-29T09:30:00-04:00", label: "09:30", open: 212, high: 214, low: 211, close: 213.5, volume: 310000 },
        { timestamp: "2026-03-29T10:00:00-04:00", label: "10:00", open: 213.6, high: 216.5, low: 213.2, close: 216.1, volume: 358000 }
      ]
    }
  }
];
