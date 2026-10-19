import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { sound } from '../utils/soundEffects';
import {
  PYTHON_ROADMAP_PHASES,
  CAREER_TRACKS as PYTHON_CAREER_TRACKS,
  getAllRoadmapNodes as getAllPythonRoadmapNodes,
  getRoadmapNodeById as getPythonRoadmapNodeById,
  RoadmapPhase,
  CareerTrack,
} from '../data/pythonRoadmap';
import {
  WEB_ROADMAP_PHASES,
  WEB_CAREER_TRACKS,
  getAllWebRoadmapNodes,
  getWebRoadmapNodeById,
} from '../data/webRoadmap';
import {
  JS_ROADMAP_PHASES,
  JS_CAREER_TRACKS,
  getAllJsRoadmapNodes,
  getJsRoadmapNodeById,
} from '../data/jsRoadmap';
import {
  SQL_ROADMAP_PHASES,
  SQL_CAREER_TRACKS,
  getAllSqlRoadmapNodes,
  getSqlRoadmapNodeById,
} from '../data/sqlRoadmap';
import {
  evaluateLearnerExplanation,
  getPhaseDiagnosticQuestions,
} from '../utils/agentCheckinService';
import { AgentCheckinEvaluation, RoadmapNode } from '../types';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Target,
  Brain,
  Award,
  Layers,
  ChevronRight,
  Send,
  Loader2,
  X,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  Cpu,
  BookOpen,
  Code2,
  Check,
  Zap,
} from 'lucide-react';

