import { Terminal, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback } from 'react';
import type { ExecutionResult } from './types';
import { MAX_EXECUTIONS_PER_SESSION } from './constants';

interface OutputConsoleProps {
  output: ExecutionResult | null;
  isRunning: boolean;
  executionCount: number;
  onClear: () => void;
}

export default function OutputConsole({
  output,
  isRunning,
  executionCount,
  onClear,
}: OutputConsoleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!output) return;
    const text = output.stdout || output.stderr || '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [output]);

  const hasStdout = output && output.stdout.length > 0;
  const hasStderr = output && output.stderr.length > 0;

  return (
    <div className="flex flex-col h-full border-t border-border bg-card/40">
      {/* Console Header */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-border bg-background/30 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Output
          </span>
          {output && (
            <span className="text-[10px] text-muted-foreground/60 font-mono">
              {output.time}s &middot; {output.memory ? `${output.memory}KB` : '—'}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/40 font-mono">
            {executionCount}/{MAX_EXECUTIONS_PER_SESSION} runs
          </span>
        </div>

        <div className="flex items-center gap-1">
          {output && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy output"
            >
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onClear}
            title="Clear output"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Console Body */}
      <pre className="flex-1 p-3 font-mono text-xs overflow-auto leading-relaxed">
        {isRunning ? (
          <span className="text-primary animate-pulse">Running code...</span>
        ) : !output ? (
          <span className="text-muted-foreground/50 italic">
            Press Run (or Ctrl+Enter) to execute your code
          </span>
        ) : (
          <>
            {hasStdout && (
              <span className="text-foreground/90 whitespace-pre-wrap">{output.stdout}</span>
            )}
            {hasStderr && (
              <span className="text-destructive whitespace-pre-wrap">
                {hasStdout && '\n'}
                {output.stderr}
              </span>
            )}
            {!hasStdout && !hasStderr && (
              <span className="text-muted-foreground/60 italic">
                Program finished with no output.
              </span>
            )}
          </>
        )}
      </pre>
    </div>
  );
}
