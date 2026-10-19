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

// Pro extras shown as locked previews until Pro is read from the server (build plan PR 11).
export const PRO_EXTRAS = [
  'Gradient banners',
  'Avatar frames (Legend, Founder, streak flame)',
  'A status line',
  'Bio up to 160 characters',
  'Feature 6 badges',
  'Pin a code snippet to your profile',
];

export const avatarEmoji = (id?: string) => AVATARS.find((a) => a.id === id)?.emoji ?? AVATARS[0].emoji;
export const bannerClass = (id?: string) => BANNERS.find((b) => b.id === id)?.className ?? BANNERS[0].className;
