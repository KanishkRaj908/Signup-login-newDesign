"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { mergeProps, useFocusRing, useHover, useMove } from "react-aria";
import { peekAt } from "@/components/pegboard";
import { brickSize, LegoBrick, type BrickColor } from "@/components/ui/lego-brick";
import { playBrickClick, preloadBrickSound } from "@/lib/brick-sound";
import { cn } from "@/lib/cn";

const GRID = 32;

type BrickSpec = {
  color: BrickColor;
  /** studs down (all hero bricks are one stud wide) */
  rows: number;
  /** home position, shared by the brick and its dashed slot */
  pos: string;
  /** stacking + entrance delay */
  className: string;
  /** tint of the dashed home slot shown while dragging */
  tint: string;
};

const BRICKS: BrickSpec[] = [
  { color: "yellow", rows: 1, pos: "left-0 top-0 below-720:left-7 below-720:top-[66px]", className: "z-2 [animation-delay:.15s]", tint: "bg-[rgba(255,208,44,.16)]" },
  { color: "green", rows: 1, pos: "left-[195px] below-720:left-[225px] top-9", className: "z-2 [animation-delay:.21s]", tint: "bg-[rgba(0,187,134,.16)]" },
  { color: "blue", rows: 2, pos: "left-32 top-9", className: "z-1 [animation-delay:.27s]", tint: "bg-[rgba(1,84,205,.16)]" },
];

type Point = { x: number; y: number };
type Box = { left: number; top: number; right: number; bottom: number };

const snap = (p: Point): Point => ({ x: Math.round(p.x / GRID) * GRID, y: Math.round(p.y / GRID) * GRID });
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

/** Rects of page content a brick may not be dropped on. */
function contentRects() {
  return Array.from(document.querySelectorAll("[data-content]"), (e) => e.getBoundingClientRect());
}

function overlaps(r: Box, rects: Box[]) {
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

/**
 * Where the brick would sit on screen at offset `p`, ignoring hover/drag scale. `k` is the brick
 * area's own scale (75% on phones): screen pixels per offset pixel.
 */
function screenBox(el: HTMLElement, p: Point) {
  const area = el.offsetParent as HTMLElement;
  const ar = area.getBoundingClientRect();
  const k = ar.width / area.offsetWidth;
  const left = ar.left + (el.offsetLeft + p.x) * k, top = ar.top + (el.offsetTop + p.y) * k;
  return { left, top, right: left + el.offsetWidth * k, bottom: top + el.offsetHeight * k, k };
}

/** Whether a brick at `b` sits inside the drop area and clear of page content. */
function fits(b: Box) {
  const rb = dropBounds();
  return b.left >= rb.lx && b.right <= rb.rx && b.top >= rb.top && b.bottom <= rb.bottom && !overlaps(b, contentRects());
}

/** Runs `fn` now, on every (frame-throttled) resize, and whenever Next shows the page again (it re-runs effects then). */
function useOnResize(fn: () => void) {
  const latest = useRef(fn);
  useLayoutEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    let raf = 0;
    const run = () => latest.current();
    function onResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(run);
    }
    run();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
}

type Phase = "idle" | "dragging" | "settling";
/** Captured when a drag starts: where it began and the offsets the brick may move between. */
type Drag = { start: Point; k: number; min: Point; max: Point };

