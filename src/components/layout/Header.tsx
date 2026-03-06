'use client';

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function Header() {
  const { state, dispatch } = useAppStore();
  const phase = state.calendarPhase;

  return (
    <header className="h-16 border-b border-[#333] bg-[#0D0D0D] flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-white capitalize">
          {state.currentModule.replace('_', ' ')}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch({ type: 'OPEN_AI_GATE' })}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#333] text-[#A0A0A0] hover:text-white hover:border-[#00F5FF]"
        >
          AI Settings
        </button>

        {phase && (
          <div
            className="px-4 py-1.5 rounded-full flex items-center space-x-2 border"
            style={{
              backgroundColor: phase.bgColor,
              borderColor: phase.color,
              color: phase.color,
            }}
          >
            <span className="text-sm font-bold tracking-wide">{phase.badge}</span>
          </div>
        )}
      </div>
    </header>
  );
}
