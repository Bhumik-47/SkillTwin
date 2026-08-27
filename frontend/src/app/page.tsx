'use client';

import React from 'react';
import { SkillTwinProvider, useSkillTwin } from '../lib/state/store';
import Header from '../components/navigation/Header';
import TabNav from '../components/navigation/TabNav';
import RoadmapView from '../components/roadmap/RoadmapView';
import SkillGraphView from '../components/graph/SkillGraphView';
import RepairStudio from '../components/repair/RepairStudio';
import LearnerProfileView from '../components/profile/LearnerProfileView';
import AssessmentModal from '../components/assessment/AssessmentModal';
import BKTFormulaVisualizer from '../components/assessment/BKTFormulaVisualizer';
import AIChatPanel from '../components/ai/AIChatPanel';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import UserProfileModal from '../components/profile/UserProfileModal';

function MainContent() {
  const { activeTab, isLoading, currentPath } = useSkillTwin();

  if (isLoading && !currentPath) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent shadow-lg shadow-brand-500/20" />
          <p className="text-xs dark:text-slate-400 text-slate-500 font-medium tracking-wide">
            Calculating Bayesian Mastery & Topological DAG...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {activeTab === 'roadmap' && <RoadmapView />}
      {activeTab === 'graph' && <SkillGraphView />}
      {activeTab === 'repair_studio' && <RepairStudio />}
      {activeTab === 'assessment' && <RepairStudio />}
      {activeTab === 'profile' && <LearnerProfileView />}

      {/* Global Modals & Floating Drawers */}
      <AssessmentModal />
      <BKTFormulaVisualizer />
      <AIChatPanel />
      <OnboardingModal />
      <UserProfileModal />
    </main>
  );
}

export default function App() {
  return (
    <SkillTwinProvider>
      <div className="min-h-screen dark:bg-[#090d16] bg-slate-50 dark:text-slate-100 text-slate-900 transition-colors selection:bg-brand-500 selection:text-white">
        <Header />
        <TabNav />
        <MainContent />
      </div>
    </SkillTwinProvider>
  );
}
