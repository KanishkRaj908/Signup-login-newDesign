import { CheckCircleIcon, CheckIcon, ExpandIcon } from "@/components/icons";
import { Lattice, LoaderLabel } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { LOADER_PATTERNS } from "@/lib/loaders";
import { LBL as LABELS, VW as WIDTHS, type Plan } from "./data";
import type { AiNode, LoaderNode, MsgNode, RecapNode, RefsState, SumRow } from "./engine";

/** Card chrome shared by the question card and the plan card. */
export const dockCard =
  "bg-fl-bg2 border-2 border-fl-bt rounded-3xl shadow-[0_-32px_50px_#fff,0_1px_3px_rgba(0,0,0,.1),0_1px_2px_-1px_rgba(0,0,0,.1)]";
export const cardMotion = (leaving: boolean) =>
  leaving ? "animate-[flCardOut_.6s_var(--ease-fl)_forwards]" : "animate-[flCardIn_.95s_var(--ease-fl)_both]";

export const shead = "m-0 py-2 px-0 text-[12px] leading-none font-medium tracking-[.24px] uppercase text-[#737373]";

/** Overlapping colour dots. */
export function Swatches({ colors, flush, className }: { colors: string[]; flush?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center align-middle", flush ? "ml-0" : "ml-1.5", className)}>
      {colors.map((c, i) => (
        <b key={i} className="size-[18px] rounded-[20.5px] border-2 border-fl-bt -mr-1.5 last:mr-0" style={{ background: c }} />
      ))}
    </span>
  );
}

/* ---- AI loader row (3×3 lattice + shimmering verb) ---- */
export function LoaderRow({ node }: { node: LoaderNode }) {
  const dots = /\.\.\.$/.test(node.text);
  return (
    <div className={cn("flex items-center gap-3", node.out ? "animate-[flFadeOut_.55s_ease_forwards]" : "animate-[flRise_.4s_var(--ease-fl)_both]")}>
      <div
        key={node.latKey}
        className="w-[22px] h-6 flex-[0_0_22px] flex items-center justify-center"
        style={node.latFade ? { animation: "flFadeIn .6s ease both" } : undefined}
      >
        <Lattice pattern={LOADER_PATTERNS[0]} colored className="[--lcell:6px] [--lgap:2px] [--loff:#e5e5e5]" />
      </div>
      <LoaderLabel
        tone="flow"
        verb={node.text.replace(/\.\.\.$/, "")}
        dots={dots}
        className={cn(
          "text-[16px] leading-6 font-medium whitespace-nowrap transition-opacity duration-500 [--ltext:16px]",
          node.hidden && "opacity-0",
        )}
      />
    </div>
  );
}

/* ---- AI message: shimmer (generating) → placeholder (awaiting answer) → default (answered) ---- */
export function Message({ node }: { node: MsgNode }) {
  const base = cn(
    "m-0 max-w-[540px] text-[16px] leading-6 font-medium text-fl-ink transition-[color] duration-800",
    node.ph && "text-fl-ph",
  );
  if (node.mode === "shim") {
    return (
      <p
        className={cn(
          base,
          node.shim &&
            "text-transparent! bg-[linear-gradient(95deg,#111_0%,#111_30%,rgba(17,17,17,.12)_50%,#111_70%,#111_100%)] bg-size-[250%_100%] bg-clip-text animate-[flShim_2.4s_cubic-bezier(.45,0,.55,1)_infinite]",
          node.enter && "animate-[flFadeIn_.7s_ease_both]",
        )}
        style={{ paddingTop: node.padTop }}
      >
        {node.text}
      </p>
    );
  }
  const words = node.text.split(" ");
  return (
    <p className={base}>
      {words.map((w, i) => (
        <span
          key={i}
          className={cn(
            "opacity-0 transition-opacity duration-450",
            i < node.shown && "opacity-100",
            i < node.shown && node.stream && "animate-[flWord_1s_ease_both]",
          )}
        >
          {w + (i < words.length - 1 ? " " : "")}
        </span>
      ))}
    </p>
  );
}

