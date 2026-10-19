// Preset profile choices. Presets only (no uploads or links) keep profiles safe for learners 13 and up.
// `pro` items need Pro; `shop` items are bought with gold rings and are different from Pro's.
import { ECONOMY } from './economy';

type Item = { id: string; label: string; pro?: boolean; shop?: boolean };

export const AVATARS: (Item & { emoji: string })[] = [
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
  { id: 'dino', emoji: '🦖', label: 'Dino', shop: true },
  { id: 'whale', emoji: '🐳', label: 'Whale', shop: true },
  { id: 'shark', emoji: '🦈', label: 'Shark', shop: true },
  { id: 'bee', emoji: '🐝', label: 'Bee', shop: true },
  { id: 'wizard', emoji: '🧙', label: 'Wizard', shop: true },
  { id: 'ninja', emoji: '🥷', label: 'Ninja', shop: true },
];

// Solid colors are free; gradients are Pro.
export const BANNERS: (Item & { className: string })[] = [
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
  { id: 'polka', label: 'Polka dots', shop: true, className: 'bg-emerald-500 bg-[radial-gradient(circle,rgba(255,255,255,0.4)_2px,transparent_2.5px)] bg-[length:18px_18px]' },
  { id: 'stripes', label: 'Stripes', shop: true, className: 'bg-sky-500 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.25)_0_10px,transparent_10px_20px)]' },
  { id: 'grid', label: 'Grid', shop: true, className: 'bg-violet-500 bg-[linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:16px_16px]' },
  { id: 'checker', label: 'Checkers', shop: true, className: 'bg-amber-400 bg-[conic-gradient(rgba(255,255,255,0.35)_25%,transparent_0_50%,rgba(255,255,255,0.35)_0_75%,transparent_0)] bg-[length:20px_20px]' },
];

export const LIMITS = {
  free: { bio: 80, featuredBadges: 3, showcase: 4 },
  pro: { bio: 160, featuredBadges: 6, showcase: 8 },
};

export const FRAMES: (Item & { className: string })[] = [
  { id: 'none', label: 'No frame', className: '' },
  { id: 'gold', label: 'Gold', className: 'ring-4 ring-amber-400', pro: true },
  { id: 'neon', label: 'Neon', className: 'ring-4 ring-fuchsia-500', pro: true },
  { id: 'flame', label: 'Flame', className: 'ring-4 ring-orange-500', pro: true },
  { id: 'silver', label: 'Silver', className: 'ring-4 ring-slate-300', shop: true },
  { id: 'mint', label: 'Mint', className: 'ring-4 ring-emerald-300', shop: true },
  { id: 'skyline', label: 'Sky', className: 'ring-4 ring-sky-400', shop: true },
  { id: 'sunshine', label: 'Sunshine', className: 'ring-4 ring-yellow-300', shop: true },
];

export const SHOP_PRICES = { avatar: ECONOMY.prices.shopAvatar, frame: ECONOMY.prices.shopFrame, banner: ECONOMY.prices.shopBanner };

// Whether a learner can use an item right now.
export const canUse = (item: Item, pro: boolean, owned: string[]) => (item.pro ? pro : item.shop ? owned.includes(item.id) : true);

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
  'Show 8 stats instead of 4',
  'My Space: design your own profile section with HTML and CSS',
];

// Pro looks only show while Pro is active; the choice is kept so it comes back on renewal.
export const avatarEmoji = (id: string | undefined, pro: boolean, owned: string[]) =>
  (AVATARS.find((a) => a.id === id && canUse(a, pro, owned)) ?? AVATARS[0]).emoji;
export const bannerClass = (id: string | undefined, pro: boolean, owned: string[]) =>
  (BANNERS.find((b) => b.id === id && canUse(b, pro, owned)) ?? BANNERS[0]).className;
export const frameClass = (id: string | undefined, pro: boolean, owned: string[]) =>
  FRAMES.find((x) => x.id === id && canUse(x, pro, owned))?.className ?? '';
