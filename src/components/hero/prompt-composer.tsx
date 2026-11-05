"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Attachments, type Attachment } from "@/components/hero/attachments";
import { Equalizer } from "@/components/hero/equalizer";
import { ModeSelect, type Mode } from "@/components/hero/mode-select";
import { useVoice } from "@/components/hero/use-voice";
import { CloseSmallIcon, ConfirmIcon, MicFilledIcon, MicIcon, PlusIcon, SendIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { THUMBS } from "@/lib/attachments";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store";

/** When the text ends with a trigger phrase, suggest its continuation (accepted with Tab). */
const CHAIN: [string, string][] = [
  ["build me a website", " for a coffee shop"],
  ["for a coffee shop", " with a dark, premium theme"],
  ["with a dark, premium theme", " and an online store"],
  ["and an online store", " with smooth scroll animations"],
];
/** Quick-start prompts under the box on phones; "More" reveals the rest. */
const CHIPS = ["SaaS", "Healthcare", "Portfolio"];
const MORE_CHIPS = ["E-commerce", "Restaurant", "Blog", "Agency"];
const MAX_UPLOAD = 10;
const MAX_HEIGHT = 132;

function suggestionFor(value: string) {
  const v = value.replace(/\s+$/, "").toLowerCase();
  if (!v) return "";
  return CHAIN.find(([trigger]) => v.endsWith(trigger))?.[1] ?? "";
}

/** The hero prompt box: auto-growing textarea, ghost suggestions, attachments, voice input, send. */
export function PromptComposer() {
  const startFlow = useUI((s) => s.startFlow);
  const input = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");
  const [active, setActive] = useState(false);
  const [multiline, setMultiline] = useState(false);
  /** text taller than the box: it scrolls instead of being clipped */
  const [overflowing, setOverflowing] = useState(false);
  const ghost = useRef<HTMLDivElement>(null);
  /** recomputed only where the original re-renders (input, Tab, launch, recording start) */
  const [suggestion, setSuggestion] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [plusOpacity, setPlusOpacity] = useState<number>();
  const [mode, setMode] = useState<Mode>("Build");
  const [moreChips, setMoreChips] = useState(false);
  const nextId = useRef(0);
  const grown = useRef(false);

  const voice = useVoice(value, (v) => update(v));
  const recording = voice.recording;

  function update(v: string, isRecording = recording) {
    grown.current = true;
    setValue(v);
    if (v.length > 0) setActive(true);
    setSuggestion(isRecording ? "" : suggestionFor(v)); // no ghost text while talking
  }

  // auto-grow up to 132px, then scroll; 2+ lines move the controls to a bottom row
  useLayoutEffect(() => {
    const el = input.current;
    if (!el || !grown.current) return;
    const top = el.scrollTop;
    el.style.height = "auto";
    const sh = el.scrollHeight;
    el.style.height = Math.min(sh, MAX_HEIGHT) + "px";
    el.scrollTop = top; // measuring at "auto" height resets the scroll position
    setMultiline(sh > 48);
    setOverflowing(sh > MAX_HEIGHT);
    syncGhost();
  }, [value, suggestion, recording]);

  /** keep the ghost-suggestion layer scrolled in step with the text */
  function syncGhost() {
    if (ghost.current && input.current) ghost.current.scrollTop = input.current.scrollTop;
  }

  function launch() {
    const v = value.trim();
    if (!v) return;
    startFlow(v);
    update("");
    input.current?.blur();
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    const s = recording ? "" : suggestionFor(value);
    if (e.key === "Tab" && s) {
      e.preventDefault();
      update(value + s);
    }
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      launch();
    }
  }

  function addFile() {
    if (files.length >= MAX_UPLOAD) return;
    const next = [...files, { id: ++nextId.current, url: THUMBS[files.length % THUMBS.length] }];
    setFiles(next);
    setPlusOpacity(next.length >= MAX_UPLOAD ? 0.4 : 1);
    input.current?.focus();
    setActive(true);
  }

  function startRecording() {
    if (recording) return;
    voice.start();
    update(value, true); // clear the ghost suggestion right away
  }

  const hasFiles = files.length > 0;

  return (
    <div className="relative isolate w-[min(680px,100%)]" data-content="">
      {/* soft colour glow rising behind the box while it's active */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute -z-1 -inset-x-4 -top-16 h-32 pointer-events-none blur-2xl opacity-0 scale-95 transition-[opacity,transform] duration-700 ease-out-soft",
          "bg-[radial-gradient(38%_75%_at_20%_65%,rgba(238,196,244,.95),transparent_75%),radial-gradient(36%_85%_at_50%_75%,rgba(190,180,246,1),transparent_75%),radial-gradient(38%_75%_at_80%_65%,rgba(176,206,250,1),transparent_75%)]",
          active && "opacity-100 scale-100 dark:opacity-35",
        )}
      />
      <div
        className={cn(
          "relative rounded-3xl bg-box-rest border border-border-secondary shadow-none",
          "transition-[box-shadow,border-color,background] [transition-duration:.35s,.35s,.3s]",
          "animate-[riseIn_.8s_var(--ease-enter)_.56s_backwards] motion-reduce:animate-none!",
          // animated conic gradient ring while active
          "before:content-[''] before:absolute before:-inset-px before:rounded-[inherit] before:p-[1.5px] before:pointer-events-none",
          "before:bg-[conic-gradient(from_var(--angle),#72edf2,#7cb8f3,#9a93e4,#7cb8f3,#72edf2)] before:mask-ring before:opacity-0 before:transition-opacity before:duration-400",
          active &&
            "bg-box border-box-line shadow-lg before:opacity-100 before:animate-[spin-angle_4.5s_linear_infinite] motion-reduce:before:animate-none",
        )}
      >
        <div
          className={cn(
            "absolute -top-3.5 right-4 size-7 rounded-full bg-ink text-white not-light:bg-[#f3f4f6] not-light:text-[#111] hidden items-center justify-center shadow-md z-7 [&_svg]:size-[15px]",
            recording && "flex",
          )}
          aria-hidden="true"
        >
          <MicFilledIcon />
        </div>

        <Attachments
          files={files}
          onRemove={(id) => {
            setFiles(files.filter((f) => f.id !== id));
            setPlusOpacity(1);
          }}
        />

        <div className="p-3 flex flex-col gap-1">
          <div
            className={cn(
              "relative h-0 overflow-visible transition-[height] duration-420 ease-out-soft",
              hasFiles && "h-10",
            )}
          />
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1.5">
            <Button
              variant="tool"
              className={cn("order-1", recording && "hidden")}
              aria-label="Attach file"
              title="Attach"
              style={plusOpacity === undefined ? undefined : { opacity: plusOpacity }}
              onClick={addFile}
            >
              <PlusIcon />
            </Button>
            <ModeSelect value={mode} onChange={setMode} className={cn("order-1 hidden below-720:block", recording && "below-720:hidden")} />

            <div className={cn("relative flex-[1_1_auto] min-w-0 order-2 below-720:order-0 below-720:basis-full", multiline && "order-0 flex-[1_1_100%]")}>
              <div
                ref={ghost}
                className="absolute inset-0 px-1.5 py-2 text-[16px] leading-6 whitespace-pre-wrap [word-break:break-word] overflow-hidden pointer-events-none font-medium text-left"
                aria-hidden="true"
              >
                <span className="text-transparent">{value}</span>
                <span className="text-placeholder">{suggestion}</span>
              </div>
              <textarea
                ref={input}
                id="pinput"
                className={cn(
                  "relative block w-full border-0 outline-none bg-transparent [font-family:inherit] text-[16px] leading-6 text-ink font-medium px-1.5 py-2 m-0 resize-none overflow-hidden h-10 below-720:min-h-16 max-h-[132px] text-left transition-[height] duration-200 placeholder:text-ph-rest placeholder:font-medium",
                  // a hidden scrollbar keeps the wrap width identical to the ghost layer's
                  overflowing && "overflow-y-auto overscroll-contain scrollbar-none",
                )}
                onScroll={syncGhost}
                rows={1}
                autoComplete="off"
                spellCheck={false}
                placeholder="Describe what you want to build…"
                aria-label="Describe what you want to build"
                value={value}
                onChange={(e) => update(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={() => setActive(true)}
                onBlur={() => {
                  if (!value && !hasFiles && !recording) setActive(false);
                }}
              />
            </div>

            <div className={cn("flex items-center gap-2 order-3 below-720:ml-auto", multiline && "ml-auto", recording && "hidden")}>
              <Button
                variant="tool"
                className="transition-[transform] duration-450 ease-out-soft"
                aria-label="Voice input"
                title="Voice"
                onClick={startRecording}
              >
                <MicIcon />
              </Button>
              <Button
                variant="brandIcon"
                className={cn(
                  "overflow-hidden opacity-0 [transform:translateX(30px)_scale(.55)] -ml-12 pointer-events-none [&_svg]:size-5",
                  "transition-[opacity,transform,margin] duration-420 [transition-timing-function:ease,var(--ease-out-soft),var(--ease-out-soft)]",
                  value.length > 0 && "opacity-100 [transform:none] ml-0 pointer-events-auto",
                )}
                aria-label="Send"
                onClick={launch}
              >
                <SendIcon />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center overflow-hidden">
            <div
              className={cn(
                "flex items-center justify-center gap-[3px] text-[12px] text-placeholder max-h-0 opacity-0 select-none transition-[max-height,opacity] duration-250",
                suggestion && "max-h-5 opacity-100 pt-1",
                recording && "hidden",
              )}
            >
              <span>Press</span>
              <kbd className="[font-family:inherit] text-[12px] font-medium bg-bg-tertiary text-placeholder rounded-[4px] px-1 py-0.5 leading-none">
                tab
              </kbd>
              <span>to evolve your idea</span>
            </div>
            <div className={cn("hidden items-center justify-between w-full gap-3", recording && "flex")}>
              <Equalizer level={voice.level} />
              <div className="flex items-center gap-2 flex-none">
                <button
                  className="size-10 rounded-lg border-0 bg-transparent text-tertiary flex items-center justify-center transition-[background,color] duration-200 hover:bg-bg-tertiary hover:text-ink [&_svg]:size-[18px]"
                  aria-label="Cancel recording"
                  onClick={voice.stop}
                >
                  <CloseSmallIcon />
                </button>
                <Button
                  variant="brandIcon"
                  className="transition-[transform] duration-200 hover:scale-105 [&_svg]:size-[19px]"
                  aria-label="Confirm"
                  onClick={voice.stop}
                >
                  <ConfirmIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden below-720:flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4 text-[12px] leading-[18px]">
        {[...CHIPS, ...(moreChips ? MORE_CHIPS : [])].map((c) => (
          <button
            key={c}
            type="button"
            className="border-0 bg-transparent p-0 text-secondary hover:text-ink transition-[color] duration-200"
            onClick={() => {
              update(`Build me a ${c.toLowerCase()} website`);
              input.current?.focus();
            }}
          >
            {c}
          </button>
        ))}
        <button
          type="button"
          aria-expanded={moreChips}
          className="border-0 bg-transparent p-0 text-[#2563eb] dark:text-[#6b9bff]"
          onClick={() => setMoreChips((m) => !m)}
        >
          {moreChips ? "Less" : "More"}
        </button>
      </div>
    </div>
  );
}
