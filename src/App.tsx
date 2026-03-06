'use client';

import React from 'react';
import { useAppStore } from './store/appStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/modules/Dashboard';
import FunnelCommand from './components/modules/FunnelCommand';
import EventBuilder from './components/modules/EventBuilder';
import CampaignArchitect from './components/modules/CampaignArchitect';
import PersonaLab from './components/modules/PersonaLab';
import ABTestStudio from './components/modules/ABTestStudio';
import BlockerRadar from './components/modules/BlockerRadar';
import CampaignAuditor from './components/modules/CampaignAuditor';
import AutoAuditBar from './components/shared/AutoAuditBar';
import APIKeyGate from './components/shared/APIKeyGate';
import GlobalBlockerSummary from './components/shared/GlobalBlockerSummary';
import AIErrorBanner from './components/shared/AIErrorBanner';

export default function App() {
  const { state } = useAppStore();

  if (state.ui?.showApiGate || !state.aiConfig?.isConfigured) {
    return <APIKeyGate />;
  }

  const modules = {
    dashboard: <Dashboard />,
    funnel_command: <FunnelCommand />,
    event_builder: <EventBuilder />,
    campaign_architect: <CampaignArchitect />,
    persona_lab: <PersonaLab />,
    ab_test: <ABTestStudio />,
    blocker_radar: <BlockerRadar />,
    campaign_auditor: <CampaignAuditor />,
  } as const;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Header />
        <AIErrorBanner />
        <GlobalBlockerSummary />
        <main className="flex-1 overflow-y-auto">
          {Object.entries(modules).map(([moduleId, moduleComponent]) => (
            <section
              key={moduleId}
              className={state.currentModule === moduleId ? 'block' : 'hidden'}
              aria-hidden={state.currentModule !== moduleId}
            >
              {moduleComponent}
            </section>
          ))}
        </main>
        {state.activeConversation?.lastAutoAudit && (
          <AutoAuditBar audit={state.activeConversation.lastAutoAudit} />
        )}
      </div>
    </div>
  );
}
