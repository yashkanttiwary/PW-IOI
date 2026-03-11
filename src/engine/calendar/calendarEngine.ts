export const ACADEMIC_CALENDAR = {
  boardExams:    { start: '2026-03-01', end: '2026-04-15', label: 'CBSE/ISC Board Exams', impact: 'BLOCKER_A' },
  jeeMains1:     { start: '2026-01-20', end: '2026-01-30', label: 'JEE Mains Session 1', impact: 'BLOCKER_A' },
  jeeMains2:     { start: '2026-04-01', end: '2026-04-15', label: 'JEE Mains Session 2', impact: 'BLOCKER_A' },
  jeeAdvanced:   { start: '2026-05-15', end: '2026-05-25', label: 'JEE Advanced', impact: 'BLOCKER_A' },
  jeeResults:    { start: '2026-06-10', end: '2026-06-20', label: 'JEE Results Window', impact: 'CLOSING_OPPORTUNITY' },
  boardResults:  { start: '2026-05-10', end: '2026-05-20', label: 'Board Results', impact: 'CLOSING_OPPORTUNITY' },
  vitAdmission:  { start: '2026-04-01', end: '2026-06-30', label: 'VIT/SRM admission window', impact: 'COMPETITOR' },
  nitCounseling: { start: '2026-06-15', end: '2026-08-15', label: 'NIT/JoSAA counseling', impact: 'COMPETITOR' },
};

export function getCalendarPhase(date = new Date()) {
  const m = date.getMonth() + 1;

  if (m >= 3 && m <= 5) {
    return {
      id:       'DEAD_ZONE',
      label:    'Dead Zone',
      badge:    '🔴 DEAD ZONE',
      color:    '#FF5252',
      bgColor:  'rgba(255, 82, 82, 0.15)',
      message:  'Schools closed. Board + JEE season. Guerrilla + digital only.',
      guidance: 'Focus on: Guerrilla outside exam centers, Trojan Horse school farewells, digital community building, content seeding for June push.',
      allowed:  ['guerrilla', 'trojan_horse', 'digital_community', 'content_seeding', 'whatsapp_nurture', 'social_media_organic', 'paid_digital'],
      blocked:  ['school_visits', 'auditorium_events', 'principal_outreach', 'campus_open_days', 'school_sponsorships'],
      priority: 'LEAD_CAPTURE_FOR_JUNE',
    };
  }

  if (m >= 6 && m <= 7) {
    return {
      id:       'CLOSING_WINDOW',
      label:    'Closing Window',
      badge:    '🟠 CLOSING WINDOW',
      color:    '#FF9100',
      bgColor:  'rgba(255, 145, 0, 0.15)',
      message:  'Convert all spring leads NOW. Campus events. Parent sessions. Fee waivers.',
      guidance: 'Activate: Mega campus events, Parental ROI sessions, on-spot fee waivers, aggressive tele-calling, WhatsApp drip campaigns. This is the close window.',
      allowed:  ['all'],
      blocked:  [],
      priority: 'PHYSICAL_CLOSE',
    };
  }

  if (m >= 8 && m <= 11) {
    return {
      id:       'ACTIVE_ACQUISITION',
      label:    'Active Acquisition',
      badge:    '🟢 ACTIVE',
      color:    '#00E676',
      bgColor:  'rgba(0, 230, 118, 0.15)',
      message:  'Full campaign mode. Build the pipeline. All channels open.',
      guidance: 'Execute: Full-funnel campaigns, school outreach, hackathons, reality show content, ambassador programs, campus events. Build lead volume for next cycle.',
      allowed:  ['all'],
      blocked:  [],
      priority: 'LEAD_VOLUME',
    };
  }

  return {
    id:       'SUSTAIN_PREP',
    label:    'Sustain & Prep',
    badge:    '🔵 SUSTAIN',
    color:    '#1A4FBF',
    bgColor:  'rgba(26, 79, 191, 0.15)',
    message:  'Nurture leads. Prep content for Dead Zone. Relationship building.',
    guidance: 'Focus on: Nurture sequences, content production for spring, ambassador training, partnership deals with schools (for post-exam access), community events.',
    allowed:  ['all'],
    blocked:  [],
    priority: 'RELATIONSHIP_BUILDING',
  };
}

export function checkDateConflicts(eventDate: Date) {
  const conflicts: { type: string; label: string; severity: string; message: string }[] = [];
  const d = eventDate.toISOString().split('T')[0];

  for (const [key, cal] of Object.entries(ACADEMIC_CALENDAR)) {
    if (d >= cal.start && d <= cal.end) {
      conflicts.push({
        type:     cal.impact,
        label:    cal.label,
        severity: cal.impact === 'BLOCKER_A' ? 'CRITICAL' : 'MEDIUM',
        message:  cal.impact === 'BLOCKER_A'
          ? `This date falls during \${cal.label}. School-based tactics are BLOCKED. Switch to guerrilla/digital.`
          : `\${cal.label} is active. This is \${cal.impact === 'CLOSING_OPPORTUNITY' ? 'an OPPORTUNITY — activate close tactics' : 'a competitor window — differentiate aggressively'}.`,
      });
    }
  }
  return conflicts;
}

export const NATIONAL_FESTIVALS = [
  { name: 'Republic Day',    month: 1,  day: 26, impact: 'low',    note: 'Patriotic content angle possible' },
  { name: 'Holi',            month: 3,  day: 14, impact: 'medium', note: 'Dead Zone overlap. Low attention.' },
  { name: 'Eid ul-Fitr',     month: 3,  day: 30, impact: 'medium', note: 'Respect. No marketing pushes.', variable: true },
  { name: 'Independence Day', month: 8,  day: 15, impact: 'low',   note: 'Active phase. Patriotic + builder angle.' },
  { name: 'Ganesh Chaturthi', month: 9,  day: 5,  impact: 'high',  note: 'MH focus. Community event angle.', variable: true },
  { name: 'Navratri/Dussehra', month: 10, day: 2, impact: 'high',  note: 'Multi-state. 9-day event. Reduced attention.', variable: true },
  { name: 'Diwali',          month: 10, day: 20, impact: 'high',   note: 'National. Ad fatigue. Aspirational messaging.', variable: true },
  { name: 'Christmas',       month: 12, day: 25, impact: 'low',    note: 'Kerala/Goa/NE specific.' },
];
