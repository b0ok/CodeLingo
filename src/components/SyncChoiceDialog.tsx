import React from 'react';
import { Modal } from './Modal';
import type { CloudState } from '../utils/cloudSync';

// Shown once when someone signs in on a device that already has progress and their account does too.
export const SyncChoiceDialog: React.FC<{
  local: CloudState;
  cloud: CloudState;
  onChoose: (choice: 'combine' | 'account') => void;
}> = ({ local, cloud, onChoose }) => {
  const summary = (s: CloudState) =>
    `${s.xp.toLocaleString()} XP · ${s.completedLessons.length} lessons · ${s.streak}-day streak`;
  return (
    <Modal
      className="fixed inset-0 z-[60] bg-slate-900/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      label="Combine your progress"
    >
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-5">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Combine your progress?</h2>
        <p className="text-slate-600">This device and your account both have progress.</p>
        <dl className="grid gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <dt className="text-xs font-bold text-slate-600 uppercase">On this device</dt>
            <dd className="font-bold text-slate-900 tabular-nums">{summary(local)}</dd>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <dt className="text-xs font-bold text-slate-600 uppercase">In your account</dt>
            <dd className="font-bold text-slate-900 tabular-nums">{summary(cloud)}</dd>
          </div>
        </dl>
        <button onClick={() => onChoose('combine')} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl cursor-pointer">
          Combine them
        </button>
        <button onClick={() => onChoose('account')} className="w-full py-3 border-2 border-slate-300 text-slate-800 font-bold rounded-2xl hover:bg-slate-50 cursor-pointer">
          Use my account's progress only
        </button>
        <p className="text-sm text-slate-600">Combining keeps every lesson, badge and the higher XP and streak from both.</p>
      </div>
    </Modal>
  );
};
