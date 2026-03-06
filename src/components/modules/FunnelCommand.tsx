import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateFunnelCommand } from '../../engine/orchestrators';
import BoardSummaryCard from '../shared/BoardSummaryCard';
import FunnelWaterfall from '../shared/FunnelWaterfall';
import { formatINR, formatNumber } from '../../utils/formatCurrency';
import ReactMarkdown from 'react-markdown';

export default function FunnelCommand() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('full_semester');
  
  const [formData, setFormData] = useState({
    targetAdmissions: 200,
    tofuVolume: 50000,
    budget: 5000000,
    channel: 'blended',
    scenario: 'realistic',
    brief: ''
  });

  const handleGenerate = async () => {
    setLoading(true);
    await orchestrateFunnelCommand(mode, formData, state, dispatch);
    setLoading(false);
  };

  const plan = state.activeConversation?.currentPlan;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Funnel Command</h1>
        
        <select 
          value={mode} 
          onChange={(e) => setMode(e.target.value)}
          className="bg-[#1A1A1A] border border-[#333] text-white rounded-lg px-4 py-2"
        >
          <option value="full_semester">Full Semester Funnel</option>
          <option value="reverse">Reverse Engineer (from Target)</option>
          <option value="compare">Compare Scenarios</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Parameters</h2>
          
          <div className="space-y-4">
            {mode === 'reverse' ? (
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Target Admissions</label>
                <input 
                  type="number" 
                  value={formData.targetAdmissions}
                  onChange={(e) => setFormData({...formData, targetAdmissions: parseInt(e.target.value)})}
                  className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Starting Volume (Views/Footfall)</label>
                <input 
                  type="number" 
                  value={formData.tofuVolume}
                  onChange={(e) => setFormData({...formData, tofuVolume: parseInt(e.target.value)})}
                  className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Total Budget (₹)</label>
              <input 
                type="number" 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Channel Mix</label>
              <select 
                value={formData.channel}
                onChange={(e) => setFormData({...formData, channel: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="blended">Blended (Online + Offline)</option>
                <option value="online">Online Heavy</option>
                <option value="offline">Offline Heavy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Conversion Scenario</label>
              <select 
                value={formData.scenario}
                onChange={(e) => setFormData({...formData, scenario: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="realistic">Realistic</option>
                <option value="optimistic">Optimistic</option>
                <option value="conservative">Conservative</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Additional Context (Optional)</label>
              <textarea 
                value={formData.brief}
                onChange={(e) => setFormData({...formData, brief: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-24"
                placeholder="Any specific constraints or goals?"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Projecting Funnel...' : 'Generate Projection'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">Running AI Funnel Analysis...</div>
            </div>
          ) : plan && plan.mode === mode ? (
            <>
              <BoardSummaryCard data={plan} />
              
              {plan.mode === 'compare' ? (
                <div className="grid grid-cols-3 gap-4">
                  {['optimistic', 'realistic', 'conservative'].map(sc => (
                    <div key={sc} className={`bg-[#1A1A1A] border \${sc === 'realistic' ? 'border-[#00F5FF]' : 'border-[#333]'} rounded-xl p-4`}>
                      <h3 className="text-center font-bold uppercase mb-4 text-[#A0A0A0]">{sc}</h3>
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-white">{formatNumber(plan.funnel[sc].totalAdmissions)}</div>
                        <div className="text-xs text-[#A0A0A0]">Admissions</div>
                      </div>
                      <div className="space-y-2">
                        {plan.funnel[sc].stages.map((st: any) => (
                          <div key={st.id} className="flex justify-between text-sm">
                            <span className="text-[#A0A0A0] capitalize">{st.id}</span>
                            <span className="font-mono text-white">{formatNumber(st.volume)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {plan.mode === 'reverse' ? (
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 mb-6">
                      <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-4">Required Volume</h3>
                      <div className="text-4xl font-bold text-[#00F5FF] mb-2">{formatNumber(plan.funnel.totalTofuNeeded)}</div>
                      <div className="text-[#A0A0A0]">Top of funnel views/footfall needed to hit {plan.funnel.required.admission} admissions.</div>
                    </div>
                  ) : (
                    <FunnelWaterfall stages={plan.funnel.stages} />
                  )}
                  
                  {plan.budget && (
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 mb-6">
                      <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-4">Budget Allocation</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-[#333] pb-2">
                          <span className="text-[#7C4DFF] font-bold">TOFU (Awareness)</span>
                          <span className="font-mono text-white">{formatINR(plan.budget.tofu.budget)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#333] pb-2">
                          <span className="text-[#00BCD4] font-bold">MOFU (Capture)</span>
                          <span className="font-mono text-white">{formatINR(plan.budget.mofu.budget)}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-[#333] pb-2">
                          <span className="text-[#FF9100] font-bold">BOFU (Close)</span>
                          <span className="font-mono text-white">{formatINR(plan.budget.bofu.budget)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#A0A0A0] font-bold">Contingency (10%)</span>
                          <span className="font-mono text-[#A0A0A0]">{formatINR(plan.budget.contingency.budget)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 prose prose-invert max-w-none">
                <ReactMarkdown>{plan.aiNarrative}</ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Configure parameters and generate to see funnel projection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