function Brick({ spec }: { spec: BrickSpec }) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [phase, setPhase] = useState<Phase>("idle");
  const [slot, setSlot] = useState<Point | null>(null);
  const pos = useRef<Point>({ x: 0, y: 0 });
  const drag = useRef<Drag | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  /** Ease the brick to `pos` (wherever it was just set). */
  function settle() {
    setOffset({ ...pos.current });
    setPhase("settling");
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => setPhase("idle"), 380);
  }

  // a narrower window pulls the rails in, which can leave a moved brick outside them: send it home
  useOnResize(() => {
    const el = ref.current;
    if (!el?.offsetParent || (pos.current.x === 0 && pos.current.y === 0) || fits(screenBox(el, pos.current))) return;
    pos.current = { x: 0, y: 0 };
    settle();
  });

  // mouse, touch and pen drag, plus arrow keys (one grid step per press) when focused
  const { moveProps } = useMove({
    onMoveStart() {
      const el = ref.current!;
      clearTimeout(settleTimer.current);
      setPhase("dragging");
      setSlot(snap(pos.current));
      // free drag past the rails; only an off-screen guard applies
      const home = screenBox(el, { x: 0, y: 0 }), rb = dropBounds(), k = home.k;
      const w = home.right - home.left, h = home.bottom - home.top;
      drag.current = {
        start: { ...pos.current },
        k,
        min: { x: (rb.lx - 180 - home.left) / k, y: (rb.top - home.top) / k },
        max: { x: (rb.rx + 180 - w - home.left) / k, y: (rb.bottom - h - home.top) / k },
      };
    },
    onMove(e) {
      const d = drag.current;
      if (!d) return;
      // pointer deltas are screen pixels; the brick area may be scaled, so convert
      const step = e.pointerType === "keyboard" ? GRID : 1 / d.k;
      const p = { x: clamp(pos.current.x + e.deltaX * step, d.min.x, d.max.x), y: clamp(pos.current.y + e.deltaY * step, d.min.y, d.max.y) };
      pos.current = p;
      setOffset(p);
      setSlot(snap(p));
      const b = screenBox(ref.current!, p);
      peekAt((b.left + b.right) / 2, (b.top + b.bottom) / 2); // glow follows the brick
    },
    onMoveEnd() {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const snapped = snap(pos.current);
      if (fits(screenBox(ref.current!, snapped))) {
        pos.current = snapped;
        playBrickClick();
      } else pos.current = d.start; // ease back to the previous spot
      settle();
      setSlot(null);
    },
  });
  const dragging = phase === "dragging";
  const { hoverProps, isHovered } = useHover({ isDisabled: dragging });
  const { focusProps, isFocusVisible } = useFocusRing();

  const scale = dragging ? 1.05 : isHovered ? 1.03 : 1;
  const size = brickSize(1, spec.rows);

  return (
    <>
      <div
        className={cn(
          "absolute border-[1.5px] border-dashed border-[#d4d4d4] dark:border-[#3a3c42] rounded-[11px] opacity-0 pointer-events-none z-1 transition-[opacity,transform] [transition-duration:.18s,.12s]",
          spec.pos,
          spec.tint,
          slot && "opacity-100",
        )}
        style={{ ...size, transform: slot ? `translate(${slot.x}px,${slot.y}px)` : undefined }}
      />
      <LegoBrick
        ref={ref}
        color={spec.color}
        rows={spec.rows}
        data-brick={spec.color}
        tabIndex={0}
        role="button"
        aria-roledescription="draggable brick"
        aria-label={`${spec.color} brick. Drag it, or use the arrow keys, to move it.`}
        {...mergeProps(moveProps, hoverProps, focusProps)}
        className={cn(
          "absolute cursor-grab select-none touch-none will-change-transform",
          // `translate`/`scale` rather than `transform`, so they add to the entrance animation's transform:
          // when Next re-shows the page the animation replays, and a moved brick rises in at its new spot
          "transition-[translate,scale] duration-180 animate-[riseIn_.75s_var(--ease-enter)_backwards] motion-reduce:animate-none!",
          spec.pos,
          spec.className,
          dragging && "cursor-grabbing transition-none z-6",
          phase === "settling" && "duration-340 ease-[cubic-bezier(.2,.8,.25,1)] z-6",
          isFocusVisible ? "outline-2 outline-solid outline-offset-4 outline-ink" : "outline-none",
        )}
        style={{ translate: `${offset.x}px ${offset.y}px`, scale }}
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
      role="group"
      aria-label="Bricks"
    >
      {BRICKS.map((b) => (
        <Brick key={b.color} spec={b} />
      ))}
    </div>
  );
}
