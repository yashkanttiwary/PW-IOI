import { GoogleGenAI } from '@google/genai';

const MODULE_CONFIG: Record<string, any> = {
  dashboard:         { maxTokens: 500,  temp: 0.2, stream: false },
  funnel_command:    { maxTokens: 4000, temp: 0.2, stream: true  },
  event_builder:     { maxTokens: 6000, temp: 0.3, stream: true  },
  campaign_architect:{ maxTokens: 8000, temp: 0.3, stream: true  },
  persona_lab:       { maxTokens: 2000, temp: 0.5, stream: false },
  persona_simulate:  { maxTokens: 1500, temp: 0.6, stream: false },
  ab_test:           { maxTokens: 3000, temp: 0.3, stream: false  },
  blocker_radar:     { maxTokens: 2000, temp: 0.1, stream: false },
  campaign_auditor:  { maxTokens: 4000, temp: 0.2, stream: false  },
  auto_audit:        { maxTokens: 500,  temp: 0.1, stream: false },
  copy_generator:    { maxTokens: 1500, temp: 0.7, stream: false },
};

function getRuntimeAIConfig(passedApiKey?: string, passedModel?: string) {
  const browserApiKey = typeof window !== 'undefined' ? localStorage.getItem('ion_api_key') : '';
  const browserModel = typeof window !== 'undefined' ? localStorage.getItem('ion_ai_model') : '';

  return {
    apiKey: passedApiKey || browserApiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    model: passedModel || browserModel || process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash',
  };
}

function parseGeminiError(err: any) {
  const rawMessage = err?.message || 'Unknown error';
  let parsed: any = null;

  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    parsed = null;
  }

  const message = parsed?.error?.message || rawMessage;
  const status = parsed?.error?.status || null;
  const code = parsed?.error?.code || null;
  const retryInfo = parsed?.error?.details?.find((d: any) => d?.['@type']?.includes('RetryInfo'));
  const retryDelay = retryInfo?.retryDelay || null;
  const lowerMessage = String(message).toLowerCase();

  if (status === 'RESOURCE_EXHAUSTED' || code === 429 || lowerMessage.includes('quota')) {
    const friendly = [
      'Quota limit reached for this model/key.',
      'Try gemini-2.5-flash, wait for quota reset, or enable billing in Google AI Studio.',
      retryDelay ? `Retry suggested after: ${retryDelay}.` : null,
    ].filter(Boolean).join(' ');

    return { message: friendly, details: message, code, status, retryDelay };
  }

  return { message, details: message, code, status, retryDelay };
}

export async function callAI({ module, systemPrompt, modulePrompt, messages, apiKey, model }: any) {
  const config = MODULE_CONFIG[module] || MODULE_CONFIG.dashboard;
  const startTime = Date.now();

  try {
    const runtime = getRuntimeAIConfig(apiKey, model);

    if (!runtime.apiKey) {
      throw new Error('Missing Gemini API key. Open AI Settings and add your key.');
    }

    const ai = new GoogleGenAI({ apiKey: runtime.apiKey });

    const fullSystemInstruction = systemPrompt + '\n\n' + modulePrompt;
    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: runtime.model,
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: config.temp,
      },
    });

    return {
      success: true,
      data: response,
      text: response.text || '',
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error(`ION AI call failed [${module}]:`, err);
    const parsedError = parseGeminiError(err);

    return {
      success: false,
      data: null,
      text: '',
      error: parsedError.message,
      errorDetails: parsedError,
      latencyMs: Date.now() - startTime,
    };
  }
}
