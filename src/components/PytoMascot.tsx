import React from 'react';

export type MascotMood = 'happy' | 'talking' | 'thinking' | 'celebrating' | 'concerned';

interface PytoMascotProps {
  mood?: MascotMood;
  speechText?: string;
  size?: 'sm' | 'md' | 'lg';
  showHat?: boolean;
  className?: string;
}

export const PytoMascot: React.FC<PytoMascotProps> = ({
  mood = 'happy',
  speechText,
  size = 'md',
  showHat = true,
  className = '',
}) => {
  const sizeDims = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
  }[size];

  return (
    <div className={`relative flex items-center gap-3 ${className}`}>
      {/* Speech bubble */}
      {speechText && (
        <div className="relative max-w-xs md:max-w-sm px-4 py-2.5 bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200/80 shadow-sm text-sm font-medium leading-snug">
          <p>{speechText}</p>
          <div className="absolute -left-2 bottom-2 w-2 h-2 bg-white border-l border-b border-slate-200/80 rotate-45" />
        </div>
      )}

      {/* Mascot Graphic */}
      <div className={`relative ${sizeDims} shrink-0 animate-bounce-subtle`}>
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md overflow-visible" fill="none">
          {/* Shadow */}
          <ellipse cx="60" cy="110" rx="36" ry="8" fill="#cbd5e1" opacity="0.6" />

          {/* Snake Coils (Body) */}
          <path
            d="M 30 92 C 20 80, 25 60, 42 62 C 55 64, 52 82, 70 82 C 85 82, 95 72, 92 56 C 90 42, 78 36, 64 36"
            stroke="#10b981"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Belly Underbelly Highlight */}
          <path
            d="M 32 94 C 24 84, 28 68, 42 68 C 52 68, 52 84, 70 84 C 84 84, 91 76, 90 64"
            stroke="#6ee7b7"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Tail rattle/tip */}
          <circle cx="28" cy="94" r="5" fill="#f59e0b" />
          <circle cx="22" cy="98" r="4" fill="#fbbf24" />

          {/* Snake Head */}
          <circle cx="62" cy="40" r="26" fill="#10b981" />
          <ellipse cx="62" cy="45" rx="22" ry="17" fill="#34d399" opacity="0.4" />

          {/* Cheeks */}
          <ellipse cx="45" cy="47" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="79" cy="47" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />

          {/* Eyes depending on mood */}
          {mood === 'celebrating' ? (
            // Joyful curved squint eyes
            <>
              <path d="M 48 38 Q 53 32 58 38" stroke="#064e3b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <path d="M 66 38 Q 71 32 76 38" stroke="#064e3b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            </>
          ) : mood === 'concerned' ? (
            // Concerned sympathetic eyes
            <>
              <circle cx="53" cy="38" r="4.5" fill="#064e3b" />
              <circle cx="71" cy="38" r="4.5" fill="#064e3b" />
              <path d="M 47 30 Q 53 34 58 32" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 66 32 Q 71 34 77 30" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            // Bright cheerful big eyes
            <>
              <circle cx="53" cy="38" r="6" fill="#ffffff" />
              <circle cx="71" cy="38" r="6" fill="#ffffff" />
              <circle cx="54" cy="38" r="3.5" fill="#064e3b" />
              <circle cx="72" cy="38" r="3.5" fill="#064e3b" />
              {/* Eye sparkle highlights */}
              <circle cx="52" cy="36" r="1.5" fill="#ffffff" />
              <circle cx="70" cy="36" r="1.5" fill="#ffffff" />
            </>
          )}

          {/* Mouth */}
          {mood === 'concerned' ? (
            // Small wavy mouth
            <path d="M 57 52 Q 62 48 67 52" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : mood === 'talking' ? (
            // Open talking mouth
            <ellipse cx="62" cy="51" rx="5" ry="4" fill="#064e3b" />
          ) : (
            // Big happy smile
            <path d="M 54 48 Q 62 56 70 48" stroke="#064e3b" strokeWidth="3" strokeLinecap="round" fill="none" />
          )}

          {/* Cute forked little tongue when happy or celebrating */}
          {(mood === 'happy' || mood === 'celebrating') && (
            <path
              d="M 62 53 L 62 59 L 59 62 M 62 59 L 65 62"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Graduation Cap / Coder Accessory */}
          {showHat && (
            <g transform="translate(42, 6)">
              {/* Cap diamond */}
              <polygon points="20,0 42,9 20,18 -2,9" fill="#1e293b" />
              {/* Cap skullcap */}
              <path d="M 8 12 Q 20 18 32 12 L 32 17 Q 20 22 8 17 Z" fill="#0f172a" />
              {/* Yellow gold tassel */}
              <circle cx="20" cy="9" r="2.5" fill="#f59e0b" />
              <path d="M 20 9 C 24 12, 28 14, 28 22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="28" cy="23" r="2" fill="#d97706" />
            </g>
          )}

          {/* Celebration confetti stars if celebrating */}
          {mood === 'celebrating' && (
            <g>
              <circle cx="18" cy="25" r="3" fill="#f59e0b" className="animate-ping" />
              <circle cx="100" cy="30" r="3.5" fill="#3b82f6" className="animate-ping" />
              <polygon points="105,15 107,20 112,20 108,23 110,28 105,25 100,28 102,23 98,20 103,20" fill="#ec4899" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
