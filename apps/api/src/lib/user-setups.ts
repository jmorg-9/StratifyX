import type { Candle, ConfluenceSignals, MarketSnapshot, TradeDirection, TradeIdea } from "../types.js";
import { classifyStratBar, directionFromBarType, hasPullbackWick, isNearKeyLevel, midpoint, nextKeyLevel } from "./strat.js";
import { scoreTradeIdea } from "./scoring.js";

function buildConfluence(snapshot: MarketSnapshot, referencePrice: number): ConfluenceSignals {
  return {
    timeframeContinuity: snapshot.timeframeContinuity,
    fairValueGap: snapshot.fairValueGap,
    nearKeyLevel: isNearKeyLevel(referencePrice, snapshot.keyLevels),
    volumeConfirmation: snapshot.volumeConfirmation,
    marketConditions: snapshot.marketConditions,
    eventRisk: snapshot.eventRisk
  };
}

function buildTradeIdea(params: {
  snapshot: MarketSnapshot;
  setup: string;
  timeframe: string;
  direction: TradeDirection;
  entry: number;
  stop: number;
  target: number;
  notes: string[];
  chartCandles: Candle[];
}): TradeIdea {
  const confluence = buildConfluence(params.snapshot, params.entry);
  const scored = scoreTradeIdea(confluence);

  return {
    ticker: params.snapshot.ticker,
    setup: params.setup,
    timeframe: params.timeframe,
    direction: params.direction,
    entry: Number(params.entry.toFixed(2)),
    stop: Number(params.stop.toFixed(2)),
    target: Number(params.target.toFixed(2)),
    grade: scored.grade,
    confidenceScore: scored.confidenceScore,
    notes: params.notes.join(" "),
    chart: params.chartCandles.map((candle) => ({
      label: candle.label,
      value: candle.close
    })),
    confluence
  };
}

function byLabel(candles: Candle[] | undefined, label: string): Candle | null {
  return candles?.find((candle) => candle.label === label) ?? null;
}

function averageRange(candles: Candle[]): number {
  return candles.reduce((sum, candle) => sum + (candle.high - candle.low), 0) / candles.length;
}

function evaluate322FirstLive(snapshot: MarketSnapshot): TradeIdea | null {
  const candles = snapshot.candlesByTimeframe["1H"];
  const prior = byLabel(candles, "07:00");
  const eight = byLabel(candles, "08:00");
  const nine = byLabel(candles, "09:00");
  const ten = byLabel(candles, "10:00");

  if (!prior || !eight || !nine || !ten) {
    return null;
  }

  if (classifyStratBar(prior, eight) !== "3") {
    return null;
  }

  const nineType = classifyStratBar(eight, nine);
  const tenType = classifyStratBar(nine, ten);

  if (!["2u", "2d"].includes(nineType) || !["2u", "2d"].includes(tenType) || nineType === tenType) {
    return null;
  }

  if (averageRange([eight, nine, ten]) / ten.close < 0.01) {
    return null;
  }

  const direction = directionFromBarType(tenType);
  if (!direction) {
    return null;
  }

  return buildTradeIdea({
    snapshot,
    setup: "3-2-2 First Live",
    timeframe: "1H",
    direction,
    entry: direction === "long" ? ten.high : ten.low,
    stop: direction === "long" ? ten.low : ten.high,
    target: direction === "long" ? eight.high : eight.low,
    notes: [
      "8:00 printed a 3 against the prior hour, 9:00 continued directionally, and 10:00 reversed it cleanly.",
      "The trade plan uses the 10:00 break for entry and the 8:00 outside-bar extreme for the magnitude target."
    ],
    chartCandles: [prior, eight, nine, ten]
  });
}

function evaluate4HRetrigger(snapshot: MarketSnapshot): TradeIdea | null {
  const candles = snapshot.candlesByTimeframe["4H"];
  const prior = byLabel(candles, "00:00");
  const four = byLabel(candles, "04:00");
  const eight = byLabel(candles, "08:00");

  if (!prior || !four || !eight) {
    return null;
  }

  const fourType = classifyStratBar(prior, four);
  const eightType = classifyStratBar(four, eight);
  const fourDirection = directionFromBarType(fourType);
  const eightDirection = directionFromBarType(eightType);

  if (!fourDirection || !eightDirection || fourDirection === eightDirection) {
    return null;
  }

  if (eight.open <= four.low || eight.open >= four.high) {
    return null;
  }

  if (!hasPullbackWick(eight, eightDirection)) {
    return null;
  }

  return buildTradeIdea({
    snapshot,
    setup: "4H Retrigger",
    timeframe: "4H",
    direction: eightDirection,
    entry: eight.close,
    stop: eightDirection === "long" ? eight.low : eight.high,
    target: eightDirection === "long" ? prior.high : prior.low,
    notes: [
      "The 4:00 bar expanded directionally and the 8:00 bar opened inside its range before retriggering the opposite side.",
      "A measurable wick confirms the required pullback before entry."
    ],
    chartCandles: [prior, four, eight]
  });
}