/* ---- recap card of a group's answers ---- */
export function Recap({ node }: { node: RecapNode }) {
  return (
    <div className="w-[360px] max-w-full bg-fl-bg2 border border-fl-bt rounded-3xl py-4 px-5 flex flex-col gap-4 animate-[flRise_.7s_var(--ease-fl)_both]">
      {node.rows.map((r, i) => (
        <div key={i} className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[12px] leading-[18px] text-fl-quat">{r.q}</span>
          {r.imgs ? (
            <div className="flex gap-2">
              {r.imgs.map((s, j) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={j} src={s} alt="" className="w-[102px] h-[75.5px] object-cover object-top rounded-[9.8px] border-[.6px] border-[rgba(0,0,0,.08)]" />
              ))}
            </div>
          ) : (
            <span className={cn("text-[14px] leading-5 font-medium text-fl-ink", r.skip && "text-fl-ph")}>{r.a}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Done({ ok }: { ok: boolean }) {
  return (
    <div className="animate-[flRise_.7s_var(--ease-fl)_both] flex items-center gap-2 text-[14px] leading-5 font-medium text-fl-ink py-2 px-1 [&_svg]:size-4 [&_svg]:text-[#16a34a]">
      <CheckCircleIcon />
      <span>{ok ? "Plan approved — setting up your build." : "Plan skipped for now — you can revisit it anytime."}</span>
    </div>
  );
}

/** The AI side of the thread: segments, loader rows and the final status line. */
export function AiThread({ nodes }: { nodes: AiNode[] }) {
  return (
    <div className="flex flex-col gap-6">
      {nodes.map((n) =>
        n.t === "seg" ? (
          <div key={n.id} className="flex flex-col gap-4 animate-[flRise_.5s_var(--ease-fl)_both]">
            {n.items.map((it) =>
              it.t === "loader" ? <LoaderRow key={it.id} node={it} /> : it.t === "msg" ? <Message key={it.id} node={it} /> : <Recap key={it.id} node={it} />,
            )}
          </div>
        ) : n.t === "loader" ? (
          <LoaderRow key={n.id} node={n} />
        ) : (
          <Done key={n.id} ok={n.ok} />
        ),
      )}
    </div>
  );
}

/* ---- vision summary rows (left shell) ---- */
/* skeleton shimmer fills (white at low / peak alpha), swept by flSkel */
const skelLabel =
  "bg-[linear-gradient(90deg,rgba(255,255,255,.32)_0%,rgba(255,255,255,.32)_38%,rgba(255,255,255,.72)_50%,rgba(255,255,255,.32)_62%,rgba(255,255,255,.32)_100%)] bg-size-[300%_100%]";
const skelValue =
  "bg-[linear-gradient(90deg,rgba(255,255,255,.06)_0%,rgba(255,255,255,.06)_38%,rgba(255,255,255,.16)_50%,rgba(255,255,255,.06)_62%,rgba(255,255,255,.06)_100%)] bg-size-[300%_100%]";
const skelRef =
  "bg-[linear-gradient(90deg,rgba(255,255,255,.05)_0%,rgba(255,255,255,.05)_38%,rgba(255,255,255,.14)_50%,rgba(255,255,255,.05)_62%,rgba(255,255,255,.05)_100%)] bg-size-[300%_100%]";

export function SummaryRow({ row }: { row: SumRow }) {
  return (
    <div
      className="flex items-start gap-1.5 text-[16px] leading-6 text-white animate-[flItemIn_1.1s_var(--ease-fl)_both]"
      style={row.fading ? { transition: "opacity .5s", opacity: 0 } : undefined}
    >
      <span className={cn("flex-[0_0_16px] h-6 flex items-center text-[#a3a3a3] [&_svg]:size-4", row.sk && "opacity-28")}>
        <CheckIcon />
      </span>
      {row.content ? (
        <span
          key={row.shimKey}
          className={cn(
            "flex-1 min-w-0 text-clip bg-[linear-gradient(100deg,#fff_0_30%,rgba(255,255,255,.18)_50%,rgba(255,255,255,.18)_100%)] bg-size-[300%_100%] animate-[flShimOnce_2.8s_cubic-bezier(.45,0,.25,1)_forwards]",
            row.skUpd && "animate-[flUpd_2.2s_ease-in-out_infinite]",
          )}
        >
          {row.content.text}
          {row.content.sw && <Swatches colors={row.content.sw} className="animate-[flSwIn_1.2s_ease_.6s_both]" />}
        </span>
      ) : (
        <span className={cn("flex-1 min-w-0", row.skUpd && "animate-[flUpd_2.2s_ease-in-out_infinite]")}>
          <span
            className={cn(
              "text-clip animate-[flSkel_2.6s_cubic-bezier(.45,0,.55,1)_infinite]",
              row.sk && skelLabel,
            )}
          >
            {LABELS[row.k]}:
          </span>{" "}
          <b
            className={cn(
              "inline-block align-[-1px] h-3 max-w-[60%] rounded-md animate-[flSkel_2.6s_cubic-bezier(.45,0,.55,1)_.15s_infinite]",
              skelValue,
            )}
            style={{ width: WIDTHS[row.k] + "px" }}
          />
        </span>
      )}
    </div>
  );
}

export function RefsBlock({ refs }: { refs: RefsState }) {
  if (!refs) return null;
  const sizes = ["w-[106.7px]", "w-[129.6px]"];
  return (
    <div key={refs.key} className="flex flex-col gap-4 animate-[flItemIn_1s_var(--ease-fl)_both]">
      <p className={shead}>Visual references</p>
      <div className="flex gap-2 flex-wrap">
        {refs.imgs
          ? refs.imgs.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt="Visual reference"
                className={cn("h-[79px] object-cover object-top rounded-[9.8px] border-[.6px] border-[rgba(0,0,0,.08)] bg-white", sizes[i === 1 ? 1 : 0])}
              />
            ))
          : Array.from({ length: refs.sk ?? 0 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "block h-[79px] rounded-[9.8px] animate-[flSkel_2.6s_cubic-bezier(.45,0,.55,1)_infinite]",
                  skelRef,
                  sizes[i],
                )}
                style={i === 1 ? { animationDelay: ".2s" } : undefined}
              />
            ))}
      </div>
    </div>
  );
}

/* ---- plan ---- */
export const phead = "flex items-center justify-between pb-4 border-b border-fl-bt [&>b]:text-[16px] [&>b]:leading-6 [&>b]:font-bold [&>b]:text-fl-ink";
export const pbody =
  "flex flex-col gap-3 text-[14px] leading-5 text-fl-sec [&_p]:m-0 [&_.t]:font-bold [&_ol]:m-0 [&_ol]:pl-[18px] [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-0.5 [&_h4]:mt-1 [&_h4]:mb-0 [&_h4]:mx-0 [&_h4]:text-[14px] [&_h4]:leading-5 [&_h4]:font-bold [&_h4]:text-fl-sec";
export const pfoot = "flex justify-end gap-2 py-3 px-5";

export function PlanSummary({ plan }: { plan: Plan }) {
  return (
    <>
      <p className="t">{plan.title}</p>
      <p>{plan.body}</p>
    </>
  );
}

export function PlanDetails({ plan }: { plan: Plan }) {
  return (
    <>
      <PlanSummary plan={plan} />
      <p>This direction is intentionally specific so the website can have a coherent brand, clear calls to action, and believable content without waiting for detailed input.</p>
      <h4>1. Project plan</h4>
      <p>Turn visitors into one of these actions:</p>
      <ol>
        {plan.goals.map((g, i) => (
          <li key={i}>{g}</li>
        ))}
      </ol>
      <p>The site should feel like a thoughtful, premium studio rather than a generic storefront.</p>
      <h4>2. Pages</h4>
      <ol>
        <li>Home — hero, featured collection, story</li>
        <li>Shop — filterable catalogue and product detail</li>
        <li>{`About ${plan.brand}`}</li>
        <li>Contact &amp; booking</li>
      </ol>
      <h4>3. Look &amp; feel</h4>
      <p>{`A ${plan.theme} theme with generous whitespace, editorial type, and soft motion on scroll.`}</p>
    </>
  );
}

type PlanCardProps = { plan: Plan; leaving: boolean; onOpen: () => void; onFinish: (ok: boolean) => void };

export function PlanCard({ plan, leaving, onOpen, onFinish }: PlanCardProps) {
  return (
    <div className={cn(dockCard, cardMotion(leaving))}>
      <div className="relative bg-white rounded-3xl pt-3 px-5 pb-5 flex flex-col gap-4 max-h-[178px] overflow-hidden after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-16 after:bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#fff_85%)] after:pointer-events-none">
        <div className={phead}>
          <b>Plan</b>
          <Button variant="flIcon" aria-label="Open plan" onClick={onOpen}>
            <ExpandIcon />
          </Button>
        </div>
        <div className={pbody}>
          <PlanSummary plan={plan} />
        </div>
      </div>
      <div className={pfoot}>
        <Button variant="flGhost" onClick={() => onFinish(false)}>Skip</Button>
        <Button variant="flPrimary" onClick={() => onFinish(true)}><span>Approve</span></Button>
      </div>
    </div>
  );
}
