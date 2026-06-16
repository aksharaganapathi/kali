/**
 * audioFX.ts — Web Audio API sound synthesizer for Kali app
 * Generates retro chimes and feedback sounds entirely client-side.
 * No external assets needed.
 */

const SOUND_PREF_KEY = "kali_sound_enabled";

let _audioCtx: AudioContext | null = null;
let _enabled: boolean | null = null;

function getEnabled(): boolean {
  if (_enabled !== null) return _enabled;
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(SOUND_PREF_KEY);
  _enabled = stored === null ? true : stored === "1";
  return _enabled;
}

export function isSoundEnabled(): boolean {
  return getEnabled();
}

export function setSoundEnabled(val: boolean): void {
  _enabled = val;
  if (typeof window !== "undefined") {
    localStorage.setItem(SOUND_PREF_KEY, val ? "1" : "0");
  }
}

export function toggleSound(): boolean {
  const next = !getEnabled();
  setSoundEnabled(next);
  return next;
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    try {
      _audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return _audioCtx;
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  gainPeak: number = 0.18
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(gainPeak, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Play a correct-answer chime: ascending E5 → G5 */
function playCorrect(ctx: AudioContext): void {
  const now = ctx.currentTime;
  playTone(ctx, 659.25, now,        0.18, "sine", 0.15); // E5
  playTone(ctx, 783.99, now + 0.12, 0.22, "sine", 0.18); // G5
}

/** Play an incorrect buzz: descending triangle wave */
function playIncorrect(ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.25);
  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  osc.start(now);
  osc.stop(now + 0.28);
}

/** Level complete fanfare: C4 → E4 → G4 → C5 arpeggio */
function playLevelComplete(ctx: AudioContext): void {
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
  notes.forEach((freq, i) => {
    playTone(ctx, freq, ctx.currentTime + i * 0.13, 0.35, "sine", 0.16);
  });
}



/** Streak milestone jingle (3+ day streak) */
function playStreakMilestone(ctx: AudioContext): void {
  const notes = [392.0, 523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    playTone(ctx, freq, ctx.currentTime + i * 0.1, 0.3, "triangle", 0.12);
  });
}

export type SoundFX = "correct" | "incorrect" | "level-complete" | "streak-milestone";

export function playAudioFX(fx: SoundFX): void {
  if (!getEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;

  // Resume AudioContext if suspended (browser autoplay policy)
  const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
  void resume.then(() => {
    switch (fx) {
      case "correct":           playCorrect(ctx); break;
      case "incorrect":         playIncorrect(ctx); break;
      case "level-complete":    playLevelComplete(ctx); break;
      case "streak-milestone":  playStreakMilestone(ctx); break;
    }
  });
}
