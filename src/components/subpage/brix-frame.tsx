"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { resolvedTheme, useUI } from "@/lib/store";

/** The N0 design library, lazy-loaded on first visit and kept in the page theme via postMessage. */
export function BrixFrame({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const theme = useUI((s) => s.theme);
  const [loaded, setLoaded] = useState(false);
  if (visible && !loaded) setLoaded(true);

  function sync() {
    try {
      ref.current?.contentWindow?.postMessage({ n0theme: resolvedTheme(useUI.getState().theme) }, "*");
    } catch {}
  }

  // match the theme whenever it changes, and when the library is shown again
  useEffect(() => {
    if (loaded) sync();
  }, [theme, visible, loaded]);

  return (
    <iframe
      ref={ref}
      className={cn("w-full h-full border-0 bg-bg", visible ? "block" : "hidden")}
      title="N0 Design Library"
      loading="lazy"
      src={loaded ? "/brix-library.html" : undefined}
      onLoad={sync}
    />
  );
}
