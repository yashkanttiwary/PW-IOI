import { GoogleGenAI } from '@google/genai';

const MODULE_CONFIG: Record<string, { maxTokens: number; temp: number; stream: boolean }> = {
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

export async function callAI({ module, systemPrompt, modulePrompt, messages }: { module: string; systemPrompt: string; modulePrompt: string; messages: { role: string; content: string }[] }) {
  const config = MODULE_CONFIG[module] || MODULE_CONFIG.dashboard;
  const startTime = Date.now();

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    
    // Combine system prompt and module prompt
    const fullSystemInstruction = systemPrompt + '\\n\\n' + modulePrompt;
    
    // Format messages for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: fullSystemInstruction,
        temperature: config.temp,
        // maxOutputTokens: config.maxTokens,
      }
    });

    return {
      success: true,
      data: response,
      text: response.text || '',
      latencyMs: Date.now() - startTime,
    };
  } catch (err: unknown) {
    console.error(`ION AI call failed [\${module}]:`, err);
    return {
      success: false,
      data: null,
      text: '',
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - startTime,
    };
  }
}
