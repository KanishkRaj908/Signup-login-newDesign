import { cn } from "@/lib/cn";

/** Green → yellow → red, one colour per dot. */
const COLORS = [
  "#22c55e", "#22c55e", "#4ade80", "#4ade80", "#4ade80", "#4ade80", "#4ade80",
  "#86efac", "#86efac", "#86efac", "#fde047", "#fde047", "#fde047", "#fde047",
  "#fbbf24", "#fbbf24", "#fbbf24", "#f59e0b", "#f59e0b", "#ef4444", "#ef4444",
  "#dc2626", "#dc2626", "#b91c1c", "#b91c1c",
];

/** Dot-matrix volume meter; at silence the first dot blinks. */
export function Equalizer({ level }: { level: number }) {
  const silent = level < 0.05;
  const lit = silent ? 0 : Math.max(1, Math.round(level * COLORS.length));

  return (
    <div className="flex gap-[3px] items-center pl-1.5 flex-nowrap overflow-hidden">
      {COLORS.map((c, i) => {
        const blink = silent && i === 0;
        const on = blink || i < lit;
        return (
          <div
            key={i}
            className={cn(
              "size-2.5 flex-none rounded-[2px] bg-transparent flex items-start justify-center p-0.5 transition-[background] duration-220 ease-out",
              blink && "animate-[eqblink_1.1s_ease-in-out_infinite]",
            )}
            style={on ? { background: c } : undefined}
          >
            <i className={cn("size-1.5 rounded-full bg-white/50 block opacity-0", on && "opacity-100")} />
          </div>
        );
      })}
    </div>
  );
}
