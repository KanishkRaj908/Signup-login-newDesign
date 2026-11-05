"use client";

import { MoonIcon, SunIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store";

export function ThemeToggle() {
  const theme = useUI((s) => s.theme);
  const toggleTheme = useUI((s) => s.toggleTheme);
  // stays above the Loading-state sub-page (z 35); the sign-up screen (z 40) still covers it
  const raised = useUI((s) => s.view === "loading");

  return (
    <button
      className={cn(
        "fixed right-4 bottom-4 size-10 rounded-full border border-border-secondary bg-box text-ink flex items-center justify-center shadow-md [&_svg]:size-[19px]",
        raised ? "z-36" : "z-20",
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={toggleTheme}
    >
      {/* the icon only changes once toggled; the initial icon is the moon regardless of system scheme */}
      {theme === "light" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
