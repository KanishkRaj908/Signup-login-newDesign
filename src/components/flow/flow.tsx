"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AddIcon, ArrowLeftIcon, ChevronDownIcon, DownloadIcon, ShareIcon, StopIcon, VoiceIcon, XIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUI } from "@/lib/store";
import { FlowEngine } from "./engine";
import { AiThread, PlanCard, PlanDetails, RefsBlock, SummaryRow, pbody, pfoot, phead, shead } from "./parts";
import { QuestionCard } from "./question-card";

/** Intent clarification flow: full-screen overlay launched from the hero prompt. */
export function Flow() {
  const [e] = useState(() => new FlowEngine());
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const pinput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    e.setCommit(() => flushSync(bump));
    e.fit();
    const onResize = () => { e.fit(); e.center(); };
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape" && e.open) e.escape(); };
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    // (re)start whenever the hero launches a prompt
    const unsub = useUI.subscribe((s, prev) => {
      if (s.flowKey !== prev.flowKey && s.flowPrompt !== null) e.start(s.flowPrompt);
    });
    return () => { unsub(); window.removeEventListener("resize", onResize); document.removeEventListener("keydown", onKey); };
  }, [e]);

  const docked = e.docked;
  const card = e.slot;

  return (
    <section
      ref={(el) => e.attach("flow", el)}
      data-flow=""
      aria-hidden={!e.open}
      aria-label="Shape your idea"
      className={cn(
        "fixed inset-0 z-45 bg-white text-[#171717] overflow-hidden font-['Plus_Jakarta_Sans',ui-sans-serif,system-ui,sans-serif] antialiased [&_svg]:block",
        e.open
          ? "opacity-100 visible [transition:opacity_.5s_ease]"
          : "opacity-0 invisible [transition:opacity_.5s_ease,visibility_0s_linear_.5s,background-color_0s_linear_.5s]",
        docked && "bg-[#0a0a0a]",
      )}
    >
      <button
        type="button"
        aria-label="Back to home"
        className={cn(
          "absolute left-6 top-5 z-5 size-8 p-2 border-0 bg-transparent rounded-full flex items-center justify-center [transition:background_.2s,color_.5s] [&_svg]:size-4",
          docked ? "text-white hover:bg-[rgba(255,255,255,.08)]" : "text-[#a3a3a3] hover:bg-[#f5f5f5]",
        )}
        onClick={e.exit}
      >
        <ArrowLeftIcon />
      </button>

      {/* left shell: Understanding Vision + Vision summary */}
      <aside
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[29.1667%] min-w-[320px] py-[110px] px-16 overflow-auto [scrollbar-width:none] flex flex-col gap-12 text-white below-900:hidden",
          `[transition:opacity_1s_ease_.55s,transform_1.3s_var(--ease-fl)_.4s]`,
          docked ? "opacity-100 [transform:none]" : "opacity-0 [transform:translateX(-12px)]",
        )}
      >
        <div className="flex flex-col gap-11">
          <div className="flex flex-col gap-4">
            <p
              className={cn("m-0 text-[16px] leading-6 font-medium text-white transition-opacity duration-500", e.vtitle.ready && "font-normal")}
              style={{ opacity: e.vtitle.opacity || undefined }}
            >
              {e.vtitle.text}
            </p>
            <div
              role="progressbar"
              aria-label="Vision progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={e.bar.now}
              className={cn(
                "relative w-[247px] h-0 transition-[opacity,height] duration-400 before:content-[''] before:absolute before:inset-x-0 before:top-[-.5px] before:h-px before:bg-[#262626]",
                e.vtitle.ready && "opacity-0 [transition:opacity_.8s_ease]",
              )}
              style={e.bar.dur != null ? ({ "--fl-bd": e.bar.dur + "ms" } as React.CSSProperties) : undefined}
            >
              <i
                className="absolute left-px top-[-1.5px] h-[3px] w-3 rounded-[3px] bg-[linear-gradient(90deg,rgba(255,255,255,.12),#fff)] [transition:width_var(--fl-bd,2.8s)_cubic-bezier(.45,.05,.25,1)] overflow-hidden"
                style={e.bar.width != null ? { width: e.bar.width + "px" } : undefined}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <p className={shead}>Vision summary</p>
            <div className="flex flex-col gap-2">
              {e.items.map((r) => <SummaryRow key={r.id} row={r} />)}
            </div>
          </div>
        </div>
        <div>
          <RefsBlock refs={e.refs} />
        </div>
      </aside>

      {/* white working panel — full-bleed while thinking, docks right once clarification starts */}
      <div
        className={cn(
          "absolute left-0 top-0 right-0 bottom-0 bg-white rounded-none overflow-hidden flex flex-col",
          `[transition:left_1.3s_var(--ease-fl),top_1.3s_var(--ease-fl),right_1.3s_var(--ease-fl),bottom_1.3s_var(--ease-fl),border-radius_1.3s_var(--ease-fl)]`,
          docked && "left-[max(29.1667%,320px)] top-5 right-5 bottom-5 rounded-3xl below-900:left-3 below-900:right-3 below-900:top-[60px] below-900:bottom-3",
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[34px] z-3 pointer-events-none bg-[linear-gradient(to_top,rgba(255,255,255,.04)_16%,rgba(255,255,255,.8)_69%)] [backdrop-filter:blur(1px)]"
        />
        <div
          ref={(el) => e.attach("scroller", el)}
          className="relative flex-[1_1_auto] min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none pt-8 pb-6 [overflow-anchor:none]"
        >
          <div className={cn(col, docked && "w-[74.4%]")}>
            <div
              ref={(el) => e.attach("thread", el)}
              className={`flex flex-col gap-8 [transition:transform_1.3s_var(--ease-fl)] will-change-transform`}
            >
              {e.run > 0 && (
                <div
                  key={e.run}
                  ref={(el) => e.attach("ub", el)}
                  className="self-end max-w-[70%] bg-[#eff6ff] p-5 rounded-[24px_24px_0_24px] text-[16px] leading-6 font-medium text-fl-ink whitespace-pre-wrap [word-break:break-word] animate-[flRise_.8s_var(--ease-fl)_.1s_both]"
                >
                  {e.prompt}
                </div>
              )}
              {e.run > 0 && <AiThread key={`ai${e.run}`} nodes={e.ai} />}
            </div>
          </div>
        </div>
        <div
          ref={(el) => e.attach("dock", el)}
          hidden={e.dockHidden}
          className="absolute inset-x-0 bottom-0 pt-6 pb-8 z-2 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0)_0,#fff_24px)]"
        >
          <div className={cn(col, docked && "w-[74.4%]", "flex flex-col gap-3 *:pointer-events-auto")}>
            <div className="empty:hidden">
              {card?.kind === "card" && <QuestionCard key={card.id} engine={e} />}
              {card?.kind === "plan" && (
                <PlanCard key={card.id} plan={card.plan} leaving={card.leaving} onOpen={e.openModal} onFinish={e.finish} />
              )}
            </div>
            <PromptBox busy={e.busy} inputRef={pinput} onSubmit={() => pinput.current && e.submitPrompt(pinput.current)} />
          </div>
        </div>
      </div>

      {/* plan modal */}
      <div
        role="dialog"
        aria-label="Plan"
        className={cn(
          "absolute inset-0 z-8 flex items-center justify-center p-6 bg-[rgba(10,10,10,.55)] [backdrop-filter:blur(6px)]",
          e.modalOpen ? "opacity-100 visible [transition:opacity_.3s_ease]" : "opacity-0 invisible [transition:opacity_.3s_ease,visibility_0s_linear_.3s]",
        )}
        onClick={(ev) => { if (ev.target === ev.currentTarget) e.closeModal(); }}
      >
        <div
          className={cn(
            "w-[min(900px,100%)] max-h-[min(600px,calc(100%-48px))] bg-[#fafafa] rounded-3xl overflow-hidden flex flex-col",
            `[transition:transform_.4s_var(--ease-fl)]`,
            e.modalOpen ? "[transform:none]" : "[transform:translateY(12px)_scale(.98)]",
          )}
        >
          <div className="bg-white rounded-[0_0_24px_24px] pt-4 px-5 pb-5 flex flex-col gap-4 min-h-0 flex-[1_1_auto]">
            <div className={phead}>
              <b>Plan</b>
              <div className="flex gap-1">
                <Button variant="flIcon" aria-label="Share"><ShareIcon /></Button>
                <Button variant="flIcon" aria-label="Download"><DownloadIcon /></Button>
                <Button variant="flIcon" aria-label="Close" onClick={e.closeModal}><XIcon /></Button>
              </div>
            </div>
            <div className={cn(pbody, "overflow-auto [scrollbar-width:thin] pr-1.5")}>
              {e.modalPlan && <PlanDetails plan={e.modalPlan} />}
            </div>
          </div>
          <div className={pfoot}>
            <Button variant="flGhost" onClick={() => e.finish(false)}>Skip</Button>
            <Button variant="flPrimary" onClick={() => e.finish(true)}><span>Approve</span></Button>
          </div>
        </div>
      </div>

      <input
        ref={(el) => e.attach("file", el)}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(ev) => { e.fileHandler?.(ev.currentTarget.files); ev.currentTarget.value = ""; }}
      />
    </section>
  );
}

