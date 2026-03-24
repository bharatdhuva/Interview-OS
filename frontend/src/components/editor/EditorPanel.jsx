import { useCallback, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle, } from '@/components/ui/resizable';
import CodeEditor from './CodeEditor';
import OutputConsole from './OutputConsole';
import EditorToolbar from './EditorToolbar';
import { useCodeEditor } from './useCodeEditor';
import { useToast } from '@/hooks/use-toast';
export default function EditorPanel({ roomId, sessionId, isDark, readOnly = false, }) {
    const { toast } = useToast();
    const onSaveSuccess = useCallback((triggeredBy) => {
        if (triggeredBy === 'manual') {
            toast({ title: 'Code saved', description: 'Your code has been saved.' });
        }
    }, [toast]);
    const { language, code, output, isRunning, isSaving, lastSavedAt, executionCount, setLanguage, setCode, runCode, saveCode, clearOutput, resetCode, } = useCodeEditor({ roomId, sessionId, onSaveSuccess });
    // Ctrl+Enter to run code
    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runCode();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [runCode]);
    return (<div className="flex flex-col h-full">
      {/* Toolbar */}
      {!readOnly && (<EditorToolbar language={language} onLanguageChange={setLanguage} onRun={runCode} onSave={() => saveCode('manual')} onReset={resetCode} isRunning={isRunning} isSaving={isSaving} lastSavedAt={lastSavedAt}/>)}

      {/* Editor + Output (resizable vertical split) */}
      <ResizablePanelGroup direction="vertical" className="flex-1">
        <ResizablePanel defaultSize={65} minSize={30}>
          <CodeEditor language={language} code={code} isDark={isDark} readOnly={readOnly} onChange={readOnly ? undefined : setCode} onSave={readOnly ? undefined : () => saveCode('manual')}/>
        </ResizablePanel>

        <ResizableHandle withHandle/>

        <ResizablePanel defaultSize={35} minSize={15}>
          <OutputConsole output={output} isRunning={isRunning} executionCount={executionCount} onClear={clearOutput}/>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>);
}
