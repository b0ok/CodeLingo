// Real Python for lessons, challenges and the playground, via Pyodide.
// In the browser it runs in a Web Worker with a time limit; in Node (repo scripts)
// it runs in-process from the `pyodide` npm package.
import type { PyodideInterface } from 'pyodide';
import { runInPyodide, ExecutionResult } from './pythonCore';

export type { ExecutionResult };

const TIME_LIMIT_MS = 5000;
const isBrowser = typeof window !== 'undefined';

type Status = 'idle' | 'loading' | 'ready';
let status: Status = 'idle';
let worker: Worker | null = null;
let workerReady: Promise<void> | null = null;
const pending = new Map<number, (r: ExecutionResult) => void>();
let nextId = 0;

function ensureWorker(): Worker {
  if (worker) return worker;
  status = 'loading';
  const w = new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'module' });
  workerReady = new Promise<void>((resolve, reject) => {
    w.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'ready') {
        status = 'ready';
        resolve();
      } else if (msg.type === 'load-error') {
        reject(new Error(msg.error));
      } else if (msg.type === 'result') {
        pending.get(msg.id)?.(msg.result);
        pending.delete(msg.id);
      }
    };
    w.onerror = () => reject(new Error('Python worker failed to start'));
  });
  worker = w;
  return w;
}

function resetWorker() {
  worker?.terminate();
  worker = null;
  workerReady = null;
  status = 'idle';
}

// 'loading' means the first run will wait for the one-time download (about 12 MB).
export function pythonStatus(): Status {
  return status;
}

// Starts downloading Python in the background, e.g. when a Python lesson opens.
export function preloadPython() {
  if (isBrowser) ensureWorker();
}

let nodePyodide: Promise<PyodideInterface> | null = null;
const NODE_PACKAGE = 'pyodide';

export async function runPythonCode(code: string, inputs: string[] = []): Promise<ExecutionResult> {
  if (!isBrowser) {
    nodePyodide ??= import(/* @vite-ignore */ NODE_PACKAGE).then((m) => m.loadPyodide());
    return runInPyodide(await nodePyodide, code, inputs);
  }

  const w = ensureWorker();
  try {
    await workerReady;
  } catch {
    resetWorker(); // the next run tries the download again
    return {
      success: false,
      output: '',
      error: 'Python could not be loaded. Check your internet connection and try again.',
      executionTimeMs: 0,
    };
  }

  return new Promise((resolve) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      resetWorker();
      resolve({
        success: false,
        output: '',
        error: `Your code ran for more than ${TIME_LIMIT_MS / 1000} seconds, so it was stopped. Check for a loop that never ends.`,
        executionTimeMs: TIME_LIMIT_MS,
      });
    }, TIME_LIMIT_MS);
    pending.set(id, (result) => {
      clearTimeout(timer);
      resolve(result);
    });
    w.postMessage({ id, code, inputs });
  });
}
