'use client';

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function GlobalBlockerSummary() {
  const { state } = useAppStore();

  const recentWithBlockers = (state.savedPlans || []).filter((p: any) => p.blockerReport).slice(0, 4);

  if (!recentWithBlockers.length) {
    return (
      <div className="px-6 py-2 border-b border-[#222] bg-[#0A0A0A] text-xs text-[#777]">
        Global Blocker Summary: No scans yet. Generate any Funnel/Event/Campaign plan to auto-populate blocker status.
      </div>
    );
  }

  return (
    <div className="px-6 py-2 border-b border-[#222] bg-[#0A0A0A] flex flex-wrap gap-4 text-xs">
      <span className="text-[#A0A0A0] font-semibold">Global Blocker Summary:</span>
      {recentWithBlockers.map((p: any, idx: number) => (
        <span key={`${p.id || idx}`} className="text-[#D4D4D4]">
          {(p.type || p.mode || 'plan').toUpperCase()} → A:{p.blockerReport.blockerA?.status || '—'} B:{p.blockerReport.blockerB?.status || '—'} C:{p.blockerReport.blockerC?.status || '—'}
        </span>
      ))}
    </div>
  );
}
