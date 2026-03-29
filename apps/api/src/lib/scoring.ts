import type { ConfluenceSignals, OpportunityGrade } from "../types.js";

function gradeFromScore(score: number): OpportunityGrade {
  if (score >= 96) return "A+";
  if (score >= 90) return "A";
  if (score >= 84) return "B+";
  if (score >= 78) return "B";
  if (score >= 70) return "C";
  if (score >= 62) return "D";
  return "F";
}

export function scoreTradeIdea(confluence: ConfluenceSignals): {
  confidenceScore: number;
  grade: OpportunityGrade;
} {
  let score = 50;

  if (confluence.timeframeContinuity) {
    score += 15;
  }

  if (confluence.fairValueGap) {
    score += 10;
  }

  if (confluence.nearKeyLevel) {
    score += 10;
  }

  if (confluence.volumeConfirmation) {
    score += 10;
  }

  if (confluence.marketConditions === "trending") {
    score += 10;
  } else if (confluence.marketConditions === "mixed") {
    score += 4;
  } else {
    score -= 10;
  }

  if (confluence.eventRisk === "medium") {
    score -= 7;
  }

  if (confluence.eventRisk === "high") {
    score -= 15;
  }

  const confidenceScore = Math.max(0, Math.min(100, score));
  return {
    confidenceScore,
    grade: gradeFromScore(confidenceScore)
  };
}
