"use client";

import { useState } from "react";
import { CodeIcon } from "@/components/icons";
import { Lattice, LoaderLabel } from "@/components/loader";
import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";
import { LOADER_PATTERNS, loaderSnippet, type LoaderPattern } from "@/lib/loaders";

type Mode = "mono" | "color";
type Size = "sm" | "md";

function CopyButton({ pattern }: { pattern: LoaderPattern }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const ok = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    };
    try {
      navigator.clipboard.writeText(loaderSnippet(pattern)).then(ok, ok);
    } catch {
      ok();
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-[7px] flex-none border border-border-secondary bg-box text-secondary [font-family:inherit] text-[13px] font-semibold py-2 px-4 rounded-full cursor-pointer shadow-xs",
        // hover background is var(--bg-secondary) in the design, which is undefined → transparent
        "transition-[background,color,border-color] duration-200 hover:bg-transparent hover:text-ink [&_svg]:size-[15px]",
        copied && "text-green border-green",
      )}
    >
      <CodeIcon />
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5 below-820:flex-[1_1_180px]">
      <span className="text-[11px] font-bold tracking-[.06em] uppercase text-tertiary">{label}</span>
      {children}
    </div>
  );
}

/** Five lattice loaders with a mono/colour and small/medium controller. */
export function LoadingGallery({ visible }: { visible: boolean }) {
  const [mode, setMode] = useState<Mode>("mono");
  const [size, setSize] = useState<Size>("sm");

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-auto pt-10 px-8 pb-16 [--loff:var(--border-secondary)]",
        size === "md" ? "[--lcell:9px] [--lgap:3px] [--ltext:16px]" : "[--lcell:6px] [--lgap:2px] [--ltext:14px]",
        visible ? "block" : "hidden",
      )}
    >
      <div className="max-w-[1180px] mx-auto mb-5">
        <h2 className="font-serif m-0 text-[30px] leading-[38px] font-medium text-ink">Loading states</h2>
      </div>
      <div className="max-w-[1180px] mx-auto min-h-[calc(100vh-268px)] flex items-stretch bg-box border border-border-secondary rounded-2xl overflow-hidden below-820:flex-col">
        <div className="flex-auto min-w-0 flex flex-col justify-center gap-[18px] py-12 px-[210px] below-1100:px-[72px]">
          {LOADER_PATTERNS.map((p) => (
            <div key={p.verb} className="flex items-center gap-5 py-3.5 px-2">
              <Lattice pattern={p} colored={mode === "color"} />
              <LoaderLabel verb={p.verb} />
              <div className="flex-auto" />
              <CopyButton pattern={p} />
            </div>
          ))}
        </div>
        <aside className="flex-[0_0_252px] border-l border-border-secondary py-12 px-8 flex flex-col gap-7 below-820:basis-auto below-820:border-l-0 below-820:border-t below-820:flex-row below-820:flex-wrap below-820:gap-x-7 below-820:gap-y-[18px]">
          <ControlGroup label="Type">
            <Segmented
              className="w-full"
              label="Type"
              value={mode}
              onChange={setMode}
              options={[
                { value: "mono", label: "Mono" },
                { value: "color", label: "Colour" },
              ]}
            />
          </ControlGroup>
          <ControlGroup label="Size">
            <Segmented
              className="w-full"
              label="Size"
              value={size}
              onChange={setSize}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
              ]}
            />
          </ControlGroup>
        </aside>
      </div>
    </div>
  );
}
