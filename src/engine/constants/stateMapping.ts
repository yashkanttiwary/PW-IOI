export const STATE_OPTIONS = [
  { label: 'Delhi NCR', value: 'Delhi-NCR' },
  { label: 'Uttar Pradesh', value: 'Uttar Pradesh' },
  { label: 'Maharashtra', value: 'Maharashtra' },
  { label: 'Karnataka', value: 'Karnataka' },
  { label: 'Bihar', value: 'Bihar' },
  { label: 'Rajasthan', value: 'Rajasthan' },
  { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
  { label: 'Tamil Nadu', value: 'Tamil Nadu' },
  { label: 'West Bengal', value: 'West Bengal' },
  { label: 'Gujarat', value: 'Gujarat' },
  { label: 'Telangana', value: 'Telangana' },
];

const LEGACY_TO_CANONICAL: Record<string, string> = {
  Delhi: 'Delhi-NCR',
  'Delhi NCR': 'Delhi-NCR',
  UP: 'Uttar Pradesh',
  'Uttar Pradesh': 'Uttar Pradesh',
  MP: 'Madhya Pradesh',
  'Madhya Pradesh': 'Madhya Pradesh',
  Bengaluru: 'Karnataka',
  Bangalore: 'Karnataka',
  Noida: 'Delhi-NCR',
  Lucknow: 'Uttar Pradesh',
  Pune: 'Maharashtra',
};

export function normalizeStateKey(input?: string | null) {
  if (!input) return null;
  return LEGACY_TO_CANONICAL[input] || input;
}
