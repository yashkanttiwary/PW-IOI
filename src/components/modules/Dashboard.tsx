import React from 'react';
import { useAppStore } from '../../store/appStore';
import { THEME } from '../../engine/constants/theme';
import { Calendar, Map, BarChart2, CheckSquare, FlaskConical, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { state, dispatch } = useAppStore();
  const phase = state.calendarPhase;

  const quickActions = [
    { id: 'event_builder', label: 'Plan a New Event', icon: Calendar },
    { id: 'campaign_architect', label: 'Build a Campaign', icon: Map },
    { id: 'funnel_command', label: 'Project My Funnel', icon: BarChart2 },
    { id: 'campaign_auditor', label: 'Audit a Campaign', icon: CheckSquare },
    { id: 'ab_test', label: 'Test an Idea', icon: FlaskConical },
    { id: 'blocker_radar', label: 'Check Blockers', icon: ShieldAlert },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Welcome Banner */}
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#1A4FBF]/20 to-transparent"></div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back to ION.</h1>
        <p className="text-[#A0A0A0] text-lg">
          Current phase: <span style={{ color: phase?.color }} className="font-bold">{phase?.label}</span>
        </p>
        <p className="mt-4 text-[#00F5FF] font-medium">{phase?.guidance}</p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">What are we building today?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => dispatch({ type: 'SET_MODULE', payload: action.id })}
                className="bg-[#1A1A1A] border border-[#333] hover:border-[#1A4FBF] hover:bg-[#252525] transition-all p-6 rounded-xl flex flex-col items-center justify-center text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#111111] flex items-center justify-center mb-4 group-hover:text-[#00F5FF] group-hover:bg-[#1A4FBF]/20 transition-colors">
                  <Icon size={24} />
                </div>
                <span className="font-semibold text-white">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        {state.savedPlans.length === 0 ? (
          <div className="bg-[#1A1A1A] border border-[#333] border-dashed rounded-xl p-8 text-center text-[#A0A0A0]">
            No recent activity. Start building a plan.
          </div>
        ) : (
          <div className="space-y-3">
            {state.savedPlans.slice(0, 5).map((plan: any) => (
              <div key={plan.id} className="bg-[#1A1A1A] border border-[#333] p-4 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white capitalize">{plan.type} Plan</div>
                  <div className="text-sm text-[#A0A0A0]">{new Date(plan.savedAt).toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_PLAN', payload: plan });
                    dispatch({ type: 'SET_MODULE', payload: plan.type === 'event' ? 'event_builder' : plan.type === 'campaign' ? 'campaign_architect' : 'funnel_command' });
                  }}
                  className="text-[#00F5FF] hover:underline text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
