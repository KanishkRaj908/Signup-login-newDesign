import { cn } from "@/lib/cn";

/** Ring spinner drawn in currentColor. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("block size-4 rounded-full border-2 border-current/25 border-t-current animate-spin", className)}
    />
  );
}
