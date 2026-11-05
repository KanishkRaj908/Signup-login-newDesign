"use client";

import { useState } from "react";
import { Topbar } from "@/components/topbar";
import { cn } from "@/lib/cn";
import { useUI, type SubView } from "@/lib/store";
import { BrixFrame } from "./brix-frame";
import { LoadingGallery } from "./loading-gallery";

const SOON: Partial<Record<SubView, string>> = { mascot: "Meet our mascot here, very soon." };

/** Full-screen sub-page under the fixed header: Brix Library, Loading states, or Coming soon. */
export function Subpage() {
  const view = useUI((s) => s.view);
  const closeView = useUI((s) => s.closeView);
  // the last view stays rendered while closed, like the original's view-* class
  const [shown, setShown] = useState<SubView>("brix");
  if (view && view !== shown) setShown(view);

  return (
    <div
      className={cn("fixed inset-0 z-35 bg-bg text-ink flex-col", view ? "flex" : "hidden")}
      aria-hidden={!view}
    >
      <Topbar variant="sub" onHome={closeView} />
      <div className="relative flex-auto overflow-hidden">
        <BrixFrame visible={shown === "brix"} />
        <LoadingGallery visible={shown === "loading"} />
        <div
          className={cn(
            "absolute inset-0 flex-col items-center justify-center gap-2.5",
            shown === "mascot" ? "flex" : "hidden",
          )}
        >
          <div className="font-serif text-[30px] leading-[38px] font-medium text-ink">Coming soon</div>
          <div className="text-[15px] text-tertiary">{SOON[shown] ?? "We're building this out."}</div>
        </div>
      </div>
    </div>
  );
}
