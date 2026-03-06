import { getCalendarPhase, checkDateConflicts, NATIONAL_FESTIVALS } from '../calendar/calendarEngine';
import { STATE_PROFILES } from '../constants/stateProfiles';

export function runBlockerScan({ planText, startDate, endDate, targetState }: any) {
  const report = {
    blockerA: { status: '✅', severity: 'CLEAR', findings: [] as string[], hack: null as string | null },
    blockerB: { status: '✅', severity: 'CLEAR', findings: [] as string[], hack: null as string | null },
    blockerC: { status: '✅', severity: 'CLEAR', findings: [] as string[], hack: null as string | null },
    hiddenBlockers: [] as any[],
    overallScore: 10,
  };

  if (startDate) {
    const phase = getCalendarPhase(startDate);
    if (phase.id === 'DEAD_ZONE') {
      report.blockerA = {
        status: '🚫',
        severity: 'CRITICAL',
        findings: [`Plan date falls in Dead Zone (${startDate.toLocaleDateString()}). Schools are closed. No auditorium events, no principal outreach.`],
        hack: 'Switch to: (1) Guerrilla activations outside exam centers, (2) Trojan Horse school farewell sponsorships, (3) Digital-only community building. Save physical events for June Closing Window.',
      };
      report.overallScore -= 4;
    }

    const conflicts = checkDateConflicts(startDate);
    conflicts.forEach(c => {
      if (c.type === 'BLOCKER_A') {
        report.blockerA.findings.push(c.message);
        if (report.blockerA.severity !== 'CRITICAL') {
          report.blockerA.status = '⚠️';
          report.blockerA.severity = 'HIGH';
          report.overallScore -= 2;
        }
      } else {
        report.hiddenBlockers.push(c);
      }
    });
  }

  const blockedTacticWords = ['school auditorium', 'principal permission', 'school assembly',
    'class presentation', 'school event hall', 'teacher coordination'];
  const textLower = planText.toLowerCase();

  blockedTacticWords.forEach(word => {
    if (textLower.includes(word)) {
      const phase = startDate ? getCalendarPhase(startDate) : null;
      if (phase && phase.id === 'DEAD_ZONE') {
        report.blockerA.findings.push(`Contains "${word}" — not possible during Dead Zone.`);
      }
    }
  });

  const stigmaPatterns = [
    { pattern: /\\b(jee\\s+fail|failed\\s+jee|couldn'?t\\s+crack|didn'?t\\s+clear)\\b/gi, severity: 'CRITICAL' },
    { pattern: /\\b(backup\\s+(plan|option|college)|safety\\s+(school|net|option)|consolation|last\\s+resort)\\b/gi, severity: 'CRITICAL' },
    { pattern: /\\b(reject(ed|ion)?|loser|failure|couldn'?t\\s+make\\s+it)\\b/gi, severity: 'CRITICAL' },
    { pattern: /\\b(dropper|drop\\s+year)\\b/gi, severity: 'HIGH' },
    { pattern: /\\b(second\\s+choice|plan\\s+b|not\\s+good\\s+enough)\\b/gi, severity: 'HIGH' },
  ];

  stigmaPatterns.forEach(({ pattern, severity }) => {
    const matches = textLower.match(pattern);
    if (matches) {
      report.blockerB = {
        status: severity === 'CRITICAL' ? '🚫' : '⚠️',
        severity,
        findings: [...report.blockerB.findings, `Found stigma language: "${matches.join('", "')}"` ],
        hack: 'MANDATORY REFRAME: Replace all failure language with "Pragmatic Builder" narrative. "You didn\'t fail the system; the system failed you. Escape the rat race and come build real tech."',
      };
      report.overallScore -= severity === 'CRITICAL' ? 3 : 1;
    }
  });

  const capabilityTriggers = [
    { pattern: /student(s)?\\s+(will|should|can)\\s+(edit|produce|create|manage|run|lead|direct)/gi, label: 'Assumes students can independently execute' },
    { pattern: /\\b(student-led|student-run|student-managed)\\b/gi, label: 'Assumes student-led execution' },
    { pattern: /\\b(video\\s+edit|edit\\s+video|edit\\s+reel|produce\\s+content)\\b/gi, label: 'Assumes video production capability' },
    { pattern: /\\b(data\\s+analy|analytics\\s+dashboard|track\\s+metrics)\\b/gi, label: 'Assumes data analysis capability' },
    { pattern: /\\b(social\\s+media\\s+strategy|content\\s+calendar\\s+management)\\b/gi, label: 'Assumes marketing strategy capability' },
  ];

  capabilityTriggers.forEach(({ pattern, label }) => {
    if (pattern.test(textLower)) {
      report.blockerC = {
        status: '⚠️',
        severity: 'MEDIUM',
        findings: [...report.blockerC.findings, label],
        hack: 'Add Pit Crew responsibility: Marketing team must script, direct, and quality-check all student-facing output. Students execute under supervision, never independently.',
      };
      report.overallScore -= 1;
    }
  });

  if (startDate && targetState && STATE_PROFILES[targetState]) {
    const m = startDate.getMonth() + 1;
    NATIONAL_FESTIVALS.forEach(f => {
      if (f.month === m && f.impact !== 'low') {
        report.hiddenBlockers.push({
          type: 'FESTIVAL',
          label: f.name,
          severity: f.impact === 'high' ? 'HIGH' : 'MEDIUM',
          message: `${f.name} falls in this period. ${f.note}`,
        });
        report.overallScore -= f.impact === 'high' ? 1 : 0.5;
      }
    });
  }

  report.overallScore = Math.max(0, Math.min(10, Math.round(report.overallScore)));

  return report;
}
