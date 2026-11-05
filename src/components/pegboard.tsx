"use client";

import { useEffect, useRef } from "react";

const PEG_ID = "pegboard";
/** Elements marked with data-content hide the glow while hovered. */
const EXCLUDE = "[data-content]";

/** Reveal the pegboard glow at a viewport point (also used while dragging bricks). */
export function peekAt(x: number, y: number) {
  const peg = document.getElementById(PEG_ID);
  if (!peg) return;
  peg.style.setProperty("--mx", x + "px");
  peg.style.setProperty("--my", y + "px");
  peg.dataset.peek = "";
}

/** Lego pegboard revealed as a soft glow that follows the cursor across the page. */
export function Pegboard() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const peg = ref.current!;
    const hide = () => delete peg.dataset.peek;
    function onMove(e: PointerEvent) {
      const t = e.target as Element | null;
      if (t?.closest?.(EXCLUDE)) return hide();
      peekAt(e.clientX, e.clientY);
    }
    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", hide);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", hide);
    };
  }, []);

  return (
    <div
      ref={ref}
      id={PEG_ID}
      aria-hidden="true"
      className="fixed inset-0 -z-1 pointer-events-none opacity-0 bg-pegboard dark:bg-pegboard-dark mask-spotlight transition-opacity duration-350 data-peek:opacity-100"
    />
  );
}
