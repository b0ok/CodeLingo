// Light / dark theme, chosen per device. "device" follows the operating system setting.
export type ThemeChoice = 'light' | 'dark' | 'device';

const KEY = 'codelingo_theme';
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

export function getThemeChoice(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'light' || v === 'dark' || v === 'device') return v;
  } catch { /* storage blocked */ }
  return 'device';
}

export function applyTheme(choice: ThemeChoice = getThemeChoice()) {
  const dark = choice === 'dark' || (choice === 'device' && !!media?.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
}

export function setThemeChoice(choice: ThemeChoice) {
  try { localStorage.setItem(KEY, choice); } catch { /* storage blocked */ }
  applyTheme(choice);
}

// Follow the OS when it switches (e.g. at sunset) while "device" is chosen.
media?.addEventListener('change', () => getThemeChoice() === 'device' && applyTheme());
