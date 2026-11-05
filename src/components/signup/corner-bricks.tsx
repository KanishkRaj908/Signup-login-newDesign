"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Brick SVGs draw a 24px-per-stud body starting 2.1px into the canvas (the rest is shadow). */
const INSET = 2.1;
const UNIT = 24;
/** Assembled cluster: 3 studs wide, 2 tall. */
const CLUSTER = { w: 3 * UNIT, h: 2 * UNIT };
const MOVE_MS = 1800;
const STAGGER_MS = 160;

type Brick = {
  src: string;
  w: number;
  h: number;
  /** resting corner (fly-in destination) */
  pos: string;
  fly: string;
  /** top-left stud of its slot in the assembled cluster */
  slot: { x: number; y: number };
  /** the vertical green brick turns flat on its way in */
  turns?: boolean;
};

const BRICKS: Brick[] = [
  // phones (where the bricks only show for the assembly) start them in the screen corners, clear of the card
  { src: "/assets/24/blue.svg", w: 73, h: 48, pos: "top-[127px] right-[108px] below-760:top-24 below-760:right-6", fly: "animate-[flyTR_1.05s_cubic-bezier(.5,.05,.2,1)_.26s_both]", slot: { x: 1, y: 1 } },
  { src: "/assets/24/yellow.svg", w: 48, h: 48, pos: "top-[126px] left-[126px] below-760:top-20 below-760:left-6", fly: "animate-[flyTL_1.05s_cubic-bezier(.5,.05,.2,1)_.14s_both]", slot: { x: 0, y: 1 } },
  { src: "/assets/24/Green.svg", w: 48, h: 73, pos: "bottom-[105px] left-[150px] below-760:bottom-20 below-760:left-8", fly: "animate-[flyBL_1.05s_cubic-bezier(.5,.05,.2,1)_.38s_both]", slot: { x: 0, y: 0 }, turns: true },
  { src: "/assets/24/yellow.svg", w: 48, h: 48, pos: "bottom-[106px] right-[108px] below-760:bottom-24 below-760:right-8", fly: "animate-[flyBR_1.05s_cubic-bezier(.5,.05,.2,1)_.5s_both]", slot: { x: 2, y: 0 } },
];
// render order matches the original markup (TL, TR, BL, BR) so the fly-in is unchanged
const ORDER = [1, 0, 2, 3];

type Placement = { transform: string; delay: number };

type Props = {
  open: boolean;
  openKey: number;
  /** slide the bricks together into the centred cluster */
  assembled: boolean;
  /** fade them out (screens without bricks, e.g. "check your inbox") */
  hidden?: boolean;
};

/**
 * The four sign-up corner bricks: they fly in from outside the frame on open and,
 * once the account is created, glide slowly together into a 3×2 cluster in the centre.
 * Below 1100px the page can outgrow (and scroll past) the screen, so the bricks are
 * pinned to the visible viewport instead of the frame.
 */
export function CornerBricks({ open, openKey, assembled, hidden }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLImageElement | null)[]>([]);
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const [flat, setFlat] = useState<{ left: number; top: number; delay: number } | null>(null);

  useLayoutEffect(() => {
    if (!assembled) return;
    let raf = 0;
    function place() {
      const fr = frame.current;
      if (!fr) return;
      // cluster's top-left, centred in the frame
      const ox = fr.clientWidth / 2 - CLUSTER.w / 2;
      const oy = fr.clientHeight / 2 - CLUSTER.h / 2;
      const next = BRICKS.map((b, i) => {
        // offsetLeft/Top give the resting corner position, ignoring any transform already applied
        // (measuring the on-screen box would start from wherever the brick currently is)
        const el = refs.current[i];
        const x = el?.offsetLeft ?? 0, y = el?.offsetTop ?? 0;
        const delay = i * STAGGER_MS;
        if (b.turns) {
          // rotate about the body's centre; the flat body is 2 studs wide, 1 tall
          const cx = x + INSET + UNIT / 2, cy = y + INSET + UNIT;
          const tx = ox + b.slot.x * UNIT + UNIT, ty = oy + b.slot.y * UNIT + UNIT / 2;
          return { transform: `translate(${tx - cx}px,${ty - cy}px) rotate(-90deg)`, delay };
        }
        const dx = ox + b.slot.x * UNIT - (x + INSET);
        const dy = oy + b.slot.y * UNIT - (y + INSET);
        return { transform: `translate(${dx}px,${dy}px)`, delay };
      });
      const g = BRICKS.findIndex((b) => b.turns);
      setPlacements(next);
      setFlat({ left: ox + BRICKS[g].slot.x * UNIT - INSET, top: oy + BRICKS[g].slot.y * UNIT - INSET, delay: next[g].delay });
    }
    // let the bricks paint once at their corners (on phones they only just became visible),
    // so the glide always starts there
    raf = requestAnimationFrame(() => (raf = requestAnimationFrame(place)));
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      // forget the cluster so the next assembly can't start from the old centre
      setPlacements(null);
      setFlat(null);
    };
  }, [assembled]);

  const settled = assembled && placements;

  return (
    <div
      ref={frame}
      className={cn("absolute inset-0 pointer-events-none below-1100:fixed", hidden && "opacity-0 transition-opacity duration-300")}
    >

      {ORDER.map((i) => {
        const b = BRICKS[i];
        const p = settled ? placements[i] : undefined;
        const style: CSSProperties = { width: b.w, height: b.h };
        if (p) {
          style.transform = p.transform;
          style.transitionDelay = `${p.delay}ms`;
          if (b.turns) {
            style.transformOrigin = `${INSET + UNIT / 2}px ${INSET + UNIT}px`;
            // hand over to the flat green brick once it has landed
            style.opacity = 0;
            style.transitionDelay = `${p.delay}ms, ${p.delay + MOVE_MS}ms`;
          }
        }
        return (
          // keyed by the open count so the fly-in replays on every open
          // eslint-disable-next-line @next/next/no-img-element -- decorative static SVG
          <img
            key={`${openKey}-${i}`}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cn(
              "absolute block pointer-events-none opacity-0 will-change-[transform,opacity] below-760:hidden",
              b.pos,
              open && !assembled && [b.fly, "motion-reduce:animate-none! motion-reduce:opacity-100"],
              assembled && "opacity-100 below-760:block",
              p && "transition-[transform,opacity] [transition-duration:1.8s,.35s] [transition-timing-function:cubic-bezier(.3,0,.15,1),ease]",
            )}
            style={style}
            src={b.src}
            width={b.w}
            height={b.h}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        );
      })}
      {settled && flat && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative static SVG
        <img
          key={`${openKey}-flat`}
          className="absolute block pointer-events-none animate-[flFadeIn_.35s_ease_both]"
          style={{ left: flat.left, top: flat.top, width: 73, height: 48, animationDelay: `${flat.delay + MOVE_MS}ms` }}
          src="/assets/24/green-h.svg"
          width={73}
          height={48}
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      )}
    </div>
  );
}
