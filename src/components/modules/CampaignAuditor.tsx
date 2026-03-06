import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateAudit } from '../../engine/orchestrators';
import { CheckSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CampaignAuditor() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [planText, setPlanText] = useState('');
  const [report, setReport] = useState<any>(null);

  const handleAudit = async () => {
    if (!planText) return;
    setLoading(true);
    const res: any = await orchestrateAudit(planText, state, dispatch);
    if (res?.success === false) {
      setError(res.error || 'Failed to run audit.');
      setReport(null);
    } else {
      setError('');
      setReport(res);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CheckSquare className="text-[#00F5FF]" size={32} />
          Campaign Auditor
        </h1>
      </div>

      {error && (
        <div className="mb-6 text-sm text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/30 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Audit Input</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Plan / Copy Text</label>
              <textarea 
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-64"
                placeholder="Paste your campaign plan, event brief, or ad copy here for a full 10-dimension audit..."
              />
            </div>

            <button 
              onClick={handleAudit}
              disabled={loading || !planText}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Auditing...' : 'Run Full Audit'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">Scoring against 10 IOI dimensions...</div>
            </div>
          ) : report && report.parsed ? (
            <>
              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Overall Score</h3>
                  <div className="text-4xl font-bold text-white flex items-end gap-2">
                    <span className={report.parsed.overallScore >= 80 ? 'text-[#00E676]' : report.parsed.overallScore >= 60 ? 'text-[#FFD600]' : 'text-[#FF5252]'}>
                      {report.parsed.overallScore}
                    </span>
                    <span className="text-xl text-[#A0A0A0] mb-1">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#A0A0A0]">Blocker Scan</div>
                  <div className="text-lg font-bold text-[#00F5FF]">
                    A[{report.parsed.blockerScan?.a || '?'}] B[{report.parsed.blockerScan?.b || '?'}] C[{report.parsed.blockerScan?.c || '?'}]
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Dimension Scores</h3>
                  <div className="space-y-3">
                    {report.parsed.dimensions?.map((d: any) => (
                      <div key={d.id} className="flex justify-between items-center text-sm">
                        <span className="text-[#A0A0A0]">{d.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-[#111111] rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${d.score >= 8 ? 'bg-[#00E676]' : d.score >= 5 ? 'bg-[#FFD600]' : 'bg-[#FF5252]'}`} 
                              style={{ width: `${(d.score / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-white w-8 text-right">{d.score}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {report.parsed.criticalFailures?.length > 0 && (
                    <div className="bg-[#FF5252]/10 border border-[#FF5252]/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-[#FF5252] mb-4 flex items-center gap-2">
                        <AlertTriangle size={20} /> Critical Failures
                      </h3>
                      <div className="space-y-3">
                        {report.parsed.criticalFailures.map((cf: any, i: number) => (
                          <div key={i} className="text-sm text-white">
                            <span className="font-bold">{cf.dimension}: </span>
                            {cf.fix}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.parsed.quickWins?.length > 0 && (
                    <div className="bg-[#00E676]/10 border border-[#00E676]/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-[#00E676] mb-4 flex items-center gap-2">
                        <CheckCircle2 size={20} /> Quick Wins
                      </h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-white">
                        {report.parsed.quickWins.map((qw: string, i: number) => <li key={i}>{qw}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Funnel & Cost Reality Check</h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Funnel Alignment</div>
                    <div className="text-white">{report.parsed.funnelAlignment}</div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">Cost Reality</div>
                    <div className="text-white">{report.parsed.costRealityCheck}</div>
                  </div>
                </div>
              </div>

              {report.parsed.improvedVersion && (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 prose prose-invert max-w-none">
                  <h3 className="text-lg font-bold text-[#00F5FF] mb-4">Improved Version</h3>
                  <ReactMarkdown>{report.parsed.improvedVersion}</ReactMarkdown>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Enter plan text and run audit to see scoring.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
