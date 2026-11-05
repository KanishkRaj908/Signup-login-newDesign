"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { peekAt } from "@/components/pegboard";
import { playBrickClick, preloadBrickSound } from "@/lib/brick-sound";
import { cn } from "@/lib/cn";

const GRID = 32;

type BrickSpec = {
  src: string;
  width: number;
  height: number;
  /** position + entrance delay of the brick image */
  className: string;
  /** dashed home slot shown while dragging */
  slotClassName: string;
  /** offset + width of the visible brick inside the transparent SVG canvas */
  inset: number;
  visibleWidth: number;
};

const BRICKS: BrickSpec[] = [
  {
    src: "/assets/yellow.svg", width: 127, height: 127,
    className: "-left-1.5 -top-1.5 below-720:left-[22px] below-720:top-[60px] w-[127px] h-[127px] z-2 [animation-delay:.15s]",
    slotClassName: "left-0 top-0 below-720:left-7 below-720:top-[66px] w-16 h-16 bg-[rgba(255,208,44,.16)]",
    inset: 6, visibleWidth: 64,
  },
  {
    src: "/assets/green.svg", width: 127, height: 127,
    className: "left-[190px] below-720:left-[220px] top-[31px] w-[127px] h-[127px] z-2 [animation-delay:.21s]",
    slotClassName: "left-[195px] below-720:left-[225px] top-9 w-16 h-16 bg-[rgba(0,187,134,.16)]",
    inset: 5, visibleWidth: 64,
  },
  {
    src: "/assets/blue.svg", width: 171, height: 232,
    className: "left-[120px] top-7 w-[171px] h-[232px] z-1 [animation-delay:.27s]",
    slotClassName: "left-32 top-9 w-16 h-[125px] bg-[rgba(1,84,205,.16)]",
    inset: 8, visibleWidth: 64,
  },
];

/** Rects of page content a brick may not be dropped on. */
function contentRects() {
  return Array.from(document.querySelectorAll("[data-content]"), (e) => e.getBoundingClientRect());
}

function overlaps(r: DOMRect, rects: DOMRect[]) {
  return rects.some((b) => r.right > b.left + 4 && r.left < b.right - 4 && r.bottom > b.top + 4 && r.top < b.bottom - 4);
}

/** Drop area: between the two rails, below the header, down to the end of the first screen. */
function dropBounds() {
  const f = document.getElementById("frame")!.getBoundingClientRect();
  const railL = document.querySelector<HTMLElement>('[data-rail="l"]');
  const railR = document.querySelector<HTMLElement>('[data-rail="r"]');
  const lx = railL?.offsetParent ? railL.getBoundingClientRect().left : f.left + 16;
  const rx = railR?.offsetParent ? railR.getBoundingClientRect().right : f.right - 16;
  return { lx, rx, top: f.top + 70, bottom: f.top + Math.min(f.height - 12, 796) };
}

type Phase = "idle" | "dragging" | "settling";

function Brick({ spec }: { spec: BrickSpec }) {
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [hover, setHover] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [slot, setSlot] = useState<{ x: number; y: number } | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  const dragging = phase === "dragging";
  const scale = dragging ? 1.05 : hover ? 1.03 : 1;
  // no inline transform until first interaction, so the entrance animation owns it
  const o = offset ?? { x: 0, y: 0 };
  const transform = offset || hover ? `translate(${o.x}px,${o.y}px) scale(${scale})` : undefined;

  function onPointerDown(e: ReactPointerEvent<HTMLImageElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    clearTimeout(settleTimer.current);
    setPhase("dragging");
    setSlot({ x: 0, y: 0 });

    const sx = e.clientX, sy = e.clientY;
    const start = { ...pos.current };
    const r0 = el.getBoundingClientRect();
    const baseLeft = r0.left - start.x, baseTop = r0.top - start.y, w = r0.width, h = r0.height;
    const rb = dropBounds();
    const blocked = contentRects();
    try { el.setPointerCapture(e.pointerId); } catch {}

    function move(ev: PointerEvent) {
      // free drag past the rails; only an off-screen guard applies
      let x = start.x + (ev.clientX - sx), y = start.y + (ev.clientY - sy);
      x = Math.max(rb.lx - 180 - baseLeft, Math.min(x, rb.rx + 180 - w - baseLeft));
      y = Math.max(rb.top - baseTop, Math.min(y, rb.bottom - h - baseTop));
      pos.current = { x, y };
      setOffset({ x, y });
      setSlot({ x: Math.round(x / GRID) * GRID, y: Math.round(y / GRID) * GRID });
      peekAt(ev.clientX, ev.clientY); // glow follows the brick
    }
    function up() {
      setHover(false);
      const r = el.getBoundingClientRect();
      const left = r.left + spec.inset, right = left + spec.visibleWidth; // the visible brick edges
      const invalid = left < rb.lx || right > rb.rx || overlaps(r, blocked);
      if (invalid) pos.current = start; // ease back to the previous spot
      else {
        pos.current = { x: Math.round(pos.current.x / GRID) * GRID, y: Math.round(pos.current.y / GRID) * GRID };
        playBrickClick();
      }
      setOffset({ ...pos.current });
      setPhase("settling");
      setSlot(null);
      settleTimer.current = setTimeout(() => setPhase("idle"), 380);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    }
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  return (
    <>
      <div
        className={cn(
          "absolute border-[1.5px] border-dashed border-[#d4d4d4] dark:border-[#3a3c42] rounded-[11px] opacity-0 pointer-events-none z-1 transition-[opacity,transform] [transition-duration:.18s,.12s]",
          spec.slotClassName,
          slot && "opacity-100",
        )}
        style={slot ? { transform: `translate(${slot.x}px,${slot.y}px)` } : undefined}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG with pointer handlers */}
      <img
        className={cn(
          "absolute block cursor-grab select-none [-webkit-user-drag:none] touch-none will-change-transform",
          "transition-[transform] duration-180 animate-[riseIn_.75s_var(--ease-enter)_backwards] motion-reduce:animate-none!",
          spec.className,
          phase === "dragging" && "cursor-grabbing transition-none z-6",
          phase === "settling" && "duration-340 ease-[cubic-bezier(.2,.8,.25,1)] z-6",
        )}
        src={spec.src}
        width={spec.width}
        height={spec.height}
        alt=""
        draggable={false}
        style={{ transform }}
        onPointerEnter={() => !dragging && setHover(true)}
        onPointerLeave={() => !dragging && setHover(false)}
        onPointerDown={onPointerDown}
      />
    </>
  );
}

/** The three draggable hero bricks with their dashed home slots. */
export function Legos() {
  useEffect(preloadBrickSound, []);
  return (
    <div
      className={cn(
        "relative w-[259px] h-[282px] overflow-visible [transform:translateX(-14px)]",
        // phones: bricks side by side at 75%, centred; the negative margin gives back the scaled-away height
        "below-720:h-[170px] below-720:origin-top below-720:[transform:scale(.75)_translateX(-29px)] below-720:-mb-[42px]",
      )}
      aria-hidden="true"
    >
      {BRICKS.map((b) => (
        <Brick key={b.src} spec={b} />
      ))}
    </div>
  );
}
