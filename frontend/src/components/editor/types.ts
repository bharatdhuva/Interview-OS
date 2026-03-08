/** Execution result from Judge0 / code execution API */
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  time: string;
  memory: number;
}

/** State for the code editor hook */
export interface EditorState {
  language: string;
  code: string;
  codeByLanguage: Record<string, string>;
  output: ExecutionResult | null;
  isRunning: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  executionCount: number;
}

/** Actions exposed by the code editor hook */
export interface EditorActions {
  setLanguage: (lang: string) => void;
  setCode: (code: string) => void;
  runCode: () => Promise<void>;
  saveCode: (triggeredBy: 'auto' | 'manual') => void;
  clearOutput: () => void;
  resetCode: () => void;
}

export type UseCodeEditorReturn = EditorState & EditorActions;
