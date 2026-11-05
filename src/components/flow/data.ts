/* Content for the intent clarification flow (prototype: identical for any prompt). */

export type Theme = { name: string; img: string; sw: string[] };

export const THEMES: Theme[] = [
  { name: "Playful", img: "/assets/flow/theme-playful.jpg", sw: ["#fcebd0", "#0c0e0e", "#ebd7f1", "#fce5be", "#77caf0"] },
  { name: "Bold", img: "/assets/flow/theme-bold.jpg", sw: ["#0f1110", "#0c0e0e", "#ce4a0c", "#cac6c2", "#e3dfda"] },
  { name: "Warm", img: "/assets/flow/theme-warm.jpg", sw: ["#eee3d5", "#0c0e0e", "#e1d2c2", "#dbdbdb", "#ece7de"] },
];

export const SAMPLE_REFS = ["/assets/flow/ref-1.jpg", "/assets/flow/ref-2.jpg"];

export const BRAND_SETS = [
  ["EliteShopper", "LuxuryGoodsHub", "PrestigeMarket"],
  ["UrbanNest", "CraftLane", "NorthBloom"],
  ["Maison Maha", "BrightCart", "Studio Kiran"],
];

export type Option = { l: string; d?: string; g?: string };
export type Question =
  | { id: string; type: "single" | "multi"; title: string; short?: string; own: true; opts: Option[] }
  | { id: string; type: "text"; title: string; short?: string; ph: string }
  | { id: string; type: "theme"; title: string; short?: string }
  | { id: string; type: "ref"; title: string; short?: string };

export const GROUPS: Question[][] = [
  [
    {
      id: "kind", type: "single", title: "What kind of website do you want to build?", own: true,
      opts: [
        { l: "Business website", d: "I need a website to introduce my company." },
        { l: "Showcase portfolio", d: "I want to display my work online and gain visibility." },
        { l: "E-commerce", d: "I want to sell my products online (like shoes, clothing, etc.)" },
        { l: "Content/Article Website", d: "I want to share my writings online." },
      ],
    },
    { id: "brand", type: "text", title: "What's your brand called?", ph: "N-Zero", short: "What's your brand called?" },
  ],
  [
    {
      id: "biz", type: "single", title: "Tell us about your business", short: "Tell us about your business?", own: true,
      opts: [{ l: "Retail / Store" }, { l: "Local service" }, { l: "Restaurant / Cafe" }, { l: "Professional services" }],
    },
    {
      id: "goals", type: "multi", title: "What do you want visitors to do?", own: true,
      opts: [
        { l: "Contact / Enquire", g: "Contacts" },
        { l: "Buy something", g: "Online sales" },
        { l: "Call / WhatsApp", g: "Calls & WhatsApp" },
        { l: "Book an appointment", g: "Getting appointments" },
      ],
    },
    { id: "theme", type: "theme", title: "What theme are you envisioning for your brand?", short: "Theme?" },
    { id: "ref", type: "ref", title: "Lastly, do you have any reference?", short: "Visual reference?" },
  ],
];

/** progress-bar width (px of 247) reached after each step */
export const BAR: Record<string, number> = { start: 12, kind: 29, brand: 70, biz: 108, goals: 168, theme: 202, ref: 217 };

/** vision-summary labels and skeleton value widths */
export const LBL: Record<string, string> = { product: "Product", kind: "Category", brand: "Brand", biz: "About Business", goals: "Goals", theme: "Theme" };
export const VW: Record<string, number> = { product: 64, kind: 150, brand: 118, biz: 104, goals: 168, theme: 62 };

export type Answer = { i?: number | null; own?: string; v?: string; sel?: number[]; imgs?: string[]; skipped?: boolean };

export function titleCase(s: string) {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

export function joinNice(a: string[]) {
  return a.length < 2 ? a[0] || "" : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
}

/** label/summary text for an answer */
export function answerText(q: Question, a: Answer | undefined): string | null | undefined {
  if (!a || a.skipped) return null;
  if (q.type === "single") return a.own ? a.own : q.opts[a.i!].l;
  if (q.type === "text") return a.v;
  if (q.type === "multi") {
    const L = a.sel!.map((i) => q.opts[i].l);
    if (a.own) L.push(a.own);
    return L.join(", ");
  }
  if (q.type === "theme") return THEMES[a.i!].name;
  if (q.type === "ref") return a.imgs!.length ? a.imgs!.length + " image" + (a.imgs!.length > 1 ? "s" : "") : null;
}

export function isAnswered(q: Question, a: Answer | undefined) {
  if (!a) return false;
  if (q.type === "single") return a.i != null || !!a.own;
  if (q.type === "text") return !!(a.v && a.v.trim());
  if (q.type === "multi") return a.sel!.length > 0 || !!a.own;
  return true; // theme (preselected) / ref (optional)
}

export function freshAnswer(q: Question): Answer {
  if (q.type === "single") return { i: 0, own: "" }; // first option pre-highlighted as the AI's best guess
  if (q.type === "text") return { v: "" };
  if (q.type === "multi") return { sel: [], own: "" };
  if (q.type === "theme") return { i: 0 };
  return { imgs: [] };
}

export function signature(a: Answer | undefined) {
  return a ? JSON.stringify([a.i, a.own, a.v, a.sel, a.imgs]) : "";
}

export type Plan = { title: string; body: string; goals: string[]; brand: string; theme: string };

export function planCopy(ans: Record<string, Answer>): Plan {
  const brand = ans.brand && !ans.brand.skipped && ans.brand.v ? ans.brand.v.trim() : "your brand";
  const biz = answerText(GROUPS[1][0], ans.biz) || "Business";
  const th = ans.theme && !ans.theme.skipped ? THEMES[ans.theme.i!].name.toLowerCase() : "clean";
  const goalsQ = GROUPS[1][1] as Extract<Question, { opts: Option[] }>;
  const goals =
    ans.goals && !ans.goals.skipped
      ? ans.goals.sel!.map((i) => goalsQ.opts[i].g!).concat(ans.goals.own ? [ans.goals.own] : [])
      : [];
  return {
    title: "Premium " + (biz === "Retail / Store" ? "eCommerce" : titleCase(biz.split("/")[0].trim())) + " Website",
    body:
      "Build a premium " + (biz === "Retail / Store" ? "eCommerce" : biz.toLowerCase()) + " website for " + brand +
      ", selling premium lifestyle & consumer products to modern, design-conscious customers. Use a minimal editorial aesthetic with a " +
      th + " palette, premium typography, strong hierarchy, generous whitespace, and polished interactions.",
    goals: goals.length ? goals : ["Contacts", "Getting appointments"],
    brand,
    theme: th,
  };
}
