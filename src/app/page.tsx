import { AppEffects } from "@/components/app-effects";
import { Flow } from "@/components/flow/flow";
import { Hero } from "@/components/hero/hero";
import { Pegboard } from "@/components/pegboard";
import { Signup } from "@/components/signup/signup";
import { Subpage } from "@/components/subpage/subpage";
import { ThemeToggle } from "@/components/theme-toggle";
import { Topbar } from "@/components/topbar";

function Rail({ side }: { side: "l" | "r" }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-y-0 w-px below-940:hidden before:content-[''] before:absolute before:inset-0 before:w-px before:bg-[linear-gradient(to_top,var(--rail)_0%,var(--rail)_30%,transparent_92%)] ${side === "l" ? "left-20" : "right-20"}`}
      data-rail={side}
    />
  );
}

export default function Home() {
  return (
    <>
      <AppEffects />
      <Pegboard />
      <div className="relative max-w-[1440px] mx-auto min-h-full" id="frame">
        <Rail side="l" />
        <Rail side="r" />
        <Topbar variant="home" />
        <Hero />
      </div>
      <Subpage />
      <Signup />
      <Flow />
      <ThemeToggle />
    </>
  );
}