function evaluate12HMiyagi(snapshot: MarketSnapshot): TradeIdea | null {
  const candles = snapshot.candlesByTimeframe["12H"];
  if (!candles || candles.length < 5) {
    return null;
  }

  const [bar0, bar1, bar2, bar3, trigger] = candles;

  if (classifyStratBar(bar0, bar1) !== "1") {
    return null;
  }

  if (classifyStratBar(bar1, bar2) !== "3") {
    return null;
  }

  if (classifyStratBar(bar2, bar3) !== "1") {
    return null;
  }

  const pivot = midpoint(bar3.high, bar3.low);
  const bearishTrigger = trigger.high > pivot && trigger.close < pivot;
  const bullishTrigger = trigger.low < pivot && trigger.close > pivot;

  if (!bearishTrigger && !bullishTrigger) {
    return null;
  }

  const direction: TradeDirection = bearishTrigger ? "short" : "long";
  const target =
    nextKeyLevel(pivot, snapshot.keyLevels, direction) ?? (direction === "long" ? bar2.high : bar2.low);

  return buildTradeIdea({
    snapshot,
    setup: "12H 1-3-1 (Miyagi)",
    timeframe: "12H",
    direction,
    entry: pivot,
    stop: direction === "long" ? trigger.low : trigger.high,
    target,
    notes: [
      "The 12H sequence formed 1-3-1 before the trigger bar interacted with the midpoint of bar 3.",
      "Polarity follows your supplied rule exactly: above midpoint is bearish, below midpoint is bullish."
    ],
    chartCandles: [bar1, bar2, bar3, trigger]
  });
}

function evaluate9F(snapshot: MarketSnapshot): TradeIdea | null {
  const oneHour = snapshot.candlesByTimeframe["1H"];
  const openRange = snapshot.candlesByTimeframe["30M"];
  const eight = byLabel(oneHour, "08:00");
  const nine = byLabel(oneHour, "09:00");
  const open = byLabel(openRange, "09:30");

  if (!eight || !nine || !open) {
    return null;
  }

  const nineType = classifyStratBar(eight, nine);
  const nineDirection = directionFromBarType(nineType);
  const midpointLevel = midpoint(eight.high, eight.low);

  if (!nineDirection) {
    return null;
  }

  if (Math.abs(open.open - midpointLevel) < 0.01) {
    return null;
  }

  const openedBeyondMidpoint = nineDirection === "long" ? open.open > midpointLevel : open.open < midpointLevel;
  const reversedThroughMidpoint =
    nineDirection === "long"
      ? open.low < midpointLevel && open.close < midpointLevel
      : open.high > midpointLevel && open.close > midpointLevel;

  if (!openedBeyondMidpoint || !reversedThroughMidpoint) {
    return null;
  }

  const direction: TradeDirection = nineDirection === "long" ? "short" : "long";

  return buildTradeIdea({
    snapshot,
    setup: "9F (Failed 9)",
    timeframe: "1H",
    direction,
    entry: midpointLevel,
    stop: direction === "long" ? nine.low : nine.high,
    target: direction === "long" ? eight.high : eight.low,
    notes: [
      "The 9:00 directional bar extended beyond the 8:00 midpoint, then failed after the open and reversed through the 50% level.",
      "That creates the trap-and-reclaim behavior required for a Failed 9."
    ],
    chartCandles: [eight, nine, open]
  });
}

function evaluate30MOrb(snapshot: MarketSnapshot): TradeIdea | null {
  const candles = snapshot.candlesByTimeframe["30M"];
  const openingRange = byLabel(candles, "09:30");
  const trigger = byLabel(candles, "10:00");

  if (!openingRange || !trigger) {
    return null;
  }

  const longBreak = trigger.high > openingRange.high && trigger.close > openingRange.high;
  const shortBreak = trigger.low < openingRange.low && trigger.close < openingRange.low;

  if (!longBreak && !shortBreak) {
    return null;
  }

  if (snapshot.marketConditions === "choppy" || !snapshot.volumeConfirmation) {
    return null;
  }

  const direction: TradeDirection = longBreak ? "long" : "short";
  const rangeSize = openingRange.high - openingRange.low;
  const target =
    nextKeyLevel(longBreak ? openingRange.high : openingRange.low, snapshot.keyLevels, direction) ??
    Number((longBreak ? openingRange.high + rangeSize * 1.5 : openingRange.low - rangeSize * 1.5).toFixed(2));

  return buildTradeIdea({
    snapshot,
    setup: "30M ORB",
    timeframe: "30M",
    direction,
    entry: longBreak ? openingRange.high : openingRange.low,
    stop: longBreak ? openingRange.low : openingRange.high,
    target,
    notes: [
      "The 9:30 to 10:00 opening range defined the ORB box and the next 30-minute candle closed outside that range.",
      "Volume and higher-timeframe context both support the breakout."
    ],
    chartCandles: [openingRange, trigger]
  });
}

export function scanUserDefinedSetups(snapshots: MarketSnapshot[]): TradeIdea[] {
  const evaluators = [
    evaluate322FirstLive,
    evaluate4HRetrigger,
    evaluate12HMiyagi,
    evaluate9F,
    evaluate30MOrb
  ];

  return snapshots
    .flatMap((snapshot) => evaluators.map((evaluate) => evaluate(snapshot)).filter((idea): idea is TradeIdea => idea !== null))
    .sort((left, right) => right.confidenceScore - left.confidenceScore);
}
