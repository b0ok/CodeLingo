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

export function spaceDocument(html: string, css: string): string {
  const safeCss = css.replace(/<\/?style/gi, ''); // can't close the style tag early
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">
<style>html,body{margin:0}body{font-family:system-ui,sans-serif;padding:16px;overflow-wrap:anywhere}${safeCss}</style>
</head><body>${sanitizeSpaceHtml(html)}</body></html>`;
}

export const SPACE_TEMPLATES: { id: string; label: string; html: string; css: string }[] = [
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
