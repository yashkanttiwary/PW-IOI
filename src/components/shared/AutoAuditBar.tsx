import React from 'react';

export default function AutoAuditBar({ audit }: { audit: Record<string, any> }) {
  if (!audit) {
    return (
      <div className="fixed bottom-0 left-64 right-0 bg-[#111111] border-t border-[#333] p-3 flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-[#333] rounded w-24"></div>
          <div className="h-4 bg-[#333] rounded w-32"></div>
          <div className="h-4 bg-[#333] rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-64 right-0 bg-[#111111] border-t border-[#333] p-3 text-sm font-mono text-[#A0A0A0] flex items-center justify-center space-x-4 overflow-x-auto whitespace-nowrap">
      <span className="font-bold text-white">━━━ AUTO-AUDIT ━━━</span>
      <span>Hook: {audit.aiScores?.hook || '?'}/10</span>
      <span>Trust: {audit.aiScores?.trust || '?'}/10</span>
      <span>Dual: {audit.hasDualAudience ? '✅' : '⚠️'}</span>
      <span>Blockers: A[{audit.blockers?.blockerA.status}] B[{audit.blockers?.blockerB.status}] C[{audit.blockers?.blockerC.status}]</span>
      <span>Data Cap: {audit.hasDataCapture ? '✅' : '⚠️'}</span>
      <span>Overall: <span className={audit.aiScores?.overall >= 70 ? 'text-[#00E676]' : 'text-[#FFD600]'}>{audit.aiScores?.overall || '?'}/100</span></span>
    </div>
  );
}
