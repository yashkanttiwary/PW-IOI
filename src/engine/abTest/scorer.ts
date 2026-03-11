export const SCORING_RUBRIC = {
  studentHook:         { weight: 2.0, maxRaw: 10, maxWeighted: 20 },
  parentTrust:         { weight: 2.0, maxRaw: 10, maxWeighted: 20 },
  brandVoice:          { weight: 1.5, maxRaw: 10, maxWeighted: 15 },
  leadCaptureFriction: { weight: 1.5, maxRaw: 10, maxWeighted: 15 }, 
  fomo:                { weight: 1.0, maxRaw: 10, maxWeighted: 10 },
  clarity:             { weight: 1.0, maxRaw: 10, maxWeighted: 10 },
};

export const MAX_WEIGHTED_TOTAL = 90; 

export function applyWeights(rawScores: Record<string, number>) {
  const weighted: Record<string, any> = {};
  let total = 0;

  for (const [dim, config] of Object.entries(SCORING_RUBRIC)) {
    const raw = rawScores[dim] || 0;
    const w = Math.round(raw * config.weight * 10) / 10;
    weighted[dim] = { raw, weighted: w };
    total += w;
  }

  return {
    scores: weighted,
    total: Math.round(total * 10) / 10,
    percentage: Math.round((total / MAX_WEIGHTED_TOTAL) * 100),
    grade: total >= 75 ? 'A' : total >= 60 ? 'B' : total >= 45 ? 'C' : 'D',
  };
}

export function compareVariants(variants: { id: string; rawScores: Record<string, number>; blockerBFlag: boolean; antiPatterns: string[] }[]) {
  const scored = variants.map(v => ({
    id: v.id,
    ...applyWeights(v.rawScores),
  }));

  scored.sort((a, b) => b.total - a.total);

  return {
    rankings: scored,
    winner: scored[0],
    runnerUp: scored[1] || null,
    gap: scored.length > 1 ? Math.round((scored[0].total - scored[1].total) * 10) / 10 : null,
  };
}
