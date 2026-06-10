import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  className = "",
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full h-10 px-4 py-2 text-sm text-left flex items-center justify-between rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className="truncate text-foreground">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon && (
                <span className="shrink-0 text-muted-foreground">{selectedOption.icon}</span>
              )}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-300 shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-xs text-muted-foreground">No options available</div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all duration-150 hover:bg-primary/10 hover:text-primary cursor-pointer border-none outline-none ${
                      isSelected
                        ? "bg-primary/15 text-primary font-semibold"
                        : "text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <span>{opt.label}</span>
                    </span>
                    {isSelected && <Check size={14} className="text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
