import React from "react";
import { FileText } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

export default function ProblemTabPanel({
  identity,
  problemText,
  handleProblemChange,
  questionTemplates
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card/5 pb-20 overflow-y-auto">
      <div className="border-b border-border flex items-center justify-between px-4 py-2 shrink-0 bg-background/60 h-12 select-none">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground/90">Problem Description</span>
        </div>

        {identity.role === "interviewer" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Template:</span>
            <CustomSelect
              placeholder="Select Template"
              onChange={(val) => {
                const q = questionTemplates.find((t) => t.title === val);
                if (q) handleProblemChange(q.markdown);
              }}
              options={questionTemplates.map((q) => ({
                value: q.title,
                label: q.title
              }))}
              className="h-8 w-44 bg-secondary/50 border-border text-[11px] font-semibold"
            />
          </div>
        )}
      </div>

      {/* View Split: Interviewer can edit Markdown, Candidate read-only */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {identity.role === "interviewer" ? (
          <div className="flex-1 flex flex-col p-4 gap-3 border-r border-border/60">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider select-none">Markdown Editor (Interviewer)</span>
            <textarea
              value={problemText}
              onChange={(e) => handleProblemChange(e.target.value)}
              placeholder="Type or paste question markdown here..."
              className="flex-1 p-3 bg-secondary/25 border border-border rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-none"
            />
          </div>
        ) : null}

        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 select-none">Question View</span>
          <div className="flex-1 rounded-xl bg-card border border-border/80 p-6 overflow-y-auto prose dark:prose-invert max-w-none text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-primary/20">
            {problemText}
          </div>
        </div>
      </div>
    </div>
  );
}
