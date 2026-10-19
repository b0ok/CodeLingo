// Pro "My Space": the learner's own HTML and CSS, shown in a locked-down frame.
// Three layers keep it safe for learners 13 and up:
//   1. sanitizeSpaceHtml strips scripts, embeds, forms, event handlers, links and outside sources;
//   2. the frame is sandboxed with no permissions, so nothing can run even if something slips through;
//   3. a Content-Security-Policy blocks every outside request, so no outside images, fonts or trackers load.

export const SPACE_LIMITS = { html: 5000, css: 5000 };

const DROP_TAGS = 'script,iframe,frame,frameset,object,embed,applet,form,input,button,textarea,select,link,meta,base,svg,math,template,portal,audio,video,source,track';

export function sanitizeSpaceHtml(html: string): string {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  doc.querySelectorAll(DROP_TAGS).forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      const outsideSource = ['src', 'srcset', 'poster', 'background'].includes(name) && !value.startsWith('data:image/');
      if (name.startsWith('on') || ['href', 'xlink:href', 'action', 'formaction', 'target', 'ping'].includes(name) || outsideSource) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

// Live data the learner can drop into their HTML with {{tags}}. Values are escaped, so they can't add markup.
export interface SpaceData {
  displayName: string; username: string; avatar: string; bio: string; status: string;
  level: number; xp: number; streak: number; bestStreak: number; league: string; lessons: number;
  stats: { label: string; value: string }[]; featuredBadges: string[];
}

export const SPACE_TAGS: [string, string][] = [
  ['{{displayName}}', 'Your display name'],
  ['{{username}}', 'Your @username'],
  ['{{avatar}}', 'Your avatar'],
  ['{{status}}', 'Your status line'],
  ['{{bio}}', 'Your bio'],
  ['{{level}}', 'Your level'],
  ['{{xp}}', 'Your total XP'],
  ['{{streak}}', 'Your day streak'],
  ['{{bestStreak}}', 'Your best streak'],
  ['{{league}}', 'Your league'],
  ['{{lessons}}', 'Lessons done'],
  ['{{stats}}', 'Your showcase stats, as a list (class "cl-stats")'],
  ['{{featuredBadges}}', 'Your featured badges, as a list (class "cl-badges")'],
];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function fillSpaceTags(html: string, d: SpaceData): string {
  const values: Record<string, string> = {
    displayName: esc(d.displayName), username: d.username ? '@' + esc(d.username) : '', avatar: esc(d.avatar),
    status: esc(d.status), bio: esc(d.bio), level: String(d.level), xp: d.xp.toLocaleString(), streak: String(d.streak),
    bestStreak: String(d.bestStreak), league: esc(d.league), lessons: String(d.lessons),
    stats: `<ul class="cl-stats">${d.stats.map((s) => `<li><span class="cl-label">${esc(s.label)}</span> <span class="cl-value">${esc(s.value)}</span></li>`).join('')}</ul>`,
    featuredBadges: d.featuredBadges.length
      ? `<ul class="cl-badges">${d.featuredBadges.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
      : '<p class="cl-empty">No badges featured yet</p>',
  };
  return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (tag, key: string) => values[key] ?? tag);
}

export function spaceDocument(html: string, css: string, data?: SpaceData): string {
  if (data) html = fillSpaceTags(html, data);
  const safeCss = css.replace(/<\/?style/gi, ''); // can't close the style tag early
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">
<style>html,body{margin:0}body{font-family:system-ui,sans-serif;padding:16px;overflow-wrap:anywhere}${safeCss}</style>
</head><body>${sanitizeSpaceHtml(html)}</body></html>`;
}

export const SPACE_TEMPLATES: { id: string; label: string; html: string; css: string }[] = [
  {
    id: 'classic',
    label: 'Classic full page',
    html: `<header>
  <span class="avatar">{{avatar}}</span>
  <div>
    <h1>{{displayName}}</h1>
    <p class="handle">{{username}} · Level {{level}} · {{league}} League</p>
    <p class="status">{{status}}</p>
  </div>
</header>
<main>
  <section class="box">
    <h2>About me</h2>
    <p>{{bio}}</p>
  </section>
  <section class="box">
    <h2>{{displayName}}'s stats</h2>
    {{stats}}
  </section>
  <section class="box wide">
    <h2>Badges I'm proud of</h2>
    {{featuredBadges}}
  </section>
</main>`,
    css: `body { background: #e8eefc; color: #1e293b; font-family: Verdana, sans-serif; }
header { display: flex; gap: 16px; align-items: center; background: #1d4ed8; color: white; padding: 16px; border-radius: 12px; }
.avatar { font-size: 56px; background: white; border-radius: 50%; width: 80px; height: 80px; display: grid; place-items: center; }
h1 { margin: 0; }
.handle, .status { margin: 4px 0 0; }
main { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px; }
.box { background: white; border: 2px solid #93c5fd; border-radius: 12px; padding: 12px; }
.box h2 { margin: 0 0 8px; font-size: 16px; color: #1d4ed8; }
.wide { grid-column: 1 / -1; }
.cl-stats, .cl-badges { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.cl-badges { display: flex; flex-wrap: wrap; }
.cl-badges li { background: #fef3c7; padding: 4px 10px; border-radius: 999px; }
.cl-label { color: #64748b; }
.cl-value { font-weight: bold; }`,
  },
  {
    id: 'retro',
    label: 'Retro',
    html: `<h1>~*~ Welcome to my space ~*~</h1>
<p class="now">Currently learning: Python</p>
<h2>About me</h2>
<p>I code after school and I'm working on my first game.</p>
<h2>My top 3 languages</h2>
<ol><li>Python</li><li>JavaScript</li><li>SQL</li></ol>`,
    css: `body { background: #0b0033; color: #ffe600; font-family: "Comic Sans MS", cursive; }
h1 { color: #ff4fd8; text-align: center; text-shadow: 2px 2px #00e5ff; }
h2 { color: #00e5ff; border-bottom: 2px dashed #ff4fd8; }
.now { background: #ff4fd8; color: #0b0033; font-weight: bold; padding: 4px 8px; text-align: center; }`,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    html: `<p>$ whoami</p>
<p class="out">a coder in training</p>
<p>$ cat goals.txt</p>
<ul class="out"><li>build a website</li><li>learn SQL joins</li><li>keep my streak alive</li></ul>
<p>$ <span class="cursor">_</span></p>`,
    css: `body { background: #0d1117; color: #3fb950; font-family: ui-monospace, monospace; }
.out { color: #c9d1d9; }
.cursor { animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .cursor { animation: none; } }`,
  },
  {
    id: 'clean',
    label: 'Clean card',
    html: `<div class="card">
  <h1>Hi, I'm learning to code 👋</h1>
  <p>Right now I'm focused on HTML &amp; CSS.</p>
  <div class="tags"><span>HTML</span><span>CSS</span><span>Grid</span></div>
</div>`,
    css: `body { background: #f1f5f9; }
.card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 16px rgb(0 0 0 / 0.08); }
h1 { margin: 0 0 8px; font-size: 22px; }
.tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tags span { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 999px; font-weight: 600; }`,
  },
];
