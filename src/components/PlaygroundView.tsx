import React, { useState, useEffect } from 'react';
import { runUnifiedCode, MULTI_LANG_TEMPLATES, PlaygroundTemplate } from '../utils/codeRunner';
import { preloadPython, pythonStatus } from '../utils/pythonRunner';
import { sound } from '../utils/soundEffects';
import { PytoMascot } from './PytoMascot';
import { LanguageId } from '../types';
import { useGame } from '../context/GameContext';
import { Play, RotateCcw, Copy, Check, Terminal, Sparkles, BookOpen, Code2 } from 'lucide-react';

export const PlaygroundView: React.FC = () => {
  const { activeLanguage, trackActivity } = useGame();
  // Counts toward the "Practice for 5 minutes" task while this screen is open and visible.
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === 'visible' && trackActivity('practiceMinutes'), 60000);
    return () => clearInterval(timer);
  }, [trackActivity]);

  const [selectedLang, setSelectedLang] = useState<LanguageId>(activeLanguage || 'python');
  useEffect(() => {
    if (selectedLang === 'python') preloadPython();
  }, [selectedLang]);

  // Filter templates by selected language
  const availableTemplates = MULTI_LANG_TEMPLATES.filter((t) => t.language === selectedLang);
  const initialTemplate = availableTemplates[0] || MULTI_LANG_TEMPLATES[0];

  const [code, setCode] = useState<string>(initialTemplate.code);
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState<string>(initialTemplate.title);
  const selectedTemplate = availableTemplates.find((t) => t.title === selectedTemplateTitle);

  const handleLanguageChange = (lang: LanguageId) => {
    sound.playTap();
    setSelectedLang(lang);
    const tmpls = MULTI_LANG_TEMPLATES.filter((t) => t.language === lang);
    const first = tmpls[0] || MULTI_LANG_TEMPLATES[0];
    setSelectedTemplateTitle(first.title);
    setCode(first.code);
    setOutput('');
    setError(null);
    setExecutionTime(null);
  };

  const handleRun = async () => {
    sound.playTap();
    if (selectedLang === 'python' && pythonStatus() !== 'ready') setOutput('Starting Python (the first run downloads about 12 MB)…');
    const result = await runUnifiedCode(code, selectedLang);
    setOutput(result.output);
    setError(result.error || null);
    setExecutionTime(result.executionTimeMs);

    if (result.success) {
      sound.playSuccess();
      trackActivity('sandboxRuns');
    } else {
      sound.playError();
    }
  };

  const handleSelectTemplate = (template: PlaygroundTemplate) => {
    sound.playTap();
    setSelectedTemplateTitle(template.title);
    setCode(template.code);
    setOutput('');
    setError(null);
    setExecutionTime(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    sound.playTap();
    const found = availableTemplates.find((t) => t.title === selectedTemplateTitle) || availableTemplates[0];
    setCode(found.code);
    setOutput('');
    setError(null);
  };

  const getFileBadge = () => {
    switch (selectedLang) {
      case 'python': return 'main.py';
      case 'javascript': return 'index.js';
      case 'sql': return 'query.sql';
      case 'web': return 'index.html';
    }
  };

  const getLanguageLabel = () => {
    switch (selectedLang) {
      case 'python': return 'Python 3';
      case 'javascript': return 'JavaScript (ES6+)';
      case 'sql': return 'SQL In-Memory Engine';
      case 'web': return 'HTML5 / CSS3';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 xl:pb-12">
      
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-lg border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Multi-Language Sandbox</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Code, Experiment & Play
          </h2>
          <p className="text-sm text-slate-300 max-w-lg">
            Pick a practice below, run it, then try the change it suggests. Or write anything you like.
          </p>
        </div>
        <PytoMascot mood="talking" size="md" showHat={true} />
      </div>

      {/* Language Track Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['python', 'javascript', 'sql', 'web'] as LanguageId[]).map((lang) => {
          const isSelected = selectedLang === lang;
          const labelMap: Record<LanguageId, { label: string; icon: string }> = {
            python: { label: 'Python 3', icon: '🐍' },
            javascript: { label: 'JavaScript', icon: '⚡' },
            sql: { label: 'SQL & Data', icon: '🗄️' },
            web: { label: 'HTML & CSS', icon: '🌐' },
          };

          return (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{labelMap[lang].icon}</span>
              <span>{labelMap[lang].label}</span>
            </button>
          );
        })}
      </div>

      {/* Starter Templates Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{getLanguageLabel()} practices ({availableTemplates.length})</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-1">
          {availableTemplates.map((tmpl) => (
            <button
              key={tmpl.title}
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                selectedTemplateTitle === tmpl.title
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm">
          <p className="text-slate-600">{selectedTemplate.description}</p>
          <p className="mt-1.5 text-slate-900"><strong className="text-emerald-700">Try this:</strong> {selectedTemplate.task}</p>
        </div>
      )}

      {/* Two Column Editor + Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left: Code Editor Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col h-[480px]">
          {/* Editor Header */}
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-400 ml-2">{getFileBadge()}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Copy code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 p-4 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-transparent text-emerald-400 font-mono text-sm leading-relaxed resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"
              placeholder={`Write ${getLanguageLabel()} code here...`}
            />
          </div>

          {/* Editor Bottom Run Bar */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-500">
              {getLanguageLabel()} Runner
            </span>

            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Run Code</span>
            </button>
          </div>
        </div>

        {/* Right: Terminal Console Output */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm flex flex-col h-[480px]">
          {/* Terminal Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold">Standard Output (stdout)</span>
            </div>

            {executionTime !== null && (
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                executed in {executionTime}ms
              </span>
            )}
          </div>

          {/* Console Body */}
          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
            {selectedLang === 'web' && output ? (
              <iframe title="Page preview" sandbox="" srcDoc={code} className="w-full h-full bg-white rounded-xl" />
            ) : error ? (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 whitespace-pre-wrap leading-relaxed">
                {error}
              </div>
            ) : output ? (
              <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed font-mono">
                {output}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-6 space-y-2">
                <Terminal className="w-8 h-8 stroke-1 text-slate-700" />
                <p>Click "Run Code" to execute your script and inspect output here.</p>
              </div>
            )}
          </div>

          {/* Terminal Footer */}
          <div className="p-3 bg-slate-900/60 border-t border-slate-800 text-xs font-mono text-slate-500 flex items-center justify-between">
            <span>Status: {error ? 'Error' : output ? 'Finished' : 'Ready'}</span>
            {output && (
              <button
                onClick={() => setOutput('')}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear Output
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
