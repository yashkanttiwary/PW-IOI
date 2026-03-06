export const CONVERSION_BENCHMARKS = {
  views_to_signup: {
    optimistic:   { rate: 0.05,  label: '5%'   },
    realistic:    { rate: 0.025, label: '2.5%' },
    conservative: { rate: 0.01,  label: '1%'   },
  },
  footfall_to_signup: {
    optimistic:   { rate: 0.40, label: '40%' },
    realistic:    { rate: 0.25, label: '25%' },
    conservative: { rate: 0.12, label: '12%' },
  },
  signup_to_app: {
    optimistic:   { rate: 0.35, label: '35%' },
    realistic:    { rate: 0.18, label: '18%' },
    conservative: { rate: 0.08, label: '8%'  },
  },
  app_to_cee: {
    optimistic:   { rate: 0.80, label: '80%' },
    realistic:    { rate: 0.55, label: '55%' },
    conservative: { rate: 0.35, label: '35%' },
  },
  cee_to_interview: {
    optimistic:   { rate: 0.60, label: '60%' },
    realistic:    { rate: 0.35, label: '35%' },
    conservative: { rate: 0.20, label: '20%' },
  },
  interview_to_admission: {
    optimistic:   { rate: 0.70, label: '70%' },
    realistic:    { rate: 0.45, label: '45%' },
    conservative: { rate: 0.25, label: '25%' },
  },
};

export const COST_BENCHMARKS = {
  cost_per_view: {
    instagram_reel: { low: 0.10, mid: 0.30, high: 0.80 },
    youtube_short:  { low: 0.15, mid: 0.50, high: 1.20 },
    youtube_long:   { low: 0.50, mid: 1.50, high: 4.00 },
    meta_ads:       { low: 0.20, mid: 0.60, high: 1.50 },
  },
  cost_per_lead: {
    qr_event:       { low: 30,  mid: 80,   high: 200  },
    landing_page:   { low: 50,  mid: 150,  high: 400  },
    school_visit:   { low: 20,  mid: 60,   high: 150  },
    guerrilla:      { low: 15,  mid: 40,   high: 100  },
    meta_lead_ads:  { low: 80,  mid: 200,  high: 500  },
    whatsapp:       { low: 5,   mid: 15,   high: 40   },
  },
  cost_per_event: {
    campus_open_day:     { low: 50000,  mid: 200000, high: 500000 },
    hackathon:           { low: 30000,  mid: 100000, high: 300000 },
    school_outreach:     { low: 5000,   mid: 15000,  high: 40000  },
    guerrilla_activation:{ low: 3000,   mid: 10000,  high: 30000  },
    online_webinar:      { low: 2000,   mid: 8000,   high: 25000  },
    parental_roi_session:{ low: 10000,  mid: 40000,  high: 100000 },
    farewell_trojan:     { low: 8000,   mid: 25000,  high: 60000  },
  },
};
