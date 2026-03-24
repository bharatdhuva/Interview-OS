export const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', monacoId: 'javascript', judge0Id: 93, icon: 'JS' },
    { value: 'typescript', label: 'TypeScript', monacoId: 'typescript', judge0Id: 94, icon: 'TS' },
    { value: 'python', label: 'Python', monacoId: 'python', judge0Id: 71, icon: 'PY' },
    { value: 'java', label: 'Java', monacoId: 'java', judge0Id: 91, icon: 'JV' },
    { value: 'cpp', label: 'C++', monacoId: 'cpp', judge0Id: 54, icon: 'C++' },
    { value: 'go', label: 'Go', monacoId: 'go', judge0Id: 95, icon: 'GO' },
    { value: 'rust', label: 'Rust', monacoId: 'rust', judge0Id: 73, icon: 'RS' },
];
export const DEFAULT_LANGUAGE = 'javascript';
// ── Starter Code (per language) ──────────────────────────────────
export const STARTER_CODE = {
    javascript: `// Write your solution here
function solve(input) {
  // Your code goes here
  
}

// Test your solution
console.log(solve());
`,
    typescript: `// Write your solution here
function solve(input: string): string {
  // Your code goes here
  
}

// Test your solution
console.log(solve(""));
`,
    python: `# Write your solution here
def solve(input):
    # Your code goes here
    pass

# Test your solution
print(solve(""))
`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Test your solution
        System.out.println(solve());
    }

    static String solve() {
        // Your code goes here
        return "";
    }
}
`,
    cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
    go: `package main

import "fmt"

func main() {
    // Write your solution here
    fmt.Println(solve())
}

func solve() string {
    // Your code goes here
    return ""
}
`,
    rust: `use std::io;

fn main() {
    // Write your solution here
    println!("{}", solve());
}

fn solve() -> String {
    // Your code goes here
    String::new()
}
`,
};
// ── Monaco Editor Options ────────────────────────────────────────
export const EDITOR_OPTIONS = {
    fontSize: 14,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontLigatures: true,
    minimap: { enabled: false },
    padding: { top: 16, bottom: 16 },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    lineNumbers: 'on',
    renderLineHighlight: 'all',
    overviewRulerBorder: false,
    hideCursorInOverviewRuler: true,
    bracketPairColorization: { enabled: true },
    smoothScrolling: true,
    tabSize: 2,
    wordWrap: 'off',
    suggest: { showSnippets: true },
    formatOnPaste: true,
    formatOnType: true,
    quickSuggestions: true,
    scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
    },
};
// ── Autosave & Execution Limits ──────────────────────────────────
export const AUTOSAVE_DELAY_MS = 1500;
export const MAX_EXECUTIONS_PER_SESSION = 30;
export const EXECUTION_TIMEOUT_MS = 15000;
