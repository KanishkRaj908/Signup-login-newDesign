"use client";

import { useState } from "react";
import { RemoveIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

export type Attachment = { id: number; url: string };

const STEP_STACK = 34; // fan step
const STEP_ROW = 62; // even-row step (58 + 4 gap)
const ROT = [0, -2, 4, 6, 0, 0, -4, -7, -2, 3]; // playful tilts per card

/** Attachment thumbnails fanned above the prompt box; hovering spreads them into a row. */
export function Attachments({ files, onRemove }: { files: Attachment[]; onRemove: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const spread = hovered && files.length > 0;
  const n = files.length;

  return (
    <div
      className={cn("absolute left-[22px] -top-[23px] h-[58px] z-6", n === 0 && "hidden")}
      style={{ width: spread ? n * STEP_ROW : n * STEP_STACK + 58 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {files.map((f, i) => (
        <div
          key={f.id}
          className="group/card absolute bottom-0 left-0 w-[58px] h-[58px] bg-box rounded-[10px] p-0.5 shadow-md origin-bottom will-change-transform cursor-pointer transition-[transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{
            zIndex: n - i, // leftmost card always on top
            transform: spread
              ? `translateX(${i * STEP_ROW}px) rotate(0deg)`
              : `translateX(${i * STEP_STACK}px) rotate(${ROT[i % ROT.length]}deg)`,
          }}
        >
          <div className="w-[54px] h-[54px] rounded-lg bg-cover bg-center" style={{ backgroundImage: `url("${f.url}")` }} />
          <button
            className={cn(
              "absolute -top-2 -right-2 size-[22px] rounded-full bg-box border border-border-tertiary shadow-xs flex items-center justify-center p-0",
              "opacity-0 [transform:scale(.6)] transition-[opacity,transform] duration-180 [&_svg]:size-[13px] [&_svg]:text-tertiary",
              spread && "group-hover/card:opacity-100 group-hover/card:[transform:scale(1)]",
            )}
            aria-label="Remove file"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(f.id);
            }}
          >
            <RemoveIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
