import React from "react";

export default function SegmentedControl({
  value,
  onChange,
  options = [],
  className = ""
}) {
  return (
    <div className={`grid grid-cols-3 gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/80 select-none ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer border-none outline-none text-center truncate ${
              isSelected
                ? `${opt.activeBg || "bg-primary text-primary-foreground"} shadow-md scale-[1.02]`
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
