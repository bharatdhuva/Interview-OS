import { useState, useRef, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import {
  STARTER_CODE,
  DEFAULT_LANGUAGE,
  AUTOSAVE_DELAY_MS,
  MAX_EXECUTIONS_PER_SESSION,
} from './constants';
import type { EditorState, EditorActions, ExecutionResult, UseCodeEditorReturn } from './types';

interface UseCodeEditorOptions {
  roomId: string;
  sessionId?: string;
  onSaveSuccess?: (triggeredBy: 'auto' | 'manual') => void;
}

function getStorageKey(roomId: string) {
  return `interviewos:room:${roomId}:editor`;
}

function loadPersistedState(roomId: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(getStorageKey(roomId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.codeByLanguage ?? null;
  } catch {
    return null;
  }
}

export function useCodeEditor({
  roomId,
  sessionId,
  onSaveSuccess,
}: UseCodeEditorOptions): UseCodeEditorReturn {
  // ── Language ─────────────────────────────────────────────
  const [language, setLanguageRaw] = useState(DEFAULT_LANGUAGE);

  // ── Code (per language) ──────────────────────────────────
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>(() => {
    const persisted = loadPersistedState(roomId);
    return { ...STARTER_CODE, ...(persisted || {}) };
  });

  const [code, setCodeRaw] = useState(() => codeByLanguage[DEFAULT_LANGUAGE] ?? STARTER_CODE[DEFAULT_LANGUAGE] ?? '');

  // ── Execution ────────────────────────────────────────────
  const [output, setOutput] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);

  // ── Save ─────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Derived setter helpers ───────────────────────────────
  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageRaw(lang);
      setCodeRaw(codeByLanguage[lang] ?? STARTER_CODE[lang] ?? '');
    },
    [codeByLanguage],
  );

  const setCode = useCallback(
    (value: string) => {
      setCodeRaw(value);
      setCodeByLanguage((prev) => {
        if (prev[language] === value) return prev;
        return { ...prev, [language]: value };
      });
    },
    [language],
  );

  // ── Persist to localStorage ──────────────────────────────
  const saveCode = useCallback(
    (triggeredBy: 'auto' | 'manual') => {
      try {
        setIsSaving(true);
        localStorage.setItem(
          getStorageKey(roomId),
          JSON.stringify({
            roomId,
            language,
            codeByLanguage,
            updatedAt: new Date().toISOString(),
            triggeredBy,
          }),
        );
        const now = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLastSavedAt(now);
        onSaveSuccess?.(triggeredBy);
      } finally {
        setIsSaving(false);
      }
    },
    [roomId, language, codeByLanguage, onSaveSuccess],
  );

  // ── Autosave on code change ──────────────────────────────
  useEffect(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => saveCode('auto'), AUTOSAVE_DELAY_MS);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [saveCode]);

  // ── Ctrl+S manual save ───────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCode('manual');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveCode]);

  // ── Run Code (real Judge0 via backend, with local fallback) ──
  const runCode = useCallback(async () => {
    if (!code.trim()) {
      setOutput({ stdout: '', stderr: 'No code to execute.', time: '0', memory: 0 });
      return;
    }
    if (executionCount >= MAX_EXECUTIONS_PER_SESSION) {
      setOutput({
        stdout: '',
        stderr: `Execution limit reached (${MAX_EXECUTIONS_PER_SESSION} runs per session).`,
        time: '0',
        memory: 0,
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);

    try {
      const { data } = await api.post<{
        success: boolean;
        data: ExecutionResult & { snapshotId?: string };
        message?: string;
      }>(`/rooms/${roomId}/code/execute`, {
        language,
        code,
        roomId,
        sessionId: sessionId ?? roomId,
      });

      if (data.success) {
        setOutput(data.data);
        setExecutionCount((c) => c + 1);
      } else {
        setOutput({ stdout: '', stderr: data.message || 'Execution failed.', time: '0', memory: 0 });
      }
    } catch {
      // Fallback: local "dry run" when backend is unavailable
      await localFallbackExec(language, code, setOutput);
      setExecutionCount((c) => c + 1);
    } finally {
      setIsRunning(false);
    }
  }, [code, language, roomId, sessionId, executionCount]);

  // ── Clear / Reset ────────────────────────────────────────
  const clearOutput = useCallback(() => setOutput(null), []);

  const resetCode = useCallback(() => {
    const starter = STARTER_CODE[language] ?? '';
    setCodeRaw(starter);
    setCodeByLanguage((prev) => ({ ...prev, [language]: starter }));
  }, [language]);

  return {
    language,
    code,
    codeByLanguage,
    output,
    isRunning,
    isSaving,
    lastSavedAt,
    executionCount,
    setLanguage,
    setCode,
    runCode,
    saveCode,
    clearOutput,
    resetCode,
  };
}

// ── Local fallback (simple eval for JS/TS, info message for others)
async function localFallbackExec(
  language: string,
  code: string,
  setOutput: (result: ExecutionResult) => void,
) {
  const start = performance.now();
  await new Promise((r) => setTimeout(r, 300)); // simulate latency

  if (language === 'javascript' || language === 'typescript') {
    try {
      const logs: string[] = [];
      const fakeConsole = { log: (...args: unknown[]) => logs.push(args.map(String).join(' ')) };
      // eslint-disable-next-line no-new-func
      const fn = new Function('console', code);
      fn(fakeConsole);
      const elapsed = ((performance.now() - start) / 1000).toFixed(3);
      setOutput({ stdout: logs.join('\n'), stderr: '', time: elapsed, memory: 0 });
    } catch (err: unknown) {
      const elapsed = ((performance.now() - start) / 1000).toFixed(3);
      const message = err instanceof Error ? err.message : String(err);
      setOutput({ stdout: '', stderr: message, time: elapsed, memory: 0 });
    }
  } else {
    const elapsed = ((performance.now() - start) / 1000).toFixed(3);
    setOutput({
      stdout: `[Local Mode] Code execution server unavailable.\nYour ${language} code is saved. Connect the backend to run it.`,
      stderr: '',
      time: elapsed,
      memory: 0,
    });
  }
}
