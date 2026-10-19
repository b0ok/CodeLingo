// Web Worker that owns the Pyodide instance, so a long-running or endless program
// never freezes the page; pythonRunner.ts terminates this worker on timeout.
import type { PyodideInterface } from 'pyodide';
import { runInPyodide, PYODIDE_CDN } from './pythonCore';

const ready: Promise<PyodideInterface> = import(/* @vite-ignore */ `${PYODIDE_CDN}pyodide.mjs`).then(
  ({ loadPyodide }) => loadPyodide({ indexURL: PYODIDE_CDN })
);

ready.then(
  () => postMessage({ type: 'ready' }),
  (err) => postMessage({ type: 'load-error', error: String(err) })
);

onmessage = async (e: MessageEvent<{ id: number; code: string; inputs: string[] }>) => {
  const { id, code, inputs } = e.data;
  try {
    postMessage({ type: 'result', id, result: runInPyodide(await ready, code, inputs) });
  } catch (err) {
    postMessage({ type: 'result', id, result: { success: false, output: '', error: String(err), executionTimeMs: 0 } });
  }
};
