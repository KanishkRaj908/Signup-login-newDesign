/*
 * Intent clarification flow — prompt → thinking → questions → vision summary → plan.
 *
 * The flow is a timed script with measured scrolling and height morphs, so its state lives in
 * this mutable engine (a port of the original controller). React renders from it; every
 * mutation ends with commit(), which re-renders synchronously so the DOM can be measured
 * right after, exactly like the original's direct DOM writes.
 */
import { useUI } from "@/lib/store";
import {
  BAR, GROUPS, SAMPLE_REFS, THEMES, answerText, freshAnswer, isAnswered, joinNice, planCopy, signature, titleCase,
  type Answer, type Plan, type Question,
} from "./data";

export type LoaderNode = { t: "loader"; id: number; text: string; hidden: boolean; out: boolean; latKey: number; latFade: boolean };
export type MsgNode = {
  t: "msg"; id: number; text: string;
  /** "shim": single text node with the generating shimmer; "stream": word-by-word reveal */
  mode: "shim" | "stream";
  shim: boolean; enter: boolean; ph: boolean; stream: boolean; shown: number; padTop?: string;
};
export type RecapRow = { q: string; imgs?: string[]; a?: string; skip?: boolean };
export type RecapNode = { t: "recap"; id: number; rows: RecapRow[] };
export type SegNode = { t: "seg"; id: number; items: (LoaderNode | MsgNode | RecapNode)[]; msg?: MsgNode };
export type DoneNode = { t: "done"; id: number; ok: boolean };
export type AiNode = SegNode | LoaderNode | DoneNode;

export type SumRow = {
  id: number; k: string; sk: boolean; skUpd: boolean; fading: boolean; shimKey: number;
  content: { text: string; sw?: string[] } | null;
};
export type RefsState = { key: number; sk?: number; imgs?: string[] } | null;
export type Slot =
  | { kind: "card"; id: number; leaving: boolean; dir: "" | "swap" | "swapb"; renderId: number }
  | { kind: "plan"; id: number; leaving: boolean; plan: Plan }
  | null;

type Logic = {
  ans: Record<string, Answer>; sig: Record<string, string>;
  g: number; qi: number; reach: number; bar: number; bset: number; done?: boolean;
  segs: SegNode[];
  ownInput: { el: HTMLInputElement; set: (v: string) => void } | null;
};

const GAP = 24;

export class FlowEngine {
  /* ---- render state ---- */
  open = false; docked = false; busy = false; modalOpen = false;
  run = 0; prompt = "";
  items: SumRow[] = []; refs: RefsState = null;
  vtitle = { ready: false, text: "Understanding Vision", opacity: "" };
  bar: { dur: number | null; width: number | null; now?: number } = { dur: null, width: null };
  dockHidden = true;
  ai: AiNode[] = [];
  slot: Slot = null;
  modalPlan: Plan | null = null;
  S: Logic | null = null;
  /** called by file-input change while a reference question is open */
  fileHandler: ((files: FileList | null) => void) | null = null;

  dom: {
    flow?: HTMLElement | null; scroller?: HTMLElement | null; thread?: HTMLElement | null; dock?: HTMLElement | null;
    ub?: HTMLElement | null; cardTop?: (HTMLElement & { _t?: number }) | null; file?: HTMLInputElement | null;
  } = {};

  /** re-render synchronously (set by the component) */
  commit: () => void = () => {};

  private uid = 0;
  private timers: number[] = [];
  private procN = 0;
  private barT = 0;
  private follow = 0; private sTarget: number | null = null; private sLoop = 0; private sPos: number | null = null; private padFinal = 0;

  id() { return ++this.uid; }
  attach<K extends keyof FlowEngine["dom"]>(key: K, el: FlowEngine["dom"][K]) { this.dom[key] = el; }
  setCommit(fn: () => void) { this.commit = fn; }
  setFileHandler(fn: ((files: FileList | null) => void) | null) { this.fileHandler = fn; }
  registerOwnInput(el: HTMLInputElement, onInput: () => void) {
    this.S!.ownInput = { el, set: (v) => { el.value = v; onInput(); } };
  }

