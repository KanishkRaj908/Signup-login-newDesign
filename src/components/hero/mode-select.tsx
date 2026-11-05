"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type Mode = "Build" | "Plan";

const MODES: { value: Mode; hint: string }[] = [
  { value: "Build", hint: "Generate the site right away" },
  { value: "Plan", hint: "Agree on a plan first" },
];

/** Compact "Build ⌄" mode picker for the composer's bottom row (phones). */
export function ModeSelect({ value, onChange, className }: { value: Mode; onChange: (m: Mode) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative self-center", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-8 flex items-center gap-1 px-2 border-0 rounded-lg bg-transparent text-[13px] font-medium text-ink transition-[background] duration-200 hover:bg-bg-tertiary [&_svg]:size-3 [&_svg]:text-tertiary"
        onClick={() => setOpen((o) => !o)}
      >
        {value}
        <ChevronDownIcon />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Mode"
          className="absolute left-0 top-full mt-1 z-10 m-0 list-none p-1 w-[220px] rounded-xl bg-box border border-border-secondary shadow-lg text-left animate-[flFadeIn_.15s_ease_both]"
        >
          {MODES.map((m) => (
            <li key={m.value} role="option" aria-selected={m.value === value}>
              <button
                type="button"
                className="w-full flex items-start gap-2 p-2 border-0 rounded-lg bg-transparent text-left hover:bg-bg-tertiary [&_svg]:size-4 [&_svg]:mt-0.5 [&_svg]:flex-none"
                onClick={() => {
                  onChange(m.value);
                  setOpen(false);
                }}
              >
                <span className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[13px] leading-5 font-semibold text-ink">{m.value}</span>
                  <span className="text-[12px] leading-[18px] text-tertiary">{m.hint}</span>
                </span>
                {m.value === value && <CheckIcon className="text-ink" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
