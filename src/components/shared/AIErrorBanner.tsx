'use client';

import React from 'react';
import { useAppStore } from '../../store/appStore';

export default function AIErrorBanner() {
  const { state, dispatch } = useAppStore();

  if (!state.aiError) return null;

  return (
    <div className="px-6 py-2 bg-[#FF9100]/10 border-b border-[#FF9100]/30 text-sm flex items-center justify-between gap-4">
      <span className="text-[#FFD600]">⚠️ AI Error: {state.aiError}</span>
      <button
        onClick={() => dispatch({ type: 'SET_AI_ERROR', payload: null })}
        className="text-xs border border-[#333] rounded px-2 py-1 text-[#A0A0A0] hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
}
