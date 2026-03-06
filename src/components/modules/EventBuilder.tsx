import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { orchestrateEventBuilder } from '../../engine/orchestrators';
import BoardSummaryCard from '../shared/BoardSummaryCard';
import FormattedAIOutput from '../shared/FormattedAIOutput';
import { Calendar, Users, MapPin, IndianRupee } from 'lucide-react';

export default function EventBuilder() {
  const { state, dispatch } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    eventType: 'Campus Open Day',
    campus: 'Bengaluru',
    targetDate: new Date().toISOString().split('T')[0],
    budget: 200000,
    footfallTarget: 500,
    audience: 'Both',
    brief: ''
  });

  const handleGenerate = async () => {
    setLoading(true);
    await orchestrateEventBuilder(formData, state, dispatch);
    setLoading(false);
  };

  const plan = state.activeConversation?.currentPlan;

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Event Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Event Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Event Type</label>
              <select 
                value={formData.eventType}
                onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Campus Open Day">Campus Open Day</option>
                <option value="Hackathon">Hackathon</option>
                <option value="School Outreach">School Outreach</option>
                <option value="Parental ROI Session">Parental ROI Session</option>
                <option value="Guerrilla Activation">Guerrilla Activation</option>
                <option value="Online Webinar">Online Webinar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Campus / Location</label>
              <select 
                value={formData.campus}
                onChange={(e) => setFormData({...formData, campus: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Delhi">Delhi</option>
                <option value="Pune">Pune</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Noida">Noida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Target Date</label>
              <input 
                type="date" 
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              />
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
                <label className="block text-sm text-[#A0A0A0] mb-1">Target Footfall</label>
                <input 
                  type="number" 
                  value={formData.footfallTarget}
                  onChange={(e) => setFormData({...formData, footfallTarget: parseInt(e.target.value)})}
                  className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Primary Audience</label>
              <select 
                value={formData.audience}
                onChange={(e) => setFormData({...formData, audience: e.target.value})}
                className="w-full bg-[#111111] border border-[#333] rounded-lg px-4 py-2 text-white"
              >
                <option value="Both">Both (Students + Parents)</option>
                <option value="Students Only">Students Only</option>
                <option value="Parents Only">Parents Only</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Event Brief</label>
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
              {loading ? 'Building Event Plan...' : 'Generate Event Plan'}
            </button>
          </div>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="h-64 bg-[#1A1A1A] border border-[#333] rounded-xl flex items-center justify-center">
              <div className="animate-pulse text-[#00F5FF] font-mono">ION is architecting the event...</div>
            </div>
          ) : plan && plan.type === 'event' ? (
            <>
              <BoardSummaryCard data={plan} />
              
              <FormattedAIOutput text={plan.aiPlan} blockerReport={plan.blockerReport} />
            </>
          ) : (
            <div className="h-64 border border-[#333] border-dashed rounded-xl flex items-center justify-center text-[#A0A0A0]">
              Configure event parameters and generate to see the plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
