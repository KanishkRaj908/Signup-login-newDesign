import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/*
 * Every button in the design. Classes override the browser's button defaults one by one
 * (the project runs without Tailwind preflight), so each variant states border/background/padding.
 */
export const buttonVariants = cva("", {
  variants: {
    variant: {
      /* solid brand pill: "Start Building" */
      brand:
        "border-2 border-brand-border text-brand-fg bg-brand-solid px-5 py-2.5 rounded-full text-[14px] font-medium shadow-7xl transition-[transform] duration-250 hover:-translate-y-px",
      /* full-width 44px brand pill: form submits */
      block:
        "h-11 w-full border-2 border-brand-border rounded-full bg-brand-solid text-brand-fg [font-family:inherit] text-[14px] font-medium leading-5 shadow-7xl flex items-center justify-center gap-1 transition-[transform,opacity] duration-220 hover:-translate-y-px disabled:cursor-default disabled:hover:translate-y-0",
      /* full-width 44px quiet pill: secondary actions next to a block button */
      blockSoft:
        "h-11 w-full border-0 rounded-full bg-bg-tertiary text-ink [font-family:inherit] text-[14px] font-medium leading-5 flex items-center justify-center gap-2 transition-[background] duration-200 hover:bg-border-secondary [&_svg]:size-4",
      /* 40px round brand button: send / confirm recording */
      brandIcon:
        "size-10 flex-none rounded-full border-2 border-brand-border bg-brand-solid text-brand-fg flex items-center justify-center",
      /* 40px square ghost icon button in the composer */
      tool:
        "size-10 flex-none rounded-lg border-0 bg-transparent text-tertiary flex items-center justify-center transition-[background,color] duration-200 hover:bg-bg-tertiary hover:text-ink [&_svg]:size-4 [&_svg]:block",
      /* intent flow: dark primary pill */
      flPrimary:
        "relative flex items-center gap-1 px-4 py-2 rounded-full border-2 border-white/12 bg-fl-solid text-white text-[14px] leading-5 font-medium shadow-[0_1px_2px_rgba(0,0,0,.05),inset_0_0_0_1px_rgba(0,0,0,.18),inset_0_-2px_0_rgba(0,0,0,.05)] transition-[transform,opacity,background] duration-200 [transition-duration:.2s,.3s,.2s] hover:-translate-y-px disabled:opacity-35 disabled:cursor-default disabled:translate-y-0 [&_span]:px-0.5 [&_svg]:size-4",
      /* intent flow: text-only ghost pill */
      flGhost:
        "border-0 bg-transparent px-4 py-2 rounded-full text-[14px] leading-5 font-medium text-fl-ter transition-[transform,opacity,background] [transition-duration:.2s,.3s,.2s] hover:bg-[#f0f0f0]",
      /* intent flow: 32px round icon button */
      flIcon:
        "size-8 p-2 border-0 bg-transparent rounded-full text-fl-sec flex items-center justify-center transition-[background,opacity] duration-200 hover:bg-fl-bt disabled:opacity-50 disabled:cursor-default disabled:bg-transparent [&_svg]:size-4",
    },
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}
