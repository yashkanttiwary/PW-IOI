import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { PERSONA_STORE } from '../../engine/persona/personaStore';
import { orchestratePersonaSimulation } from '../../engine/orchestrators';

export default function PersonaLab() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(['S1', 'P1']);
  const [material, setMaterial] = useState('');
  const [results, setResults] = useState<any>(null);

  const allPersonas = [...PERSONA_STORE, ...state.savedPersonas];

  const togglePersona = (id: string) => {
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter(p => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  const handleSimulate = async () => {
    if (!material || selectedPersonas.length === 0) return;
    setLoading(true);
    const res = await orchestratePersonaSimulation({ personaIds: selectedPersonas, material }, state, dispatch);
    setResults(res);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Persona Lab</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Select Personas</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {allPersonas.map(p => (
                <div 
                  key={p.id}
                  onClick={() => togglePersona(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors \${
                    selectedPersonas.includes(p.id) 
                      ? 'bg-[#1A4FBF]/20 border-[#1A4FBF]' 
                      : 'bg-[#111111] border-[#333] hover:border-[#555]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{p.name}</span>
                    <span className={`text-xs px-2 py-1 rounded \${p.type === 'student' ? 'bg-[#7C4DFF]/20 text-[#7C4DFF]' : 'bg-[#FF9100]/20 text-[#FF9100]'}`}>
                      {p.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-[#A0A0A0] mt-1">{p.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Material to Test</h2>
            <textarea 
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-48 mb-4"
              placeholder="Paste ad copy, email, landing page text, or event description here..."
            />
            <button 
              onClick={handleSimulate}
              disabled={loading || !material || selectedPersonas.length === 0}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Simulating Reactions...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">Running psychological simulation...</div>
            </div>
          ) : results && results.success ? (
            <>
              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-4">Simulation Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#111111] p-4 rounded-lg border border-[#333]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Student Resonance</div>
                    <div className={`text-2xl font-bold \${results.reactions.studentResonance >= 7 ? 'text-[#00E676]' : results.reactions.studentResonance >= 5 ? 'text-[#FFD600]' : 'text-[#FF5252]'}`}>
                      {results.reactions.studentResonance}/10
                    </div>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg border border-[#333]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Parent Resonance</div>
                    <div className={`text-2xl font-bold \${results.reactions.parentResonance >= 7 ? 'text-[#00E676]' : results.reactions.parentResonance >= 5 ? 'text-[#FFD600]' : 'text-[#FF5252]'}`}>
                      {results.reactions.parentResonance}/10
                    </div>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg border border-[#333]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Dual Alignment</div>
                    <div className="text-lg font-bold text-white">{results.reactions.dualAudienceAlignment}</div>
                  </div>
                  <div className="bg-[#111111] p-4 rounded-lg border border-[#333]">
                    <div className="text-xs text-[#A0A0A0] mb-1">Funnel Impact</div>
                    <div className="text-lg font-bold text-[#00F5FF]">{results.reactions.funnelStageMostImpacted}</div>
                  </div>
                </div>
                <div className="bg-[#111111] border-l-4 border-[#00F5FF] p-4 rounded-r-lg">
                  <span className="font-bold text-white">Top Fix: </span>
                  <span className="text-[#A0A0A0]">{results.reactions.topFix}</span>
                </div>
              </div>

              <div className="space-y-4">
                {Object.keys(results.reactions).filter(k => k !== 'studentResonance' && k !== 'parentResonance' && k !== 'dualAudienceAlignment' && k !== 'funnelStageMostImpacted' && k !== 'topFix').map(key => {
                  const r = results.reactions[key];
                  if (typeof r !== 'object') return null;
                  
                  return (
                    <div key={r.personaId} className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4 border-b border-[#333] pb-4">
                        <h3 className="text-lg font-bold text-white">{r.personaName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold \${
                          r.converts === 'YES' ? 'bg-[#00E676]/20 text-[#00E676]' : 
                          r.converts === 'MAYBE' ? 'bg-[#FFD600]/20 text-[#FFD600]' : 
                          'bg-[#FF5252]/20 text-[#FF5252]'
                        }`}>
                          CONVERTS: {r.converts}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">First Reaction (3s)</div>
                          <div className="text-white italic">&quot;{r.firstReaction}&quot;</div>
                        </div>
                        <div>
                          <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Internal Thought</div>
                          <div className="text-white">&quot;{r.internalThought}&quot;</div>
                        </div>
                        {r.converts !== 'YES' && (
                          <div className="bg-[#FF5252]/10 border border-[#FF5252]/30 p-3 rounded-lg">
                            <div className="text-xs text-[#FF5252] uppercase tracking-wider mb-1">Primary Objection</div>
                            <div className="text-white">{r.objection}</div>
                          </div>
                        )}
                        <div className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 p-3 rounded-lg">
                          <div className="text-xs text-[#00F5FF] uppercase tracking-wider mb-1">What would change their mind?</div>
                          <div className="text-white">{r.whatWouldChangeMind}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Select personas, add material, and run simulation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
