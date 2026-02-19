import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, PhoneOff, 
  Play, Save, Brain, Send, Clock, Terminal, ChevronDown, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const defaultCode: Record<string, string> = {
  javascript: `// Two Sum Problem\nfunction twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\n// Test\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  typescript: `// Two Sum Problem\nfunction twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
  python: `# Two Sum Problem\ndef two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
  cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> map;\n        for (int i = 0; i < nums.size(); i++) {\n            int complement = target - nums[i];\n            if (map.count(complement)) {\n                return {map[complement], i};\n            }\n            map[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
  go: `package main\n\nimport "fmt"\n\nfunc twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        complement := target - num\n        if j, ok := m[complement]; ok {\n            return []int{j, i}\n        }\n        m[num] = i\n    }\n    return nil\n}\n\nfunc main() {\n    fmt.Println(twoSum([]int{2, 7, 11, 15}, 9))\n}`,
  rust: `use std::collections::HashMap;\n\nfn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    let mut map = HashMap::new();\n    for (i, &num) in nums.iter().enumerate() {\n        let complement = target - num;\n        if let Some(&j) = map.get(&complement) {\n            return vec![j as i32, i as i32];\n        }\n        map.insert(num, i);\n    }\n    vec![]\n}\n\nfn main() {\n    println!("{:?}", two_sum(vec![2, 7, 11, 15], 9));\n}`,
};

interface ChatMsg {
  id: string;
  sender: string;
  message: string;
  time: string;
}


// component that renders a chat message with typing animation
const MessageBubble: React.FC<{msg: ChatMsg; currentUserName?: string}> = ({ msg, currentUserName }) => {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplay('');
    const timer = setInterval(() => {
      setDisplay(msg.message.slice(0, ++i));
      if (i >= msg.message.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [msg.message]);

  return (
    <motion.div
      key={msg.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className={`text-xs font-semibold ${msg.sender === currentUserName ? 'text-primary' : 'text-success'}`}>
          {msg.sender}
        </span>
        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
      </div>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
        {display}
      </p>
    </motion.div>
  );
};

export default function InterviewRoom() {
  const { roomId } = useParams();
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  
  const [language, setLanguage] = useState('typescript');
  const [code, setCode] = useState(defaultCode.typescript);
  const [output, setOutput] = useState('');
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // simple typewriter hook for arbitrary text
  const useTypewriter = (text: string, speed = 30) => {
    const [display, setDisplay] = useState('');
    useEffect(() => {
      let i = 0;
      setDisplay('');
      const timer = setInterval(() => {
        setDisplay(text.slice(0, ++i));
        if (i >= text.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    }, [text, speed]);
    return display;
  };

  // helper to animate code typing
  const startTypingCode = (full: string) => {
    setCode('');
    let i = 0;
    const timer = setInterval(() => {
      setCode(full.slice(0, ++i));
      if (i >= full.length) clearInterval(timer);
    }, 10);
  };

  const [isRunning, setIsRunning] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [timer, setTimer] = useState(3600);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: '1', sender: 'Alex Chen', message: 'Welcome! Take your time to read the problem. Let me know when you\'re ready.', time: '2:00 PM' },
    { id: '2', sender: 'Jordan Smith', message: 'Thanks! I\'ll start with a brute force approach and optimize.', time: '2:01 PM' },
    { id: '3', sender: 'Alex Chen', message: 'Sounds good. Walk me through your thought process.', time: '2:02 PM' },
  ]);
  const [previewCode, setPreviewCode] = useState('');
  const [previewChat, setPreviewChat] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTimer((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // when a new message arrives, animate preview chat bubble
    if (messages.length > 0) {
      const last = messages[messages.length - 1];
      let i = 0;
      setPreviewChat('');
      const timer = setInterval(() => {
        setPreviewChat(last.message.slice(0, ++i));
        if (i >= last.message.length) clearInterval(timer);
      }, 30);
      return () => clearInterval(timer);
    }
  }, [messages]);

  // when language changes start the typing animation in editor
  useEffect(() => {
    startTypingCode(defaultCode[language] || '');
  }, [language]);

  // re-trigger code typing when user scrolls the editor panel
  useEffect(() => {
    const el = codeContainerRef.current;
    const onScroll = () => {
      setPreviewCode('');
      // type a small snippet in left panel
      let i = 0;
      const snippet = defaultCode[language].split('\n').slice(0, 4).join('\n') + '\n...';
      const timer = setInterval(() => {
        setPreviewCode(snippet.slice(0, ++i));
        if (i >= snippet.length) clearInterval(timer);
      }, 40);
    };
    el?.addEventListener('scroll', onScroll);
    return () => el?.removeEventListener('scroll', onScroll);
  }, [language]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    await new Promise((r) => setTimeout(r, 1500));
    setOutput('> [0, 1]\n\n✓ Executed in 12ms | Memory: 2.1 MB');
    setIsRunning(false);
  };

  const handleSave = () => {
    toast({ title: 'Code saved!', description: 'Snapshot saved successfully.' });
  };

  const handleAIReview = () => {
    toast({ title: 'AI Review', description: 'Analyzing your code...' });
    setTimeout(() => {
      setOutput(
        '🤖 AI Code Review:\n\n' +
        '✅ Correctness: Solution handles the basic case correctly.\n' +
        '⏱️ Time Complexity: O(n) — optimal\n' +
        '💾 Space Complexity: O(n) — uses hash map\n' +
        '💡 Suggestion: Consider adding input validation for edge cases (empty array, no solution).\n' +
        '🎯 Overall: Clean, idiomatic solution. Good use of hash map pattern.'
      );
    }, 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      sender: user?.name || 'You',
      message: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatInput('');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(defaultCode[lang] || '');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-gradient-primary flex items-center justify-center">
              <Terminal className="w-3 h-3 text-primary-foreground" />
            </div>
          </Link>
          <span className="text-sm font-display font-semibold">Frontend Engineer — React Deep Dive</span>
          <span className="text-xs text-muted-foreground font-mono">#{roomId}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm font-mono">
            <Clock className="w-4 h-4 text-primary" />
            <span className={timer < 300 ? 'text-destructive' : 'text-foreground'}>{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">2 connected</span>
          </div>
          <Button size="sm" variant="destructive" className="h-7 text-xs">
            End Interview
          </Button>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Video Panel */}
        <div className="col-span-2 border-r border-border flex flex-col p-2 gap-2">
          <div className="flex-1 rounded-lg bg-secondary flex flex-col items-center justify-center relative overflow-hidden">
            {/* animated activity icon (code lines) */}
            <motion.div
              className="absolute top-2 left-2"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            >
              <Terminal className="w-4 h-4 text-primary/70" />
            </motion.div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-primary/60" />
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] font-medium bg-background/80 px-1.5 py-0.5 rounded">
              Alex Chen
            </div>
            {!camOn && <div className="absolute inset-0 bg-secondary flex items-center justify-center"><VideoOff className="w-6 h-6 text-muted-foreground" /></div>}
            {previewCode && (
              <pre className="absolute inset-x-2 bottom-10 text-[10px] text-primary/70 bg-background/90 p-1 rounded max-h-16 overflow-hidden font-mono">
                {previewCode}
              </pre>
            )}
          </div>
          <div className="flex-1 rounded-lg bg-secondary flex flex-col items-center justify-center relative overflow-hidden">
            {/* animated activity icon (chat) */}
            <motion.div
              className="absolute top-2 left-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              <Send className="w-4 h-4 text-success/70" />
            </motion.div>
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-success/60" />
            </div>
            <div className="absolute bottom-2 left-2 text-[10px] font-medium bg-background/80 px-1.5 py-0.5 rounded">
              Jordan Smith
            </div>
            {previewChat && (
              <pre className="absolute inset-x-2 bottom-10 text-[10px] text-success/70 bg-background/90 p-1 rounded max-h-16 overflow-hidden font-mono">
                {previewChat}
              </pre>
            )}
          </div>
          {/* Controls */}
          <div className="flex justify-center gap-1.5 py-2">
            <button onClick={() => setMicOn(!micOn)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${micOn ? 'bg-secondary hover:bg-surface-hover' : 'bg-destructive/20 text-destructive'}`}>
              {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button onClick={() => setCamOn(!camOn)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${camOn ? 'bg-secondary hover:bg-surface-hover' : 'bg-destructive/20 text-destructive'}`}>
              {camOn ? <VideoIcon className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
            <button className="w-9 h-9 rounded-full bg-secondary hover:bg-surface-hover flex items-center justify-center transition-colors">
              <Monitor className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive flex items-center justify-center transition-colors">
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code Editor Panel */}
        <div className="col-span-7 flex flex-col border-r border-border">
          {/* Editor Toolbar */}
          <div className="h-10 border-b border-border flex items-center justify-between px-3 shrink-0">
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-7 w-36 text-xs bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleSave}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleAIReview}>
                <Brain className="w-3 h-3 mr-1" /> AI Review
              </Button>
              <Button size="sm" className="h-7 text-xs bg-gradient-primary hover:opacity-90" onClick={handleRun} disabled={isRunning}>
                <Play className="w-3 h-3 mr-1" /> {isRunning ? 'Running...' : 'Run'}
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div ref={codeContainerRef} className="flex-1 min-h-0 overflow-auto">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || '')}
              options={{
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                minimap: { enabled: false },
                padding: { top: 12 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                bracketPairColorization: { enabled: true },
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output Console */}
          <div className="h-32 border-t border-border shrink-0">
            <div className="flex items-center h-7 px-3 border-b border-border bg-card">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Output</span>
            </div>
            <pre className="p-3 text-xs font-mono text-foreground/80 overflow-auto h-[calc(100%-28px)]">
              {output || 'Click "Run" to execute your code...'}
            </pre>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="col-span-3 flex flex-col">
          <div className="h-10 border-b border-border flex items-center px-3 shrink-0">
            <span className="text-sm font-display font-semibold">Chat</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} currentUserName={user?.name} />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="text-sm bg-secondary border-border"
              />
              <Button type="submit" size="sm" className="bg-gradient-primary hover:opacity-90 px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
