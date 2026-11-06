import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Face colours per size, lifted from the original brick SVGs. */
const PALETTES = {
  /** hero bricks: face, lower-right inner edge, stud shadow, stud rim */
  lg: {
    yellow: { face: "#ffc702", edge: "#f4aa02", studShadow: "rgba(159,89,5,.42)", rim: "#864202" },
    green: { face: "#00bb86", edge: "rgba(255,255,255,.2)", studShadow: "rgba(0,0,0,.42)", rim: "#00815d" },
    blue: { face: "#0154cd", edge: "rgba(255,255,255,.2)", studShadow: "rgba(0,0,0,.42)", rim: "#003786" },
  },
  /** sign-up corner bricks: one flat colour each; their studs are clear rings lit by shadows */
  sm: {
    yellow: { face: "#fbbf24" },
    green: { face: "#10b981" },
    blue: { face: "#2563eb" },
  },
} as const;

export type BrickColor = keyof (typeof PALETTES)["lg"];
export type BrickSize = keyof typeof PALETTES;

/**
 * Geometry per size: `cell` is one stud's square, `join` the extra width each further stud adds,
 * `stud` the stud diameter. The large cell (64px) is two pegboard circles each way.
 */
const SIZES = {
  lg: { cell: 64, join: 0, stud: 30, radius: 10, ringInset: 1.25 },
  sm: { cell: 24, join: 0.75, stud: 12, radius: 4.5, ringInset: 0.5 },
} as const;

/** Pixel size of a brick with `cols` × `rows` studs. */
export function brickSize(cols: number, rows: number, size: BrickSize = "lg") {
  const { cell, join } = SIZES[size];
  return { width: cols * cell + (cols - 1) * join, height: rows * cell + (rows - 1) * join };
}

/** Layered soft drop shadows + top-left light and bottom-right edge, as in the SVG filters. */
function bodyShadow(size: BrickSize, color: BrickColor) {
  if (size === "sm")
    return [
      ".7px .7px 2.8px rgba(0,0,0,.1)",
      "3.5px 3.5px 4.9px rgba(0,0,0,.09)",
      "7.7px 7.7px 6.7px rgba(0,0,0,.05)",
      "13.7px 13.7px 7.7px rgba(0,0,0,.01)",
      "inset .7px .7px .94px rgba(255,255,255,.55)",
      "inset -.47px -.47px .7px rgba(0,0,0,.16)",
    ].join(",");
  return [
    "3px 3px 2px rgba(0,0,0,.08)",
    "1.9px 1.9px 7.5px rgba(0,0,0,.1)",
    "9.4px 9.4px 13px rgba(0,0,0,.09)",
    "20.6px 20.6px 17.8px rgba(0,0,0,.05)",
    "36.5px 36.5px 20.6px rgba(0,0,0,.01)",
    "inset 1.9px 1.9px 2.5px rgba(255,255,255,.55)",
    `inset -1.25px -1.25px 1.9px ${PALETTES.lg[color].edge}`,
  ].join(",");
}

/**
 * A stud's fill and shadows. The small ones are flat: in their SVG the stud shapes are 1% opaque,
 * so their shadows barely show and only the ring (below) reads.
 */
function studStyle(size: BrickSize, color: BrickColor): CSSProperties {
  if (size === "sm") return { background: "transparent", boxShadow: ".4px .6px .8px rgba(0,0,0,.14)" };
  const c = PALETTES.lg[color];
  return {
    background: c.face,
    boxShadow: [
      `5px 7.5px 8.8px -1.9px ${c.studShadow}`,
      ".6px 1.25px 2.5px rgba(0,0,0,.16)",
      "inset 1.9px 2.5px 3.8px rgba(255,255,255,.55)",
      `inset -.5px -.5px .5px ${c.rim}`,
    ].join(","),
  };
}

/** The stud's top: a thin rim, light at the top-left, fading out towards the bottom-right. */
function ringStyle(size: BrickSize, color: BrickColor): CSSProperties {
  // the face fill inside keeps the border gradient to the rim
  const face = PALETTES[size][color].face;
  if (size === "sm")
    return {
      borderWidth: 0.45,
      background: `linear-gradient(${face},${face}) padding-box, linear-gradient(135deg,rgba(255,255,255,.8),rgba(255,255,255,.1) 47%,rgba(0,0,0,.17)) border-box`,
      filter: "blur(.13px)",
    };
  return {
    borderWidth: 0.6,
    background: `linear-gradient(${face},${face}) padding-box, linear-gradient(135deg,rgba(255,255,255,.75),${face} 47%,transparent) border-box`,
    filter: "blur(.3px)",
  };
}

type Props = ComponentProps<"div"> & {
  color: BrickColor;
  /** studs across */
  cols?: number;
  /** studs down */
  rows?: number;
  /** "lg": the draggable hero bricks; "sm": the sign-up corner bricks */
  size?: BrickSize;
};

/**
 * A plastic brick drawn in HTML/CSS (no image), so it can take pointer, touch and keyboard
 * handlers directly. Extra props (event handlers, aria, style) go to the brick's root.
 */
export function LegoBrick({ color, cols = 1, rows = 1, size = "lg", className, style, ...props }: Props) {
  const g = SIZES[size];
  const { width, height } = brickSize(cols, rows, size);
  const pitch = g.cell + g.join;
  const stud = studStyle(size, color);
  const ring = ringStyle(size, color);

  return (
    <div
      className={cn("relative", className)}
      style={{ width, height, borderRadius: g.radius, background: PALETTES[size][color].face, boxShadow: bodyShadow(size, color), ...style }}
      {...props}
    >
      {Array.from({ length: cols * rows }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            ...stud,
            width: g.stud,
            height: g.stud,
            left: (i % cols) * pitch + (g.cell - g.stud) / 2,
            top: Math.floor(i / cols) * pitch + (g.cell - g.stud) / 2,
          }}
        >
          <span className="absolute rounded-full border-solid border-transparent" style={{ ...ring, inset: g.ringInset }} />
        </span>
      ))}
    </div>
  );
}
