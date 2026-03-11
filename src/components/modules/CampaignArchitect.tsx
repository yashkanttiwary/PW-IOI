import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateCampaignArchitect } from '../../engine/orchestrators';
import BoardSummaryCard from '../shared/BoardSummaryCard';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function CampaignArchitect() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    goal: 'Lead Generation',
    states: ['Delhi', 'UP'],
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
    await orchestrateCampaignArchitect(formData, state, dispatch);
    setLoading(false);
  };

  const plan = state.activeConversation?.currentPlan;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Campaign Architect</h1>
      </div>

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
                <option value="Delhi">Delhi NCR</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Bihar">Bihar</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="MP">Madhya Pradesh</option>
              </select>
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
              
              <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{plan.aiPlan}</ReactMarkdown>
              </div>
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
