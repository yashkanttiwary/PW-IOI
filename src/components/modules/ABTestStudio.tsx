import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateABTest } from '../../engine/orchestrators';
import { PERSONA_STORE } from '../../engine/persona/personaStore';
import { FlaskConical, CheckCircle2 } from 'lucide-react';

export default function ABTestStudio() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    goal: 'Lead Capture (MOFU)',
    targetPersona: 'All',
    variantA: '',
    variantB: '',
    variantC: ''
  });

  const [results, setResults] = useState<Record<string, any> | null>(null);

  const handleTest = async () => {
    if (!formData.variantA || !formData.variantB) return;
    setLoading(true);
    const res = await orchestrateABTest(formData, state, dispatch);
    setResults(res);
    setLoading(false);
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A') return 'text-[#00E676]';
    if (grade === 'B') return 'text-[#00F5FF]';
    if (grade === 'C') return 'text-[#FFD600]';
    return 'text-[#FF5252]';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FlaskConical className="text-[#00F5FF]" size={32} />
          A/B Test Studio
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Test Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Test Goal</label>
              <select 
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Lead Capture (MOFU)">Lead Capture (MOFU)</option>
                <option value="Event Registration (BOFU)">Event Registration (BOFU)</option>
                <option value="Brand Awareness (TOFU)">Brand Awareness (TOFU)</option>
                <option value="Parental Trust">Parental Trust</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target Persona</label>
              <select 
                value={formData.targetPersona}
                onChange={(e) => setFormData({...formData, targetPersona: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="All">All Personas</option>
                {PERSONA_STORE.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Variant A (Control)</label>
              <textarea 
                value={formData.variantA}
                onChange={(e) => setFormData({...formData, variantA: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-24"
                placeholder="Paste Variant A copy/plan..."
              />
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Variant B (Challenger)</label>
              <textarea 
                value={formData.variantB}
                onChange={(e) => setFormData({...formData, variantB: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-24"
                placeholder="Paste Variant B copy/plan..."
              />
            </div>

            <button 
              onClick={handleTest}
              disabled={loading || !formData.variantA || !formData.variantB}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Simulating Variants...' : 'Run A/B Test'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">Scoring variants against IOI rubric...</div>
            </div>
          ) : results && results.comparison ? (
            <>
              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Winner</h3>
                  <div className="text-4xl font-bold text-white flex items-center gap-3">
                    Variant {results.comparison.winner.id}
                    <CheckCircle2 className="text-[#00E676]" size={32} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#A0A0A0]">Winning Margin</div>
                  <div className="text-lg font-bold text-[#00F5FF]">+{results.comparison.gap} pts</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.variants.map((v: { id: string; blockerBFlag: boolean; antiPatterns: string[] }) => {
                  const isWinner = v.id === results.comparison.winner.id;
                  const scoreData = results.comparison.rankings.find((r: { id: string; totalScore: number; scores: Record<string, { weighted: number }> }) => r.id === v.id);
                  
                  return (
                    <div key={v.id} className={`bg-[#1A1A1A] border rounded-xl p-6 \${isWinner ? 'border-[#00F5FF]' : 'border-[#333]'}`}>
                      <div className="flex justify-between items-center mb-6 border-b border-[#333] pb-4">
                        <h3 className="text-xl font-bold text-white">Variant {v.id}</h3>
                        <div className="text-right">
                          <div className={`text-3xl font-bold \${getGradeColor(scoreData.grade)}`}>
                            {scoreData.total}
                          </div>
                          <div className="text-xs text-[#A0A0A0]">/ 90 pts</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {Object.entries(scoreData.scores as Record<string, { weighted: number }>).map(([dim, s]) => (
                          <div key={dim} className="flex justify-between items-center text-sm">
                            <span className="text-[#A0A0A0] capitalize">{dim.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-[#111111] rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#1A4FBF]" 
                                  style={{ width: `\${(s.raw / 10) * 100}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-white w-8 text-right">{s.weighted}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {v.blockerBFlag && (
                        <div className="bg-[#FF5252]/10 border border-[#FF5252]/30 p-3 rounded-lg text-sm text-white mb-4">
                          <span className="font-bold text-[#FF5252]">⚠️ Blocker B Violation: </span>
                          Contains failure/stigma language.
                        </div>
                      )}

                      {v.antiPatterns?.length > 0 && (
                        <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 p-3 rounded-lg text-sm text-white">
                          <span className="font-bold text-[#FFD600]">Anti-patterns: </span>
                          <ul className="list-disc pl-4 mt-1">
                            {v.antiPatterns.map((ap: string, i: number) => <li key={i}>{ap}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {results.synthesizedBest && (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                  <h3 className="text-sm font-bold text-[#00F5FF] uppercase tracking-wider mb-4">Synthesized Best Version</h3>
                  <div className="text-white whitespace-pre-wrap">{results.synthesizedBest}</div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Enter variants and run test to see scoring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
