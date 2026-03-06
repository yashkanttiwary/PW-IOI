import { runBlockerScan } from '../blocker/blockerDetector';
import { callAI } from '../ai/client';
import { BRAND_SYSTEM_PROMPT } from '../ai/brandSystemPrompt';
import { getModulePrompt } from '../ai/promptRouter';
import { parseAIResponse } from '../ai/responseParser';

export async function runAutoAudit(planText: string, auditContext: any = {}) {
  const clientChecks = {
    blockers: auditContext.blockerReport || runBlockerScan({
      planText,
      startDate: auditContext.startDate || new Date(),
      targetState: auditContext.targetState || null,
    }),
    hasDataCapture: /qr|lead\\s+capture|sign\\s*up|register|form|playbook|vip\\s+pass/i.test(planText),
    hasDualAudience: /student\\s+hook|parent\\s+close|\\[student\\]|\\[parent\\]/i.test(planText),
    hasFunnelRef: /tofu|mofu|bofu|views.*signup|signup.*app|app.*cee|funnel/i.test(planText),
  };

  const aiResult = await callAI({
    module: 'auto_audit',
    systemPrompt: BRAND_SYSTEM_PROMPT,
    modulePrompt: getModulePrompt('auto_audit'),
    messages: [{ role: 'user', content: `Audit this plan:\\n\\n${planText.slice(0, 3000)}` }],
  });

  const parsed = parseAIResponse(aiResult.text, 'audit_line');

  return {
    ...clientChecks,
    aiScores: parsed.success ? parsed.data : null,
    bar: aiResult.text, 
    timestamp: new Date().toISOString(),
  };
}
