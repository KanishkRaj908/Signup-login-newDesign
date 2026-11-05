import { cn } from "@/lib/cn";

/** Brick colours (match the 24px bricks). */
const Y = "#FBBF24";
const G = "#10B981";
const B = "#2563EB";

/** A cell is a colour, "off" (faint idle stud) or null (empty). */
type Cell = string | "off" | null;

export const TEAM_GLYPHS: Record<string, Cell[]> = {
  solo: ["off", "off", "off", "off", Y, "off", "off", "off", "off"],
  small: [null, null, null, G, Y, B, null, null, null],
  medium: [null, G, null, G, Y, B, null, B, null],
  large: [G, B, G, B, Y, B, G, B, G],
};

/** 3×3 stud grid that fills up with team size. */
export function TeamGlyph({ cells, className }: { cells: Cell[]; className?: string }) {
  return (
    <span className={cn("grid grid-cols-[repeat(3,7px)] gap-px", className)} aria-hidden="true">
      {cells.map((c, i) => (
        <i
          key={i}
          className={cn("block size-[7px] rounded-[2px]", c === "off" && "bg-bg-tertiary")}
          style={c && c !== "off" ? { background: c } : undefined}
        />
      ))}
    </span>
  );
}
