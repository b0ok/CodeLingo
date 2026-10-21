// Web Worker for learner JavaScript. A worker has no page, no localStorage (where the sign-in
// session lives) and no cookies, and codeRunner.ts gives each run a fresh worker it kills on timeout.
// Network and storage are removed too, so pasted code can't send anything anywhere.
import { runJavaScriptInScope } from './jsCore';

const scope = self as unknown as Record<string, unknown>;
for (const name of ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts', 'Worker', 'SharedWorker', 'indexedDB', 'caches', 'BroadcastChannel', 'WebTransport']) {
  try {
    Object.defineProperty(scope, name, { value: undefined, configurable: false, writable: false });
  } catch { /* not defined in this browser */ }
}
// ponytail: dynamic import() can't be removed from a module worker; the page's Content-Security-Policy (script-src) is what blocks outside scripts.

onmessage = (e: MessageEvent<{ code: string }>) => {
  postMessage(runJavaScriptInScope(e.data.code));
};
