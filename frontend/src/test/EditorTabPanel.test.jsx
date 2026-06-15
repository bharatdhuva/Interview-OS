import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import EditorTabPanel from "../components/room/EditorTabPanel";

// Mock Monaco Editor
vi.mock("@monaco-editor/react", () => {
  return {
    default: vi.fn(({ value, onChange, language, theme }) => {
      window.lastMonacoProps = { value, onChange, language, theme };
      return <div data-testid="mock-monaco-editor" />;
    }),
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  return {
    Code2: () => <span>Code2</span>,
    Play: () => <span>Play</span>,
    Save: () => <span>Save</span>,
    Brain: () => <span>Brain</span>,
    X: () => <span>X</span>,
    Terminal: () => <span>Terminal</span>,
    ChevronDown: () => <span>ChevronDown</span>,
    Check: () => <span>Check</span>,
  };
});

describe("EditorTabPanel Component", () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    document.body.removeChild(container);
    container = null;
    vi.restoreAllMocks();
    delete window.lastMonacoProps;
  });

  const defaultProps = {
    files: {
      "index.js": "console.log('hello');",
      "helper.py": "print('helper')"
    },
    activeFile: "index.js",
    setActiveFile: vi.fn(),
    newFileName: "",
    setNewFileName: vi.fn(),
    showFileExplorer: true,
    setShowFileExplorer: vi.fn(),
    language: "javascript",
    setLanguage: vi.fn(),
    handleManualSave: vi.fn(),
    isSaving: false,
    handleRun: vi.fn(),
    isRunning: false,
    output: "",
    setOutput: vi.fn(),
    isDark: true,
    handleCodeChange: vi.fn(),
    handleDeleteFile: vi.fn(),
    handleCreateFile: vi.fn(),
    lastSavedAt: null
  };

  it("should mount and show file list", () => {
    act(() => {
      root = createRoot(container);
      root.render(<EditorTabPanel {...defaultProps} />);
    });

    expect(container.textContent).toContain("index.js");
    expect(container.textContent).toContain("helper.py");
  });

  it("should switch files when a file is clicked", () => {
    act(() => {
      root = createRoot(container);
      root.render(<EditorTabPanel {...defaultProps} />);
    });

    const fileSpan = Array.from(container.querySelectorAll("span")).find(
      (el) => el.textContent === "helper.py"
    );
    
    expect(fileSpan).toBeDefined();

    act(() => {
      fileSpan.click();
    });

    expect(defaultProps.setActiveFile).toHaveBeenCalledWith("helper.py");
  });

  it("should trigger handleCodeChange when Monaco onChange is fired", () => {
    act(() => {
      root = createRoot(container);
      root.render(<EditorTabPanel {...defaultProps} />);
    });

    const editedCode = "console.log('new code');";
    act(() => {
      window.lastMonacoProps.onChange(editedCode);
    });

    expect(defaultProps.handleCodeChange).toHaveBeenCalledWith(editedCode);
  });

  it("should invoke handleRun and handleManualSave when buttons are clicked", () => {
    act(() => {
      root = createRoot(container);
      root.render(<EditorTabPanel {...defaultProps} />);
    });

    const saveButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent.includes("Save")
    );
    act(() => {
      saveButton.click();
    });
    expect(defaultProps.handleManualSave).toHaveBeenCalled();

    const runButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent.includes("Run")
    );
    act(() => {
      runButton.click();
    });
    expect(defaultProps.handleRun).toHaveBeenCalled();
  });
});
