import { RoadmapNode, RoadmapPhaseId } from '../types';

export interface RoadmapPhase {
  id: RoadmapPhaseId;
  phaseNumber: number;
  title: string;
  subtitle: string;
  description: string;
  roadmapShUrl: string;
  badge: string;
  color: string;
  accentBg: string;
  borderClass: string;
  nodes: RoadmapNode[];
}

export interface CareerTrack {
  id: 'frontend-dev' | 'ui-engineer' | 'accessibility-specialist' | 'fullstack-web';
  name: string;
  tagline: string;
  targetRole: string;
  icon: string;
  color: string;
  essentialPhases: RoadmapPhaseId[];
  keyTools: string[];
  recommendedDailyMinutes: number;
}

export const WEB_CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'frontend-dev',
    name: 'Modern Frontend Developer',
    tagline: 'Craft responsive web applications, component architecture, and fluid layouts',
    targetRole: 'Frontend Software Engineer',
    icon: 'sparkles',
    color: 'indigo',
    essentialPhases: ['html-basics', 'css-foundations', 'box-model', 'semantic-html', 'flexbox', 'css-grid', 'forms-a11y', 'responsive-modern'],
    keyTools: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'DevTools', 'Vite', 'React'],
    recommendedDailyMinutes: 25,
  },
  {
    id: 'ui-engineer',
    name: 'UI & Design Systems Engineer',
    tagline: 'Master token-based design systems, micro-interactions, typography, and polished UI',
    targetRole: 'Design Systems / UI Engineer',
    icon: 'box',
    color: 'purple',
    essentialPhases: ['css-foundations', 'box-model', 'flexbox', 'css-grid', 'responsive-modern'],
    keyTools: ['CSS Variables', 'Tailwind CSS', 'Figma Tokens', 'Fluid Typography', 'Transitions'],
    recommendedDailyMinutes: 20,
  },
  {
    id: 'accessibility-specialist',
    name: 'Web Accessibility (a11y) Specialist',
    tagline: 'Ensure digital products comply with WCAG 2.2, screen readers, and keyboard navigation',
    targetRole: 'Accessibility Engineer / Auditor',
    icon: 'shield',
    color: 'emerald',
    essentialPhases: ['html-basics', 'semantic-html', 'forms-a11y', 'responsive-modern'],
    keyTools: ['Semantic HTML5', 'ARIA Landmark Roles', 'VoiceOver/NVDA', 'Lighthouse a11y'],
    recommendedDailyMinutes: 20,
  },
  {
    id: 'fullstack-web',
    name: 'Full-Stack Web Architect',
    tagline: 'Bridge backend data services with accessible, responsive, high-performance web interfaces',
    targetRole: 'Full-Stack Web Engineer',
    icon: 'server',
    color: 'cyan',
    essentialPhases: ['html-basics', 'css-foundations', 'box-model', 'semantic-html', 'flexbox', 'forms-a11y'],
    keyTools: ['HTML5', 'CSS3', 'Modern Forms', 'Responsive Grid', 'REST/GraphQL'],
    recommendedDailyMinutes: 30,
  },
];

