import type { Candle, TradeDirection } from "../types.js";

export type StratBarType = "1" | "2u" | "2d" | "3";

export function classifyStratBar(previous: Candle, current: Candle): StratBarType {
  const inside = current.high <= previous.high && current.low >= previous.low;
  if (inside) {
    return "1";
  }

  const outside = current.high > previous.high && current.low < previous.low;
  if (outside) {
    return "3";
  }

  if (current.high > previous.high) {
    return "2u";
  }

  return "2d";
}

export function directionFromBarType(barType: StratBarType): TradeDirection | null {
  if (barType === "2u") {
    return "long";
  }

  if (barType === "2d") {
    return "short";
  }

  return null;
}

export function midpoint(high: number, low: number): number {
  return Number(((high + low) / 2).toFixed(2));
}

export function hasPullbackWick(candle: Candle, direction: TradeDirection): boolean {
  const upperWick = candle.high - Math.max(candle.open, candle.close);
  const lowerWick = Math.min(candle.open, candle.close) - candle.low;
  const candleRange = candle.high - candle.low || 1;

  if (direction === "short") {
    return upperWick / candleRange >= 0.18;
  }

  return lowerWick / candleRange >= 0.18;
}

export function isNearKeyLevel(price: number, levels: number[], maxDistancePct = 0.012): boolean {
  return levels.some((level) => Math.abs(price - level) / price <= maxDistancePct);
}

export function nextKeyLevel(price: number, levels: number[], direction: TradeDirection): number | null {
  const candidates =
    direction === "long"
      ? levels.filter((level) => level > price).sort((left, right) => left - right)
      : levels.filter((level) => level < price).sort((left, right) => right - left);

  return candidates[0] ?? null;
}
