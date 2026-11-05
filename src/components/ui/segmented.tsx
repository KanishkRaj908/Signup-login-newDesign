import { cn } from "@/lib/cn";

type SegmentedProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Pill-shaped segmented control (Loading-state gallery). */
export function Segmented<T extends string>({ label, options, value, onChange, className }: SegmentedProps<T>) {
  return (
    <div
      className={cn("inline-flex p-[3px] rounded-full bg-bg-tertiary border border-border-secondary", className)}
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={cn(
            "flex-1 text-center border-0 bg-transparent text-[13px] font-semibold text-tertiary px-4 py-1.5 rounded-full cursor-pointer transition-[background,color] duration-200 whitespace-nowrap",
            o.value === value && "bg-box text-ink shadow-xs",
          )}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
