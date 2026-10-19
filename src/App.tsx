import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { getUnitsForLanguage } from './data/curriculum';
import { LessonNode } from './types';
import { TopNavbar } from './components/TopNavbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LessonPath } from './components/LessonPath';
import { LessonModal } from './components/LessonModal';
import { HeartRefillModal } from './components/HeartRefillModal';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgesView } from './components/BadgesView';
import { PracticeView } from './components/PracticeView';
import { PlaygroundView } from './components/PlaygroundView';
import { ChallengesView } from './components/ChallengesView';
import { DailySidebar } from './components/DailySidebar';
import { BadgeUnlockModal } from './components/BadgeUnlockModal';
import { MonetizationModal } from './components/MonetizationModal';
import { InactivityReminderModal } from './components/InactivityReminderModal';
import { RoadmapModal } from './components/RoadmapModal';

function AppContent() {
  const { activeLanguage } = useGame();
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground'>('learn');
  const [activeLesson, setActiveLesson] = useState<LessonNode | null>(null);
  const [isHeartModalOpen, setIsHeartModalOpen] = useState(false);
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);

  const currentUnits = getUnitsForLanguage(activeLanguage);

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 flex gap-8 items-start justify-center">
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

          {activeTab === 'badges' && <BadgesView />}

          {activeTab === 'playground' && <PlaygroundView />}
        </div>

        {/* Right Desktop Sidebar: Daily Streak Calendar, Quests, Pyto Tips, Habit Engine */}
        <DailySidebar
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
          onClose={() => setActiveLesson(null)}
        />
      )}

      {/* Heart Refill & Free Practice Drill Modal */}
      <HeartRefillModal
        isOpen={isHeartModalOpen}
        onClose={() => setIsHeartModalOpen(false)}
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
