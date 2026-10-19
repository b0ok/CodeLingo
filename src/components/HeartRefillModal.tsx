import React, { useState } from 'react';
import { Modal } from './Modal';
import { useGame } from '../context/GameContext';
import { PytoMascot } from './PytoMascot';
import { sound } from '../utils/soundEffects';
import { X, Heart, Circle, Dumbbell, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HeartRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeartRefillModal: React.FC<HeartRefillModalProps> = ({ isOpen, onClose }) => {
  const { stats, refillHearts, refillHeartsWithGems, buyStreakFreeze } = useGame();
  const [drillActive, setDrillActive] = useState(false);
  const [drillStep, setDrillStep] = useState(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);
  const [drillSuccess, setDrillSuccess] = useState(false);

  if (!isOpen) return null;

  // Mini review drill questions to earn life points back for free
  const drillQuestions = [
    {
      q: 'Which function prints text to the screen in Python?',
      opts: ['echo()', 'print()', 'console.log()', 'say()'],
      correct: 1,
    },
    {
      q: 'Which symbol defines a comment in Python?',
      opts: ['//', '/*', '#', '<!--'],
      correct: 2,
    },
    {
      q: 'What is the boolean opposite of True in Python?',
      opts: ['False', 'false', '0', 'None'],
      correct: 0,
    },
  ];

  const handleStartDrill = () => {
    sound.playTap();
    setDrillActive(true);
    setDrillStep(0);
    setSelectedDrillOption(null);
    setDrillSuccess(false);
  };

  const handleCheckDrill = () => {
    if (selectedDrillOption === drillQuestions[drillStep].correct) {
      sound.playSuccess();
      if (drillStep + 1 < drillQuestions.length) {
        setDrillStep((prev) => prev + 1);
        setSelectedDrillOption(null);
      } else {
        // Complete drill and restore all life points
        refillHearts();
        setDrillSuccess(true);
        sound.playVictory();
      }
    } else {
      sound.playError();
      alert('Review tip: Take another look and try again!');
    }
  };

  return (
    <Modal className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" label="Life points" onClose={onClose}>
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!drillActive ? (
          <div className="space-y-6 text-center">
            <PytoMascot mood={stats.hearts === 0 ? 'concerned' : 'happy'} size="md" className="justify-center" />

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {stats.hearts === 0 ? 'Out of life points' : 'Life point sanctuary'}
              </h3>
              <p className="text-sm text-slate-600">
                {stats.hearts === 0
                  ? 'Take a free practice drill to earn your life points back, or refill them with gold rings.'
                  : `You have ${stats.hearts} of ${stats.maxHearts} life points.`}
              </p>
            </div>

            <div className="space-y-3 text-left">
              {/* Option 1: Practice drill */}
              <button
                onClick={handleStartDrill}
                className="w-full p-4 border-2 border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl flex items-center justify-between cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                      Free practice drill
                    </div>
                    <div className="text-xs text-slate-500">
                      Answer 3 quick review questions to refill all life points
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 uppercase">FREE</span>
              </button>

              {/* Option 2: gold ring refill */}
              <button
                onClick={() => {
                  if (refillHeartsWithGems()) {
                    onClose();
                  } else {
                    alert('You need 20 gold rings for a refill. Finish lessons to earn more.');
                  }
                }}
                disabled={stats.gems < 20}
                className="w-full p-4 border-2 border-slate-200 hover:border-yellow-400 rounded-2xl flex items-center justify-between cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Refill all life points</div>
                    <div className="text-xs text-slate-500">Get all 5 life points back now</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                  <Circle strokeWidth={3} className="w-4 h-4 text-yellow-500" />
                  <span>20</span>
                </div>
              </button>

              {/* Option 3: Buy Streak Freeze */}
              <button
                onClick={() => {
                  if (buyStreakFreeze()) {
                    alert('Streak Freeze purchased! Your streak is protected.');
                  } else {
                    alert('You need 50 gold rings for a streak freeze. Finish lessons to earn more.');
                  }
                }}
                disabled={stats.gems < 50}
                className="w-full p-4 border-2 border-slate-200 hover:border-amber-400 rounded-2xl flex items-center justify-between cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">Streak Freeze ({stats.streakFreeze} Owned)</div>
                    <div className="text-xs text-slate-500">Protects your streak if you miss a day</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-700 font-bold text-sm">
                  <Circle strokeWidth={3} className="w-4 h-4 text-yellow-500" />
                  <span>50</span>
                </div>
              </button>
            </div>
          </div>
        ) : drillSuccess ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-2xl font-extrabold text-slate-900">Life points restored</h3>
            <p className="text-sm text-slate-600">
              You crushed the drill. All 5 life points are refilled and ready for new coding challenges!
            </p>
            <button
              onClick={() => {
                setDrillActive(false);
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              Back to Lessons
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Practice drill · Question {drillStep + 1} of 3</span>
            </div>

            <h4 className="text-lg font-bold text-slate-900">
              {drillQuestions[drillStep].q}
            </h4>

            <div className="space-y-2">
              {drillQuestions[drillStep].opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDrillOption(idx)}
                  className={`w-full p-3.5 text-left text-sm font-medium rounded-xl border-2 transition cursor-pointer ${
                    selectedDrillOption === idx
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setDrillActive(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleCheckDrill}
                disabled={selectedDrillOption === null}
                className="px-6 py-2.5 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl cursor-pointer"
              >
                Submit Answer
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
