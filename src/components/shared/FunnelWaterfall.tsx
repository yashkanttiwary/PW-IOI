import React from 'react';
import { THEME } from '../../engine/constants/theme';
import { formatNumber, formatPercent } from '../../utils/formatCurrency';

export default function FunnelWaterfall({ stages }: { stages: any[] }) {
  if (!stages || stages.length === 0) return null;

  const maxVolume = stages[0].volume;

  const getTierColor = (id: string) => {
    if (id === 'views') return THEME.colors.tofu;
    if (['signup', 'app', 'cee'].includes(id)) return THEME.colors.mofu;
    return THEME.colors.bofu;
  };

  return (
    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 mb-6">
      <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-6">Funnel Visualization</h3>
      
      <div className="space-y-2">
        {stages.map((stage, index) => {
          const width = Math.max((stage.volume / maxVolume) * 100, 1);
          const color = getTierColor(stage.id);
          
          return (
            <div key={stage.id} className="relative">
              {index > 0 && (
                <div className="flex justify-center my-1 text-xs text-[#A0A0A0]">
                  ↓ {formatPercent(stages[index].rate)} conversion
                </div>
              )}
              
              <div className="flex items-center">
                <div className="w-32 text-sm font-medium text-[#A0A0A0] uppercase">
                  {stage.id}
                </div>
                <div className="flex-1 flex items-center">
                  <div 
                    className="h-8 rounded-r-md transition-all duration-500"
                    style={{ width: `\${width}%`, backgroundColor: color }}
                  ></div>
                  <div className="ml-4 font-mono font-bold text-white">
                    {formatNumber(stage.volume)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
