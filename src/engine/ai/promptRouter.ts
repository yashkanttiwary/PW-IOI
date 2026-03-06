import { CONVERSION_BENCHMARKS } from '../constants/benchmarks';
import { STATE_PROFILES } from '../constants/stateProfiles';

export function getModulePrompt(moduleId: string, context: any = {}) {
  const prompts: Record<string, string> = {
    funnel_command: `
MODULE ACTIVE: FUNNEL COMMAND

You are now in funnel projection mode. The user wants conversion numbers, budget projections, or CAC analysis.

CURRENT CONTEXT:
- Calendar Phase: ${context.calendarPhase?.label || 'Unknown'}
- Active Blockers: ${context.blockers || 'None detected'}
${context.targetAdmissions ? `- Target Admissions: ${context.targetAdmissions}` : ''}
${context.budget ? `- Budget: ₹${context.budget.toLocaleString('en-IN')}` : ''}

OUTPUT REQUIREMENTS:
1. ALWAYS start with Board Summary Card (Goal, Budget, Timeline, CAC, Confidence).
2. ALWAYS include the full Funnel Projection Table (Views → Signup → App → CEE → Interview → Admission) with volumes, conversion rates, drop-offs, and cost-per-unit.
3. ALWAYS include the Waterfall Visualization showing progressive volume reduction.
4. ALWAYS include Cost Breakdown by Funnel Stage with line items and percentages.
5. ALWAYS include Channel-wise Breakdown showing which channels serve which funnel stages.
6. If comparing scenarios, show Optimistic / Realistic / Conservative side by side.
7. Include Sensitivity Analysis: "If X drops by Y%, then Z."
8. Include Risk Register with funnel-stage-specific risks.
9. Mark all estimates with 🔶 and data-backed numbers with ✅.
10. Mark unknowns with 🔴 DATA NEEDED.

CONVERSION BENCHMARKS TO USE (${context.scenario || 'realistic'} scenario):
Views→Signup: ${CONVERSION_BENCHMARKS.views_to_signup[context.scenario as keyof typeof CONVERSION_BENCHMARKS.views_to_signup || 'realistic'].label}
Footfall→Signup: ${CONVERSION_BENCHMARKS.footfall_to_signup[context.scenario as keyof typeof CONVERSION_BENCHMARKS.footfall_to_signup || 'realistic'].label}
Signup→App: ${CONVERSION_BENCHMARKS.signup_to_app[context.scenario as keyof typeof CONVERSION_BENCHMARKS.signup_to_app || 'realistic'].label}
App→CEE: ${CONVERSION_BENCHMARKS.app_to_cee[context.scenario as keyof typeof CONVERSION_BENCHMARKS.app_to_cee || 'realistic'].label}
CEE→Interview: ${CONVERSION_BENCHMARKS.cee_to_interview[context.scenario as keyof typeof CONVERSION_BENCHMARKS.cee_to_interview || 'realistic'].label}
Interview→Admission: ${CONVERSION_BENCHMARKS.interview_to_admission[context.scenario as keyof typeof CONVERSION_BENCHMARKS.interview_to_admission || 'realistic'].label}

Use these unless the user specifies custom rates.

Format all ₹ amounts in Indian numbering (lakhs, crores). Example: ₹5,50,000 not ₹550,000.
`,

    event_builder: `
MODULE ACTIVE: EVENT BUILDER

You are now in event planning mode. The user wants a complete, executable event plan.

CURRENT CONTEXT:
- Calendar Phase: ${context.calendarPhase?.label || 'Unknown'}
- Blocker Status: ${JSON.stringify(context.blockerReport || 'Not yet scanned')}
${context.eventType ? `- Event Type: ${context.eventType}` : ''}
${context.campus ? `- Campus: ${context.campus}` : ''}
${context.budget ? `- Budget: ₹${context.budget.toLocaleString('en-IN')}` : ''}

OUTPUT REQUIREMENTS (ALL sections mandatory, in this order):
1. BOARD SUMMARY CARD — Event name, type, campus, date, budget, footfall target, funnel impact (signups→apps→admissions), CAC contribution, blocker status.
2. EVENT OVERVIEW — Format, duration, venue, student experience flow, parent experience flow.
3. OBJECTIVES & KPIs — Table with KPI, target number, measurement method, funnel stage.
4. OPS TIMELINE — T-minus table from T-30 to T+7 with: Task, Owner (specific role), Tools/Resources, Estimated Cost, Status checkbox.
5. PIT CREW vs. STUDENT CLUB SPLIT — Table showing every task category, who handles it, what support is needed. (BLOCKER C COMPLIANCE — mandatory.)
6. LEAD CAPTURE STRATEGY — Table of touchpoints, mechanisms, data captured, friction level.
7. PARENTAL CONVERSION LAYER — ROI Lounge setup, talking points, collateral list.
8. BUDGET BREAKDOWN — Line items with estimated cost, % of total, notes.
9. COST EFFICIENCY METRICS — Cost per footfall, cost per lead, cost per app, CAC contribution.
10. BLOCKER ANALYSIS — A/B/C status with specific hacks.
11. CREATIVE BRIEF — Visual direction, content angles, copy tone.
12. POST-EVENT FOLLOW-UP SLA — Action, timeline, owner, tool.

Every cost must be estimated in ₹ ranges. No vague "arrange as needed."
Every task must have an OWNER (not "team" — specify which team member role).
`,

    campaign_architect: `
MODULE ACTIVE: CAMPAIGN ARCHITECT

You are building a complete, multi-channel marketing campaign plan.

CURRENT CONTEXT:
- Calendar Phase: ${context.calendarPhase?.label || 'Unknown'}
- Target Geography: ${context.states?.join(', ') || 'Not specified'}
${context.budget ? `- Budget: ₹${context.budget.toLocaleString('en-IN')}` : ''}
${context.goal ? `- Campaign Goal: ${context.goal}` : ''}

STATE-SPECIFIC DATA FOR THIS CAMPAIGN:
${context.states?.map((s: string) => {
  const p = STATE_PROFILES[s];
  return p ? `
${s}: Language=${p.language.primary}, JEE=${p.jeeIntensity}, Parent=${p.parentArchetype}, Channels=${JSON.stringify(p.channelMix)}, Reframe="${p.reframeAngle.en}"
` : '';
}).join('') || 'No states selected — ask user.'}

OUTPUT REQUIREMENTS (ALL sections mandatory):
1. BOARD SUMMARY CARD
2. STRATEGY SPINE — Positioning, [STUDENT HOOK], [PARENT CLOSE], core message.
3. FUNNEL PROJECTION TABLE — Full Views→Admission with all metrics.
4. CHANNEL MIX TABLE — Channel, Tactic, Funnel Stage, Budget, Expected Output, Cost/Unit.
5. CONTENT CALENDAR (4-week) — Day-by-day with Platform, Format, Hook, CTA, Lead capture, Funnel stage.
6. STATE-WISE TARGETING — For each selected state: language, JEE intensity, parent archetype, price perception, channel variation, cultural landmines, recommended personas, local tactic.
7. ACQUISITION FUNNEL MAP — Stage-by-stage with tactic, metric, conversion assumption.
8. RISK REGISTER — Min 5 risks with funnel stage, probability, impact, mitigation, cost.
9. "HOW WILL THIS HAPPEN?" OPS PLAN — For each major tactic: who executes, what they need, how measured, what goes wrong, backup.
10. BUDGET BREAKDOWN by channel AND by funnel stage.

THE DUAL AUDIENCE RULE IS CRITICAL HERE: Every campaign element must clearly label [STUDENT HOOK] and [PARENT CLOSE]. If any section misses one side, flag it yourself.
`,

    persona_simulate: `
MODULE ACTIVE: PERSONA SIMULATION

You are now simulating one or more audience personas reacting to marketing material.

PERSONA DATA:
${context.personas?.map((p: any) => `
${p.id} — ${p.name}:
  Psychology: ${p.psychology}
  Hooks: ${p.hooks}
  Repels: ${p.repels}
  Decision: ${p.decisionStyle}
  Parent Gate: ${p.parentGate}
`).join('\\n') || 'No personas selected'}

MATERIAL BEING TESTED:
[Will be provided in user message]

OUTPUT FORMAT (for EACH persona):
{
  "personaId": "S1",
  "personaName": "Arjun",
  "firstReaction": "What they think in the first 3 seconds",
  "internalThought": "What they actually think after reading fully",
  "saysToFriend": "How they'd describe this to a friend",
  "converts": "YES | MAYBE | NO",
  "conversionReason": "Why",
  "whatWouldChangeMind": "Specific change that would flip them",
  "funnelStageImpact": "Which funnel stage this moves",
  "objection": "Primary objection if NO/MAYBE"
}

THEN provide a SUMMARY:
{
  "studentResonance": 0-10,
  "parentResonance": 0-10,
  "dualAudienceAlignment": "ALIGNED | PARTIAL | MISMATCHED",
  "funnelStageMostImpacted": "TOFU | MOFU | BOFU",
  "topFix": "1-2 sentence recommendation"
}

Respond ONLY in valid JSON. No markdown. No preamble.
`,

    ab_test: `
MODULE ACTIVE: A/B TEST STUDIO

You are scoring and comparing campaign variants.

SCORING RUBRIC (weighted):
- Student Hook Strength: weight ×2.0
- Parent Trust Signal: weight ×2.0
- Brand Voice Alignment: weight ×1.5
- Lead Capture Friction [reversed]: weight ×1.5
- FOMO Trigger: weight ×1.0
- Clarity: weight ×1.0
Total possible: 90 weighted points

For each variant, score each dimension 0-10, apply weights, sum.

BLOCKER B CHECK: Scan each variant for stigma/failure language.
BRAND VOICE CHECK: Does it sound like a builder or a bureaucrat?

OUTPUT FORMAT:
{
  "variants": [
    {
      "id": "A",
      "scores": {
        "studentHook": { "raw": 7, "weighted": 14 },
        "parentTrust": { "raw": 5, "weighted": 10 },
        "brandVoice": { "raw": 8, "weighted": 12 },
        "leadCaptureFriction": { "raw": 6, "weighted": 9 },
        "fomo": { "raw": 7, "weighted": 7 },
        "clarity": { "raw": 8, "weighted": 8 }
      },
      "total": 60,
      "blockerBFlag": false,
      "antiPatterns": []
    }
  ],
  "winner": "B",
  "winnerReason": "...",
  "runnerUp": "A",
  "borrowFrom": "Borrow X element from A",
  "synthesizedBest": "Rewritten combined version..."
}

Respond in valid JSON.
`,

    campaign_auditor: `
MODULE ACTIVE: CAMPAIGN AUDITOR

Score the submitted plan/copy against 10 IOI-specific dimensions.

DIMENSIONS (each scored 0-10):
1. Brand Voice (Builder, not bureaucrat)
2. Student Hook Strength (grabs 17-year-old in 3 seconds?)
3. Parent Close Strength (makes parent feel safe spending ₹8L?)
4. Lead Capture Mechanics (frictionless data harvesting present?)
5. Blocker Compliance (A+B+C all clear?)
6. Stigma Reframe Quality (no failure language? proper reframe?)
7. Visual/Tone Guideline Match (dark mode, gritty, no stock images?)
8. Indian Psychology Fit (regional awareness, dual decision-maker?)
9. Funnel Stage Clarity (maps to Views→Admission?)
10. Ops Feasibility (can 5-person team + clubs execute this?)

OVERALL SCORE: Sum of all dimensions = __/100

OUTPUT FORMAT:
{
  "overallScore": 72,
  "dimensions": [
    { "id": 1, "name": "Brand Voice", "score": 7, "evidence": "..." }
  ],
  "criticalFailures": [{ "dimension": "...", "score": 4, "fix": "..." }],
  "quickWins": ["...", "...", "..."],
  "blockerScan": { "a": "✅", "b": "⚠️", "c": "✅", "details": "..." },
  "funnelAlignment": "This campaign serves TOFU. Missing: clear path to MOFU capture.",
  "costRealityCheck": "Estimated cost: ₹___. At realistic conversion, expect ___ admissions. CAC: ₹___.",
  "improvedVersion": "... full rewrite with [CHANGED: reason] markers ..."
}

Respond in valid JSON.
`,

    auto_audit: `
Run a LITE AUDIT on the most recently generated output. Score 6 core dimensions only.
Output a single line in this exact format:

Hook: X/10 | Trust: X/10 | Dual: ✅/⚠️ | Blockers: A[✅/⚠️/🚫] B[✅/⚠️/🚫] C[✅/⚠️/🚫] | Funnel: [TOFU/MOFU/BOFU] | Data Capture: ✅/⚠️ | CAC: ₹___ | Overall: XX/100 | Flags: [issues]

Nothing else. Just the one-line bar.
`,
  };

  return prompts[moduleId] || '';
}
