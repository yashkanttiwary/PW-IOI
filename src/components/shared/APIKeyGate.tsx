'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { callAI } from '../../engine/ai/client';

export default function APIKeyGate() {
  const { state, dispatch } = useAppStore();
  const [apiKey, setApiKey] = useState(state.aiConfig?.apiKey || '');
  const [model, setModel] = useState(state.aiConfig?.model || 'gemini-2.5-flash');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState('');

  const saveConfig = () => {
    const trimmed = apiKey.trim();

    if (!trimmed) {
      setError('Please enter a Gemini API key to continue.');
      return;
    }

    dispatch({
      type: 'SET_AI_CONFIG',
      payload: { apiKey: trimmed, model: model.trim() || 'gemini-2.5-flash' },
    });
    dispatch({ type: 'CLOSE_AI_GATE' });
    setError('');
  };

  const testConnection = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Please enter an API key before testing.');
      return;
    }

    setTesting(true);
    setError('');
    setTestStatus('Testing AI connection...');

    const result = await callAI({
      module: 'dashboard',
      apiKey: trimmed,
      model: model.trim() || 'gemini-2.5-flash',
      systemPrompt: 'You are a connectivity checker.',
      modulePrompt: 'Return exactly: CONNECTION_OK',
      messages: [{ role: 'user', content: 'Respond with CONNECTION_OK' }],
    });

    if (result.success && result.text?.toUpperCase().includes('CONNECTION_OK')) {
      setTestStatus('✅ Connection successful. You can save and continue.');
    } else if (result.success) {
      setTestStatus('✅ API call worked. Save and continue.');
    } else {
      setTestStatus('');
      setError(result.error || 'Connection failed. Please verify your key and model.');
    }

    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-[#333] rounded-2xl p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-2">
            ION <span className="text-[#1A4FBF]">by PW IOI</span>
          </h1>
          <p className="text-[#A0A0A0] mb-6">
            Enter your Gemini API key to unlock all AI modules. Funnel math and blocker detection still run client-side,
            while strategy and recommendations use Gemini.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#00F5FF] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-2">Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemini-2.5-flash"
                className="w-full bg-[#0D0D0D] border border-[#333] rounded-lg px-4 py-3 text-white focus:border-[#00F5FF] outline-none"
              />
              <p className="text-xs text-[#A0A0A0] mt-2">Recommended for testing: gemini-2.5-flash. You can also enter Pro or any Gemini model available on your key.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {['gemini-2.5-flash', 'gemini-2.5-pro'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    type="button"
                    className={`px-2.5 py-1 text-xs rounded border ${model === m ? 'border-[#00F5FF] text-[#00F5FF]' : 'border-[#333] text-[#A0A0A0]'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/30 rounded-lg p-3">
                {error}
              </div>
            )}
            {testStatus && <div className="text-sm text-[#00F5FF]">{testStatus}</div>}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={testConnection}
                disabled={testing}
                className="px-4 py-3 rounded-lg border border-[#00F5FF] text-[#00F5FF] hover:bg-[#00F5FF]/10 disabled:opacity-60"
              >
                {testing ? 'Testing...' : 'Test AI Connection'}
              </button>
              <button
                onClick={saveConfig}
                className="px-4 py-3 rounded-lg bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-semibold"
              >
                Save & Enter ION
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] border border-[#333] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">How to get your Gemini API key</h2>
          <ol className="list-decimal pl-5 space-y-3 text-[#D4D4D4]">
            <li>Open Google AI Studio.</li>
            <li>Sign in with your Google account.</li>
            <li>Go to API keys and click <span className="text-white font-semibold">Create API key</span>.</li>
            <li>Copy the generated key and paste it here.</li>
            <li>Keep this key private. Do not share publicly.</li>
          </ol>

          <div className="mt-6 p-4 rounded-lg bg-[#0D0D0D] border border-[#333] text-sm text-[#A0A0A0]">
            <div className="text-white font-semibold mb-2">If test shows quota exceeded (429)</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Switch model to <span className="text-white">gemini-2.5-flash</span> and retest.</li>
              <li>Check Gemini usage/billing in AI Studio for this key/project.</li>
              <li>Wait for quota reset and retry.</li>
            </ul>
          </div>

          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-6 text-[#00F5FF] hover:underline"
          >
            Open Google AI Studio API Keys →
          </a>

          <div className="mt-8 p-4 rounded-lg bg-[#0D0D0D] border border-[#333] text-sm text-[#A0A0A0]">
            <div className="text-white font-semibold mb-2">Security note</div>
            Your key is stored in your browser local storage for this app session and device.
          </div>
        </div>
      </div>
    </div>
  );
}
