'use client';

import React from 'react';
import { useAppStore } from '../../store/appStore';

function toSummaryItem(source: string, label: string, blockerReport: any, key: string) {
  if (!blockerReport) return null;
  return {
    key,
    source,
    label,
    blockerReport,
  };
}

export default function GlobalBlockerSummary() {
  const { state } = useAppStore();

  const items = [
    toSummaryItem(
      'Current',
      state.activeConversation?.currentPlan?.type || state.currentModule,
      state.activeConversation?.currentPlan?.blockerReport,
      'current'
    ),
    ...(state.blockerScans || []).map((scan: any, idx: number) => toSummaryItem('Radar', scan.label || 'manual_scan', scan.report, `scan_${idx}`)),
    ...(state.savedPlans || []).map((p: any, idx: number) => toSummaryItem('Plan', p.type || p.mode || 'plan', p.blockerReport, `plan_${idx}`)),
    ...(state.auditHistory || []).map((a: any, idx: number) => toSummaryItem('Audit', 'campaign_audit', a.blockerReport, `audit_${idx}`)),
  ].filter(Boolean).slice(0, 8) as any[];

  if (!items.length) {
    return (
      <div className="px-6 py-2 border-b border-[#222] bg-[#0A0A0A] text-xs text-[#777]">
        Global Blocker Summary: No scans yet. Generate Funnel/Event/Campaign or run Blocker Radar to populate statuses.
      </div>
    );
  }

  return (
    <div className="px-6 py-2 border-b border-[#222] bg-[#0A0A0A] flex flex-wrap gap-3 text-xs">
      <span className="text-[#A0A0A0] font-semibold">Global Blocker Summary:</span>
      {items.map((item) => (
        <span key={item.key} className="text-[#D4D4D4]">
          [{item.source}] {String(item.label).toUpperCase()} → A:{item.blockerReport.blockerA?.status || '—'} B:{item.blockerReport.blockerB?.status || '—'} C:{item.blockerReport.blockerC?.status || '—'}
        </span>
      ))}
    </div>
  );
}
