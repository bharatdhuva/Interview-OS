import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Play, Save, Brain, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import CustomSelect from "@/components/ui/CustomSelect";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/Resizable";


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
  const [stdin, setStdin] = useState('');
  const [consoleTab, setConsoleTab] = useState("output");
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
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-[11px] gap-1.5 hover:bg-primary/10 hover:text-primary active:scale-95 transition-all"
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI</span>
            </Button>
            {lastSavedAt && (
              <span className="hidden md:inline text-[10px] text-muted-foreground mr-1.5">
                Saved {lastSavedAt}
              </span>
            )}
            <Button
                size="sm"
                className="h-8 text-[11px] gap-1.5 bg-primary hover:bg-primary/90 hover:scale-[1.03] active:scale-95 transition-all shadow-md shadow-primary/20"
                onClick={() => handleRun(stdin)}
                disabled={isRunning}
              >
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isRunning ? "Running..." : "Run"}</span>
              </Button>
          </div>
        </div>
      </div>

      {/* Editor Workspace splits (sidebar filetree & monaco) */}
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          {/* Collapsible File Explorer */}
          {showFileExplorer && (
            <>
              <ResizablePanel defaultSize={15} minSize={10} maxSize={30} className="flex flex-col min-w-0">
                <div className="w-full h-full border-r border-border bg-card/45 flex flex-col p-3 overflow-hidden select-none">
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
              </ResizablePanel>
              <ResizableHandle withHandle className="w-1 bg-border/40 hover:bg-primary/50 transition-all cursor-col-resize z-40" />
            </>

          )}

          <ResizablePanel defaultSize={showFileExplorer ? 85 : 100} className="flex flex-col min-w-0">
            {/* Monaco & Output split */}
            <div className="w-full h-full flex flex-col min-w-0 relative">
          {!showFileExplorer && (
            <button
              onClick={() => setShowFileExplorer(true)}
              className="absolute left-3 top-3 z-20 w-8 h-8 rounded-lg bg-card border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95 transition-all"
              title="Expand Files Sidebar"
            >
              <Code2 className="w-4 h-4" />
            </button>
          )}

              <ResizablePanelGroup direction="vertical" className="h-full w-full flex-1">
                <ResizablePanel defaultSize={70} minSize={30} className="flex flex-col min-h-0">
                  <div className="flex-1 min-h-0 h-full">
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
                </ResizablePanel>
                
                <ResizableHandle withHandle className="h-1 bg-border/40 hover:bg-primary/50 transition-all cursor-row-resize z-40" />
                
                <ResizablePanel defaultSize={30} minSize={15} className="flex flex-col min-h-0">
                  <div className="w-full h-full bg-card/50 flex flex-col overflow-hidden">
                    <div className="h-10 px-4 flex items-center justify-between border-b border-border bg-background/30 shrink-0 select-none">
                      <div className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <button
                          onClick={() => setConsoleTab("output")}
                          className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 border ${
                            consoleTab === "output"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent"
                          }`}
                        >
                          Output
                        </button>
                        <button
                          onClick={() => setConsoleTab("stdin")}
                          className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all duration-200 border ${
                            consoleTab === "stdin"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40 border-transparent"
                          }`}
                        >
                          Stdin
                        </button>
                      </div>
                      
                      {consoleTab === "output" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] hover:bg-secondary active:scale-95 transition-all"
                          onClick={() => setOutput("")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex-1 min-h-0 overflow-hidden relative flex flex-col">
                      {consoleTab === "output" ? (
                        <pre className="flex-1 p-4 pb-20 font-mono text-xs overflow-auto bg-black/[0.03] dark:bg-black/30 text-foreground/95 leading-relaxed selection:bg-primary/20 select-text">
                          {output || (
                            <span className="text-muted-foreground/40 italic">
                              Execute code to see results...
                            </span>
                          )}
                        </pre>
                      ) : (
                        <div className="flex-1 flex flex-col p-4 bg-black/[0.03] dark:bg-black/30 min-h-0">
                          <div className="text-[10px] text-muted-foreground font-semibold mb-2 select-none">
                            Provide standard input (stdin) parameters to be passed to your execution thread.
                          </div>
                          <textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Type standard input (stdin) here..."
                            className="flex-1 w-full p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-mono resize-none shadow-inner leading-relaxed text-foreground select-text"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
