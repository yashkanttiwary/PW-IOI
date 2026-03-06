'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

function isPrimitive(v: any) {
  return ['string', 'number', 'boolean'].includes(typeof v) || v === null;
}

function tryParseJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function prettyLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function FormattedAIOutput({ text, blockerReport }: { text: string; blockerReport?: any }) {
  const parsed = tryParseJson(text);

  if (!parsed) {
    return (
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 prose prose-invert max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    );
  }

  const data = Array.isArray(parsed) ? { result: parsed } : parsed;
  const keys = Object.keys(data);

  return (
    <div className="space-y-4">
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider">Structured Output (Auto-formatted)</h3>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(JSON.stringify(parsed, null, 2))}
            className="text-xs px-2 py-1 rounded border border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#00F5FF]"
          >
            Copy JSON
          </button>
        </div>
      </div>

      {blockerReport && (
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
          <div className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-3">Blocker Snapshot</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span>A: <span className="font-bold">{blockerReport.blockerA?.status || '—'}</span></span>
            <span>B: <span className="font-bold">{blockerReport.blockerB?.status || '—'}</span></span>
            <span>C: <span className="font-bold">{blockerReport.blockerC?.status || '—'}</span></span>
            <span className="text-[#A0A0A0]">Score: {blockerReport.overallScore ?? '—'}/10</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {keys.map((k) => {
          const value = data[k];
          const primitive = isPrimitive(value);

          return (
            <div key={k} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
              <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-2">{prettyLabel(k)}</div>
              {primitive ? (
                <div className="text-white whitespace-pre-wrap">{String(value)}</div>
              ) : (
                <details>
                  <summary className="cursor-pointer text-[#00F5FF] text-sm">Expand section</summary>
                  <pre className="mt-3 bg-[#111111] border border-[#333] rounded-lg p-3 text-xs overflow-auto whitespace-pre-wrap text-[#D4D4D4]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
