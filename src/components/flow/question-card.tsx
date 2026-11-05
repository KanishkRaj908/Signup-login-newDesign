import { useEffect, useLayoutEffect, useRef, useState, type DragEvent } from "react";
import {
  ArrowLeftIcon, ArrowRightIcon, CheckBoldIcon, ChevronLeftIcon, ChevronRightIcon, DiceIcon, NavRightIcon, UploadIcon, XIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { BRAND_SETS, GROUPS, THEMES, type Answer, type Option, type Question } from "./data";
import type { FlowEngine } from "./engine";
import { Swatches, cardMotion, dockCard } from "./parts";

type Q<T extends Question["type"]> = Question & { type: T };
type InputProps<T extends Question["type"]> = { engine: FlowEngine; q: Q<T>; a: Answer };


/* ---- radio / checkbox control ---- */
function Control({ multi, on }: { multi: boolean; on: boolean }) {
  return (
    <span
      className={cn(
        "size-4 border border-fl-bp bg-white relative transition-[background,border-color] duration-150",
        multi ? "rounded-[4px]" : "rounded-full",
        on && "bg-fl-solid border-fl-solid",
        on && !multi && "after:content-[''] after:absolute after:inset-[31.25%] after:rounded-full after:bg-white",
      )}
    >
      {multi && <CheckBoldIcon className={cn("absolute inset-[12.5%] w-3/4 h-3/4 text-white", on ? "opacity-100" : "opacity-0")} />}
    </span>
  );
}

function OptionRow({ opt, multi, selected, onClick }: { opt: Option; multi: boolean; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-start gap-3 py-2 px-3 rounded-[10px] bg-white border-0 text-left transition-[background] duration-[.18s] min-w-0 hover:bg-[#fafafa]",
        selected && "bg-[#fafafa]",
      )}
      onClick={onClick}
    >
      <span className="flex-[0_0_16px] pt-0.5 flex">
        <Control multi={multi} on={selected} />
      </span>
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <b className="text-[14px] leading-5 font-bold text-fl-sec">{opt.l}</b>
        {opt.d && <span className="text-[12px] leading-[18px] text-fl-quat whitespace-nowrap overflow-hidden text-ellipsis">{opt.d}</span>}
      </span>
    </button>
  );
}

/** Register the question's free-text input as the target of the bottom prompt box. */
function useOwnInput(engine: FlowEngine, ref: React.RefObject<HTMLInputElement | null>, onInput: () => void) {
  useLayoutEffect(() => {
    engine.registerOwnInput(ref.current!, onInput);
    // registered once per render of the question, like the original
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ---- single / multi choice with "write your own" ---- */
function ChoiceInput({ engine, q, a }: InputProps<"single" | "multi">) {
  const multi = q.type === "multi";
  const own = useRef<HTMLInputElement>(null);
  const onOwn = () => engine.setOwn(q, own.current!.value);
  useOwnInput(engine, own, onOwn);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2 below-900:grid-cols-1">
        {q.opts.map((o, i) => (
          <OptionRow
            key={i}
            opt={o}
            multi={multi}
            selected={multi ? a.sel!.includes(i) : a.i === i && !a.own}
            onClick={() => {
              if (!multi) own.current!.value = "";
              engine.pickOption(q, i);
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 py-1 px-2">
        <span className="flex-[0_0_16px] pt-0.5 flex cursor-pointer" onClick={() => own.current!.focus()}>
          <Control multi={multi} on={!!a.own} />
        </span>
        <label className={cn("flex-1 min-w-0 border border-fl-bsa rounded-[13px] p-3 transition-[border-color] duration-200 focus-within:border-fl-brand", a.own && "border-fl-brand")}>
          <input
            ref={own}
            type="text"
            placeholder="Write your own"
            aria-label="Write your own"
            defaultValue={a.own || ""}
            className="w-full border-0 outline-none bg-transparent p-0 [font-family:inherit] text-[14px] leading-5 font-medium text-fl-ink placeholder:text-fl-ph"
            onChange={onOwn}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (engine.answered(q)) engine.advance(); } }}
          />
        </label>
      </div>
    </div>
  );
}

/* ---- free text with suggestion chips ---- */
function TextInput({ engine, q, a }: InputProps<"text">) {
  const inp = useRef<HTMLInputElement>(null);
  const [rolled, setRolled] = useState(false);
  const onInput = () => engine.setText(q, inp.current!.value);
  useOwnInput(engine, inp, onInput);
  useEffect(() => {
    engine.later(() => { try { inp.current?.focus({ preventScroll: true }); } catch {} }, 450);
  }, [engine]);
  const bset = engine.S!.bset;

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inp}
        type="text"
        placeholder={q.ph}
        defaultValue={a.v || ""}
        aria-label={q.title}
        className="w-[320px] max-w-full h-11 border border-fl-bs rounded-[10px] py-2.5 px-3.5 bg-white [font-family:inherit] text-[14px] leading-5 font-medium text-fl-ink outline-none transition-[box-shadow] duration-200 placeholder:text-fl-ph focus:shadow-[0_0_0_2px_#fff,0_0_0_4px_#e4e5e7]"
        onChange={onInput}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (engine.answered(q)) engine.advance(); } }}
      />
      <div className="flex gap-2 flex-wrap">
        {BRAND_SETS[bset % BRAND_SETS.length].map((n) => (
          <button
            key={`${bset}-${n}`}
            type="button"
            className={chip}
            onClick={() => { inp.current!.value = n; engine.setText(q, n); inp.current!.focus(); }}
          >
            {n}
          </button>
        ))}
        <button
          key={`${bset}-dice`}
          type="button"
          aria-label="Shuffle suggestions"
          title="Shuffle suggestions"
          className={cn(
            chip,
            "w-[33px] p-0 [&_svg]:size-4 [&_svg]:text-fl-sec [&_svg]:[transition:transform_.4s_var(--ease-fl)]",
            rolled && "[&_svg]:[transform:rotate(180deg)]",
          )}
          onClick={() => { setRolled(true); engine.shuffleBrands(); }}
        >
          <DiceIcon />
        </button>
      </div>
    </div>
  );
}
const chip =
  "h-[33px] py-[7px] px-4 border-0 rounded-[56px] bg-fl-bg2 text-fl-sec text-[12px] leading-[18px] flex items-center justify-center transition-[background] duration-200 animate-[flRise_.35s_ease_both] hover:bg-[#f0f0f0]";

