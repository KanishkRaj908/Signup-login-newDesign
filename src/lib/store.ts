import { create } from "zustand";

export type SubView = "brix" | "loading" | "mascot";
export type Theme = "light" | "dark";
/** which card the sign-up overlay shows */
export type AuthMode = "signup" | "login" | "inbox";

type UIState = {
  /** null until the user toggles; the page then follows the system scheme. */
  theme: Theme | null;
  signupOpen: boolean;
  /** bumps on every open so the sign-up entrance animation replays */
  signupKey: number;
  authMode: AuthMode;
  /** email carried between the auth screens (login → check inbox → back to login) */
  authEmail: string;
  view: SubView | null;
  /** the prompt that launched the intent flow, or null when the flow is closed */
  flowPrompt: string | null;
  flowKey: number;

  toggleTheme: () => void;
  openSignup: (mode?: AuthMode) => void;
  closeSignup: () => void;
  setAuthMode: (mode: AuthMode, email?: string) => void;
  openView: (view: SubView) => void;
  closeView: () => void;
  startFlow: (prompt: string) => void;
  exitFlow: () => void;
};

export function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolvedTheme(theme: Theme | null): Theme {
  return theme ?? (systemPrefersDark() ? "dark" : "light");
}

export const useUI = create<UIState>((set, get) => ({
  theme: null,
  signupOpen: false,
  signupKey: 0,
  authMode: "signup",
  authEmail: "",
  view: null,
  flowPrompt: null,
  flowKey: 0,

  toggleTheme: () => set({ theme: resolvedTheme(get().theme) === "dark" ? "light" : "dark" }),
  openSignup: (mode = "signup") => set((s) => ({ signupOpen: true, signupKey: s.signupKey + 1, authMode: mode })),
  closeSignup: () => set({ signupOpen: false }),
  setAuthMode: (mode, email) => set((s) => ({ authMode: mode, authEmail: email ?? s.authEmail })),
  openView: (view) => set({ view }),
  closeView: () => set({ view: null }),
  startFlow: (prompt) => set((s) => ({ flowPrompt: prompt, flowKey: s.flowKey + 1 })),
  exitFlow: () => set({ flowPrompt: null }),
}));
