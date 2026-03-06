import { projectFunnelForward, projectFunnelReverse, compareScenarios } from './funnel/funnelEngine';
import { calculateBudgetAllocation, calculateCAC } from './funnel/costEngine';
import { runBlockerScan } from './blocker/blockerDetector';
import { buildContext } from './ai/contextBuilder';
import { callAI } from './ai/client';
import { BRAND_SYSTEM_PROMPT } from './ai/brandSystemPrompt';
import { getModulePrompt } from './ai/promptRouter';
import { runAutoAudit } from './audit/autoAudit';
import { STATE_PROFILES } from './constants/stateProfiles';
import { parseAIResponse } from './ai/responseParser';
import { PERSONA_STORE } from './persona/personaStore';
import { compareVariants } from './abTest/scorer';
import { normalizeStateKey } from './constants/stateMapping';

function getAIArgs(appState: any) {
  return {
    apiKey: appState?.aiConfig?.apiKey,
    model: appState?.aiConfig?.model,
  };
}

export async function orchestrateFunnelCommand(mode: string, userInput: any, appState: any, dispatch: any) {
  let funnelData: any;

  switch (mode) {
    case 'full_semester':
    case 'campaign_slice':
    case 'event_roi':
      funnelData = projectFunnelForward({
        tofuVolume: userInput.tofuVolume,
        channel: userInput.channel || 'blended',
        scenario: userInput.scenario || 'realistic',
        overrides: userInput.customRates || {},
      });
      break;

    case 'reverse':
      funnelData = projectFunnelReverse({
        targetAdmissions: userInput.targetAdmissions,
        channel: userInput.channel || 'blended',
        scenario: userInput.scenario || 'realistic',
      });
      break;

    case 'compare':
      funnelData = compareScenarios({
        tofuVolume: userInput.tofuVolume,
        channel: userInput.channel || 'blended',
      });
      break;
  }

  let budgetData = null;
  if (userInput.budget && funnelData.stages) {
    budgetData = calculateBudgetAllocation({
      totalBudget: userInput.budget,
      channelMix: userInput.channelMix || STATE_PROFILES[userInput.states?.[0]]?.channelMix || {},
      funnelProjection: funnelData,
    });
  }

  const cacData = calculateCAC(
    userInput.budget || 0,
    mode === 'reverse' ? userInput.targetAdmissions : funnelData.totalAdmissions
  );

  const ctx = buildContext('funnel_command', appState, userInput);
  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'funnel_command',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('funnel_command', {
      ...ctx,
      computedFunnel: JSON.stringify(funnelData),
      computedBudget: JSON.stringify(budgetData),
      computedCAC: cacData.formatted,
    }),
    messages: [{ role: 'user', content: userInput.brief || `Generate a ${mode} funnel projection for ${userInput.targetAdmissions || userInput.tofuVolume} with budget ₹${userInput.budget?.toLocaleString('en-IN') || 'TBD'}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const result = {
    mode,
    funnel: funnelData,
    budget: budgetData,
    cac: cacData,
    aiNarrative: aiResult.text,
    calendarPhase: ctx.calendarPhase,
    blockerReport: ctx.blockerReport,
    timestamp: new Date().toISOString(),
  };

  dispatch({ type: 'SET_CURRENT_PLAN', payload: result });
  dispatch({ type: 'SAVE_PLAN', payload: { type: 'funnel', ...result } });

  runAutoAudit(aiResult.text, {
    blockerReport: ctx.blockerReport,
    startDate: userInput.targetDate ? new Date(userInput.targetDate) : new Date(),
    aiConfig: appState.aiConfig,
  }).then(audit => dispatch({ type: 'SET_AUTO_AUDIT', payload: audit }));

  return result;
}

export async function orchestrateEventBuilder(userInput: any, appState: any, dispatch: any) {
  const blockerReport = runBlockerScan({
    planText: userInput.brief || '',
    startDate: new Date(userInput.targetDate),
    targetState: normalizeStateKey(userInput.campus), 
  });

  const eventFunnel = projectFunnelForward({
    tofuVolume: userInput.footfallTarget || 500,
    channel: 'offline',
    scenario: 'realistic',
  });

  const eventCAC = calculateCAC(userInput.budget || 0, eventFunnel.totalAdmissions);

  const ctx = buildContext('event_builder', appState, {
    ...userInput,
    blockerReport,
  });

  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'event_builder',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('event_builder', {
      ...ctx,
      computedFunnel: JSON.stringify(eventFunnel),
      computedCAC: eventCAC.formatted,
      blockerReport: JSON.stringify(blockerReport),
    }),
    messages: [{ role: 'user', content: `Plan this event:\n\nType: ${userInput.eventType}\nCampus: ${userInput.campus}\nDate: ${userInput.targetDate}\nBudget: ₹${userInput.budget?.toLocaleString('en-IN') || 'TBD'}\nFootfall Target: ${userInput.footfallTarget || 'TBD'}\nAudience: ${userInput.audience || 'Both'}\n\nBrief: ${userInput.brief || 'No brief provided — generate comprehensive plan.'}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const result = {
    type: 'event',
    eventType: userInput.eventType,
    campus: userInput.campus,
    funnel: eventFunnel,
    budget: userInput.budget,
    cac: eventCAC,
    blockerReport,
    calendarPhase: ctx.calendarPhase,
    aiPlan: aiResult.text,
    timestamp: new Date().toISOString(),
  };

  dispatch({ type: 'SET_CURRENT_PLAN', payload: result });
  dispatch({ type: 'SAVE_PLAN', payload: result });

  runAutoAudit(aiResult.text, { blockerReport, aiConfig: appState.aiConfig }).then(
    audit => dispatch({ type: 'SET_AUTO_AUDIT', payload: audit })
  );

  return result;
}

export async function orchestrateCampaignArchitect(userInput: any, appState: any, dispatch: any) {
  const campaignFunnel = userInput.targetAdmissions
    ? projectFunnelReverse({
        targetAdmissions: userInput.targetAdmissions,
        channel: 'blended',
        scenario: userInput.scenario || 'realistic',
      })
    : projectFunnelForward({
        tofuVolume: userInput.tofuVolume || 50000,
        channel: 'blended',
        scenario: userInput.scenario || 'realistic',
      });

  const primaryState = normalizeStateKey(userInput.states?.[0]);

  const stateMix = primaryState && STATE_PROFILES[primaryState]
    ? STATE_PROFILES[primaryState].channelMix
    : { instagram: 0.25, youtube: 0.25, whatsapp: 0.20, offline: 0.20, meta_ads: 0.10 };

  const budgetAlloc = userInput.budget
    ? calculateBudgetAllocation({
        totalBudget: userInput.budget,
        channelMix: stateMix,
        funnelProjection: campaignFunnel.stages
          ? campaignFunnel
          : projectFunnelForward({ tofuVolume: campaignFunnel.required?.views || 50000 }),
      })
    : null;

  const admissions = campaignFunnel.totalAdmissions || userInput.targetAdmissions;
  const cacData = calculateCAC(userInput.budget || 0, admissions);

  const blockerReport = runBlockerScan({
    planText: userInput.brief || '',
    startDate: userInput.startDate ? new Date(userInput.startDate) : new Date(),
    targetState: primaryState || null,
  });

  const stateIntel = (userInput.states || []).map((s: string) => {
    const normalized = normalizeStateKey(s);

    return {
      state: normalized,
      profile: normalized ? STATE_PROFILES[normalized] || null : null,
    };
  }).filter((s: any) => s.profile);

  const ctx = buildContext('campaign_architect', appState, {
    ...userInput,
    blockerReport,
  });

  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'campaign_architect',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('campaign_architect', {
      ...ctx,
      computedFunnel: JSON.stringify(campaignFunnel),
      computedBudget: JSON.stringify(budgetAlloc),
      computedCAC: cacData.formatted,
      stateIntel: JSON.stringify(stateIntel),
    }),
    messages: [{ role: 'user', content: `Build a campaign:\n\nGoal: ${userInput.goal}\nStates: ${userInput.states?.join(', ')}\nBudget: ₹${userInput.budget?.toLocaleString('en-IN') || 'TBD'}\nTimeline: ${userInput.timeline || 'TBD'} weeks\nAdmission Target: ${userInput.targetAdmissions || 'TBD'}\n\nBrief: ${userInput.brief || 'Generate comprehensive plan.'}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const result = {
    type: 'campaign',
    goal: userInput.goal,
    states: userInput.states,
    funnel: campaignFunnel,
    budget: budgetAlloc,
    cac: cacData,
    blockerReport,
    stateIntel,
    aiPlan: aiResult.text,
    timestamp: new Date().toISOString(),
  };

  dispatch({ type: 'SET_CURRENT_PLAN', payload: result });
  dispatch({ type: 'SAVE_PLAN', payload: result });

  runAutoAudit(aiResult.text, { blockerReport, aiConfig: appState.aiConfig }).then(
    audit => dispatch({ type: 'SET_AUTO_AUDIT', payload: audit })
  );

  return result;
}

export async function orchestratePersonaSimulation(userInput: any, appState: any, dispatch: any) {
  const allPersonas = [...PERSONA_STORE, ...appState.savedPersonas];
  const selected = userInput.personaIds.map((id: string) =>
    allPersonas.find(p => p.id === id)
  ).filter(Boolean);

  const ctx = buildContext('persona_simulate', appState, {
    ...userInput,
    selectedPersonas: userInput.personaIds,
  });

  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'persona_simulate',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('persona_simulate', { ...ctx, personas: selected }),
    messages: [{ role: 'user', content: `React to this material:\n\n${userInput.material}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const parsed = parseAIResponse(aiResult.text, 'json');
  return { success: parsed.success, personas: selected, reactions: parsed.data };
}

export async function orchestrateABTest(userInput: any, appState: any, dispatch: any) {
  const ctx = buildContext('ab_test', appState, userInput);

  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'ab_test',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('ab_test', ctx),
    messages: [{ role: 'user', content: `Score these variants:\n\nVARIANT A:\n${userInput.variantA}\n\nVARIANT B:\n${userInput.variantB}${userInput.variantC ? `\n\nVARIANT C:\n${userInput.variantC}` : ''}\n\nGoal: ${userInput.goal}\nTarget: ${userInput.targetPersona || 'All personas'}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const parsed = parseAIResponse(aiResult.text, 'json');

  if (parsed.success && parsed.data.variants) {
    const validated = parsed.data.variants.map((v: any) => ({
      id: v.id,
      rawScores: {
        studentHook: v.scores?.studentHook?.raw || 5,
        parentTrust: v.scores?.parentTrust?.raw || 5,
        brandVoice: v.scores?.brandVoice?.raw || 5,
        leadCaptureFriction: v.scores?.leadCaptureFriction?.raw || 5,
        fomo: v.scores?.fomo?.raw || 5,
        clarity: v.scores?.clarity?.raw || 5,
      },
      blockerBFlag: v.blockerBFlag,
      antiPatterns: v.antiPatterns,
    }));

    const comparison = compareVariants(validated);

    const result = {
      variants: validated,
      comparison,
      synthesizedBest: parsed.data.synthesizedBest,
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: 'SAVE_AB_TEST', payload: result });
    return result;
  }

  return { success: false, raw: aiResult.text };
}

export async function orchestrateAudit(planText: string, appState: any, dispatch: any) {
  const blockerReport = runBlockerScan({
    planText,
    startDate: new Date(),
    targetState: null,
  });

  const ctx = buildContext('campaign_auditor', appState, { brief: planText });

  const aiResult = await callAI({
    ...getAIArgs(appState),
    module: 'campaign_auditor',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('campaign_auditor', ctx),
    messages: [{ role: 'user', content: `Audit this:\n\n${planText}` }],
  });

  if (!aiResult.success) {
    dispatch({ type: 'SET_AI_ERROR', payload: aiResult.error });
    return { success: false, error: aiResult.error };
  }

  dispatch({ type: 'SET_AI_ERROR', payload: null });

  const parsed = parseAIResponse(aiResult.text, 'json');

  const result = {
    parsed: parsed.success ? parsed.data : null,
    blockerReport,
    raw: aiResult.text,
    timestamp: new Date().toISOString(),
  };

  dispatch({ type: 'SAVE_AUDIT', payload: result });
  return result;
}
