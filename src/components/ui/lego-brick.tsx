import type { ComponentProps, CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** One stud cell is 64px; neighbouring cells overlap by 3px (a 1×2 brick is 64×125). */
const CELL = 64;
const OVERLAP = 3;
const STUD = 30;

/** Colours lifted from the original brick SVGs: face, lower-right inner edge, stud shadow, stud rim. */
export const BRICK_COLORS = {
  yellow: { face: "#ffc702", edge: "#f4aa02", studShadow: "rgba(159,89,5,.42)", rim: "#864202" },
  green: { face: "#00bb86", edge: "rgba(255,255,255,.2)", studShadow: "rgba(0,0,0,.42)", rim: "#00815d" },
  blue: { face: "#0154cd", edge: "rgba(255,255,255,.2)", studShadow: "rgba(0,0,0,.42)", rim: "#003786" },
} as const;

export type BrickColor = keyof typeof BRICK_COLORS;

/** Pixel size of a brick with `cols` × `rows` studs. */
export function brickSize(cols: number, rows: number) {
  return { width: cols * CELL - (cols - 1) * OVERLAP, height: rows * CELL - (rows - 1) * OVERLAP };
}

type Props = ComponentProps<"div"> & {
  color: BrickColor;
  /** studs across */
  cols?: number;
  /** studs down */
  rows?: number;
};

/**
 * A plastic brick drawn in HTML/CSS (no image), so it can take pointer, touch and keyboard
 * handlers directly. Extra props (event handlers, aria, style) go to the brick's root.
 */
export function LegoBrick({ color, cols = 1, rows = 1, className, style, ...props }: Props) {
  const c = BRICK_COLORS[color];
  const { width, height } = brickSize(cols, rows);
  const body: CSSProperties = {
    width,
    height,
    background: c.face,
    // layered soft drop shadows + top-left light and bottom-right edge, as in the SVG filters
    boxShadow: [
      "3px 3px 2px rgba(0,0,0,.08)",
      "1.9px 1.9px 7.5px rgba(0,0,0,.1)",
      "9.4px 9.4px 13px rgba(0,0,0,.09)",
      "20.6px 20.6px 17.8px rgba(0,0,0,.05)",
      "36.5px 36.5px 20.6px rgba(0,0,0,.01)",
      "inset 1.9px 1.9px 2.5px rgba(255,255,255,.55)",
      `inset -1.25px -1.25px 1.9px ${c.edge}`,
    ].join(","),
    ...style,
  };
  const stud: CSSProperties = {
    width: STUD,
    height: STUD,
    background: c.face,
    boxShadow: [
      `5px 7.5px 8.8px -1.9px ${c.studShadow}`,
      ".6px 1.25px 2.5px rgba(0,0,0,.16)",
      "inset 1.9px 2.5px 3.8px rgba(255,255,255,.55)",
      `inset -.5px -.5px .5px ${c.rim}`,
    ].join(","),
  };
  const cellW = width / cols, cellH = height / rows;

  return (
    <div className={cn("relative rounded-[10px]", className)} style={body} {...props}>
      {Array.from({ length: cols * rows }, (_, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            ...stud,
            left: (i % cols) * cellW + (cellW - STUD) / 2,
            top: Math.floor(i / cols) * cellH + (cellH - STUD) / 2,
          }}
        >
          {/* the stud's top: a thin rim, light at the top-left, fading out towards the bottom-right */}
          <span
            className="absolute inset-[1.25px] rounded-full border-[.6px] border-solid border-transparent"
            style={{
              background: `linear-gradient(${c.face},${c.face}) padding-box, linear-gradient(135deg,rgba(255,255,255,.75),${c.face} 47%,transparent) border-box`,
              filter: "blur(.3px)",
            }}
          />
        </span>
      ))}
    </div>
  );
}
