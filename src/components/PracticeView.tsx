import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PATHWAYS_DATA, getPathway } from '../data/curriculum';
import { LessonNode } from '../types';
import { Dumbbell, ShieldAlert, Zap, Repeat, Heart, Play } from 'lucide-react';
import { PytoMascot } from './PytoMascot';
import { PlaygroundView } from './PlaygroundView';

interface PracticeViewProps {
  onStartLesson: (lesson: LessonNode) => void;
  onOpenHeartModal: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  onStartLesson,
  onOpenHeartModal,
}) => {
  const { stats, activeLanguage } = useGame();
  const [mode, setMode] = useState<'drills' | 'sandbox'>('drills');
  const currentPathway = getPathway(activeLanguage);

  // Dynamic practice modules mapped to current pathway
  const practiceModules = activeLanguage === 'javascript'
    ? [
        {
          id: 'drill-bugs',
          title: 'JS Bug Slaying Arena',
          subtitle: 'Catch sneaky syntax errors, missing quotes, and improper assignments.',
          icon: ShieldAlert,
          color: 'from-rose-500 to-orange-500',
          lessonId: 'js-lesson-1-1',
          tag: 'Bug Hunting',
          xp: 30,
        },
        {
          id: 'drill-syntax',
          title: 'Modern JS Syntax Sprint',
          subtitle: 'Template literals, console diagnostics, and let/const declarations.',
          icon: Zap,
          color: 'from-amber-500 to-yellow-500',
          lessonId: 'js-lesson-1-2',
          tag: 'ES6+ Strings',
          xp: 35,
        },
        {
          id: 'drill-logic',
          title: 'Strict Equality & Arrow Gauntlet',
          subtitle: 'Master triple equals (===) and concise arrow functions.',
          icon: Repeat,
          color: 'from-purple-500 to-indigo-500',
          lessonId: 'js-lesson-3-1',
          tag: 'Logic & Arrows',
          xp: 40,
        },
      ]
    : activeLanguage === 'sql'
    ? [
        {
          id: 'drill-syntax',
          title: 'SQL SELECT Sprint',
          subtitle: 'Projection, column naming, and wildcard query speed drills.',
          icon: Zap,
          color: 'from-cyan-500 to-blue-500',
          lessonId: 'sql-lesson-1-1',
          tag: 'SELECT & FROM',
          xp: 30,
        },
        {
          id: 'drill-logic',
          title: 'WHERE Filter Gauntlet',
          subtitle: 'Test comparison operators, text predicates, and boolean filters.',
          icon: Repeat,
          color: 'from-indigo-500 to-purple-500',
          lessonId: 'sql-lesson-1-2',
          tag: 'Data Filtering',
          xp: 35,
        },
        {
          id: 'drill-loops',
          title: 'Sorting & Pagination Arena',
          subtitle: 'ORDER BY clauses, descending rankings, and LIMIT offsets.',
          icon: Dumbbell,
          color: 'from-teal-500 to-emerald-500',
          lessonId: 'sql-lesson-2-1',
          tag: 'Sorting & Limits',
          xp: 40,
        },
      ]
    : activeLanguage === 'web'
    ? [
        {
          id: 'drill-bugs',
          title: 'HTML Tag Diagnostic',
          subtitle: 'Spot unclosed tags, semantic errors, and attribute syntax.',
          icon: ShieldAlert,
          color: 'from-rose-500 to-orange-500',
          lessonId: 'web-lesson-1-1',
          tag: 'HTML5 Debug',
          xp: 30,
        },
        {
          id: 'drill-syntax',
          title: 'CSS Styling Sprint',
          subtitle: 'Class selectors, colors, borders, and modern layout properties.',
          icon: Zap,
          color: 'from-violet-500 to-indigo-500',
          lessonId: 'web-lesson-1-2',
          tag: 'CSS Properties',
          xp: 35,
        },
      ]
    : [
        {
          id: 'drill-bugs',
          title: 'Bug Slaying Arena',
          subtitle: 'Identify sneaky syntax errors and fix broken Python code.',
          icon: ShieldAlert,
          color: 'from-rose-500 to-orange-500',
          lessonId: 'lesson-1-2',
          tag: 'Bug Fixes',
          xp: 30,
        },
        {
          id: 'drill-syntax',
          title: 'Fast-Paced Syntax Sprint',
          subtitle: 'Token matching, prints, and variable assignments in under 2 minutes.',
          icon: Zap,
          color: 'from-amber-500 to-yellow-500',
          lessonId: 'lesson-2-1',
          tag: 'Variables & Types',
          xp: 35,
        },
        {
          id: 'drill-logic',
          title: 'Boolean Logic Gauntlet',
          subtitle: 'Conditionals, if/elif decisions, and truth table challenges.',
          icon: Repeat,
          color: 'from-purple-500 to-indigo-500',
          lessonId: 'lesson-3-1',
          tag: 'Conditionals',
          xp: 40,
        },
        {
          id: 'drill-loops',
          title: 'The Loop Coil Challenge',
          subtitle: 'Count iterations, master range(), and test while break-points.',
          icon: Dumbbell,
          color: 'from-emerald-500 to-teal-500',
          lessonId: 'lesson-4-1',
          tag: 'Loops & Iteration',
          xp: 45,
        },
      ];

  const handleLaunchPractice = (lessonId: string) => {
    for (const pathway of Object.values(PATHWAYS_DATA)) {
      for (const unit of pathway.units) {
        const found = unit.nodes.find((n) => n.id === lessonId);
        if (found) {
          onStartLesson(found);
          return;
        }
      }
    }
  };

  const modeSwitch = (
    <div role="group" aria-label="Practice mode" className="max-w-3xl mx-auto flex gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
      {(['drills', 'sandbox'] as const).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          className={`py-2 px-5 text-sm font-bold rounded-xl cursor-pointer ${
            mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {m === 'drills' ? 'Drills' : 'Sandbox'}
        </button>
      ))}
    </div>
  );

  if (mode === 'sandbox') {
    return (
      <div className="space-y-6">
        {modeSwitch}
        <PlaygroundView />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 xl:pb-12">
      {modeSwitch}
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-lg border border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
            <Dumbbell className="w-4 h-4" />
            <span>Targeted Training Gym</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Daily Practice Hub
          </h2>
          <p className="text-sm text-slate-300 max-w-md">
            Strengthen your muscle memory. Practice review drills to earn bonus XP and keep your coding skills razor sharp!
          </p>
        </div>
        <PytoMascot mood="happy" size="md" showHat={true} />
      </div>

      {/* Life point recovery card */}
      <div className="p-5 bg-rose-50 border-2 border-rose-200/80 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 fill-rose-500 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-rose-950">
              Life point sanctuary ({stats.hearts}/{stats.maxHearts} life points)
            </h3>
            <p className="text-xs text-rose-700">
              Did a hard challenge cost you a life point? Take a free review drill to restore them all.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenHeartModal}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer shrink-0"
        >
          Refill Drill
        </button>
      </div>

      {/* Practice Modules Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Featured Review Drills
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {practiceModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.id}
                onClick={() => handleLaunchPractice(mod.lessonId)}
                className="p-5 bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${mod.color} text-white flex items-center justify-center shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{mod.xp} XP
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {mod.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {mod.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span>Start Drill</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
