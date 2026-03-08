import { Play, Save, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';

interface EditorToolbarProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  onSave: () => void;
  onReset: () => void;
  isRunning: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
}

export default function EditorToolbar({
  language,
  onLanguageChange,
  onRun,
  onSave,
  onReset,
  isRunning,
  isSaving,
  lastSavedAt,
}: EditorToolbarProps) {
  return (
    <div className="h-11 border-b border-border flex items-center justify-between px-3 bg-background/40 backdrop-blur-sm shrink-0">
      {/* Left: Language Selector */}
      <div className="flex items-center gap-2">
        <LanguageSelector
          value={language}
          onChange={onLanguageChange}
          disabled={isRunning}
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Reset */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-[11px] gap-1.5 hover:bg-secondary text-muted-foreground"
          onClick={onReset}
          disabled={isRunning}
          title="Reset to starter code"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>

        {/* Save */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 text-[11px] gap-1.5 hover:bg-secondary"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        {/* Last saved timestamp */}
        <span className="hidden md:inline text-[10px] text-muted-foreground/60 min-w-[80px]">
          {lastSavedAt ? `Saved ${lastSavedAt}` : ''}
        </span>

        {/* Run Code */}
        <Button
          size="sm"
          className="h-8 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 font-semibold"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </div>
    </div>
  );
}
