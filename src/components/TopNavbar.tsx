import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { PATHWAYS_DATA } from '../data/curriculum';
import { LanguageId } from '../types';
import { Flame, Heart, Gem, Volume2, VolumeX, Sparkles, Code2, ChevronDown, Check, Layers, Terminal, Crown, Bell, BellRing, Radio, Zap, Compass, Brain } from 'lucide-react';

interface TopNavbarProps {
  activeTab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground';
  setActiveTab: (tab: 'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground') => void;
  onOpenHeartModal: () => void;
  onOpenMonetizationModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenHeartModal,
  onOpenMonetizationModal,
}) => {
  const {
    stats,
    toggleSound,
    activeLanguage,
    setActiveLanguage,
    notificationPermission,
    requestBrowserNotifications,
    activeInactivityReminder,
    idleSeconds,
    inactivityIntervalSec,
    triggerTestInactivityReminder,
    openRoadmapModal,
    checkedInNodes,
  } = useGame();
  const [isPathwayDropdownOpen, setIsPathwayDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const navLinks: { id: 'learn' | 'practice' | 'challenges' | 'leagues' | 'badges' | 'playground'; label: string }[] = [
    { id: 'learn', label: 'Learn' },
    { id: 'practice', label: 'Practice' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'leagues', label: 'Leagues' },
    { id: 'badges', label: 'Badges' },
    { id: 'playground', label: 'Playground' },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPathwayDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPathway = PATHWAYS_DATA[activeLanguage] || PATHWAYS_DATA.python;

  const getLanguageBadge = (id: LanguageId) => {
    switch (id) {
      case 'python':
        return { label: 'Python 3', emoji: '🐍', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'javascript':
        return { label: 'JavaScript', emoji: '⚡', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'sql':
        return { label: 'SQL & Data', emoji: '🗄️', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'web':
        return { label: 'HTML & CSS', emoji: '🌐', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Wordmark + Pathway Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('learn')}
            className="flex items-center gap-2.5 text-left text-slate-900 group cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                Code<span className="text-emerald-600">Lingo</span>
              </div>
              <div className="hidden sm:block text-[11px] font-medium text-slate-500 tracking-normal">
                Multi-Language Coding
              </div>
            </div>
          </button>

          {/* Pathway Picker Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsPathwayDropdownOpen(!isPathwayDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Switch Coding Pathway"
            >
              <span>{getLanguageBadge(activeLanguage).emoji}</span>
              <span className="hidden sm:inline font-semibold">{currentPathway.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isPathwayDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isPathwayDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Pathway</span>
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">4 Tracks</span>
                </div>

                <div className="p-1.5 space-y-1">
                  {(Object.keys(PATHWAYS_DATA) as LanguageId[]).map((langId) => {
                    const pathway = PATHWAYS_DATA[langId];
                    const isSelected = activeLanguage === langId;
                    const meta = getLanguageBadge(langId);

                    return (
                      <button
                        key={langId}
                        onClick={() => {
                          setActiveLanguage(langId);
                          setIsPathwayDropdownOpen(false);
                          setActiveTab('learn');
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 font-bold text-slate-900'
                            : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{meta.emoji}</span>
                          <div className="truncate">
                            <div className="text-sm font-bold flex items-center gap-1.5">
                              {pathway.name}
                              {isSelected && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">Active</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {pathway.units.length} Unit{pathway.units.length === 1 ? '' : 's'} • {pathway.units.reduce((acc, u) => acc + u.nodes.length, 0)} Lessons
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {navLinks.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-colors whitespace-nowrap cursor-pointer relative py-1 ${
                  isActive
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action & Real Stats */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Streak Flame */}
          <div
            title={`${stats.streak} day streak! Maintain daily practice to keep the flame.`}
            className="flex items-center gap-1.5 text-orange-600 font-bold text-sm select-none"
          >
            <Flame className="w-5 h-5 fill-orange-500 animate-pulse text-orange-600" />
            <span className="tabular-nums">{stats.streak}</span>
          </div>

          {/* Gems */}
          <div
            title={`${stats.gems} gems collected! Use in shop for freezes and refills.`}
            className="flex items-center gap-1.5 text-cyan-600 font-bold text-sm select-none"
          >
            <Gem className="w-4 h-4 fill-cyan-400 text-cyan-600" />
            <span className="tabular-nums">{stats.gems}</span>
          </div>

          {/* Hearts */}
          <button
            onClick={onOpenHeartModal}
            className="flex items-center gap-1.5 text-rose-500 font-bold text-sm hover:opacity-85 transition-opacity cursor-pointer px-2 py-1 rounded-lg hover:bg-rose-50"
            title="Current Hearts. Click to refill or take a free practice drill!"
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span className="tabular-nums">
              {stats.subscriptionTier === 'novice' || stats.subscriptionTier === 'pro' ? '∞' : stats.hearts}
            </span>
          </button>

          {/* Roadmap & Agent Check-in Trigger */}
          <button
            onClick={() => openRoadmapModal()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white hover:from-slate-800 hover:to-indigo-900 shadow-sm border border-emerald-500/30 transition-all active:scale-95 cursor-pointer"
            title={
              stats.activeLanguage === 'web'
                ? 'HTML & CSS Mastery Roadmap & Socratic Agent Check-in'
                : stats.activeLanguage === 'javascript'
                ? 'JavaScript Mastery Roadmap & Socratic Agent Check-in'
                : 'Python Mastery Roadmap & Socratic Agent Check-in'
            }
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Roadmap</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-1.5 py-0.2 rounded-full border border-emerald-400/30">
              {stats.activeLanguage === 'web'
                ? (checkedInNodes || []).filter((id) => id.startsWith('web-')).length || 1
                : stats.activeLanguage === 'javascript'
                ? (checkedInNodes || []).filter((id) => id.startsWith('js-')).length || 1
                : (checkedInNodes || []).filter((id) => !id.startsWith('web-') && !id.startsWith('js-')).length || 1}
              /16
            </span>
          </button>

          {/* Subscription Tier Button */}
          <button
            onClick={onOpenMonetizationModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              stats.subscriptionTier === 'pro'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : stats.subscriptionTier === 'novice'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Subscription & Membership (Free, Novice, Pro Let Me Cook)"
          >
            <Crown className={`w-3.5 h-3.5 ${stats.subscriptionTier === 'pro' ? 'text-amber-300 fill-amber-300' : stats.subscriptionTier === 'novice' ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
            <span className="capitalize">{stats.subscriptionTier === 'pro' ? 'Pro Cook' : stats.subscriptionTier === 'novice' ? 'Novice' : 'Upgrade'}</span>
          </button>

          {/* Notification & Inactivity Alerts Menu */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer relative"
              title="Daily Goal & Inactivity Alerts"
              aria-label="Notification alerts"
            >
              {activeInactivityReminder ? (
                <BellRing className="w-4 h-4 text-amber-600 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              {/* Ping badge if reminder active */}
              {activeInactivityReminder && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white animate-ping" />
              )}
            </button>

            {isNotificationDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-3 px-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">Inactivity Reminders</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {notificationPermission === 'granted' ? 'Web Push ON' : 'In-App Only'}
                  </span>
                </div>

                {notificationPermission !== 'granted' && (
                  <button
                    onClick={() => requestBrowserNotifications()}
                    className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-xl border border-emerald-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BellRing className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Enable Native Browser Web Push</span>
                  </button>
                )}

                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Idle Status:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {idleSeconds === 0 ? 'Active 🟢' : `${idleSeconds}s / ${inactivityIntervalSec}s`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Target Goal:</span>
                    <span className="font-bold text-emerald-700">
                      {stats.dailyGoalTarget} XP / day
                    </span>
                  </div>
                </div>

                {activeInactivityReminder && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="font-extrabold text-amber-900 flex items-center gap-1">
                      <span>{activeInactivityReminder.iconEmoji}</span>
                      <span>Active Reminder</span>
                    </div>
                    <p className="text-amber-800 text-[11px] leading-snug">
                      {activeInactivityReminder.title}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    triggerTestInactivityReminder();
                    setIsNotificationDropdownOpen(false);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test Web Notification Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title={stats.soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            aria-label="Toggle sound"
          >
            {stats.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Primary Quick CTA to Sandbox */}
          <button
            onClick={() => setActiveTab('playground')}
            className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Code Sandbox</span>
          </button>
        </div>

      </div>
    </header>
  );
};
