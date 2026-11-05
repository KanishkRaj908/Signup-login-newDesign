import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Inline bold text action inside a sentence ("Already have an account? Log in"). */
export function TextButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "p-0 border-0 bg-transparent [font-family:inherit] text-[14px] leading-5 text-ink font-bold cursor-pointer hover:underline",
        className,
      )}
      {...props}
    />
  );
}

/** A line of muted text that ends in a TextButton. */
export function TextPrompt({ className, ...props }: ComponentProps<"p">) {
  // keeps the browser's bottom margin: the centred sign-up card was matched with it
  return <p className={cn("mt-8 text-[14px] leading-5 text-tertiary text-center", className)} {...props} />;
}
