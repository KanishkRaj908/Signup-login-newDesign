import { LogoMark } from "@/components/brand";
import { cn } from "@/lib/cn";

/** The "N" mark pinned top-left on full-screen pages (onboarding, reset password). */
export function PageLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute left-8 top-7 z-3 flex items-center text-ink [&_svg]:h-5 [&_svg]:w-auto [&_svg]:block below-760:left-6",
        className,
      )}
      role="img"
      aria-label="zero"
    >
      <LogoMark />
    </span>
  );
}
