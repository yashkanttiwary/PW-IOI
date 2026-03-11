import React from 'react';
import { THEME } from '../../engine/constants/theme';
import { formatINR, formatNumber } from '../../utils/formatCurrency';

export default function BoardSummaryCard({ data }: { data: Record<string, any> }) {
  if (!data) return null;

  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 relative overflow-hidden mb-6">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00F5FF]"></div>
      
      <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-4">📋 Board Summary</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <div className="text-xs text-[#A0A0A0] mb-1">Goal / Target</div>
          <div className="text-xl font-bold text-white">
            {data.goal || `${formatNumber(data.targetAdmissions || data.funnel?.totalAdmissions)} Admissions`}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-[#A0A0A0] mb-1">Total Budget</div>
          <div className="text-xl font-bold text-[#00F5FF] font-mono">
            {formatINR(data.budget?.totals?.totalBudget || data.budget)}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-[#A0A0A0] mb-1">Target CAC</div>
          <div className="text-xl font-bold text-white font-mono">
            {data.cac?.formatted || formatINR(data.budget?.totals?.cac)}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-[#A0A0A0] mb-1">Confidence</div>
          <div className="text-xl font-bold">
            {data.cac?.isHealthy ? '🟢 HIGH' : '🟡 MEDIUM'}
          </div>
        </div>
      </div>
      
      {data.blockerReport && (
        <div className="mt-6 pt-4 border-t border-[#333] flex items-center space-x-4">
          <span className="text-sm text-[#A0A0A0]">Blockers:</span>
          <span className="text-sm">A: {data.blockerReport.blockerA.status}</span>
          <span className="text-sm">B: {data.blockerReport.blockerB.status}</span>
          <span className="text-sm">C: {data.blockerReport.blockerC.status}</span>
        </div>
      )}
    </div>
  );
}
