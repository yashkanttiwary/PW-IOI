'use client';

import React from 'react';
import { useAppStore } from '../../store/appStore';
import { 
  Home, 
  BarChart2, 
  Calendar, 
  Map, 
  BrainCircuit, 
  FlaskConical, 
  ShieldAlert, 
  CheckSquare 
} from 'lucide-react';
import { THEME } from '../../engine/constants/theme';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'funnel_command', label: 'Funnel Command', icon: BarChart2 },
  { id: 'event_builder', label: 'Event Builder', icon: Calendar },
  { id: 'campaign_architect', label: 'Campaign Architect', icon: Map },
  { id: 'persona_lab', label: 'Persona Lab', icon: BrainCircuit },
  { id: 'ab_test', label: 'A/B Test Studio', icon: FlaskConical },
  { id: 'blocker_radar', label: 'Blocker Radar', icon: ShieldAlert },
  { id: 'campaign_auditor', label: 'Campaign Auditor', icon: CheckSquare },
];

export default function Sidebar() {
  const { state, dispatch } = useAppStore();

  return (
    <div className="w-64 h-full bg-[#111111] border-r border-[#333] flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: THEME.colors.primary }}>
          ION <span className="text-white text-sm font-normal ml-2">by PW IOI</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const isActive = state.currentModule === mod.id;
          
          return (
            <button
              key={mod.id}
              onClick={() => dispatch({ type: 'SET_MODULE', payload: mod.id })}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors \${
                isActive 
                  ? 'bg-[#1A4FBF] text-white' 
                  : 'text-[#A0A0A0] hover:bg-[#252525] hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#00F5FF]' : ''} />
              <span className="font-medium">{mod.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#333] text-xs text-[#A0A0A0]">
        ION v2.0 • Marketing Command
      </div>
    </div>
  );
}
