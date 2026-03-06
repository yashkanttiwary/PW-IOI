import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateCampaignArchitect } from '../../engine/orchestrators';
import BoardSummaryCard from '../shared/BoardSummaryCard';
import FormattedAIOutput from '../shared/FormattedAIOutput';
import { STATE_OPTIONS } from '../../engine/constants/stateMapping';

export default function CampaignArchitect() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    goal: 'Lead Generation',
    states: ['Delhi-NCR', 'Uttar Pradesh'],
    budget: 1000000,
    timeline: 4,
    targetAdmissions: 50,
    brief: ''
  });

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({...formData, states: options});
  };

  const handleGenerate = async () => {
    setLoading(true);
    const result: any = await orchestrateCampaignArchitect(formData, state, dispatch);

    if (result?.success === false) {
      setError(result.error || 'Failed to generate campaign plan.');
    } else {
      setError('');
    }

    setLoading(false);
  };

  const plan = state.activeConversation?.currentPlan;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Campaign Architect</h1>
      </div>

      {error && (
        <div className="mb-6 text-sm text-[#FF9100] bg-[#FF9100]/10 border border-[#FF9100]/30 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Campaign Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Campaign Goal</label>
              <select 
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Lead Generation">Lead Generation (TOFU/MOFU)</option>
                <option value="Conversion Push">Conversion Push (BOFU)</option>
                <option value="Brand Awareness">Brand Awareness (TOFU)</option>
                <option value="Nurture Sequence">Nurture Sequence (MOFU)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target States (Multi-select)</label>
              <select 
                multiple
                value={formData.states}
                onChange={handleStateChange}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-32"
              >
                {STATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Budget (₹)</label>
                <input 
                  type="number" 
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value)})}
                  className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#A0A0A0] mb-1">Timeline (Weeks)</label>
                <input 
                  type="number" 
                  value={formData.timeline}
                  onChange={(e) => setFormData({...formData, timeline: parseInt(e.target.value)})}
                  className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target Admissions (Impact)</label>
              <input 
                type="number" 
                value={formData.targetAdmissions}
                onChange={(e) => setFormData({...formData, targetAdmissions: parseInt(e.target.value)})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Campaign Brief</label>
              <textarea 
                value={formData.brief}
                onChange={(e) => setFormData({...formData, brief: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white h-24"
                placeholder="What's the core idea? Any specific requirements?"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#1A4FBF] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Architecting Campaign...' : 'Generate Campaign Plan'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">ION is architecting the campaign...</div>
            </div>
          ) : plan && plan.type === 'campaign' ? (
            <>
              <BoardSummaryCard data={plan} />
              
              <FormattedAIOutput text={plan.aiPlan} blockerReport={plan.blockerReport} />
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Configure campaign parameters and generate to see the plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
