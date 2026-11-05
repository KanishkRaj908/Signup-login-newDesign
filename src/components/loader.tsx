import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { BRAND_ACCENTS, LOADER_PATTERNS, timing, type LoaderPattern } from "@/lib/loaders";

type LatticeProps = {
  pattern: LoaderPattern;
  /** accent for colour mode (defaults to the pattern's brand colour) */
  accent?: string;
  /** lit cells use the accent instead of ink */
  colored?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * 3×3 flat-cube loader. Cell size/gap/idle colour come from inherited
 * --lcell / --lgap / --loff, so the parent decides the scale.
 */
export function Lattice({ pattern, accent, colored, className, style }: LatticeProps) {
  const { step, cycle } = timing(pattern);
  const index = LOADER_PATTERNS.indexOf(pattern);
  const vars = {
    "--cyc": `${cycle}ms`,
    "--lc": accent ?? BRAND_ACCENTS[Math.max(index, 0) % BRAND_ACCENTS.length],
    ...style,
  } as CSSProperties;

  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(3,var(--lcell))] gap-(--lgap) justify-center flex-none",
        colored ? "[--lon:var(--lc,var(--blue))]" : "[--lon:var(--ink)]",
        className,
      )}
      style={vars}
    >
      {pattern.cells.map((v, i) => (
        <i
          key={i}
          className={cn(
            "block size-(--lcell) bg-(--loff) rounded-[22%]",
            v === null && "opacity-50",
            v === "core" && "bg-(--lon)",
            typeof v === "number" &&
              (pattern.scan
                ? "animate-[lattScan_var(--cyc,700ms)_cubic-bezier(.77,0,.175,1)_infinite]"
                : "animate-[lattOn_var(--cyc,700ms)_cubic-bezier(.77,0,.175,1)_infinite]"),
          )}
          style={typeof v === "number" ? { animationDelay: `${v * step}ms` } : undefined}
        />
      ))}
    </div>
  );
}

type LoaderLabelProps = {
  verb: string;
  dots?: boolean;
  /** "gallery" follows the page theme; "flow" uses the flow's fixed palette */
  tone?: "gallery" | "flow";
  className?: string;
};

/**
 * Shimmering verb with animated ellipsis. Reduced motion mirrors the original cascade:
 * the shimmer stops and the text turns solid ink, but in the flow the gradient stays
 * painted behind the text (its rule outranks the reset of background-image).
 */
export function LoaderLabel({ verb, dots = true, tone = "gallery", className }: LoaderLabelProps) {
  const flow = tone === "flow";
  return (
    <span className={cn("flex items-baseline gap-px", className)}>
      <span
        className={cn(
          "text-(length:--ltext) tracking-[-.01em] leading-[1.4] pb-px text-clip bg-size-[220%_100%]",
          // the original reset is `background:none`, which also returns background-size to auto
          "motion-reduce:animate-none motion-reduce:text-ink motion-reduce:bg-clip-border motion-reduce:bg-auto",
          flow
            ? "font-medium bg-[linear-gradient(100deg,#a3a3a3_36%,#171717_50%,#a3a3a3_64%)] animate-[tshimmer_3s_linear_infinite]"
            : "font-semibold bg-[linear-gradient(100deg,var(--placeholder)_36%,var(--ink)_50%,var(--placeholder)_64%)] animate-[tshimmer_2.6s_linear_infinite] motion-reduce:bg-none",
        )}
      >
        {verb}
      </span>
      {dots && (
        <span className="inline-flex text-(length:--ltext) font-semibold">
          {[0, 0.25, 0.5].map((delay) => (
            <i
              key={delay}
              className={cn(
                "not-italic opacity-0 animate-[edot_1.8s_infinite] motion-reduce:animate-none motion-reduce:opacity-85",
                flow ? "text-[#171717]" : "text-ink",
              )}
              style={delay ? { animationDelay: `${delay}s` } : undefined}
            >
              .
            </i>
          ))}
        </span>
      )}
    </span>
  );
}
