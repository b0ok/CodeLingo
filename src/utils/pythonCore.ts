// Runs Python with Pyodide (CPython compiled to WebAssembly). Shared by the browser
// worker (pythonWorker.ts) and Node scripts, so lessons and checks use the same engine.
import type { PyodideInterface } from 'pyodide';

// Keep in sync with the `pyodide` devDependency in package.json (used by Node scripts).
export const PYODIDE_VERSION = '314.0.7';
export const PYODIDE_CDN = `https://cdn.jsdelivr.net/npm/pyodide@${PYODIDE_VERSION}/`;

export interface ExecutionResult {
  success: boolean;
  output: string;
  returnValue?: unknown;
  error?: string;
  executionTimeMs: number;
}

// Runs one program in a fresh namespace. `inputs` answer input() calls in order;
// once they run out, input() raises EOFError instead of opening a browser prompt.
export function runInPyodide(py: PyodideInterface, code: string, inputs: string[] = []): ExecutionResult {
  const start = performance.now();
  const out: string[] = [];
  py.setStdout({ batched: (s) => out.push(s) });
  py.setStderr({ batched: (s) => out.push(s) });
  let next = 0;
  py.setStdin({ stdin: () => (next < inputs.length ? inputs[next++] : undefined) });

  const ns = py.globals.get('dict')();
  const elapsed = () => Math.round(performance.now() - start);
  try {
    py.runPython(code, { globals: ns });
    py.runPython('import sys; sys.stdout.flush(); sys.stderr.flush()');
    return { success: true, output: out.join('\n'), executionTimeMs: elapsed() };
  } catch (err) {
    // Show the last traceback line ("NameError: name 'x' is not defined") plus the
    // line number in the learner's code, which Pyodide reports as File "<exec>".
    const lines = String((err as Error)?.message ?? err).trim().split('\n');
    const lineNo = [...lines].reverse().join('\n').match(/File "<exec>", line (\d+)/)?.[1];
    const error = lines[lines.length - 1] + (lineNo ? ` (line ${lineNo})` : '');
    return { success: false, output: out.join('\n'), error, executionTimeMs: elapsed() };
  } finally {
    ns.destroy();
  }
}
