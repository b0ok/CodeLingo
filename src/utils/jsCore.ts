// Runs learner JavaScript and captures console output. In the browser this only ever runs
// inside jsWorker.ts (no page, no saved sign-in, no network); in Node (repo scripts) it runs in-process.
import type { ExecutionResult } from './pythonCore';

export function runJavaScriptInScope(code: string): ExecutionResult {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    if (!code.trim()) {
      return { success: true, output: '', executionTimeMs: 0 };
    }

    // Custom console logger
    const customConsole = {
      log: (...args: unknown[]) => {
        logs.push(
          args
            .map((arg) => {
              if (typeof arg === 'object' && arg !== null) {
                try {
                  return JSON.stringify(arg, null, 2);
                } catch {
                  return String(arg);
                }
              }
              return String(arg);
            })
            .join(' ')
        );
      },
      warn: (...args: unknown[]) => {
        logs.push('[WARN] ' + args.map(String).join(' '));
      },
      error: (...args: unknown[]) => {
        logs.push('[ERROR] ' + args.map(String).join(' '));
      },
      table: (data: unknown) => {
        logs.push(JSON.stringify(data, null, 2));
      },
    };

    const runner = new Function('console', `"use strict";\n${code}`);
    runner(customConsole);

    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      success: true,
      output: logs.join('\n'),
      executionTimeMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      success: false,
      output: logs.join('\n'),
      error: errorMsg,
      executionTimeMs,
    };
  }
}
