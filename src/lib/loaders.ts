/** A 3×3 lattice cell: a stagger step (animated), "core" (always lit), "off" (static idle) or null (hole). */
export type LatticeCell = number | "core" | "off" | null;

export type LoaderPattern = {
  verb: string;
  cells: LatticeCell[];
  /** cycle length, in steps */
  loop: number;
  /** step-length multiplier */
  scale: number;
  scan?: boolean;
};

/** N0 brand accents, one per loader in colour mode. */
export const BRAND_ACCENTS = ["var(--blue)", "var(--yellow)", "var(--green)"];

const STEP = 125; // ms per stagger step (slower pacing)

export const LOADER_PATTERNS: LoaderPattern[] = [
  { verb: "Thinking", cells: ["off", 0, "off", 0, "core", 0, "off", 0, "off"], loop: 7, scale: 1 }, // plus
  { verb: "Searching", cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2 }, // spin — ring chase
  { verb: "Working", cells: [0, 1, 2, 0, 1, 2, 0, 1, 2], loop: 3, scale: 2.4 }, // dots — column sweep
  { verb: "Reviewing", cells: [0, 1, 2, 1, 2, 3, 2, 3, 4], loop: 9, scale: 0.9 }, // cascade — diagonal glow
  { verb: "Updating", cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5 }, // ripple — rings outward
];

export function timing(p: LoaderPattern) {
  const step = Math.round(STEP * p.scale);
  return { step, cycle: Math.round(p.loop * step) };
}

/** Copy-paste snippet for a loader (mono colours; tokens kept as CSS variables). */
export function loaderSnippet(p: LoaderPattern) {
  const OFF = "var(--border-secondary)";
  const ON = "var(--ink)";
  const { step, cycle } = timing(p);
  const cells = "[" + p.cells.map((v) => (v === null ? "null" : typeof v === "string" ? `"${v}"` : v)).join(",") + "]";
  return (
    '<div class="lattice"></div>\n\n' +
    "<style>\n" +
    ".lattice{ display:grid; grid-template-columns:repeat(3,6px); gap:2px }\n" +
    ".lattice i{ width:6px; height:6px; border-radius:22%; background:" + OFF + ";\n" +
    "  animation:latt " + cycle + "ms cubic-bezier(.77,0,.175,1) infinite }\n" +
    ".lattice i.on{ background:" + ON + "; animation:none }   /* always-lit centre */\n" +
    ".lattice i.off{ animation:none }                     /* static idle cell */\n" +
    (p.scan
      ? "@keyframes latt{ 0%{ background:" + OFF + " } 7%,22%{ background:" + ON + " } 32%,100%{ background:" + OFF + " } }\n"
      : "@keyframes latt{ 0%,100%{ background:" + OFF + " } 18%,42%{ background:" + ON + " } 62%{ background:" + OFF + " } }\n") +
    "/* colour mode: swap " + ON + " for one accent, e.g. var(--blue) */\n" +
    "</style>\n\n" +
    "<script>\n" +
    "const cells=" + cells + ", d=" + step + ";\n" +
    'const lat=document.querySelector(".lattice");\n' +
    'cells.forEach(v=>{ const i=document.createElement("i");\n' +
    '  if(v==="core") i.classList.add("on");          // always lit\n' +
    '  else if(v==="off") i.classList.add("off");     // static idle\n' +
    '  else if(v===null) i.style.opacity=".5";        // hole\n' +
    '  else i.style.animationDelay=v*d+"ms";\n' +
    "  lat.append(i); });\n" +
    "</script>"
  );
}
