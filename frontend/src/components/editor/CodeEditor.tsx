import { useCallback, useRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { EDITOR_OPTIONS } from './constants';
import { Loader2 } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  code: string;
  isDark: boolean;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onSave?: () => void;
}

export default function CodeEditor({
  language,
  code,
  isDark,
  readOnly = false,
  onChange,
  onSave,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // Register Ctrl+S keybinding within Monaco itself
      if (onSave) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          onSave();
        });
      }

      // Focus the editor on mount
      editor.focus();
    },
    [onSave],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      onChange?.(value ?? '');
    },
    [onChange],
  );

  return (
    <MonacoEditor
      height="100%"
      language={language}
      theme={isDark ? 'vs-dark' : 'light'}
      value={code}
      onChange={handleChange}
      onMount={handleMount}
      loading={
        <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading editor...</span>
        </div>
      }
      options={{
        ...EDITOR_OPTIONS,
        readOnly,
      }}
    />
  );
}
