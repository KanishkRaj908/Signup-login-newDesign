import { cn } from "@/lib/cn";

type Props = {
  /** 0..1 */
  value: number;
  segments?: number;
  className?: string;
};

/**
 * Segmented progress line: faint segments underneath, and one continuous fill on top
 * that fades in from the left and runs across the gaps as it grows.
 */
export function Progress({ value, segments = 3, className }: Props) {
  return (
    <div
      role="progressbar"
      aria-label="Onboarding progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={cn("relative h-0.5", className)}
    >
      <div className="absolute inset-0 flex gap-2">
        {Array.from({ length: segments }, (_, i) => (
          <span key={i} className="flex-1 rounded-full bg-bg-tertiary" />
        ))}
      </div>
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--ink)_6%,transparent),var(--ink))] transition-[width] duration-700 ease-fl"
        style={{ width: `${value * 100}%` }}
      />
    </div>
  );
}
