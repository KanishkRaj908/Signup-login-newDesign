import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  icon: ReactNode;
  label: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
};

/** Selectable tile: icon over a label; the chosen tile gets a solid ink outline. */
export function OptionCard({ icon, label, selected, disabled, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group min-w-0 h-[84px] flex flex-col items-start justify-between p-4 pl-6 text-left rounded-[14px] bg-box border border-border-secondary",
        "transition-[border-color,box-shadow,transform] duration-200 hover:border-placeholder hover:-translate-y-px disabled:cursor-default disabled:hover:translate-y-0",
        "below-760:pl-4",
        // a 1px inset ring on top of the border reads as a 2px outline without shifting the content
        selected && "border-ink hover:border-ink shadow-[inset_0_0_0_1px_var(--ink)]",
      )}
    >
      <span className={cn("size-6 flex-none text-placeholder transition-colors duration-200 [&_svg]:size-6", selected && "text-ink")}>
        {icon}
      </span>
      <span className="text-[15px] leading-5 font-medium text-ink truncate max-w-full">{label}</span>
    </button>
  );
}
