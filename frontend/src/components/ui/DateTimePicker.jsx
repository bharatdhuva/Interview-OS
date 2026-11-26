import React, { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, addMinutes, addHours, setHours, setMinutes, startOfTomorrow } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

function parseLocalDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toLocalDateTimeString(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function VirtualClock({ hour24, minute, onChange }) {
  const [mode, setMode] = useState("hour"); // "hour" | "minute"
  const isPm = hour24 >= 12;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

  const radius = 58;
  const center = 76;

  const numbers = useMemo(() => {
    if (mode === "hour") {
      return [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }
    return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }, [mode]);

  const activeAngleDeg =
    mode === "hour" ? (hour12 % 12) * 30 : (minute / 60) * 360;
  const activeRad = ((activeAngleDeg - 90) * Math.PI) / 180;
  const handX = center + Math.cos(activeRad) * (radius - 14);
  const handY = center + Math.sin(activeRad) * (radius - 14);

  const selectHour12 = (h12) => {
    let next24 = h12 % 12;
    if (isPm) next24 += 12;
    onChange(next24, minute);
    setMode("minute");
  };

  const selectMinute = (m) => {
    onChange(hour24, m);
  };

  const toggleAmPm = (nextPm) => {
    if (nextPm === isPm) return;
    const next24 = nextPm ? (hour24 % 12) + 12 : hour24 % 12;
    onChange(next24, minute);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Digital Readout + AM/PM */}
      <div className="flex items-center justify-between w-full mb-3 gap-2">
        <div className="flex items-center gap-1 bg-[#f4f6f3] px-2.5 py-1 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("hour")}
            className={`px-1.5 py-0.5 rounded text-sm font-semibold tabular-nums cursor-pointer ${
              mode === "hour"
                ? "bg-[#080a09] text-white"
                : "text-[#171917] hover:bg-white"
            }`}
          >
            {String(hour12).padStart(2, "0")}
          </button>
          <span className="text-sm font-bold text-[#707870]">:</span>
          <button
            type="button"
            onClick={() => setMode("minute")}
            className={`px-1.5 py-0.5 rounded text-sm font-semibold tabular-nums cursor-pointer ${
              mode === "minute"
                ? "bg-[#080a09] text-white"
                : "text-[#171917] hover:bg-white"
            }`}
          >
            {String(minute).padStart(2, "0")}
          </button>
        </div>

        <div className="flex rounded-lg border border-[#e2e7e1] overflow-hidden text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => toggleAmPm(false)}
            className={`px-2 py-1 cursor-pointer ${
              !isPm ? "bg-[#008a52] text-white" : "bg-white text-[#566059]"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => toggleAmPm(true)}
            className={`px-2 py-1 cursor-pointer ${
              isPm ? "bg-[#008a52] text-white" : "bg-white text-[#566059]"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {/* Analog Clock Face */}
      <div className="relative w-[152px] h-[152px] rounded-full bg-[#fafbf9] border border-[#e2e7e1] select-none">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 152 152">
          <line
            x1={center}
            y1={center}
            x2={handX}
            y2={handY}
            stroke="#008a52"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={center} cy={center} r="3.5" fill="#008a52" />
          <circle cx={handX} cy={handY} r="13" fill="#008a52" fillOpacity="0.14" />
        </svg>

        {numbers.map((num, idx) => {
          const angle = ((idx * 30 - 90) * Math.PI) / 180;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          const isSelected =
            mode === "hour" ? hour12 === num : minute === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() =>
                mode === "hour" ? selectHour12(num) : selectMinute(num)
              }
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
              }}
              className={`absolute w-6 h-6 rounded-full text-[11px] font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                isSelected
                  ? "bg-[#008a52] text-white"
                  : "text-[#171917] hover:bg-[#eef5ef]"
              }`}
            >
              {mode === "minute" ? String(num).padStart(2, "0") : num}
            </button>
          );
        })}
      </div>

      <p className="text-[10.5px] text-[#707870] mt-2">
        {mode === "hour" ? "Click an hour" : "Click minutes"}
      </p>
    </div>
  );
}