  /* ---- answer edits (each re-renders) ---- */
  pickOption(q: Question, i: number) {
    const a = this.ensureAns(q);
    if (q.type === "multi") { const k = a.sel!.indexOf(i); if (k > -1) a.sel!.splice(k, 1); else a.sel!.push(i); a.sel!.sort(); }
    else { a.i = i; a.own = ""; }
    this.commit();
  }
  setOwn(q: Question, value: string) {
    const a = this.ensureAns(q), multi = q.type === "multi";
    a.own = value.trim();
    if (!multi && a.own) a.i = null;
    if (!multi && !a.own && a.i == null) a.i = 0;
    this.commit();
  }
  setText(q: Question, value: string) { this.ensureAns(q).v = value; this.commit(); }
  shuffleBrands() { this.S!.bset++; this.commit(); }
  setTheme(q: Question, i: number) { this.ensureAns(q).i = i; this.commit(); }
  setRefs(q: Question, imgs: string[]) { this.ensureAns(q).imgs = imgs; this.commit(); }
  addRefs(q: Question, files: FileList | null) {
    const a = this.ensureAns(q);
    Array.from(files || []).forEach((f) => { if (/^image\//.test(f.type)) a.imgs!.push(URL.createObjectURL(f)); });
    this.commit();
  }
  removeRef(q: Question, i: number) { this.ensureAns(q).imgs!.splice(i, 1); this.commit(); }
  later(fn: () => void, ms: number) { const t = window.setTimeout(fn, ms); this.timers.push(t); return t; }
  private clearAll() { this.timers.forEach(clearTimeout); this.timers = []; }

  /* ---- AI loader rows ---- */
  loader(text: string): LoaderNode {
    return { t: "loader", id: this.id(), text, hidden: !text, out: false, latKey: 0, latFade: false };
  }
  say(row: LoaderNode, txt: string) {
    const had = !!row.text;
    row.hidden = true; this.commit();
    this.later(() => { row.text = txt; row.hidden = false; this.commit(); }, had ? 450 : 60);
  }
  setLoader(row: LoaderNode, txt: string) {
    row.hidden = true; this.commit();
    this.later(() => { row.latKey++; row.latFade = true; row.text = txt; row.hidden = false; this.commit(); }, 450);
  }
  dropLoader(row: LoaderNode, cb?: () => void) {
    row.out = true; this.commit();
    this.later(() => { this.removeNode(row); this.commit(); cb?.(); }, 560);
  }
  private removeNode(node: AiNode | LoaderNode) {
    this.ai = this.ai.filter((n) => n !== node);
    this.ai.forEach((n) => { if (n.t === "seg") n.items = n.items.filter((x) => x !== node); });
  }

  /* ---- streamed AI message ---- */
  streamMsg(text: string, done?: (m: MsgNode) => void): MsgNode {
    const m: MsgNode = { t: "msg", id: this.id(), text, mode: "stream", shim: false, enter: false, ph: false, stream: true, shown: 0 };
    const count = text.split(" ").length;
    const tick = () => {
      if (m.shown < count) { m.shown++; this.commit(); this.toBottom(); this.later(tick, 62); }
      else this.later(() => { m.stream = false; done?.(m); this.commit(); }, 800);
    };
    m.shown++; this.toBottom(); this.later(tick, 62);
    return m;
  }

  /* ---- keep the newest content a constant GAP above the dock ---- */
  toBottom() {
    if (this.follow) return;
    this.follow = requestAnimationFrame(() => { this.follow = 0; this.settle(); });
  }
  private settle() {
    const { dock, scroller, thread } = this.dom;
    if (!this.docked || this.dockHidden || !dock || !scroller || !thread) return;
    const need = dock.offsetHeight + GAP, cur = parseFloat(scroller.style.paddingBottom) || 0;
    if (need > cur) scroller.style.paddingBottom = need + "px"; // grow now; shrink only once settled
    this.padFinal = need;
    const contentBottom = thread.offsetTop + thread.offsetHeight;
    const visBottom = dock.offsetTop - scroller.offsetTop - GAP;
    const max = scroller.scrollHeight - scroller.clientHeight;
    this.sTarget = Math.max(0, Math.min(max, contentBottom - visBottom));
    if (!this.sLoop) this.sLoop = requestAnimationFrame(this.step);
  }
  private step = () => {
    const scroller = this.dom.scroller!;
    if (this.sPos == null || Math.abs(this.sPos - scroller.scrollTop) > 2) this.sPos = scroller.scrollTop; // respect manual scrolling
    const d = this.sTarget! - this.sPos;
    if (Math.abs(d) < 0.5) {
      scroller.scrollTop = this.sTarget!; this.sPos = null; this.sLoop = 0;
      if (this.padFinal) scroller.style.paddingBottom = this.padFinal + "px";
      return;
    }
    let v = d * 0.085; if (Math.abs(v) < 0.35) v = d < 0 ? -0.35 : 0.35; // eased approach
    this.sPos += v; scroller.scrollTop = this.sPos;
    this.sLoop = requestAnimationFrame(this.step);
  };
  center() {
    const { scroller, thread } = this.dom;
    if (this.docked || !scroller || !thread) return;
    const h = scroller.clientHeight - 56, th = thread.offsetHeight;
    thread.style.transform = "translateY(" + Math.max(0, (h - th) / 2 - 30) + "px)";
  }

  /* ---- vision summary (left shell) ---- */
  setBar(px: number, dur?: number) {
    const S = this.S;
    if (!S || px <= S.bar) return;
    S.bar = px;
    dur = dur || 2800;
    this.bar = { dur, width: px, now: Math.round((px / 247) * 100) };
    clearTimeout(this.barT); this.barT = window.setTimeout(() => {}, dur + 200);
    this.commit();
  }
  procOn(key?: string | null) { this.procN++; if (key) this.skelRow(key); this.commit(); }
  procOff() {
    this.procN = Math.max(0, this.procN - 1);
    if (!this.procN) {
      this.items.forEach((r) => {
        if (r.sk) { r.fading = true; setTimeout(() => { this.items = this.items.filter((x) => x !== r); this.commit(); }, 520); }
        if (r.skUpd) r.skUpd = false;
      });
    }
    this.commit();
  }
  private skelRow(key: string) {
    const row = this.items.find((r) => r.k === key);
    if (row) { row.skUpd = true; return; } // already shown → shimmer it in place
    this.items.push({ id: this.id(), k: key, sk: true, skUpd: false, fading: false, shimKey: 0, content: null });
  }
  private refsSkeleton(n: number) { this.refs = { key: this.id(), sk: Math.min(n, 2) }; this.commit(); }
  private showRefs(imgs: string[]) { this.refs = imgs.length ? { key: this.id(), imgs: imgs.slice() } : null; this.commit(); }
  private sumItem(key: string, text: string, sw?: string[]) {
    let row = this.items.find((r) => r.k === key);
    if (!row) { row = { id: this.id(), k: key, sk: false, skUpd: false, fading: false, shimKey: 0, content: null }; this.items.push(row); }
    row.sk = false; row.skUpd = false; row.content = { text, sw }; row.shimKey++;
    this.commit();
  }
  private sumRemove(key: string) { this.items = this.items.filter((r) => r.k !== key); }
  private summarize(q: Question) {
    const a = this.S!.ans[q.id], t = answerText(q, a);
    if (q.type === "ref") return;
    if (t == null) { this.sumRemove(q.id); this.commit(); return; }
    if (q.id === "kind") this.sumItem("kind", "Category: " + titleCase(t));
    else if (q.id === "brand") this.sumItem("brand", "Brand: " + t);
    else if (q.id === "biz") this.sumItem("biz", "About Business: " + t);
    else if (q.id === "goals" && q.type === "multi") {
      const g = a.sel!.map((i) => q.opts[i].g!); if (a.own) g.push(a.own);
      this.sumItem("goals", "Goals: " + joinNice(g));
    } else if (q.id === "theme") this.sumItem("theme", "Theme:", THEMES[a.i!].sw);
  }

  /* ---- question card ---- */
  current() { const S = this.S!; return GROUPS[S.g][S.qi]; }
  answered(q: Question) { return isAnswered(q, this.S!.ans[q.id]); }
  ensureAns(q: Question) { const S = this.S!; return S.ans[q.id] || (S.ans[q.id] = freshAnswer(q)); }

  renderCard(enterDir?: "f" | "b") {
    const S = this.S!;
    this.ensureAns(this.current());
    const top = this.dom.cardTop;
    if (!this.slot || this.slot.kind !== "card") {
      this.slot = { kind: "card", id: this.id(), leaving: false, dir: "", renderId: 0 };
    }
    const h0 = enterDir && top ? top.offsetHeight : 0;
    this.slot.dir = enterDir === "f" ? "swap" : enterDir === "b" ? "swapb" : "";
    this.slot.renderId++;
    S.ownInput = null;
    this.commit();
    const t = this.dom.cardTop;
    if (enterDir && t) { // morph the card height instead of snapping
      t.style.height = "auto"; const h1 = t.offsetHeight;
      if (Math.abs(h1 - h0) > 1) {
        t.style.height = h0 + "px"; void t.offsetHeight; t.style.height = h1 + "px";
        clearTimeout(t._t); t._t = window.setTimeout(() => { t.style.height = ""; }, 660);
      } else t.style.height = "";
    }
    this.toBottom(); this.later(() => this.toBottom(), 700); this.later(() => this.toBottom(), 1150);
  }
  prev() { const S = this.S!; if (S.qi > 0) { S.qi--; this.renderCard("b"); } }
  next() {
    const S = this.S!;
    if (S.qi < S.reach) { if (this.answered(this.current())) this.advance(); else { S.qi++; this.renderCard("f"); } }
  }

  advance = () => {
    const S = this.S!, G = GROUPS[S.g], q = G[S.qi];
    if (!this.answered(q)) return;
    S.ans[q.id].skipped = false;
    if (S.qi < G.length - 1) {
      const sg = signature(S.ans[q.id]);
      if (S.sig[q.id] !== sg) { // new / changed answer → AI processes it
        S.sig[q.id] = sg;
        this.procOn(q.id);
        this.later(() => { this.summarize(q); this.setBar(BAR[q.id], 3000); }, 1500);
        this.later(() => this.procOff(), 2600);
      }
      S.qi++; S.reach = Math.max(S.reach, S.qi); this.renderCard("f");
    } else this.submitGroup(q);
  };
  skipAll = () => {
    const S = this.S!, G = GROUPS[S.g];
    for (let i = S.qi; i < G.length; i++) { const q = G[i]; this.ensureAns(q).skipped = true; this.sumRemove(q.id); }
    this.submitGroup(null);
  };

  private recap(G: Question[]): RecapNode {
    const S = this.S!;
    const rows = G.map((q): RecapRow => {
      const a = S.ans[q.id], t = answerText(q, a), label = q.short || q.title;
      if (q.type === "ref" && a && !a.skipped && a.imgs!.length) return { q: label, imgs: a.imgs!.slice(0, 3) };
      if (q.type === "theme" && t) return { q: label, a: t };
      return t == null ? { q: label, a: "Skipped", skip: true } : { q: label, a: t };
    });
    return { t: "recap", id: this.id(), rows };
  }
  private hideCard(cb?: () => void) {
    if (!this.slot) { cb?.(); return; }
    this.slot.leaving = true; this.commit();
    this.later(() => { this.slot = null; this.commit(); cb?.(); }, 420);
  }

  private submitGroup(lastQ: Question | null) {
    const S = this.S!, G = GROUPS[S.g], seg = S.segs[S.g];
    S.ownInput = null;
    const changed = !!lastQ && lastQ.type !== "ref" && S.sig[lastQ.id] !== signature(S.ans[lastQ.id]);
    if (lastQ) S.sig[lastQ.id] = signature(S.ans[lastQ.id]);
    this.procOn(changed ? lastQ!.id : null); // skeleton only where something new is being worked out
    if (changed) this.later(() => this.summarize(lastQ!), 1600);
    this.hideCard(() => {
      if (seg.msg) seg.msg.ph = false; // answered → message turns default
      seg.items.push(this.recap(G)); this.commit(); this.toBottom();
      this.busy = true; this.commit();
      if (S.g === 0) {
        this.later(() => this.setBar(BAR.brand, 3600), 900);
        const ld = this.loader("Working..."); this.ai.push(ld); this.commit(); this.toBottom();
        this.later(() => this.dropLoader(ld, () => {
          const seg2: SegNode = { t: "seg", id: this.id(), items: [] }; this.ai.push(seg2); S.segs[1] = seg2;
          seg2.msg = this.streamMsg("Great, I can build it, first I need the site’s purpose, content, and preferred look.", (p) => {
            p.ph = true; this.busy = false; this.procOff();
            S.g = 1; S.qi = 0; S.reach = 0; this.later(() => { this.renderCard(); this.toBottom(); }, 300);
          });
          seg2.items.push(seg2.msg); this.commit();
        }), 3000);
      } else {
        const refs = S.ans.ref && !S.ans.ref.skipped ? S.ans.ref.imgs! : [];
        if (refs.length) { this.refsSkeleton(refs.length); this.later(() => this.showRefs(refs), 2200); }
        this.later(() => this.setBar(BAR.ref, 2600), 900);
        this.later(() => this.setBar(238, 3400), 3600);
        const ld2 = this.loader("Building plan..."); this.ai.push(ld2); this.commit(); this.toBottom();
        this.later(() => this.setLoader(ld2, "Working..."), 2800);
        this.later(() => this.dropLoader(ld2, () => this.planReady()), 5000);
      }
    });
  }

  /* ---- vision ready + plan ---- */
  private planReady() {
    const S = this.S!;
    this.busy = false; this.commit();
    this.setBar(247, 1200);
    this.later(() => { this.procN = 1; this.procOff(); this.vtitle.opacity = "0"; this.commit(); }, 1100);
    this.later(() => { this.vtitle = { ready: true, text: "Your vision is ready", opacity: "1" }; this.commit(); }, 1700);
    const seg3: SegNode = { t: "seg", id: this.id(), items: [] }; this.ai.push(seg3); S.segs[2] = seg3;
    seg3.msg = this.streamMsg("I've put together a plan for you. Feel free to review it, suggest any changes, and approve it when you're ready.", (p) => {
      p.ph = true; this.showPlan();
    });
    seg3.items.push(seg3.msg); this.commit();
  }
  private showPlan() {
    const P = planCopy(this.S!.ans);
    this.slot = { kind: "plan", id: this.id(), leaving: false, plan: P };
    this.modalPlan = P;
    this.commit(); this.toBottom();
  }
  openModal = () => { this.modalOpen = true; this.commit(); };
  closeModal = () => { this.modalOpen = false; this.commit(); };
  finish = (ok: boolean) => {
    const S = this.S;
    if (!S || S.done) return; S.done = true;
    this.modalOpen = false;
    const seg = S.segs[2]; if (seg?.msg) seg.msg.ph = false;
    if (this.slot) this.slot.leaving = true;
    this.commit();
    this.later(() => {
      this.slot = null;
      this.ai.push({ t: "done", id: this.id(), ok }); this.commit(); this.toBottom();
    }, 420);
  };

  /* ---- entry / exit ---- */
  /** scale the whole flow like the 1440×790 Figma frame, so shell/panel/content keep their ratio */
  fit = () => {
    const flow = this.dom.flow; if (!flow) return;
    const w = window.innerWidth, h = window.innerHeight;
    const k = w <= 900 ? 1 : Math.max(1, Math.min(w / 1440, h / 790, 1.6));
    flow.style.zoom = k === 1 ? "" : String(Math.round(k * 1000) / 1000);
  };

  start(prompt: string) {
    const { scroller, thread } = this.dom;
    this.clearAll(); this.modalOpen = false;
    const S: Logic = { ans: {}, sig: {}, g: 0, qi: 0, reach: 0, bar: 0, bset: 0, segs: [], ownInput: null };
    this.S = S;
    this.run++; this.prompt = prompt;
    this.ai = []; this.items = []; this.refs = null; this.slot = null;
    this.vtitle = { ready: false, text: "Understanding Vision", opacity: "" };
    this.procN = 0;
    if (scroller) scroller.style.paddingBottom = "";
    this.sTarget = null; if (this.sLoop) { cancelAnimationFrame(this.sLoop); this.sLoop = 0; } this.sPos = null;
    if (scroller) scroller.scrollTop = 0;
    this.bar = { dur: 0, width: 0 };
    this.docked = false; this.busy = false; this.dockHidden = true;
    if (thread) thread.style.transition = "none";
    const seg: SegNode = { t: "seg", id: this.id(), items: [] };
    const ld = this.loader(""); seg.items.push(ld);
    this.ai.push(seg); S.segs[0] = seg;
    this.open = true;
    this.commit();
    this.center();
    if (thread) { void thread.offsetWidth; thread.style.transition = ""; }
    // Entrance: the prompt appears in its final spot, rising smoothly from slightly lower and settling
    const ub = this.dom.ub;
    if (ub) {
      ub.style.animation = "none"; ub.style.transition = "none";
      ub.style.transform = "translateY(120px)"; ub.style.opacity = "0";
      void ub.offsetWidth;
      ub.style.transition = "transform .9s cubic-bezier(.16,1,.3,1) .12s, opacity .55s ease .12s";
      ub.style.transform = "none"; ub.style.opacity = "1";
    }
    // 1 · thinking → "Let's shape the idea"
    this.later(() => this.say(ld, "Let’s shape the idea"), 900);
    // 2 · analysing → "We need a bit more to go on first."
    this.later(() => this.dropLoader(ld, () => {
      const m: MsgNode = { t: "msg", id: this.id(), text: "We need a bit more to go on first.", mode: "shim", shim: true, enter: true, ph: false, stream: false, shown: 0, padTop: "4px" };
      seg.msg = m; seg.items.push(m); this.commit();
    }), 3300);
    // 3 · dock the panel, reveal the vision shell
    this.later(() => {
      this.docked = true; if (this.dom.thread) this.dom.thread.style.transform = "translateY(0)";
      if (seg.msg) { seg.msg.shim = false; seg.msg.ph = true; seg.msg.padTop = "0"; }
      this.commit();
      this.procOn("product"); S.bar = 0;
      this.later(() => { this.sumItem("product", "Product: Website"); this.setBar(BAR.start, 2200); }, 1500);
    }, 5000);
    // 4 · first question slides up; panel goes still while waiting for the answer
    this.later(() => { this.dockHidden = false; this.renderCard(); this.procOff(); }, 6900);
  }

  exit = () => {
    this.clearAll(); this.modalOpen = false;
    this.open = false; this.commit();
    if (useUI.getState().flowPrompt !== null) useUI.getState().exitFlow();
    this.later(() => { this.docked = false; this.busy = false; this.commit(); }, 650);
    const hi = document.getElementById("pinput"); try { hi?.focus(); } catch {}
  };
  escape() { if (this.modalOpen) this.closeModal(); else this.exit(); }

  /** prompt box: typing here answers the open question ("write your own" / text field) */
  submitPrompt(input: HTMLInputElement) {
    const v = input.value.trim(); if (!v || !this.S) return;
    const o = this.S.ownInput; if (!o) return;
    o.set(v); input.value = ""; o.el.focus();
  }

  /** prototype upload: two sample references */
  sampleRefs(q: Question) { this.setRefs(q, SAMPLE_REFS.slice()); }
}
