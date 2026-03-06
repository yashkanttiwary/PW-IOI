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

  const renderModule = () => {
    switch (state.currentModule) {
      case 'dashboard': return <Dashboard />;
      case 'funnel_command': return <FunnelCommand />;
      case 'event_builder': return <EventBuilder />;
      case 'campaign_architect': return <CampaignArchitect />;
      case 'persona_lab': return <PersonaLab />;
      case 'ab_test': return <ABTestStudio />;
      case 'blocker_radar': return <BlockerRadar />;
      case 'campaign_auditor': return <CampaignAuditor />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative">
        <Header />
        <AIErrorBanner />
        <GlobalBlockerSummary />
        <main className="flex-1 overflow-y-auto">
          {renderModule()}
        </main>
        {state.activeConversation?.lastAutoAudit && (
          <AutoAuditBar audit={state.activeConversation.lastAutoAudit} />
        )}
      </div>
    </div>
  );
}
