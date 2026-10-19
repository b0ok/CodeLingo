import React from 'react';
import { Unit, LessonNode } from '../types';
import { useGame } from '../context/GameContext';
import { getRoadmapProgress } from '../data/roadmapProgress';
import { getPathway } from '../data/curriculum';
import { PytoMascot } from './PytoMascot';
import { Check, Lock, Star, Play, Terminal, Quote, Hash, Box, ToggleLeft, RefreshCw, GitBranch, Split, Cpu, Repeat, List, CircleDot, Layers, PackagePlus, Key, Sparkles, CornerDownLeft, Sliders, Shield, Zap, ShieldCheck, Compass, Brain, ExternalLink } from 'lucide-react';

interface LessonPathProps {
  units: Unit[];
  onSelectLesson: (lesson: LessonNode) => void;
  onOpenHeartModal: () => void;
}

export const LessonPath: React.FC<LessonPathProps> = ({
  units,
  onSelectLesson,
  onOpenHeartModal,
}) => {
  const { stats, activeLanguage, openRoadmapModal, checkedInNodes } = useGame();
  const roadmap = getRoadmapProgress(activeLanguage, checkedInNodes);
  const pathway = getPathway(activeLanguage);

  // Helper to render appropriate icon
  const getIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'terminal': return <Terminal className={className} />;
      case 'quote': return <Quote className={className} />;
      case 'hash': return <Hash className={className} />;
      case 'box': return <Box className={className} />;
      case 'toggle-left': return <ToggleLeft className={className} />;
      case 'refresh-cw': return <RefreshCw className={className} />;
      case 'git-branch': return <GitBranch className={className} />;
      case 'split': return <Split className={className} />;
      case 'cpu': return <Cpu className={className} />;
      case 'repeat': return <Repeat className={className} />;
      case 'list': return <List className={className} />;
      case 'circle-dot': return <CircleDot className={className} />;
      case 'layers': return <Layers className={className} />;
      case 'package-plus': return <PackagePlus className={className} />;
      case 'key': return <Key className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'corner-down-left': return <CornerDownLeft className={className} />;
      case 'sliders': return <Sliders className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'shield-check': return <ShieldCheck className={className} />;
      default: return <Play className={className} />;
    }
  };

  // Find the current active lesson node (first non-completed lesson)
  let foundActive = false;
  let activeNodeId: string | null = null;
  for (const unit of units) {
    for (const node of unit.nodes) {
      if (!stats.completedLessons.includes(node.id) && !foundActive) {
        activeNodeId = node.id;
        foundActive = true;
        break;
      }
    }
    if (foundActive) break;
  }

  // Horizontal offsets for the winding path (0 = center, -36 = left, +36 = right)
  const offsetPattern = [0, -36, 0, 36];

  const today = new Date().toISOString().split('T')[0];
  const todayXp = stats.history[today] || 0;
  const targetXp = stats.dailyGoalTarget || 50;
  const goalPercent = Math.min(100, Math.round((todayXp / targetXp) * 100));

  const totalLessons = units.reduce((acc, u) => acc + u.nodes.length, 0);
  const pathwayCompleted = units.flatMap((u) => u.nodes).filter((n) => stats.completedLessons.includes(n.id)).length;

  return (
    <div className="w-full max-w-xl mx-auto pb-24 xl:pb-12">
      {/* Friendly Mascot Intro Banner on top of path */}
      <div className="mb-4 p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200/80 rounded-2xl shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <span>{pathway.badge}</span>
            <span>·</span>
            <span>{pathwayCompleted} of {totalLessons} Lessons</span>
            <span>·</span>
            <span className="text-emerald-800 font-extrabold tabular-nums">🎯 {todayXp}/{targetXp} XP ({goalPercent}%)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Your {pathway.name} Learning Tree
          </h2>
          <p className="text-sm text-slate-600">
            {pathway.tagline}. Bite-sized 3-minute interactive coding challenges!
          </p>
        </div>
        <PytoMascot mood="happy" size="sm" showHat={true} />
      </div>

      {/* Curriculum Roadmap & Anti-Blind Agent Check-in Banner */}
      {(activeLanguage === 'python' || activeLanguage === 'web' || activeLanguage === 'javascript') && (
        <div className={`mb-8 p-4 bg-gradient-to-r ${
          activeLanguage === 'web'
            ? 'from-slate-900 via-indigo-950 to-purple-950 border-indigo-500/30'
            : activeLanguage === 'javascript'
            ? 'from-slate-900 via-amber-950 to-slate-900 border-amber-500/30'
            : 'from-slate-900 via-slate-800 to-emerald-950 border-emerald-500/30'
        } rounded-2xl text-white shadow-md border flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${
              activeLanguage === 'web'
                ? 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
                : activeLanguage === 'javascript'
                ? 'bg-amber-500/20 border-amber-400/30 text-amber-400'
                : 'bg-emerald-500/20 border-emerald-400/30 text-emerald-400'
            } border flex items-center justify-center shrink-0`}>
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${
                  activeLanguage === 'web'
                    ? 'text-indigo-300 bg-indigo-950/80 border-indigo-500/30'
                    : activeLanguage === 'javascript'
                    ? 'text-amber-400 bg-amber-950/80 border-amber-500/30'
                    : 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30'
                } px-2 py-0.5 rounded-full border`}>
                  {activeLanguage === 'web'
                    ? 'HTML & CSS Dual-Track'
                    : activeLanguage === 'javascript'
                    ? 'JavaScript Mastery Track'
                    : 'Python Mastery Track'}
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  {roadmap.verified} / {roadmap.total} milestones verified
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeLanguage === 'web'
                  ? 'Intertwined HTML & CSS: build real components with semantic tags + Flexbox/Grid instead of "div soup"!'
                  : activeLanguage === 'javascript'
                  ? 'Modern ES6+, Event Loop, Closures & Async: verify you truly understand execution mechanics, not just syntax!'
                  : 'Don\'t learn blindly! Run an Agent Check-in to verify you truly understand the mental models.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openRoadmapModal(undefined, 'checkin')}
              className={`px-3 py-1.5 rounded-xl ${
                activeLanguage === 'web'
                  ? 'bg-indigo-500 hover:bg-indigo-400'
                  : activeLanguage === 'javascript'
                  ? 'bg-amber-500 hover:bg-amber-400'
                  : 'bg-emerald-500 hover:bg-emerald-400'
              } text-slate-950 font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Agent Check-in</span>
            </button>
            <button
              onClick={() => openRoadmapModal(undefined, 'roadmap')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
            >
              <span>Visualizer</span>
            </button>
          </div>
        </div>
      )}

      {/* Units Stack */}
      <div className="space-y-12">
        {units.map((unit) => {
          const unitCompletedCount = unit.nodes.filter((n) => stats.completedLessons.includes(n.id)).length;
          const isUnitFullyCompleted = unitCompletedCount === unit.nodes.length;

          return (
            <section key={unit.id} className="relative">
              {/* Unit Header Card */}
              <div className="sticky top-18 z-20 mb-8 p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                      Unit {unit.unitNumber}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {unit.subtitle}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 tabular-nums">
                      {unitCompletedCount}/{unit.nodes.length}
                    </span>
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition duration-500"
                        style={{ width: `${(unitCompletedCount / unit.nodes.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Nodes Path */}
              <div className="relative flex flex-col items-center gap-7 my-6">
                {unit.nodes.map((node, nodeIdx) => {
                  const isCompleted = stats.completedLessons.includes(node.id);
                  const isCurrent = node.id === activeNodeId;
                  const isLocked = !isCompleted && !isCurrent;
                  const stars = stats.nodeStars[node.id] || (isCompleted ? 3 : 0);

                  const xOffset = offsetPattern[nodeIdx % offsetPattern.length];

                  const handleClick = () => {
                    if (isLocked) return;
                    if (stats.hearts <= 0) {
                      onOpenHeartModal();
                      return;
                    }
                    onSelectLesson(node);
                  };

                  return (
                    <div
                      key={node.id}
                      className={`relative flex flex-col items-center group ${isCurrent ? 'mt-8' : ''}`}
                      style={{ transform: `translateX(${xOffset}px)` }}
                    >
                      {/* Mascot Speech Bubble if current node */}
                      {isCurrent && (
                        <div className="absolute -top-11 z-30 animate-bounce-subtle">
                          <div className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md whitespace-nowrap flex items-center gap-1">
                            <span>START HERE</span>
                            <span className="text-amber-200">★</span>
                          </div>
                          <div className="w-2 h-2 bg-emerald-600 rotate-45 mx-auto -mt-1" />
                        </div>
                      )}

                      {/* Node Button */}
                      <button
                        onClick={handleClick}
                        disabled={isLocked}
                        aria-label={`${node.title}, ${isCompleted ? `completed, ${stars} of 3 stars` : isLocked ? 'locked' : 'start lesson'}`}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition duration-200 cursor-pointer shadow-md min-h-[44px] min-w-[44px] ${
                          isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-4 border-emerald-400 active:scale-95'
                            : isCurrent
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 border-4 border-emerald-300 ring-4 ring-emerald-400/40 animate-pulse active:scale-95'
                            : 'bg-slate-200 text-slate-400 border-4 border-slate-300 cursor-not-allowed opacity-80'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-7 h-7 stroke-[3px]" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6 text-slate-400" />
                        ) : (
                          getIcon(node.icon, 'w-7 h-7')
                        )}
                      </button>

                      {/* Stars for completed lessons */}
                      {isCompleted && (
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${
                                starIdx <= stars
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-slate-200 text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Node Label Below */}
                      <div className="text-center mt-1.5 max-w-[130px]">
                        <span className={`text-xs font-bold leading-tight block line-clamp-2 ${
                          isCurrent ? 'text-emerald-700' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {node.title}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          +{node.xpReward} XP
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Unit Completion Chest Banner */}
                {isUnitFullyCompleted && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-bold text-amber-800 flex items-center justify-center gap-2">
                    <span>🏆</span>
                    <span>Unit {unit.unitNumber} Mastered! Badge unlocked: {unit.badgeName}</span>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