export const WEB_ROADMAP_PHASES: RoadmapPhase[] = [
  // ================= PHASE 1: HTML BASICS & ANATOMY =================
  {
    id: 'html-basics',
    phaseNumber: 1,
    title: 'HTML Anatomy & Document Tree',
    subtitle: 'The Web Skeleton & Element Syntax',
    description: 'Learn the foundational markup language that structures every document and app on the internet.',
    roadmapShUrl: 'https://roadmap.sh/html',
    badge: 'Structure Pioneer',
    color: 'indigo',
    accentBg: 'bg-indigo-500/10',
    borderClass: 'border-indigo-400/40',
    nodes: [
      {
        id: 'web-rm-doctype-tree',
        phaseId: 'html-basics',
        title: 'Document Structure & DOCTYPE',
        roadmapCategory: 'HTML Basics / Document Outline',
        description: 'Understand the role of <!DOCTYPE html>, <html>, <head>, and <body> in web rendering engines.',
        keyConcepts: ['<!DOCTYPE html>', '<head>', '<meta charset="UTF-8">', '<title>', '<body>'],
        unitId: 'web-unit-1',
        lessonIds: ['web-lesson-1-1'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Why is the <!DOCTYPE html> declaration required at the very top of an HTML file, and what happens to browser rendering if it is omitted?',
        sampleAnswerHint:
          '<!DOCTYPE html> tells modern browsers to render in Standards Mode instead of Quirks Mode. In Quirks Mode, browsers emulate legacy 1990s layout bugs (like the old Internet Explorer box model), breaking modern CSS layouts.',
      },
      {
        id: 'web-rm-text-tags',
        phaseId: 'html-basics',
        title: 'Headings, Paragraphs & Lists',
        roadmapCategory: 'HTML Elements / Text Hierarchy',
        description: 'Establish clear typographic hierarchy with h1-h6, p, ul, ol, and li.',
        keyConcepts: ['<h1>-<h6>', '<p>', '<ul>', '<ol>', '<li>', '<strong>', '<em>'],
        unitId: 'web-unit-1',
        lessonIds: ['web-lesson-1-1'],
        importance: 'essential',
        icon: 'quote',
        antiBlindQuestion:
          'Why should you choose heading levels (h1 through h6) based on document outline hierarchy rather than visual font size?',
        sampleAnswerHint:
          'Heading tags provide the structural tree for screen readers, search engines (SEO), and document accessibility outlines. Visual styling must always be managed by CSS, never by arbitrarily picking an <h3> just because it looks smaller.',
      },
      {
        id: 'web-rm-links-images',
        phaseId: 'html-basics',
        title: 'Anchors, Links & Media Attributes',
        roadmapCategory: 'HTML Elements / Hyperlinks & Media',
        description: 'Create navigation links with <a> href, and embed accessible media with <img> alt text.',
        keyConcepts: ['<a href>', 'target="_blank"', 'rel="noopener noreferrer"', '<img src alt>'],
        unitId: 'web-unit-1',
        lessonIds: ['web-lesson-1-1'],
        importance: 'essential',
        icon: 'globe',
        antiBlindQuestion:
          'Why is the "alt" attribute on <img> tags mandatory for accessibility, and what is the security purpose of "rel=\'noopener noreferrer\'" when opening links in a new tab?',
        sampleAnswerHint:
          'The alt attribute provides alternative text for blind users using screen readers and displays if images fail to load. rel="noopener noreferrer" prevents the opened page from accessing window.opener, which shields against reverse tab-nabbing security exploits.',
      },
    ],
  },

  // ================= PHASE 2: CSS FOUNDATIONS & THE CASCADE =================
  {
    id: 'css-foundations',
    phaseNumber: 2,
    title: 'CSS Foundations & The Cascade',
    subtitle: 'Rules, Selectors, Units & Specificity',
    description: 'Master how CSS rules target elements, calculate specificity priorities, and inherit properties.',
    roadmapShUrl: 'https://roadmap.sh/css',
    badge: 'Style Architect',
    color: 'cyan',
    accentBg: 'bg-cyan-500/10',
    borderClass: 'border-cyan-400/40',
    nodes: [
      {
        id: 'web-rm-selectors-cascade',
        phaseId: 'css-foundations',
        title: 'Selectors, Specificity & The Cascade',
        roadmapCategory: 'CSS Basics / Specificity & Cascade',
        description: 'Understand the three pillars of CSS: Cascade order, specificity weights, and property inheritance.',
        keyConcepts: ['Element vs Class vs ID', 'Specificity Calculation (0,0,1,0)', 'The Cascade', 'Inheritance'],
        unitId: 'web-unit-2',
        lessonIds: ['web-lesson-2-1'],
        importance: 'essential',
        icon: 'sparkles',
        antiBlindQuestion:
          'Explain how CSS resolves competing style declarations between an ID selector, a class selector, and an element tag. Why is using !important considered an anti-pattern?',
        sampleAnswerHint:
          'Specificity uses a tuple weighting: Inline styles > ID selectors (0,1,0,0) > Class/Attribute/Pseudo-class selectors (0,0,1,0) > Element tags (0,0,0,1). Using !important overrides the cascade artificially and causes specificity wars that make future maintenance nearly impossible.',
      },
      {
        id: 'web-rm-css-units',
        phaseId: 'css-foundations',
        title: 'CSS Units: rem vs em vs px vs %',
        roadmapCategory: 'CSS Basics / Values & Units',
        description: 'Master relative vs absolute units for accessible typography and fluid responsive designs.',
        keyConcepts: ['px (absolute)', 'rem (root em)', 'em (parent relative)', '% (container relative)', 'vw / vh'],
        unitId: 'web-unit-2',
        lessonIds: ['web-lesson-2-1'],
        importance: 'essential',
        icon: 'sliders',
        antiBlindQuestion:
          'Why is "rem" strongly recommended over "px" for typography and spacing in modern accessible web development?',
        sampleAnswerHint:
          '1rem is relative to the root <html> font-size (default 16px). When users adjust their browser base font-size in accessibility preferences (e.g. for low vision), rem units scale proportionally, whereas hardcoded px values stay fixed and ignore user accessibility preferences.',
      },
    ],
  },

  // ================= PHASE 3: THE BOX MODEL =================
  {
    id: 'box-model',
    phaseNumber: 3,
    title: 'The CSS Box Model & Display Modes',
    subtitle: 'Content, Padding, Border, Margin & Sizing',
    description: 'Demystify layout geometry, margin collapsing, and the box-sizing property.',
    roadmapShUrl: 'https://roadmap.sh/css',
    badge: 'Geometry Master',
    color: 'emerald',
    accentBg: 'bg-emerald-500/10',
    borderClass: 'border-emerald-400/40',
    nodes: [
      {
        id: 'web-rm-box-sizing',
        phaseId: 'box-model',
        title: 'Box-Sizing: content-box vs border-box',
        roadmapCategory: 'CSS Box Model / Box Sizing',
        description: 'Understand how width and height are calculated with borders and padding.',
        keyConcepts: ['content-box (default)', 'border-box (modern standard)', 'Universal * reset'],
        unitId: 'web-unit-2',
        lessonIds: ['web-lesson-2-2'],
        importance: 'essential',
        icon: 'box',
        antiBlindQuestion:
          'Why does "box-sizing: border-box" prevent layouts from breaking when you add padding or borders to an element with width: 100%?',
        sampleAnswerHint:
          'In default content-box, width only specifies the inner content, so padding and borders are added on top (width + padding + border = total width > 100%), overflowing the container. With border-box, the declared width includes content, padding, and border, keeping the total footprint predictable.',
      },
      {
        id: 'web-rm-margin-collapse',
        phaseId: 'box-model',
        title: 'Margin Collapsing & Spacing',
        roadmapCategory: 'CSS Box Model / Margins',
        description: 'Learn why vertical margins combine instead of stacking, and how to control spacing.',
        keyConcepts: ['Vertical margin collapse', 'Adjacent siblings', 'Parent-child collapse', 'Padding vs Margin'],
        unitId: 'web-unit-2',
        lessonIds: ['web-lesson-2-2'],
        importance: 'recommended',
        icon: 'layers',
        antiBlindQuestion:
          'What is margin collapsing in CSS, and what happens if two adjacent vertical paragraphs have margin-bottom: 20px and margin-top: 30px respectively?',
        sampleAnswerHint:
          'Vertical margins of adjacent block elements collapse into a single margin equal to the larger of the two values. In this case, 20px and 30px collapse into a 30px gap, NOT 50px! Note that Flexbox and Grid items do not collapse margins.',
      },
      {
        id: 'web-rm-display-modes',
        phaseId: 'box-model',
        title: 'Display: block, inline & inline-block',
        roadmapCategory: 'CSS Layout / Normal Flow',
        description: 'Understand natural document flow and element formatting contexts.',
        keyConcepts: ['display: block', 'display: inline', 'display: inline-block', 'display: none'],
        unitId: 'web-unit-2',
        lessonIds: ['web-lesson-2-2'],
        importance: 'essential',
        icon: 'split',
        antiBlindQuestion:
          'Why can you NOT apply top and bottom margins or explicit width/height to a standard "display: inline" element like a <span>?',
        sampleAnswerHint:
          'Inline elements flow along text lines and only take up the width of their content. Vertical dimensions (width, height, top/bottom margin) do not alter the line-box height in inline formatting context. Changing display to inline-block or block allows full box model control.',
      },
    ],
  },

  // ================= PHASE 4: SEMANTIC HTML5 =================
  {
    id: 'semantic-html',
    phaseNumber: 4,
    title: 'Semantic HTML5 Architecture',
    subtitle: 'Living Document Outlining vs Div Soup',
    description: 'Transform unorganized divs into meaningful, accessible, SEO-optimized semantic documents.',
    roadmapShUrl: 'https://roadmap.sh/html',
    badge: 'Semantic Sage',
    color: 'amber',
    accentBg: 'bg-amber-500/10',
    borderClass: 'border-amber-400/40',
    nodes: [
      {
        id: 'web-rm-semantic-landmarks',
        phaseId: 'semantic-html',
        title: 'Semantic Landmarks (<header>, <nav>, <main>, <footer>)',
        roadmapCategory: 'HTML Semantics / Landmark Elements',
        description: 'Use native landmark tags to define document sections and improve accessibility navigation.',
        keyConcepts: ['<header>', '<nav>', '<main>', '<article>', '<section>', '<aside>', '<footer>'],
        unitId: 'web-unit-3',
        lessonIds: ['web-lesson-3-1'],
        importance: 'essential',
        icon: 'compass',
        antiBlindQuestion:
          'Explain the difference between <article> and <section>. When should you use a generic <div> instead of a semantic tag?',
        sampleAnswerHint:
          '<article> represents independent, self-contained content that could be distributed in an RSS feed or syndicated on its own (like a blog post, tweet, or card). <section> groups related content thematically (usually with its own heading). A generic <div> should only be used for CSS styling or layout wrapping with no semantic meaning.',
      },
      {
        id: 'web-rm-button-vs-link',
        phaseId: 'semantic-html',
        title: 'Buttons vs Links & Interactive Semantics',
        roadmapCategory: 'HTML Semantics / Interactive Elements',
        description: 'Choose between <button> and <a> for correct keyboard and browser interaction.',
        keyConcepts: ['<button> (Actions)', '<a href> (Navigation)', 'Enter & Space key support', 'Screen reader announcements'],
        unitId: 'web-unit-3',
        lessonIds: ['web-lesson-3-1'],
        importance: 'essential',
        icon: 'key',
        antiBlindQuestion:
          'Why should you never write <div onClick="..."> for an action, and how do <button> and <a> differ in their browser contracts?',
        sampleAnswerHint:
          '<a> is for navigating to a new URL/resource (supports right-click open in new tab, browser history). <button> is for triggering on-page actions (form submit, opening modals, toggling state). A div lacks native keyboard focus (tabindex), does not fire on Space/Enter key presses, and is invisible to screen reader action lists.',
      },
    ],
  },

  // ================= PHASE 5: FLEXBOX 1D LAYOUTS =================
  {
    id: 'flexbox',
    phaseNumber: 5,
    title: 'Modern Layout: Flexbox 1D',
    subtitle: 'Main Axis, Cross Axis, Centering & Fluid Alignment',
    description: 'Master one-dimensional layouts, navbar positioning, space distribution, and foolproof centering.',
    roadmapShUrl: 'https://roadmap.sh/css',
    badge: 'Flexbox Wizard',
    color: 'teal',
    accentBg: 'bg-teal-500/10',
    borderClass: 'border-teal-400/40',
    nodes: [
      {
        id: 'web-rm-flex-axes',
        phaseId: 'flexbox',
        title: 'Main Axis vs Cross Axis & Alignment',
        roadmapCategory: 'CSS Flexbox / Axes & Alignment',
        description: 'Understand flex-direction and how justify-content and align-items swap axes.',
        keyConcepts: ['flex-direction (row/column)', 'justify-content (main axis)', 'align-items (cross axis)', 'gap'],
        unitId: 'web-unit-4',
        lessonIds: ['web-lesson-4-1'],
        importance: 'essential',
        icon: 'split',
        antiBlindQuestion:
          'When you change "flex-direction: row" to "flex-direction: column", what happens to the behavior of "justify-content" and "align-items"?',
        sampleAnswerHint:
          'justify-content always aligns items along the MAIN axis, and align-items always aligns along the CROSS axis. In row mode, main is horizontal and cross is vertical. When switched to column, the main axis becomes vertical (so justify-content controls vertical spacing) and the cross axis becomes horizontal (align-items controls horizontal alignment).',
      },
      {
        id: 'web-rm-flex-sizing',
        phaseId: 'flexbox',
        title: 'flex-grow, flex-shrink & flex-basis',
        roadmapCategory: 'CSS Flexbox / Item Sizing',
        description: 'Calculate how flex items expand, shrink, and establish baseline widths.',
        keyConcepts: ['flex-grow', 'flex-shrink', 'flex-basis', 'flex: 1 1 auto', 'flex: 0 0 auto'],
        unitId: 'web-unit-4',
        lessonIds: ['web-lesson-4-1'],
        importance: 'essential',
        icon: 'cpu',
        antiBlindQuestion:
          'What is the difference between "flex: 1" and "flex: auto" in a multi-item flex row?',
        sampleAnswerHint:
          '"flex: 1" is shorthand for flex: 1 1 0px (basis is 0, so items distribute ALL space equally regardless of text length). "flex: auto" is flex: 1 1 auto (basis uses the item\'s content size first, then distributes remaining space), which can make items with more text wider than items with less text.',
      },
    ],
  },

  // ================= PHASE 6: CSS GRID 2D ARCHITECTURE =================
  {
    id: 'css-grid',
    phaseNumber: 6,
    title: 'Modern Layout: CSS Grid 2D',
    subtitle: 'Columns, Rows, fr Units & Responsive Auto-Fit',
    description: 'Create two-dimensional layouts, Holy Grail page structures, and media-query-free card grids.',
    roadmapShUrl: 'https://roadmap.sh/css',
    badge: 'Grid Master',
    color: 'purple',
    accentBg: 'bg-purple-500/10',
    borderClass: 'border-purple-400/40',
    nodes: [
      {
        id: 'web-rm-grid-templates',
        phaseId: 'css-grid',
        title: 'Grid Templates & the "fr" Unit',
        roadmapCategory: 'CSS Grid / Tracks & fr Unit',
        description: 'Define fractional column tracks and understand grid lines vs grid areas.',
        keyConcepts: ['grid-template-columns', 'grid-template-rows', 'fr (fractional unit)', 'gap', 'grid-column'],
        unitId: 'web-unit-5',
        lessonIds: ['web-lesson-5-1'],
        importance: 'essential',
        icon: 'layers',
        antiBlindQuestion:
          'How does the CSS Grid "fr" unit distribute available space compared to using percentages like width: 33.33%?',
        sampleAnswerHint:
          'The fr unit calculates a fraction of FREE available space AFTER fixed tracks (px, rem) and gaps are deducted. If you use 33.33% with a 20px gap, the row overflows because percentages do not account for gaps. fr units natively subtract gaps before distributing leftover space.',
      },
      {
        id: 'web-rm-grid-autofit',
        phaseId: 'css-grid',
        title: 'Auto-Fit & minmax() Magic Grid',
        roadmapCategory: 'CSS Grid / Responsive Patterns',
        description: 'Build fully responsive card grids without writing a single media query.',
        keyConcepts: ['repeat()', 'auto-fit vs auto-fill', 'minmax(250px, 1fr)'],
        unitId: 'web-unit-5',
        lessonIds: ['web-lesson-5-1'],
        importance: 'essential',
        icon: 'sparkles',
        antiBlindQuestion:
          'Explain how "grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))" automatically rearranges columns across mobile, tablet, and desktop screens.',
        sampleAnswerHint:
          'minmax(280px, 1fr) guarantees each column is at least 280px wide. auto-fit tells Grid to fit as many 280px columns into the row as will fit. If the screen shrinks and 280px cannot fit, it drops that column down and stretches the remaining columns equally (1fr) to fill the width—all without media queries!',
      },
    ],
  },

  // ================= PHASE 7: FORMS & ACCESSIBLE INPUT =================
  {
    id: 'forms-a11y',
    phaseNumber: 7,
    title: 'Forms, User Input & Web Accessibility',
    subtitle: 'Labels, Inputs, Validation & WCAG Guidelines',
    description: 'Build bulletproof interactive forms with accessible labels, error feedback, and keyboard focus states.',
    roadmapShUrl: 'https://roadmap.sh/html',
    badge: 'Form Authority',
    color: 'rose',
    accentBg: 'bg-rose-500/10',
    borderClass: 'border-rose-400/40',
    nodes: [
      {
        id: 'web-rm-form-labels',
        phaseId: 'forms-a11y',
        title: 'Accessible Labels & Form Binding',
        roadmapCategory: 'HTML Forms / Input & Labeling',
        description: 'Link form controls with explicit labels and HTML5 validation attributes.',
        keyConcepts: ['<label for="id">', 'required', 'pattern', 'type="email"', 'autocomplete'],
        unitId: 'web-unit-6',
        lessonIds: ['web-lesson-6-1'],
        importance: 'essential',
        icon: 'terminal',
        antiBlindQuestion:
          'Why is placeholder text on an <input> NOT a valid substitute for a proper <label>?',
        sampleAnswerHint:
          'Placeholders disappear as soon as the user starts typing, causing users to lose track of what the field asked for. Additionally, placeholders often have low color contrast that fails WCAG requirements, and some screen readers do not announce placeholders reliably.',
      },
      {
        id: 'web-rm-focus-states',
        phaseId: 'forms-a11y',
        title: 'Keyboard Focus & :focus-visible',
        roadmapCategory: 'CSS Accessibility / Focus Management',
        description: 'Design accessible keyboard focus outlines without disrupting mouse users.',
        keyConcepts: [':focus vs :focus-visible', 'outline: none dangers', 'tabindex="0" vs "-1"', 'ARIA live regions'],
        unitId: 'web-unit-6',
        lessonIds: ['web-lesson-6-1'],
        importance: 'essential',
        icon: 'key',
        antiBlindQuestion:
          'Why is removing outlines with "outline: none" or "outline: 0" one of the worst web accessibility mistakes, and how does ":focus-visible" solve the visual complaint for mouse users?',
        sampleAnswerHint:
          '"outline: none" blinds keyboard and motor-impaired users who navigate with Tab, as they have zero indication of where their focus cursor is. :focus-visible shows the outline ONLY when navigating via keyboard (Tab/Arrows), while keeping it hidden for mouse clicks.',
      },
    ],
  },

  // ================= PHASE 8: RESPONSIVE DESIGN & MODERN CSS =================
  {
    id: 'responsive-modern',
    phaseNumber: 8,
    title: 'Responsive Web & Modern CSS Power',
    subtitle: 'Media Queries, CSS Variables, Fluid Typography & Dark Mode',
    description: 'Design fluid multi-device experiences with custom properties, modern pseudo-classes, and dark mode.',
    roadmapShUrl: 'https://roadmap.sh/css',
    badge: 'Modern Web Master',
    color: 'violet',
    accentBg: 'bg-violet-500/10',
    borderClass: 'border-violet-400/40',
    nodes: [
      {
        id: 'web-rm-media-queries',
        phaseId: 'responsive-modern',
        title: 'Mobile-First Media Queries & Viewport',
        roadmapCategory: 'CSS Responsive / Media Queries',
        description: 'Write maintainable mobile-first media queries with min-width and viewport configuration.',
        keyConcepts: ['<meta name="viewport">', '@media (min-width: ...)', 'Mobile-First', 'prefers-color-scheme'],
        unitId: 'web-unit-6',
        lessonIds: ['web-lesson-6-2'],
        importance: 'essential',
        icon: 'sparkles',
        antiBlindQuestion:
          'What does "Mobile-First" CSS architecture mean in practice, and why is min-width preferred over max-width for responsive styling?',
        sampleAnswerHint:
          'Mobile-first means writing base CSS for small screens first, then progressively layering styles for larger viewports using @media (min-width: 640px). This prevents overriding heavy desktop rules on mobile and results in cleaner, cascading CSS with fewer specificity conflicts.',
      },
      {
        id: 'web-rm-css-variables',
        phaseId: 'responsive-modern',
        title: 'CSS Custom Properties (Variables) & Theming',
        roadmapCategory: 'Modern CSS / Custom Properties',
        description: 'Implement dynamic runtime tokens, dark mode themes, and fluid clamp() sizing.',
        keyConcepts: ['--primary-color', 'var(--name, fallback)', 'clamp(min, val, max)', ':root scope'],
        unitId: 'web-unit-6',
        lessonIds: ['web-lesson-6-2'],
        importance: 'essential',
        icon: 'sliders',
        antiBlindQuestion:
          'How do CSS Custom Properties (variables) differ from preprocessor variables (like Sass $color) in terms of runtime reactivity and the DOM cascade?',
        sampleAnswerHint:
          'Sass variables are compiled away at build time into static values. CSS Custom Properties (--var) live in the browser DOM at runtime: they inherit through the DOM cascade, can be updated dynamically via JavaScript, and can be overridden locally inside specific classes or media queries (like instant dark mode toggling).',
      },
    ],
  },
];

export function getAllWebRoadmapNodes(): RoadmapNode[] {
  return WEB_ROADMAP_PHASES.flatMap((p) => p.nodes);
}

export function getWebRoadmapNodeById(id: string): RoadmapNode | undefined {
  return getAllWebRoadmapNodes().find((n) => n.id === id);
}
