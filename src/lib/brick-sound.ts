/** "Click" played when a dragged brick snaps into a slot: the bundled sample, or a synthesized tick. */

let sample: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Create the audio element up front so the first snap plays without delay. */
export function preloadBrickSound() {
  if (sample) return;
  try {
    sample = new Audio("/assets/ksjsbwuil-click-0-481191.mp3");
    sample.preload = "auto";
    sample.volume = 0.6;
  } catch {}
}

function synthTick() {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as WebkitWindow).webkitAudioContext!)();
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(1700, t);
    o.frequency.exponentialRampToValueAtTime(820, t + 0.05);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.15);
  } catch {}
}

export function playBrickClick() {
  if (sample) {
    try {
      sample.currentTime = 0;
      sample.play()?.catch(synthTick);
      return;
    } catch {}
  }
  synthTick();
}
