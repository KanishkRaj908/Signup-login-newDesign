"use client";

import { useEffect, useRef, useState } from "react";

/* Minimal Web Speech API typings (not in lib.dom). */
type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
  webkitAudioContext?: typeof AudioContext;
};

/** Smoothed 0..1 input level: real microphone RMS, or a speech-like simulation if the mic is unavailable. */
function useLevel(active: boolean) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf = 0, lvl = 0, simT = 0, cancelled = false;
    let stream: MediaStream | null = null, actx: AudioContext | null = null;
    let read: () => number = simLevel;

    function simLevel() {
      simT += 0.016;
      const burst = (Math.sin(simT * 0.75) + Math.sin(simT * 0.33)) / 2; // speaking vs pausing
      if (burst < -0.1) return Math.random() * 0.02; // silence → blink
      const base = 0.22 + 0.42 * ((burst + 1) / 2);
      const flutter = 0.22 * Math.abs(Math.sin(simT * 11)) + 0.14 * Math.random();
      const spike = Math.random() < 0.05 ? 0.35 : 0; // occasional loud → red
      return Math.min(1, base * 0.6 + flutter + spike);
    }
    function loop() {
      const target = read();
      lvl += (target - lvl) * (target > lvl ? 0.5 : 0.16); // quick rise, moderate fall
      setLevel(lvl);
      raf = requestAnimationFrame(loop);
    }

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((s) => {
          if (cancelled) return s.getTracks().forEach((t) => t.stop());
          stream = s;
          actx = new (window.AudioContext || (window as SpeechWindow).webkitAudioContext!)();
          const analyser = actx.createAnalyser();
          analyser.fftSize = 512;
          const buf = new Uint8Array(analyser.fftSize);
          actx.createMediaStreamSource(s).connect(analyser);
          read = () => {
            analyser.getByteTimeDomainData(buf);
            let sum = 0;
            for (const b of buf) { const v = (b - 128) / 128; sum += v * v; }
            return Math.min(1, Math.sqrt(sum / buf.length) * 3.4);
          };
          loop();
        })
        .catch(() => !cancelled && loop()); // mic blocked/denied → simulate
    } else loop();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
      try { actx?.close(); } catch {}
      setLevel(0);
    };
  }, [active]);

  return level;
}

/**
 * Voice input for the composer: live speech-to-text appended to `text`, plus an input level for the equalizer.
 * `onText` receives the full composed value as the user speaks.
 */
export function useVoice(text: string, onText: (value: string) => void) {
  const [recording, setRecording] = useState(false);
  const level = useLevel(recording);
  const textRef = useRef(text);
  const onTextRef = useRef(onText);
  useEffect(() => {
    textRef.current = text;
    onTextRef.current = onText;
  });

  useEffect(() => {
    if (!recording) return;
    const w = window as SpeechWindow;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const recog = new SR();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    let base = textRef.current ? textRef.current.replace(/\s+$/, "") + " " : "";
    recog.onresult = (e) => {
      let finalT = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalT += r[0].transcript + " ";
        else interim += r[0].transcript;
      }
      if (finalT) base = (base + finalT).replace(/\s+/g, " ");
      onTextRef.current((base + interim).replace(/\s+/g, " ").replace(/^\s/, ""));
    };
    recog.onend = () => { try { recog.start(); } catch {} }; // keep listening until stopped
    recog.onerror = () => {};
    try { recog.start(); } catch {}
    return () => {
      recog.onend = null;
      try { recog.stop(); } catch {}
    };
  }, [recording]);

  return { recording, level, start: () => setRecording(true), stop: () => setRecording(false) };
}
