import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

/** Full "N zero" wordmark; inverted in dark mode. */
export function Wordmark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG; next/image would change the markup
    <img
      className={cn("h-7 w-auto block dark:[filter:invert(1)_hue-rotate(180deg)]", className)}
      src="/assets/NzeroLogo.svg"
      alt="zero"
      width={122}
      height={28}
    />
  );
}

/** The "N" mark on its own, drawn in currentColor. */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="6.8 6.4 14.2 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M16.9454 21.875H20.5524L16.9454 16.1955L10.9127 6.94232H7.30566V21.875H10.9127V12.6644L16.9454 21.875Z"
        fill="currentColor"
      />
      <ellipse cx="18.6323" cy="8.86237" rx="1.93359" ry="1.92005" fill="#EAB308" />
    </svg>
  );
}
