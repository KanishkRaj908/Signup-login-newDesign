import { cn } from "@/lib/cn";

const DOTS = 12;

/** Ring of dots that grow and darken towards the head, turning one dot per step. */
export function DotSpinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("relative block size-8 text-ink animate-[spin_1s_steps(12)_infinite] motion-reduce:animate-none", className)}
    >
      {Array.from({ length: DOTS }, (_, i) => {
        const t = (i + 1) / DOTS;
        return (
          <i
            key={i}
            className="absolute inset-0 m-auto block"
            // each dot is 16% of the ring; -230% of its own size puts it ~37% out from the centre
            style={{ transform: `rotate(${i * (360 / DOTS)}deg) translateY(-230%)`, width: "16%", height: "16%" }}
          >
            <b
              className="block size-full rounded-full bg-current"
              style={{ opacity: 0.15 + 0.85 * t, transform: `scale(${0.55 + 0.45 * t})` }}
            />
          </i>
        );
      })}
    </span>
  );
}
