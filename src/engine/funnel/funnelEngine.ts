import { CONVERSION_BENCHMARKS } from '../constants/benchmarks';

export function projectFunnelForward({ tofuVolume, channel = 'blended', scenario = 'realistic', overrides = {} }: { tofuVolume: number; channel?: string; scenario?: string; overrides?: Record<string, number> }) {
  const b = CONVERSION_BENCHMARKS as Record<string, Record<string, { rate: number }>>;
  const getRate = (stage: string) => {
    if (overrides[stage]) return overrides[stage];
    return b[stage][scenario].rate;
  };

  const firstRate = channel === 'offline'
    ? getRate('footfall_to_signup')
    : channel === 'online'
      ? getRate('views_to_signup')
      : (getRate('views_to_signup') + getRate('footfall_to_signup')) / 2;

  const stages = [
    { id: 'views',     volume: tofuVolume, rate: 0,                        dropoff: 0 },
    { id: 'signup',    volume: 0,          rate: firstRate,                dropoff: 0 },
    { id: 'app',       volume: 0,          rate: getRate('signup_to_app'),    dropoff: 0 },
    { id: 'cee',       volume: 0,          rate: getRate('app_to_cee'),       dropoff: 0 },
    { id: 'interview', volume: 0,          rate: getRate('cee_to_interview'), dropoff: 0 },
    { id: 'admission', volume: 0,          rate: getRate('interview_to_admission'), dropoff: 0 },
  ];

  for (let i = 1; i < stages.length; i++) {
    stages[i].volume = Math.round(stages[i - 1].volume * stages[i].rate);
    stages[i].dropoff = 1 - stages[i].rate;
  }

  return {
    scenario,
    channel,
    stages,
    totalAdmissions: stages[stages.length - 1].volume,
    overallConversionRate: tofuVolume > 0 ? stages[stages.length - 1].volume / tofuVolume : 0,
  };
}

export function projectFunnelReverse({ targetAdmissions, channel = 'blended', scenario = 'realistic', overrides = {} }: { targetAdmissions: number; channel?: string; scenario?: string; overrides?: Record<string, number> }) {
  const b = CONVERSION_BENCHMARKS as Record<string, Record<string, { rate: number }>>;
  const getRate = (stage: string) => overrides[stage] || b[stage][scenario].rate;

  const firstRate = channel === 'offline'
    ? getRate('footfall_to_signup')
    : channel === 'online'
      ? getRate('views_to_signup')
      : (getRate('views_to_signup') + getRate('footfall_to_signup')) / 2;

  const interview  = Math.ceil(targetAdmissions / getRate('interview_to_admission'));
  const cee        = Math.ceil(interview / getRate('cee_to_interview'));
  const app        = Math.ceil(cee / getRate('app_to_cee'));
  const signup     = Math.ceil(app / getRate('signup_to_app'));
  const tofu       = Math.ceil(signup / firstRate);

  return {
    scenario,
    channel,
    required: {
      views:      tofu,
      signup:     signup,
      app:        app,
      cee:        cee,
      interview:  interview,
      admission:  targetAdmissions,
    },
    totalTofuNeeded: tofu,
  };
}

export function compareScenarios({ tofuVolume, channel = 'blended' }: { tofuVolume: number; channel?: string }) {
  return {
    optimistic:   projectFunnelForward({ tofuVolume, channel, scenario: 'optimistic' }),
    realistic:    projectFunnelForward({ tofuVolume, channel, scenario: 'realistic' }),
    conservative: projectFunnelForward({ tofuVolume, channel, scenario: 'conservative' }),
  };
}
