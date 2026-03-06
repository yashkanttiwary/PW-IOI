export function calculateBudgetAllocation({ totalBudget, channelMix, funnelProjection }: any) {
  const stageAllocation = {
    tofu:     0.35, 
    mofu:     0.40, 
    bofu:     0.15, 
    contingency: 0.10, 
  };

  const stages = funnelProjection.stages;
  const admissions = funnelProjection.totalAdmissions;

  const breakdown = {
    tofu: {
      budget:     Math.round(totalBudget * stageAllocation.tofu),
      volume:     stages[0].volume,
      costPerUnit: null as number | null,
      tactics:    [],
    },
    mofu: {
      budget:     Math.round(totalBudget * stageAllocation.mofu),
      signups:    stages[1].volume,
      apps:       stages[2].volume,
      cee:        stages[3].volume,
      costPerLead: null as number | null,
      costPerApp:  null as number | null,
      tactics:    [],
    },
    bofu: {
      budget:     Math.round(totalBudget * stageAllocation.bofu),
      interviews: stages[4].volume,
      admissions: stages[5].volume,
      costPerAdmission: null as number | null,
      tactics:    [],
    },
    contingency: {
      budget:     Math.round(totalBudget * stageAllocation.contingency),
    },
    totals: {
      totalBudget,
      totalAdmissions: admissions,
      cac: admissions > 0 ? Math.round(totalBudget / admissions) : null,
      cacLabel: admissions > 0 ? `₹${Math.round(totalBudget / admissions).toLocaleString('en-IN')}` : '🔴 N/A',
    },
  };

  if (breakdown.tofu.volume > 0) {
    breakdown.tofu.costPerUnit = Math.round(breakdown.tofu.budget / breakdown.tofu.volume * 100) / 100;
  }
  if (breakdown.mofu.signups > 0) {
    breakdown.mofu.costPerLead = Math.round(breakdown.mofu.budget / breakdown.mofu.signups);
    breakdown.mofu.costPerApp = breakdown.mofu.apps > 0
      ? Math.round(breakdown.mofu.budget / breakdown.mofu.apps) : null;
  }
  if (breakdown.bofu.admissions > 0) {
    breakdown.bofu.costPerAdmission = Math.round(breakdown.bofu.budget / breakdown.bofu.admissions);
  }

  return breakdown;
}

export function calculateCAC(budget: number, admissions: number) {
  if (!admissions || admissions === 0) {
    return { cac: null, formatted: '🔴 N/A', isHealthy: false, status: '🔴' };
  }
  const cac = Math.round(budget / admissions);
  return {
    cac,
    formatted: `₹${cac.toLocaleString('en-IN')}`,
    isHealthy: cac <= 15000,
    status: cac <= 15000 ? '🟢' : cac <= 25000 ? '🟡' : '🔴',
  };
}
