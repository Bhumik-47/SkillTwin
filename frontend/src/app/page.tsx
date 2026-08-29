'use client';

import React from 'react';
import { SkillTwinProvider, useSkillTwin } from '../lib/state/store';
import Header from '../components/navigation/Header';
import TabNav from '../components/navigation/TabNav';
import LandingPage from '../components/landing/LandingPage';
import DashboardView from '../components/dashboard/DashboardView';
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
  const { activeTab, isLoading, currentPath, showLandingPage, setShowLandingPage } = useSkillTwin();

  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  if (isLoading && !currentPath) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center space-y-4 rounded-3xl border dark:border-white/10 border-slate-200 dark:bg-[#090f1b] bg-white p-8 shadow-xl">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-md animate-pulse" />
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-brand-500 border-t-transparent shadow-md" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Setting up your study plan
            </p>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-medium mt-1">
              Organizing topics and building your personalized learning roadmap...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <TabNav />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {(!activeTab || activeTab === 'dashboard') && <DashboardView />}
        {activeTab === 'roadmap' && <RoadmapView />}
        {activeTab === 'graph' && <SkillGraphView />}
        {(activeTab === 'repair_studio' || activeTab === 'repair') && <RepairStudio />}
        {activeTab === 'profile' && <LearnerProfileView />}

        {/* Global Modals & Floating Drawers */}
        <AssessmentModal />
        <BKTFormulaVisualizer />
        <AIChatPanel />
        <OnboardingModal />
        <UserProfileModal />
      </main>
    </>
  );
}

export default function App() {
  return (
    <SkillTwinProvider>
      <div className="relative min-h-screen dark:bg-[#040711] bg-slate-50 dark:text-slate-100 text-slate-900 transition-colors duration-200 selection:bg-brand-500 selection:text-white">
        {/* Ambient Lighting */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-600/5 blur-[120px] dark:bg-brand-500/8" />
          <div className="absolute top-1/3 -right-20 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px] dark:bg-cyan-500/6" />
        </div>

        <div className="relative z-10">
          <MainContent />
        </div>
      </div>
    </SkillTwinProvider>
  );
}
