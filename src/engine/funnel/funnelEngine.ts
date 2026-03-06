import { CONVERSION_BENCHMARKS } from '../constants/benchmarks';

type FunnelStage = {
  id: string;
  volume: number | null;
  rate: number | null;
  dropoff: number | null;
};

export function projectFunnelForward({ tofuVolume, channel = 'blended', scenario = 'realistic', overrides = {} }: any): any {
  const b = CONVERSION_BENCHMARKS as any;
  const getRate = (stage: string) => {
    if (overrides[stage]) return overrides[stage];
    return b[stage][scenario].rate;
  };

  const firstRate = channel === 'offline'
    ? getRate('footfall_to_signup')
    : channel === 'online'
      ? getRate('views_to_signup')
      : (getRate('views_to_signup') + getRate('footfall_to_signup')) / 2;

  const stages: FunnelStage[] = [
    { id: 'views',     volume: tofuVolume, rate: null,                        dropoff: null },
    { id: 'signup',    volume: null,       rate: firstRate,                   dropoff: null },
    { id: 'app',       volume: null,       rate: getRate('signup_to_app'),    dropoff: null },
    { id: 'cee',       volume: null,       rate: getRate('app_to_cee'),       dropoff: null },
    { id: 'interview', volume: null,       rate: getRate('cee_to_interview'), dropoff: null },
    { id: 'admission', volume: null,       rate: getRate('interview_to_admission'), dropoff: null },
  ];

  for (let i = 1; i < stages.length; i++) {
    const prevVolume = stages[i - 1].volume ?? 0;
    const rate = stages[i].rate ?? 0;

    stages[i].volume = Math.round(prevVolume * rate);
    stages[i].dropoff = 1 - rate;
  }

  const totalAdmissions = stages[stages.length - 1].volume ?? 0;

  return {
    scenario,
    channel,
    stages,
    totalAdmissions,
    overallConversionRate: totalAdmissions / tofuVolume,
  };
}

export function projectFunnelReverse({ targetAdmissions, channel = 'blended', scenario = 'realistic', overrides = {} }: any): any {
  const b = CONVERSION_BENCHMARKS as any;
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

export function compareScenarios({ tofuVolume, channel = 'blended' }: any) {
  return {
    optimistic:   projectFunnelForward({ tofuVolume, channel, scenario: 'optimistic' }),
    realistic:    projectFunnelForward({ tofuVolume, channel, scenario: 'realistic' }),
    conservative: projectFunnelForward({ tofuVolume, channel, scenario: 'conservative' }),
  };
}
