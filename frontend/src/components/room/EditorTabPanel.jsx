import React from "react";
import Editor from "@monaco-editor/react";
import { Code2, Play, Save, Brain, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomSelect from "@/components/ui/CustomSelect";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

export default function EditorTabPanel({
  files,
  activeFile,
  setActiveFile,
  newFileName,
  setNewFileName,
  showFileExplorer,
  setShowFileExplorer,
  language,
  setLanguage,
  handleManualSave,
  isSaving,
  handleRun,
  isRunning,
  output,
  setOutput,
  isDark,
  handleCodeChange,
  handleDeleteFile,
  handleCreateFile,
  lastSavedAt
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden pb-20">
      {/* Toolbar */}
      <div className="border-b border-border flex items-center justify-between px-4 py-2 shrink-0 bg-background/60 backdrop-blur-md h-12 select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground/90">IDE Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          <CustomSelect
            value={language}
            onChange={setLanguage}
            options={languages}
            className="h-8 w-32 bg-secondary/50 border-border text-[11px] font-semibold"
          />

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[11px] gap-1.5 hover:bg-secondary active:scale-95 transition-all"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[11px] gap-1.5 hover:bg-primary/10 hover:text-primary active:scale-95 transition-all"
            >
              <Brain className="w-3.5 h-3.5" /> AI
            </Button>
            {lastSavedAt && (
              <span className="hidden md:inline text-[10px] text-muted-foreground mr-1.5">
                Saved {lastSavedAt}
              </span>
            )}
            <Button
              size="sm"
              className="h-8 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 hover:scale-[1.03] active:scale-95 transition-all shadow-md shadow-primary/20"
              onClick={handleRun}
              disabled={isRunning}
            >
              <Play className="w-3.5 h-3.5" />
              {isRunning ? "Running..." : "Run"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Workspace splits (sidebar filetree & monaco) */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Collapsible File Explorer */}
        {showFileExplorer && (
          <div className="w-44 border-r border-border bg-card/45 flex flex-col p-3 shrink-0 h-full select-none">
            <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Files</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-5 h-5 rounded hover:bg-secondary text-muted-foreground"
                onClick={() => setShowFileExplorer(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1">
              {Object.keys(files).map((filePath) => {
                const isActive = activeFile === filePath;
                return (
                  <div
                    key={filePath}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                    }`}
                    onClick={() => {
                      setActiveFile(filePath);
                      const ext = filePath.split(".").pop();
                      let lang = "javascript";
                      if (ext === "py") lang = "python";
                      else if (ext === "java") lang = "java";
                      else if (ext === "cpp" || ext === "cc") lang = "cpp";
                      else if (ext === "go") lang = "go";
                      else if (ext === "rs") lang = "rust";
                      else if (ext === "ts") lang = "typescript";
                      setLanguage(lang);
                    }}
                  >
                    <span className="truncate pr-2">{filePath}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(filePath);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5 rounded transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateFile();
              }}
              className="flex items-center gap-1 border-t border-border/50 pt-2"
            >
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
                placeholder="file.js"
                className="h-7 text-[10px] px-2 bg-secondary/35 border-border rounded"
              />
              <button
                type="submit"
                className="h-7 w-7 rounded bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 text-xs font-bold shrink-0"
              >
                +
              </button>
            </form>
          </div>
        )}

        {/* Monaco & Output split */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          {!showFileExplorer && (
            <button
              onClick={() => setShowFileExplorer(true)}
              className="absolute left-3 top-3 z-20 w-8 h-8 rounded-lg bg-card border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              title="Expand Files Sidebar"
            >
              <Code2 className="w-4 h-4" />
            </button>
          )}

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              theme={isDark ? "vs-dark" : "light"}
              value={files[activeFile] || ""}
              onChange={handleCodeChange}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                cursorBlinking: "smooth",
                lineNumbers: "on",
                renderLineHighlight: "all",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                bracketPairColorization: { enabled: true },
                smoothScrolling: true,
              }}
            />
          </div>

          <div className="h-40 border-t border-border bg-card/50 flex flex-col shrink-0 select-none">
            <div className="h-8 px-4 flex items-center justify-between border-b border-border bg-background/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Output Console
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] hover:bg-secondary active:scale-95 transition-all"
                onClick={() => setOutput("")}
              >
                Clear
              </Button>
            </div>
            <pre className="flex-1 p-4 pb-24 font-mono text-xs overflow-auto bg-black/[0.03] dark:bg-black/30 text-foreground/95 leading-relaxed selection:bg-primary/20">
              {output || (
                <span className="text-muted-foreground/40 italic">
                  Execute code to see results...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
