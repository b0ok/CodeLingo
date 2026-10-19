import React, { useEffect, useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { getUnitsForLanguage } from './data/curriculum';
import { LessonNode } from './types';
import { TopNavbar } from './components/TopNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LessonPath } from './components/LessonPath';
import { LessonModal } from './components/LessonModal';
import { HeartRefillModal } from './components/HeartRefillModal';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { HabitRoutinePrompt } from './components/HabitRoutinePrompt';
import { FeedView } from './components/FeedView';
import { PracticeView } from './components/PracticeView';
import { ChallengesView } from './components/ChallengesView';
import { DailySidebar } from './components/DailySidebar';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { MonetizationModal } from './components/MonetizationModal';
import { InactivityReminderModal } from './components/InactivityReminderModal';
import { RoadmapModal } from './components/RoadmapModal';
import { OnboardingIntro, AccountDialog, WelcomeDialog, loadStage, saveStage, OnboardingStage } from './components/Onboarding';
import { useSession, flushPendingProfile } from './utils/supabase';

// Read before GameProvider saves anything, so first-time visitors are told apart from returning ones.
const initialStage = loadStage();

function AppContent() {
  const { activeLanguage, stats, updateProfile } = useGame();
  const session = useSession();
  const [stage, setStageState] = useState<OnboardingStage>(initialStage);
  const setStage = (s: OnboardingStage) => { saveStage(s); setStageState(s); };
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'challenges' | 'leagues' | 'feed' | 'profile' | 'settings'>('learn');
  const [activeLesson, setActiveLesson] = useState<LessonNode | null>(null);
  const [isHeartModalOpen, setIsHeartModalOpen] = useState(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);

  const currentUnits = getUnitsForLanguage(activeLanguage);

  // Signing in (including from the emailed link) saves onboarding choices and skips the intro.
  useEffect(() => {
    if (!session) return;
    flushPendingProfile(session).then((username) => username && updateProfile({ username }));
    if (stage === 'intro') setStage('done');
  }, [session]);

  if (stage === 'intro') {
    return (
      <OnboardingIntro
        onFinish={(lang, skipped) => {
          const first = getUnitsForLanguage(lang).flatMap((u) => u.nodes).find((n) => !skipped.includes(n.id));
          setStage('lesson');
          if (first) setActiveLesson(first);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Bar */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHeartModal={() => setIsHeartModalOpen(true)}
        onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-6 flex gap-6 items-start justify-center">
        {/* Left desktop sidebar: daily goal and streak */}
        <DailySidebar
          side="left"
          onOpenLeagues={() => setActiveTab('leagues')}
          onOpenShop={() => setIsMonetizationModalOpen(true)}
        />

        {/* Center Main Stage */}
        <div className="flex-1 min-w-0 w-full max-w-3xl">
          {activeTab === 'learn' && (
            <LessonPath
              units={currentUnits}
              onSelectLesson={(lesson) => setActiveLesson(lesson)}
              onOpenHeartModal={() => setIsHeartModalOpen(true)}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeView
              onStartLesson={(lesson) => setActiveLesson(lesson)}
              onOpenHeartModal={() => setIsHeartModalOpen(true)}
            />
          )}

          {activeTab === 'challenges' && <ChallengesView />}

          {activeTab === 'leagues' && <LeaderboardView />}

          {activeTab === 'feed' && <FeedView />}
          {activeTab === 'profile' && <ProfileView onOpenPlans={() => setIsMonetizationModalOpen(true)} />}
          {activeTab === 'settings' && (
            <SettingsView
              onOpenPlans={() => setIsMonetizationModalOpen(true)}
              onStartQuickLesson={() => {
                const firstNode = currentUnits.flatMap((u) => u.nodes).find((n) => !stats.completedLessons.includes(n.id));
                if (firstNode) setActiveLesson(firstNode);
              }}
            />
          )}

        </div>

        {/* Right desktop sidebar: league, mastery track and tip */}
        <DailySidebar
          side="right"
          onOpenLeagues={() => setActiveTab('leagues')}
          onOpenShop={() => setIsMonetizationModalOpen(true)}
          onStartQuickLesson={() => {
            const firstNode = currentUnits[0]?.nodes[0];
            if (firstNode) setActiveLesson(firstNode);
          }}
        />
      </main>

      {/* Membership & Pricing Modal */}
      <MonetizationModal
        isOpen={isMonetizationModalOpen}
        onClose={() => setIsMonetizationModalOpen(false)}
      />

      {/* Mobile Bottom Tab Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Full-Screen Interactive Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          onClose={() => {
            // The onboarding lesson ends with the account offer, but only after a real win.
            if (stage === 'lesson') {
              const won = stats.completedLessons.includes(activeLesson.id);
              setStage(won ? (session ? 'welcome' : 'account') : 'done');
            }
            setActiveLesson(null);
          }}
        />
      )}

      {stage === 'account' && (
        <AccountDialog mode="create" intro="Nice work! Save your progress" onClose={() => setStage('welcome')} />
      )}
      {stage === 'welcome' && !activeLesson && <WelcomeDialog onDone={() => setStage('done')} />}

      {/* Life point refill & free practice drill modal */}
      <HeartRefillModal
        isOpen={isHeartModalOpen}
        onClose={() => setIsHeartModalOpen(false)}
      />

      {/* High-five toasts and the streak-saver banner, on every screen */}
      <HabitRoutinePrompt
        show="alerts"
        onStartQuickLesson={() => {
          const firstNode = currentUnits.flatMap((u) => u.nodes).find((n) => !stats.completedLessons.includes(n.id));
          if (firstNode) setActiveLesson(firstNode);
        }}
      />

      {/* Achievement Badge Unlock Celebration Modal */}
      <BadgeUnlockModal />

      {/* Web Inactivity & Personalized Daily Coding Goal Reminder */}
      <InactivityReminderModal
        onStartLesson={() => {
          const firstNode = currentUnits[0]?.nodes[0];
          if (firstNode) setActiveLesson(firstNode);
        }}
      />

      {/* Official roadmap.sh Python Curriculum & Agentic Goal Check-in Modal */}
      <RoadmapModal
        onSelectLesson={(lessonId) => {
          const matched = currentUnits.flatMap((u) => u.nodes).find((n) => n.id === lessonId);
          if (matched) setActiveLesson(matched);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
