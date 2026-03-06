'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

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

function RenderValue({ value, depth = 0 }: { value: any; depth?: number }) {
  if (value === null || value === undefined) {
    return <span className="text-[#777]">—</span>;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <div className="text-white whitespace-pre-wrap">{String(value)}</div>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((item, idx) => (
          <div key={idx} className="bg-[#111111] border border-[#333] rounded-lg p-3">
            <RenderValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  const entries = Object.entries(value);

  return (
    <div className={`grid gap-3 ${depth === 0 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
      {entries.map(([k, v]) => (
        <div key={k} className="bg-[#111111] border border-[#333] rounded-lg p-3">
          <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">{prettyLabel(k)}</div>
          <RenderValue value={v} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
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

      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4">
        <RenderValue value={parsed} />
      </div>
    </div>
  );
}
