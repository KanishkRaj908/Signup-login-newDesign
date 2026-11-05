"use client";

import { Wordmark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUI, type SubView } from "@/lib/store";

const NAV: { view: SubView; label: string }[] = [
  { view: "brix", label: "Brix Library" },
  { view: "loading", label: "Loading state" },
  { view: "mascot", label: "Mascot" },
];

type TopbarProps = {
  /** "home" floats over the hero; "sub" is the solid bar pinned above a sub-page. */
  variant: "home" | "sub";
  onHome?: () => void;
};

export function Topbar({ variant, onHome }: TopbarProps) {
  const view = useUI((s) => s.view);
  const openView = useUI((s) => s.openView);
  const openSignup = useUI((s) => s.openSignup);

  return (
    <header
      className={cn(
        "relative max-w-[1280px] mx-auto h-[72px] px-8 flex items-center justify-between gap-4",
        "animate-[dropIn_.7s_var(--ease-enter)_.05s_backwards] motion-reduce:animate-none!",
        variant === "home" && "below-720:px-5",
        variant === "sub" && "flex-none w-full border-b border-border-secondary bg-bg z-[2]",
      )}
      data-content={variant === "home" ? "" : undefined}
    >
      <button
        className="flex items-center bg-transparent border-0 p-0 cursor-pointer"
        type="button"
        aria-label="Home"
        onClick={onHome}
      >
        <Wordmark className="below-720:h-5" />
      </button>
      <nav
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-9 below-900:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => (
          <button
            key={item.view}
            className={cn(
              "bg-transparent border-0 py-1 px-0 text-[15px] font-medium text-secondary cursor-pointer relative transition-[color] duration-200 whitespace-nowrap hover:text-ink",
              view === item.view &&
                "text-ink after:content-[''] after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-[2px] after:bg-ink",
            )}
            onClick={() => openView(item.view)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <Button variant="brand" className="below-720:px-3.5 below-720:py-1.5 below-720:text-[12px]" onClick={() => openSignup()}>
        Start Building
      </Button>
    </header>
  );
}