const col = `w-[min(744px,calc(100%-64px))] mx-auto [transition:width_1.3s_var(--ease-fl)] below-900:w-[calc(100%-32px)]`;

/** Bottom AI prompt box: attach, text, mode switch, voice, stop (while busy). */
function PromptBox({ busy, inputRef, onSubmit }: { busy: boolean; inputRef: React.RefObject<HTMLInputElement | null>; onSubmit: () => void }) {
  const ib = "size-8 flex-[0_0_32px] p-2 border-0 bg-transparent rounded-full text-fl-ink flex items-center justify-center transition-[background] duration-200 hover:bg-[#f5f5f5] [&_svg]:size-4";
  return (
    <form
      autoComplete="off"
      className="bg-white border-[1.5px] border-fl-bt rounded-[20px] p-2 flex items-center gap-1 transition-[box-shadow] duration-200 focus-within:shadow-[0_0_0_2px_#fff,0_0_0_4px_#e4e5e7]"
      onSubmit={(ev) => { ev.preventDefault(); onSubmit(); }}
    >
      <button className={ib} type="button" aria-label="Attach"><AddIcon /></button>
      <input
        ref={inputRef}
        type="text"
        placeholder="Describe..."
        aria-label="Describe"
        className="flex-1 min-w-0 border-0 outline-none bg-transparent [font-family:inherit] text-[14px] leading-5 font-medium text-fl-ink pr-1 pl-0 py-0 placeholder:text-fl-ph"
      />
      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-between w-[78px] h-8 px-3 py-0 border-0 bg-transparent rounded-full text-[14px] leading-5 font-medium text-fl-ink [&_svg]:size-3 [&_svg]:text-fl-quat [&_svg]:mt-0.5"
          type="button"
        >
          Build
          <ChevronDownIcon />
        </button>
        <div className="flex items-center gap-1">
          <button className={ib} type="button" aria-label="Voice input"><VoiceIcon /></button>
          <button
            className={cn(
              "size-8 flex-[0_0_32px] p-2 rounded-full border-2 border-[rgba(255,255,255,.12)] bg-fl-solid text-white items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,.05),inset_0_0_0_1px_rgba(0,0,0,.18),inset_0_-2px_0_rgba(0,0,0,.05)] [&_svg]:size-4",
              busy ? "flex" : "hidden",
            )}
            type="button"
            aria-label="Stop"
          >
            <StopIcon />
          </button>
        </div>
      </div>
    </form>
  );
}
