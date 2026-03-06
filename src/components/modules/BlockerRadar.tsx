import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { runBlockerScan } from '../../engine/blocker/blockerDetector';
import { ShieldAlert, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';

export default function BlockerRadar() {
  const { state } = useAppStore();
  const [planText, setPlanText] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetState, setTargetState] = useState('Delhi');
  const [report, setReport] = useState<any>(null);

  const handleScan = () => {
    const res = runBlockerScan({
      planText,
      startDate: new Date(targetDate),
      targetState,
    });
    setReport(res);
  };

  const getStatusIcon = (status: string) => {
    if (status === '✅') return <CheckCircle2 className="text-[#00E676]" size={24} />;
    if (status === '⚠️') return <AlertTriangle className="text-[#FFD600]" size={24} />;
    return <XCircle className="text-[#FF5252]" size={24} />;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-[#00F5FF]" size={32} />
          Blocker Radar
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Scan Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target Date</label>
              <input 
                type="date" 
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target State</label>
              <select 
                value={targetState}
                onChange={(e) => setTargetState(e.target.value)}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Delhi">Delhi NCR</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Bihar">Bihar</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Plan / Copy Text</label>
              <textarea 
                value={planText}
                onChange={(e) => setPlanText(e.target.value)}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-48"
                placeholder="Paste your campaign plan, event brief, or ad copy here to scan for blockers..."
              />
            </div>

            <button 
              onClick={handleScan}
              disabled={!planText}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              Run Blocker Scan
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {report ? (
            <>
              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#A0A0A0] uppercase tracking-wider mb-1">Overall Safety Score</h3>
                  <div className="text-4xl font-bold text-white flex items-end gap-2">
                    <span className={report.overallScore >= 8 ? 'text-[#00E676]' : report.overallScore >= 5 ? 'text-[#FFD600]' : 'text-[#FF5252]'}>
                      {report.overallScore}
                    </span>
                    <span className="text-xl text-[#A0A0A0] mb-1">/10</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-[#A0A0A0]">Calendar Phase</div>
                  <div className="text-lg font-bold text-[#00F5FF]">{state.calendarPhase?.label}</div>
                </div>
              </div>

              {/* Blocker A */}
              <div className={`bg-[#1A1A1A] border rounded-xl p-6 \${report.blockerA.status === '🚫' ? 'border-[#FF5252]' : report.blockerA.status === '⚠️' ? 'border-[#FFD600]' : 'border-[#333]'}`}>
                <div className="flex items-start gap-4">
                  {getStatusIcon(report.blockerA.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Blocker A: The Dead Zone</h3>
                    {report.blockerA.findings.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-[#A0A0A0] mb-4">
                        {report.blockerA.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    ) : (
                      <p className="text-[#A0A0A0] mb-4">No calendar conflicts detected.</p>
                    )}
                    {report.blockerA.hack && (
                      <div className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 p-3 rounded-lg text-sm text-white">
                        <span className="font-bold text-[#00F5FF]">MANDATORY HACK: </span>
                        {report.blockerA.hack}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Blocker B */}
              <div className={`bg-[#1A1A1A] border rounded-xl p-6 \${report.blockerB.status === '🚫' ? 'border-[#FF5252]' : report.blockerB.status === '⚠️' ? 'border-[#FFD600]' : 'border-[#333]'}`}>
                <div className="flex items-start gap-4">
                  {getStatusIcon(report.blockerB.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Blocker B: &quot;Loser College&quot; Stigma</h3>
                    {report.blockerB.findings.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-[#A0A0A0] mb-4">
                        {report.blockerB.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    ) : (
                      <p className="text-[#A0A0A0] mb-4">No stigma language detected. Good framing.</p>
                    )}
                    {report.blockerB.hack && (
                      <div className="bg-[#FFD600]/10 border border-[#FFD600]/30 p-3 rounded-lg text-sm text-white">
                        <span className="font-bold text-[#FFD600]">MANDATORY REFRAME: </span>
                        {report.blockerB.hack}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Blocker C */}
              <div className={`bg-[#1A1A1A] border rounded-xl p-6 \${report.blockerC.status === '🚫' ? 'border-[#FF5252]' : report.blockerC.status === '⚠️' ? 'border-[#FFD600]' : 'border-[#333]'}`}>
                <div className="flex items-start gap-4">
                  {getStatusIcon(report.blockerC.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">Blocker C: Internal Capability Reality</h3>
                    {report.blockerC.findings.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1 text-[#A0A0A0] mb-4">
                        {report.blockerC.findings.map((f: string, i: number) => <li key={i}>{f}</li>)}
                      </ul>
                    ) : (
                      <p className="text-[#A0A0A0] mb-4">No capability assumptions detected.</p>
                    )}
                    {report.blockerC.hack && (
                      <div className="bg-[#1A4FBF]/20 border border-[#1A4FBF]/50 p-3 rounded-lg text-sm text-white">
                        <span className="font-bold text-[#00F5FF]">PIT CREW MANDATE: </span>
                        {report.blockerC.hack}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden Blockers */}
              {report.hiddenBlockers.length > 0 && (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Hidden Blockers (State/Festival)</h3>
                  <div className="space-y-3">
                    {report.hiddenBlockers.map((hb: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-[#111111] p-3 rounded-lg border border-[#333]">
                        <AlertTriangle className="text-[#FFD600] shrink-0 mt-0.5" size={16} />
                        <div>
                          <div className="font-bold text-white text-sm">{hb.label}</div>
                          <div className="text-xs text-[#A0A0A0]">{hb.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Enter plan text and run scan to detect blockers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
