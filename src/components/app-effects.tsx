"use client";

import { useEffect } from "react";
import { useUI } from "@/lib/store";

/** Document-level side effects: theme attribute, scroll lock under overlays, Escape to close. */
export function AppEffects() {
  const theme = useUI((s) => s.theme);
  const locked = useUI((s) => s.signupOpen || s.view !== null || s.flowPrompt !== null);

  useEffect(() => {
    // stays unset until the first toggle, so the page follows the system scheme
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = locked ? "hidden" : "";
    // release the lock when leaving the page with an overlay still open
    return () => {
      document.body.style.overflow = "";
    };
  }, [locked]);

  useEffect(() => {
    // dev-only handle for the visual regression scripts
    if (process.env.NODE_ENV !== "production") (window as unknown as { __zeroUI: typeof useUI }).__zeroUI = useUI;
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const s = useUI.getState();
      if (s.flowPrompt !== null) return; // the flow handles its own Escape (modal first, then exit)
      if (s.signupOpen) s.closeSignup();
      else if (s.view) s.closeView();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