export default function DateTimePicker({ value, onChange, hasError }) {
  const [open, setOpen] = useState(false);

  const selectedDate = useMemo(() => {
    const parsed = parseLocalDateTime(value);
    if (parsed) return parsed;
    const def = addHours(new Date(), 1);
    def.setMinutes(0, 0, 0);
    return def;
  }, [value]);

  const handleDaySelect = (day) => {
    if (!day) return;
    const next = new Date(day);
    next.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    onChange(toLocalDateTimeString(next));
  };

  const handleTimeChange = (h24, m) => {
    const next = new Date(selectedDate);
    next.setHours(h24, m, 0, 0);
    onChange(toLocalDateTimeString(next));
  };

  const applyPreset = (date) => {
    date.setSeconds(0, 0);
    onChange(toLocalDateTimeString(date));
  };

  const parsedDisplay = parseLocalDateTime(value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`mt-1.5 w-full h-10 px-3 rounded-md border text-left text-sm flex items-center justify-between gap-2 bg-[#fafbf9] transition-colors cursor-pointer ${
            hasError
              ? "border-[#ba1a1a]"
              : "border-[#e2e7e1] hover:border-[#bfcaba] focus:border-[#008a52]"
          }`}
        >
          <span className={parsedDisplay ? "text-[#171917] truncate" : "text-[#828b83] truncate"}>
            {parsedDisplay
              ? format(parsedDisplay, "MMM d, yyyy · h:mm a")
              : "Select date & time"}
          </span>
          <span className="inline-flex items-center gap-1 text-[#707870] shrink-0">
            <CalendarIcon className="w-3.5 h-3.5" />
            <Clock className="w-3.5 h-3.5" />
          </span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="w-auto p-4 bg-white border border-[#e2e7e1] rounded-2xl shadow-xl z-[60]"
        >
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pb-3 mb-3 border-b border-[#e2e7e1]">
          <button
            type="button"
            onClick={() => applyPreset(addMinutes(new Date(), 15))}
            className="px-2.5 py-1 rounded-full bg-[#f4f6f3] hover:bg-[#eef5ef] text-[11px] font-medium text-[#171917] cursor-pointer"
          >
            In 15 min
          </button>
          <button
            type="button"
            onClick={() => applyPreset(addHours(new Date(), 1))}
            className="px-2.5 py-1 rounded-full bg-[#f4f6f3] hover:bg-[#eef5ef] text-[11px] font-medium text-[#171917] cursor-pointer"
          >
            In 1 hour
          </button>
          <button
            type="button"
            onClick={() =>
              applyPreset(setMinutes(setHours(startOfTomorrow(), 10), 0))
            }
            className="px-2.5 py-1 rounded-full bg-[#f4f6f3] hover:bg-[#eef5ef] text-[11px] font-medium text-[#171917] cursor-pointer"
          >
            Tomorrow 10:00 AM
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDaySelect}
            disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
            className="text-xs"
            classNames={{
              months: "flex flex-col",
              month: "space-y-2",
              caption: "flex justify-center pt-1 relative items-center text-xs font-semibold",
              caption_label: "text-xs font-semibold text-[#171917]",
              nav: "space-x-1 flex items-center",
              nav_button: "h-6 w-6 bg-transparent p-0 opacity-60 hover:opacity-100 rounded hover:bg-[#f4f6f3]",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-[#707870] rounded-md w-7 font-medium text-[10px]",
              row: "flex w-full mt-1",
              cell: "h-7 w-7 text-center text-xs p-0 relative",
              day: "h-7 w-7 p-0 font-normal rounded-full hover:bg-[#eef5ef] text-[#171917] cursor-pointer",
              day_selected: "!bg-[#080a09] !text-white font-semibold",
              day_today: "border border-[#008a52] text-[#008a52] font-semibold",
              day_outside: "text-[#bfcaba] opacity-50",
              day_disabled: "text-[#bfcaba] opacity-40 cursor-not-allowed",
            }}
          />

          <div className="sm:border-l sm:border-[#e2e7e1] sm:pl-4 pt-2 sm:pt-0">
            <VirtualClock
              hour24={selectedDate.getHours()}
              minute={selectedDate.getMinutes()}
              onChange={handleTimeChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 mt-3 border-t border-[#e2e7e1]">
          <button
            type="button"
            onClick={() => {
              if (!value) onChange(toLocalDateTimeString(selectedDate));
              setOpen(false);
            }}
            className="px-4 h-8 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
