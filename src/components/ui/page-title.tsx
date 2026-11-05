import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Serif 30px screen heading used across sign-up, login and onboarding. */
export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn("font-serif font-medium text-[30px] leading-[38px] tracking-normal text-center m-0", className)}
      {...props}
    />
  );
}