interface RoadmapModalProps {
  onSelectLesson?: (lessonId: string) => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ onSelectLesson }) => {
  const {
    stats,
    isRoadmapModalOpen,
    roadmapModalInitialTab,
    roadmapModalNodeId,
    closeRoadmapModal,
    checkedInNodes,
    markNodeCheckedIn,
    targetCareerTrack,
    setTargetCareerTrack,
  } = useGame();

  const isWeb = stats.activeLanguage === 'web';
  const isJs = stats.activeLanguage === 'javascript';
  const isSql = stats.activeLanguage === 'sql';

  let phases: RoadmapPhase[] = PYTHON_ROADMAP_PHASES;
  let careerTracks: CareerTrack[] = PYTHON_CAREER_TRACKS;
  let allNodes: RoadmapNode[] = getAllPythonRoadmapNodes();
  let defaultNodeId = 'rm-variables-types';
  let modalTitle = 'Python Roadmap & Agent Check-in';
  let badgeTitle = 'Mastery Curriculum';

  if (isWeb) {
    phases = WEB_ROADMAP_PHASES;
    careerTracks = WEB_CAREER_TRACKS as any;
    allNodes = getAllWebRoadmapNodes();
    defaultNodeId = 'web-rm-doctype-tree';
    modalTitle = 'HTML & CSS Roadmap & Agent Check-in';
    badgeTitle = 'HTML5 & CSS3 Master Pathway';
  } else if (isJs) {
    phases = JS_ROADMAP_PHASES;
    careerTracks = JS_CAREER_TRACKS as any;
    allNodes = getAllJsRoadmapNodes();
    defaultNodeId = 'js-rm-variables-tdz';
    modalTitle = 'JavaScript Roadmap & Agent Check-in';
    badgeTitle = 'Modern ES6+ & TypeScript Ready';
  } else if (isSql) {
    phases = SQL_ROADMAP_PHASES;
    careerTracks = SQL_CAREER_TRACKS as any;
    allNodes = getAllSqlRoadmapNodes();
    defaultNodeId = 'sql-rm-select-from';
    modalTitle = 'SQL Roadmap & Agent Check-in';
    badgeTitle = 'Relational Data Pathway';
  }

  const getNodeById = (id: string): RoadmapNode | undefined => {
    if (isWeb) return getWebRoadmapNodeById(id);
    if (isJs) return getJsRoadmapNodeById(id);
    if (isSql) return getSqlRoadmapNodeById(id);
    return getPythonRoadmapNodeById(id);
  };

  const [activeTab, setActiveTab] = useState<'roadmap' | 'checkin' | 'track'>(
    roadmapModalInitialTab || 'roadmap'
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    roadmapModalNodeId || defaultNodeId
  );
  const [userExplanation, setUserExplanation] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<AgentCheckinEvaluation | null>(null);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [intertwinedStrategy, setIntertwinedStrategy] = useState<'integrated' | 'html-only' | 'css-only'>('integrated');
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticSelectedOption, setDiagnosticSelectedOption] = useState<string | null>(null);
  const [showDiagnosticFeedback, setShowDiagnosticFeedback] = useState(false);

  // Sync initial tab and node when opened or when language changes
  React.useEffect(() => {
    if (isRoadmapModalOpen) {
      if (roadmapModalInitialTab) setActiveTab(roadmapModalInitialTab);
      if (roadmapModalNodeId) {
        setSelectedNodeId(roadmapModalNodeId);
      } else {
        setSelectedNodeId(defaultNodeId);
      }
      setSelectedPhaseFilter('all');
    }
  }, [isRoadmapModalOpen, roadmapModalInitialTab, roadmapModalNodeId, defaultNodeId]);

  if (!isRoadmapModalOpen) return null;

  const selectedNode = getNodeById(selectedNodeId) || allNodes[0];

  // Calculate roadmap statistics
  const totalNodesCount = allNodes.length;
  const verifiedCount = (checkedInNodes || []).filter((id) =>
    allNodes.some((n) => n.id === id)
  ).length;
  const completionPercent = Math.round((verifiedCount / totalNodesCount) * 100);

  const currentCareerTrack =
    careerTracks.find((t) => t.id === targetCareerTrack) || careerTracks[0];

  const handleRunEvaluation = async () => {
    if (!userExplanation.trim()) return;
    setIsEvaluating(true);
    sound.playClick();
    try {
      const result = await evaluateLearnerExplanation(
        selectedNode,
        userExplanation,
        currentCareerTrack?.name
      );
      setEvaluation(result);
      if (result.score >= 70) {
        sound.playCelebration();
      } else {
        sound.playOops();
      }
    } catch {
      // Fallback
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleClaimCheckin = () => {
    markNodeCheckedIn(selectedNode.id);
    sound.playAchievement();
  };

  const diagnosticQuestions = getPhaseDiagnosticQuestions(selectedNode.phaseId);
  const currentDiagnostic = diagnosticQuestions[diagnosticIndex % diagnosticQuestions.length];

  // Filter phases by user selection or intertwined strategy for HTML/CSS
  const filteredPhases = phases.filter((p) => {
    if (selectedPhaseFilter !== 'all' && p.id !== selectedPhaseFilter) return false;
    if (isWeb) {
      if (intertwinedStrategy === 'html-only') {
        return ['html-basics', 'semantic-html', 'forms-a11y'].includes(p.id);
      }
      if (intertwinedStrategy === 'css-only') {
        return ['css-foundations', 'box-model', 'flexbox', 'css-grid', 'responsive-modern'].includes(p.id);
      }
    }
    return true;
  });

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200" label={modalTitle} onClose={closeRoadmapModal}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={closeRoadmapModal}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${
                isWeb
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-400'
                  : isJs
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-400'
                  : isSql
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-400'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
              } border flex items-center justify-center shadow-inner`}>
                <Compass className="w-7 h-7 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold uppercase tracking-widest ${
                    isWeb
                      ? 'text-indigo-300 bg-indigo-950/60 border-indigo-500/30'
                      : isJs
                      ? 'text-amber-400 bg-amber-950/60 border-amber-500/30'
                      : isSql
                      ? 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                      : 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30'
                  } px-2.5 py-0.5 rounded-full border`}>
                    {badgeTitle}
                  </span>
                  <span className="text-xs text-slate-400">
                    Industry Developer Standards
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
                  {modalTitle}
                </h2>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Roadmap Verified
                </div>
                <div className={`text-sm font-extrabold ${isWeb ? 'text-indigo-300' : 'text-emerald-400'}`}>
                  {verifiedCount} / {totalNodesCount} Milestones ({completionPercent}%)
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 font-extrabold text-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex gap-2 mt-5 border-b border-white/10 pb-0">
            <button
              onClick={() => {
                setActiveTab('roadmap');
                sound.playClick();
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-sm transition flex items-center gap-2 border-b-2 ${
                activeTab === 'roadmap'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>1. Roadmap Visualizer</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('checkin');
                sound.playClick();
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-sm transition flex items-center gap-2 border-b-2 relative ${
                activeTab === 'checkin'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>2. Agent Check-in (Anti-Blind)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 right-1" />
            </button>

            <button
              onClick={() => {
                setActiveTab('track');
                sound.playClick();
              }}
              className={`px-4 py-2.5 rounded-t-xl font-bold text-sm transition flex items-center gap-2 border-b-2 ${
                activeTab === 'track'
                  ? 'border-emerald-400 text-emerald-300 bg-white/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>3. Target Goal Pacing</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-6">
          {/* ================= TAB 1: ROADMAP VISUALIZER ================= */}
          {activeTab === 'roadmap' && (
            <div className="space-y-6">
              {/* Intertwined Pedagogical Recommendation Banner (for HTML & CSS) */}
              {isWeb && (
                <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-2xl border border-indigo-400/30 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <span>Pedagogical Recommendation: Intertwined Dual-Track</span>
                          <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full">
                            Best Practice
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Never learn HTML in pure isolation! Intertwining semantic structure with CSS styling creates real intuition, preventing "div soup" and unstyled document fatigue.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Intertwined Strategy Selector */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10 text-xs">
                    <span className="text-slate-400 font-bold">Curriculum View Mode:</span>
                    <button
                      onClick={() => setIntertwinedStrategy('integrated')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        intertwinedStrategy === 'integrated'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      ⚡ Integrated Track (Recommended: Build Real Components)
                    </button>
                    <button
                      onClick={() => setIntertwinedStrategy('html-only')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        intertwinedStrategy === 'html-only'
                          ? 'bg-indigo-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      🧱 HTML Focus Only
                    </button>
                    <button
                      onClick={() => setIntertwinedStrategy('css-only')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition ${
                        intertwinedStrategy === 'css-only'
                          ? 'bg-purple-500 text-white shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      🎨 CSS Focus Only
                    </button>
                  </div>
                </div>
              )}

              {/* Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {isWeb
                      ? 'HTML5 & CSS3 Core Developer Pathway'
                      : isJs
                      ? 'JavaScript & TypeScript Core Developer Pathway'
                      : isSql
                      ? 'SQL & Relational Data Core Developer Pathway'
                      : 'Python Core Developer Pathway'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Each milestone is aligned with industry standard roadmaps. Click "Verify with Agent" on any milestone to test your understanding!
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter Phase:</span>
                  <select
                    value={selectedPhaseFilter}
                    onChange={(e) => setSelectedPhaseFilter(e.target.value)}
                    className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All {phases.length} Phases</option>
                    {phases.map((p) => (
                      <option key={p.id} value={p.id}>
                        Phase {p.phaseNumber}: {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phases Grid */}
              <div className="space-y-5">
                {filteredPhases.map((phase) => {
                  const phaseNodes = phase.nodes;
                  const verifiedInPhase = phaseNodes.filter((n) =>
                    (checkedInNodes || []).includes(n.id)
                  ).length;
                  const isPhaseComplete = verifiedInPhase === phaseNodes.length;

                  return (
                    <div
                      key={phase.id}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Phase Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                            #{phase.phaseNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-base">
                                {phase.title}
                              </h4>
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md">
                                {phase.badge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {phase.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs ${
                              isPhaseComplete
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {verifiedInPhase} / {phaseNodes.length} Verified
                          </span>
                        </div>
                      </div>

                      {/* Phase Nodes */}
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {phaseNodes.map((node) => {
                          const isVerified = (checkedInNodes || []).includes(node.id);

                          return (
                            <div
                              key={node.id}
                              className={`p-4 rounded-xl border transition ${
                                isVerified
                                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                      isVerified
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {isVerified ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <Cpu className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-900 text-sm leading-tight">
                                      {node.title}
                                    </h5>
                                    <span className="text-xs text-slate-500 font-mono">
                                      {node.roadmapCategory}
                                    </span>
                                  </div>
                                </div>

                                {isVerified ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <ShieldCheck className="w-3 h-3" />
                                    Mastered
                                  </span>
                                ) : (
                                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    Check-in Pending
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                {node.description}
                              </p>

                              {/* Key Concepts Pills */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {node.keyConcepts.map((concept) => (
                                  <span
                                    key={concept}
                                    className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono"
                                  >
                                    {concept}
                                  </span>
                                ))}
                              </div>

                              {/* Card Action Buttons */}
                              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    setSelectedNodeId(node.id);
                                    setActiveTab('checkin');
                                    sound.playClick();
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                                    isVerified
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                                  }`}
                                >
                                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{isVerified ? 'Re-Verify with Agent' : 'Agent Check-in'}</span>
                                </button>

                                {onSelectLesson && node.lessonIds[0] && (
                                  <button
                                    onClick={() => {
                                      closeRoadmapModal();
                                      onSelectLesson(node.lessonIds[0]);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1"
                                    title="Open interactive practice drills"
                                  >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>Drills</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 2: AGENTIC CHECK-IN (ANTI-BLIND LEARNING) ================= */}
          {activeTab === 'checkin' && (
            <div className="space-y-6">
              {/* Milestone Selector & Header Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 shrink-0">
                    <PytoMascot
                      mood={
                        evaluation
                          ? evaluation.score >= 70
                            ? 'celebrating'
                            : 'thinking'
                          : isEvaluating
                          ? 'thinking'
                          : 'happy'
                      }
                      size="sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Pyto Copilot • Anti-Blind Learning
                      </span>
                      <span className="text-xs text-slate-300">
                        Target: {currentCareerTrack?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-white mt-1">
                      Concept Understanding Check-in
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl">
                      Do not blindly memorize syntax. Explain the underlying mental model to the AI agent to verify deep comprehension.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-bold">Milestone:</span>
                  <select
                    value={selectedNodeId}
                    onChange={(e) => {
                      setSelectedNodeId(e.target.value);
                      setUserExplanation('');
                      setEvaluation(null);
                      setShowDiagnosticFeedback(false);
                      setDiagnosticSelectedOption(null);
                    }}
                    className="text-xs font-bold bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 max-w-xs truncate"
                  >
                    {allNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Socratic Prompt Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Milestone:
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {selectedNode.title}
                      </span>
                      <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {selectedNode.roadmapCategory}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                      {selectedNode.antiBlindQuestion}
                    </h4>
                  </div>
                </div>

                {/* Interactive Explanation Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Explain in your own words (or write sample code demonstrating the concept):</span>
                    <span className="text-xs text-slate-500 font-normal">
                      Minimum 1-2 clear sentences
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={userExplanation}
                    onChange={(e) => setUserExplanation(e.target.value)}
                    placeholder={
                      isWeb
                        ? 'e.g. When box-sizing is border-box, the declared width includes content, padding, and border. This prevents horizontal scrolling bugs because...'
                        : isSql
                        ? 'e.g. WHERE filters rows before grouping, so COUNT(*) does not exist yet. HAVING runs after GROUP BY, which is why...'
                        : 'e.g. When Python assigns a variable to an object in memory... The difference between mutable and immutable is...'
                    }
                    className="w-full text-sm p-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-colors"
                  />
                </div>

                {/* Quick Hint Accordion */}
                <details className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <summary className="font-bold text-slate-700 cursor-pointer hover:text-emerald-700 select-none">
                    Need a clue? Click to reveal key intuition trigger
                  </summary>
                  <p className="mt-2 text-slate-600 italic">
                    Hint: {selectedNode.sampleAnswerHint}
                  </p>
                </details>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    💡 Evaluated by Gemini AI Copilot + Socratic Technical Heuristics
                  </div>

                  <button
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating || userExplanation.trim().length < 5}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Evaluating Comprehension...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit for Agent Evaluation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Evaluation Results Card */}
              {evaluation && (
                <div
                  className={`p-6 rounded-2xl border transition animate-in fade-in duration-300 ${
                    evaluation.score >= 70
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm ${
                          evaluation.score >= 70 ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      >
                        {evaluation.score}%
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Comprehension Rating
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-900">
                          {evaluation.rating}
                        </h4>
                      </div>
                    </div>

                    {evaluation.score >= 70 && !(checkedInNodes || []).includes(selectedNode.id) && (
                      <button
                        onClick={handleClaimCheckin}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Claim Verified Badge (+40 XP)</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>What You Nailed</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {evaluation.whatNailed}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Blind Spots & Subtle Gotchas</span>
                      </div>
                      <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                        {evaluation.blindSpots.map((bs, i) => (
                          <li key={i}>{bs}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Copilot Mentor Tip:</span>
                    </div>
                    <p className="text-slate-600">{evaluation.actionableTip}</p>
                    <p className="text-slate-500 italic mt-1">
                      Next Step: {evaluation.recommendedNextStep}
                    </p>
                  </div>
                </div>
              )}

              {/* 30-Second Diagnostic Drill Section */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        30-Second Socratic Drill
                      </h4>
                      <p className="text-xs text-slate-500">
                        Rapidly verify mental models on edge cases before moving on
                      </p>
                    </div>
                  </div>
                </div>

                {currentDiagnostic && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="text-sm font-bold text-slate-900">
                      {currentDiagnostic.question}
                    </div>

                    <div className="space-y-2">
                      {currentDiagnostic.options.map((opt) => {
                        const isSelected = diagnosticSelectedOption === opt.id;
                        let btnStyle = 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800';
                        if (showDiagnosticFeedback) {
                          if (opt.isOptimal) {
                            btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                          } else if (isSelected) {
                            btnStyle = 'bg-rose-100 border-rose-400 text-rose-900';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-slate-900 text-white border-slate-900';
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setDiagnosticSelectedOption(opt.id);
                              setShowDiagnosticFeedback(true);
                              if (opt.isOptimal) sound.playCelebration();
                              else sound.playOops();
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-start gap-2.5 ${btnStyle}`}
                          >
                            <span className="font-mono font-bold mt-0.5">•</span>
                            <span>{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {showDiagnosticFeedback && (
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <span className="font-bold text-slate-900">Agent Explanation: </span>
                        <span className="text-slate-600">
                          {currentDiagnostic.options.find((o) => o.id === diagnosticSelectedOption)?.feedback ||
                            'Understand the distinction to avoid common production bugs.'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 3: TARGET GOAL PACING ================= */}
          {activeTab === 'track' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Select Your Target Career Track ({isWeb ? 'Web Frontend' : isJs ? 'JavaScript & Full-Stack' : isSql ? 'SQL & Data' : 'Python'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    The agent aligns your daily XP goals and prioritizes essential roadmap phases for your chosen role.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {careerTracks.map((track) => {
                    const isSelected = targetCareerTrack === track.id;

                    return (
                      <div
                        key={track.id}
                        onClick={() => {
                          setTargetCareerTrack(track.id as any);
                          sound.playClick();
                        }}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              <Target className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                {track.name}
                              </h4>
                              <span className="text-xs text-slate-500 font-medium">
                                {track.targetRole}
                              </span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                              Active Goal
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 mt-2.5">
                          {track.tagline}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {track.keyTools.map((tool) => (
                            <span
                              key={tool}
                              className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">Pacing Recommendation:</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-amber-500" />
                            {track.recommendedDailyMinutes} mins/day
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Pacing Dashboard */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Calculated Pacing for {currentCareerTrack?.name}
                    </span>
                    <h4 className="text-xl font-extrabold text-white mt-0.5">
                      Daily Routine Alignment
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Current Daily Goal: {stats.dailyGoalTarget} XP / Day
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Essential Roadmap Phases
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {currentCareerTrack?.essentialPhases.length || 6} Phases
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Targeted strictly to what matters for {currentCareerTrack?.targetRole}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Target Completion ETA
                    </div>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">
                      ~3 to 4 Weeks
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      At {currentCareerTrack?.recommendedDailyMinutes || 25} mins/day + 1 Agent Check-in/phase
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Inactivity Reminder Engine
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {stats.inactivityIntervalSec ? `${stats.inactivityIntervalSec}s interval` : 'Active'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Pings you if you become inactive during your daily coding window
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