/* ---- theme picker ---- */
function ThemeInput({ engine, q, a }: InputProps<"theme">) {
  const pick = (i: number) => engine.setTheme(q, i);
  return (
    <div className="flex flex-col gap-3 items-end">
      <div className="flex gap-4 w-full below-900:overflow-x-auto">
        {THEMES.map((t, i) => {
          const sel = i === a.i;
          return (
            <button
              key={t.name}
              type="button"
              aria-label={t.name + " theme"}
              className={cn(
                "flex-[1_1_0] min-w-0 h-[190px] p-0 bg-white border border-fl-bsa rounded-2xl overflow-hidden flex flex-col text-left transition-[border-color,box-shadow,transform] duration-200 hover:[transform:translateY(-1px)] below-900:flex-[0_0_200px]",
                sel && "border-2 border-fl-brand",
              )}
              onClick={() => pick(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.img} alt="" className={cn("w-full h-[120px] object-cover object-[top_left] block border-b border-fl-bsa flex-none", sel && "h-[118px]")} />
              <span className="py-3 px-4 flex flex-col gap-2">
                <b className="text-[12px] leading-[18px] font-medium text-fl-ter">{t.name}</b>
                <Swatches colors={t.sw} flush />
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex gap-1">
        <Button variant="flIcon" aria-label="Previous theme" disabled={a.i === 0} onClick={() => a.i! > 0 && pick(a.i! - 1)}>
          <ArrowLeftIcon />
        </Button>
        <Button variant="flIcon" aria-label="Next theme" disabled={a.i === THEMES.length - 1} onClick={() => a.i! < THEMES.length - 1 && pick(a.i! + 1)}>
          <NavRightIcon />
        </Button>
      </div>
    </div>
  );
}

/* ---- reference upload ---- */
function RefInput({ engine, q, a }: InputProps<"ref">) {
  const [draws, setDraws] = useState(0);
  const [over, setOver] = useState(false);
  // every change redraws the drop zone / thumbnails from scratch (fresh entrance animations)
  const redraw = () => setDraws((d) => d + 1);
  const addFiles = (fl: FileList | null) => { redraw(); engine.addRefs(q, fl); };
  useEffect(() => { engine.setFileHandler(addFiles); });
  const dnd = (zone: boolean) => ({
    onDragOver: (e: DragEvent) => { e.preventDefault(); if (zone) setOver(true); },
    onDragLeave: () => zone && setOver(false),
    onDrop: (e: DragEvent) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); },
  });

  return (
    <div className="">
      {!a.imgs!.length ? (
        <div
          key={draws}
          className={cn(
            "border-[1.5px] border-dashed border-[#e5e5e5] rounded-2xl py-[22px] px-4 flex flex-col items-center gap-3 text-center transition-[border-color,background] duration-200",
            over && "border-fl-brand bg-[#fafafa]",
          )}
          {...dnd(true)}
        >
          <p className="m-0 text-[14px] leading-5 text-fl-sec">
            Drag or upload your screenshots
            <br />
            and sketches here.
          </p>
          <button
            type="button"
            className="border-0 bg-[#f5f5f5] text-fl-sec text-[12px] leading-[18px] py-[5px] px-[22px] rounded-full transition-[background] duration-200 hover:bg-[#ebebeb]"
            onClick={() => { redraw(); engine.sampleRefs(q); }} // prototype: simulated upload
          >
            Upload
          </button>
        </div>
      ) : (
        <div key={draws} className="flex gap-4 flex-wrap">
          {a.imgs!.map((src, i) => (
            <div key={i} className="group/th relative size-[126px] rounded-2xl overflow-hidden border border-fl-bsa animate-[flRise_.4s_var(--ease-fl)_both]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Reference ${i + 1}`} className="w-full h-full object-cover object-top block" />
              <button
                type="button"
                aria-label="Remove"
                className="absolute top-1.5 right-1.5 size-[22px] rounded-full border border-fl-bt bg-white flex items-center justify-center p-0 opacity-0 transition-opacity duration-200 text-fl-ter group-hover/th:opacity-100 [&_svg]:size-3"
                onClick={() => { redraw(); engine.removeRef(q, i); }}
              >
                <XIcon />
              </button>
            </div>
          ))}
          <button
            type="button"
            aria-label="Upload more"
            className="size-[126px] rounded-2xl border-[1.5px] border-dashed border-[#e5e5e5] bg-white flex items-center justify-center text-fl-sec hover:border-fl-bp [&_svg]:size-5"
            onClick={() => engine.dom.file?.click()}
            {...dnd(false)}
          >
            <UploadIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionInput({ engine, q, a }: { engine: FlowEngine; q: Question; a: Answer }) {
  switch (q.type) {
    case "single":
    case "multi":
      return <ChoiceInput engine={engine} q={q} a={a} />;
    case "text":
      return <TextInput engine={engine} q={q} a={a} />;
    case "theme":
      return <ThemeInput engine={engine} q={q} a={a} />;
    case "ref":
      return <RefInput engine={engine} q={q} a={a} />;
  }
}

/* ---- the card: question body, pager, Skip all / Next ---- */
export function QuestionCard({ engine }: { engine: FlowEngine }) {
  const slot = engine.slot;
  if (!slot || slot.kind !== "card" || !engine.S) return null;
  const S = engine.S, G = GROUPS[S.g], q = G[S.qi], a = engine.ensureAns(q), last = S.qi === G.length - 1;

  return (
    <div className={cn(dockCard, cardMotion(slot.leaving))}>
      <div ref={(el) => engine.attach("cardTop", el)} className="bg-white rounded-[22px] p-5 overflow-hidden [transition:height_.6s_var(--ease-fl)]">
        <div
          className={cn(
            "flex flex-col gap-6",
            slot.dir === "swap" && "animate-[flSwap_.65s_var(--ease-fl)_both]",
            slot.dir === "swapb" && "animate-[flSwapB_.65s_var(--ease-fl)_both]",
          )}
        >
          <p key={`t${slot.renderId}`} className="m-0 text-[16px] leading-6 font-bold text-fl-ink">{q.title}</p>
          <QuestionInput key={slot.renderId} engine={engine} q={q} a={a} />
        </div>
      </div>
      <div className="flex items-center justify-between py-3 px-5">
        <div className="flex items-center gap-1.5">
          <button type="button" aria-label="Previous question" className={pagerBtn} disabled={S.qi === 0} onClick={() => engine.prev()}>
            <ChevronLeftIcon />
          </button>
          <span className="w-[30px] text-center text-[14px] leading-5 text-fl-sec whitespace-nowrap">{S.qi + 1 + " / " + G.length}</span>
          <button type="button" aria-label="Next question" className={pagerBtn} disabled={S.qi >= S.reach} onClick={() => engine.next()}>
            <ChevronRightIcon />
          </button>
        </div>
        <div className="flex gap-2 items-center">
          {/* "Skip all" only on a group's first question */}
          <Button variant="flGhost" hidden={S.qi !== 0} onClick={engine.skipAll}>Skip all</Button>
          <Button variant="flPrimary" disabled={!engine.answered(q)} onClick={engine.advance}>
            {last ? <span>Submit</span> : <><span>Next</span><ArrowRightIcon /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
const pagerBtn = "size-4 p-0 border-0 bg-transparent text-fl-sec disabled:text-fl-bp disabled:cursor-default [&_svg]:size-4";
