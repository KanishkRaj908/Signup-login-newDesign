/** Placeholder attachment thumbnails (inline SVG data URIs) cycled by the composer's "+" button. */

const svg = (s: string) => "data:image/svg+xml;utf8," + encodeURIComponent(s);

function portrait(bg: string, skin: string, hair: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="${bg}"/><path d="M60 34a20 20 0 0 1 20 20c0 14-9 22-9 22h-22s-9-8-9-22a20 20 0 0 1 20-20z" fill="${hair}"/><ellipse cx="60" cy="58" rx="15" ry="18" fill="${skin}"/><path d="M30 120c2-22 15-34 30-34s28 12 30 34z" fill="${hair}" opacity=".9"/></svg>`,
  );
}

function docThumb(color: string, label: string) {
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#fafafa"/><path d="M46 30h20l16 16v44a4 4 0 0 1-4 4H46a4 4 0 0 1-4-4V34a4 4 0 0 1 4-4z" fill="${color}"/><path d="M66 30v16h16z" fill="#fff" opacity=".4"/><text x="62" y="76" font-family="sans-serif" font-size="15" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`,
  );
}

export const THUMBS = [
  svg('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#eef4fb"/><rect width="120" height="70" fill="#a9c9ea"/><rect y="54" width="120" height="16" fill="#84add9"/><rect x="12" y="18" width="70" height="9" rx="2" fill="#1f2937"/><rect x="12" y="34" width="46" height="6" rx="2" fill="#40506a"/><rect x="12" y="80" width="80" height="8" rx="2" fill="#1f2937"/><rect x="12" y="95" width="58" height="6" rx="2" fill="#9aa2af"/></svg>'),
  svg('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="#1a1a1a"/><circle cx="40" cy="38" r="19" fill="#ededed"/><circle cx="80" cy="52" r="21" fill="#ee7a24"/><circle cx="48" cy="84" r="17" fill="#2b2b2b" stroke="#555"/><text x="80" y="57" font-family="sans-serif" font-size="12" fill="#111" text-anchor="middle" font-style="italic">dtai</text></svg>'),
  svg('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#241a63"/><stop offset="1" stop-color="#120c34"/></linearGradient></defs><rect width="120" height="120" fill="url(#w)"/><path d="M-4 86c26-20 52 6 78-8s34-16 50-4" stroke="#5b56b8" stroke-width="3" fill="none" opacity=".8"/><path d="M-4 98c26-20 52 6 78-8s34-16 50-4" stroke="#3f3a8f" stroke-width="3" fill="none" opacity=".7"/></svg>'),
  portrait("#d6cfb7", "#8a6b52", "#2c2118"),
  docThumb("#e0483c", "PDF"),
  portrait("#e5b53a", "#caa07a", "#3a2a1c"),
  portrait("#d94c4c", "#c98f74", "#241612"),
  portrait("#d3d6e9", "#a97a5c", "#171310"),
  docThumb("#5b57e6", "CSS"),
  portrait("#f2a7c4", "#c99277", "#2a1c18"),
];
