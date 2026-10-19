// Preset profile choices. Presets only (no uploads or links) keep profiles safe for learners 13 and up.

export const AVATARS: { id: string; emoji: string; label: string }[] = [
  { id: 'snake', emoji: '🐍', label: 'Snake' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'frog', emoji: '🐸', label: 'Frog' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'octopus', emoji: '🐙', label: 'Octopus' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dog', emoji: '🐶', label: 'Dog' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger' },
  { id: 'monkey', emoji: '🐵', label: 'Monkey' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'dragon', emoji: '🐲', label: 'Dragon' },
  { id: 'robot', emoji: '🤖', label: 'Robot' },
  { id: 'alien', emoji: '👾', label: 'Alien' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'bolt', emoji: '⚡', label: 'Lightning' },
  { id: 'headphones', emoji: '🎧', label: 'Headphones' },
  { id: 'controller', emoji: '🎮', label: 'Game controller' },
];

// Solid colors are free; gradients are Pro.
export const BANNERS: { id: string; label: string; className: string; pro?: boolean }[] = [
  { id: 'emerald', label: 'Emerald', className: 'bg-emerald-500' },
  { id: 'sky', label: 'Sky', className: 'bg-sky-500' },
  { id: 'violet', label: 'Violet', className: 'bg-violet-500' },
  { id: 'amber', label: 'Amber', className: 'bg-amber-400' },
  { id: 'rose', label: 'Rose', className: 'bg-rose-500' },
  { id: 'slate', label: 'Slate', className: 'bg-slate-700' },
  { id: 'sunset', label: 'Sunset', className: 'bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-600', pro: true },
  { id: 'ocean', label: 'Ocean', className: 'bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-600', pro: true },
  { id: 'aurora', label: 'Aurora', className: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-violet-600', pro: true },
  { id: 'ember', label: 'Ember', className: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600', pro: true },
];

export const LIMITS = {
  free: { bio: 80, featuredBadges: 3 },
  pro: { bio: 160, featuredBadges: 6 },
};

export const FRAMES: { id: string; label: string; className: string; pro?: boolean }[] = [
  { id: 'none', label: 'No frame', className: '' },
  { id: 'gold', label: 'Gold', className: 'ring-4 ring-amber-400', pro: true },
  { id: 'neon', label: 'Neon', className: 'ring-4 ring-fuchsia-500', pro: true },
  { id: 'flame', label: 'Flame', className: 'ring-4 ring-orange-500', pro: true },
];

// ponytail: Pro status is read from the browser for now, like unlimited life points; it moves to the
// subscriptions table with Stripe (build plan PR 11), and the database then enforces Pro-only choices.
export const isProTier = (tier?: string) => tier === 'pro';

// Shown to free learners as what Pro adds.
export const PRO_EXTRAS = [
  'Gradient banners',
  'Avatar frames (Gold, Neon, Flame)',
  'A status line',
  'Bio up to 160 characters',
  'Feature 6 badges',
  'Pin a code snippet to your profile',
];

export const avatarEmoji = (id?: string) => AVATARS.find((a) => a.id === id)?.emoji ?? AVATARS[0].emoji;
// Pro looks only show while Pro is active; the choice is kept so it comes back on renewal.
export const bannerClass = (id: string | undefined, pro: boolean) => {
  const b = BANNERS.find((x) => x.id === id && (pro || !x.pro));
  return (b ?? BANNERS[0]).className;
};
export const frameClass = (id: string | undefined, pro: boolean) => (pro ? FRAMES.find((x) => x.id === id)?.className ?? '' : '');
