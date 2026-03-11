import { getCalendarPhase } from '../calendar/calendarEngine';
import { runBlockerScan } from '../blocker/blockerDetector';
import { PERSONA_STORE } from '../persona/personaStore';

export function buildContext(moduleId: string, appState: Record<string, any>, userInput: Record<string, any>) {
  const ctx: Record<string, any> = {
    calendarPhase: getCalendarPhase(userInput.targetDate ? new Date(userInput.targetDate) : new Date()),
    blockers: null,
    blockerReport: null,
  };

  if (userInput.targetDate || userInput.startDate) {
    const dateToUse = userInput.targetDate || userInput.startDate;
    ctx.blockerReport = runBlockerScan({
      planText: userInput.brief || '',
      startDate: new Date(dateToUse),
      endDate: userInput.endDate ? new Date(userInput.endDate) : undefined,
      targetState: userInput.states?.[0] || userInput.campus || undefined,
    });
    ctx.blockers = [
      `A:\${ctx.blockerReport.blockerA.status}`,
      `B:\${ctx.blockerReport.blockerB.status}`,
      `C:\${ctx.blockerReport.blockerC.status}`,
    ].join(' ');
  }

  switch (moduleId) {
    case 'funnel_command':
      ctx.targetAdmissions = userInput.targetAdmissions;
      ctx.budget = userInput.budget;
      ctx.scenario = userInput.scenario || 'realistic';
      break;

    case 'event_builder':
      ctx.eventType = userInput.eventType;
      ctx.campus = userInput.campus;
      ctx.budget = userInput.budget;
      ctx.footfallTarget = userInput.footfallTarget;
      break;

    case 'campaign_architect':
      ctx.goal = userInput.goal;
      ctx.states = userInput.states;
      ctx.budget = userInput.budget;
      ctx.timeline = userInput.timeline;
      ctx.admissionTarget = userInput.admissionTarget;
      break;

    case 'persona_simulate':
      ctx.personas = userInput.selectedPersonas?.map((id: string) =>
        PERSONA_STORE.find(p => p.id === id) || appState.savedPersonas?.find((p: { id: string }) => p.id === id)
      ).filter(Boolean);
      break;

    case 'ab_test':
      ctx.personas = userInput.selectedPersonas?.map((id: string) =>
        PERSONA_STORE.find(p => p.id === id) || appState.savedPersonas?.find((p: { id: string }) => p.id === id)
      ).filter(Boolean);
      ctx.testGoal = userInput.testGoal;
      break;

    case 'campaign_auditor':
      ctx.lastPlan = appState.activeConversation?.currentPlan || null;
      break;
  }

  return ctx;
}
