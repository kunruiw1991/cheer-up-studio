/**
 * Boston ↔ Bay Area Creative Cheer-Up Studio
 * Shared Web Audio API Manager & HybridAudioTransport Clock Engine
 *
 * Provides:
 * 1. Shared singleton AudioContext with master gain + dynamics compressor and
 *    automatic user-gesture unlock handling (`pointerdown`, `keydown`, `touchstart`, `click`).
 * 2. `HybridAudioTransport` clock engine that seamlessly synchronizes to
 *    `AudioContext.currentTime` when running, and falls back monotonically to
 *    `performance.now() / 1000` (plus deterministic `step(deltaSec)`) when
 *    `AudioContext` is suspended in headless Chromium environments.
 */

let _sharedCtx = null;
let _masterGain = null;
let _unlockBound = false;

/**
 * Returns (and lazily initializes) the shared Web Audio API AudioContext.
 */
export function getAudioContext() {
  if (_sharedCtx) {
    return _sharedCtx;
  }
  const AudioCtxClass =
    typeof window !== 'undefined'
      ? window.AudioContext || window.webkitAudioContext
      : null;
  if (!AudioCtxClass) {
    return null;
  }
  try {
    _sharedCtx = new AudioCtxClass();
    _masterGain = _sharedCtx.createGain();
    _masterGain.gain.value = 0.85;

    const compressor = _sharedCtx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.knee.value = 20;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;

    _masterGain.connect(compressor);
    compressor.connect(_sharedCtx.destination);
    bindUserGestureAudioUnlock();
  } catch (err) {
    console.warn('[AudioContext] Could not initialize Web Audio API:', err);
    _sharedCtx = null;
  }
  return _sharedCtx;
}

/**
 * Returns the shared master output gain node.
 */
export function getMasterGain() {
  getAudioContext();
  return _masterGain;
}

/**
 * Resumes the shared AudioContext if suspended. Safe to call in headless browsers.
 */
export async function ensureAudioUnlocked() {
  const ctx = getAudioContext();
  if (!ctx) {
    return false;
  }
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Headless browsers without audio output device may stay suspended;
      // HybridAudioTransport handles this seamlessly via performance.now().
    }
  }
  return ctx.state === 'running';
}

/**
 * Binds one-time document gesture listeners to unlock Web Audio automatically.
 */
export function bindUserGestureAudioUnlock() {
  if (_unlockBound || typeof document === 'undefined') {
    return;
  }
  _unlockBound = true;
  const events = ['pointerdown', 'keydown', 'touchstart', 'click'];
  const unlockHandler = () => {
    ensureAudioUnlocked().then((running) => {
      if (running) {
        events.forEach((evt) =>
          document.removeEventListener(evt, unlockHandler, true)
        );
      }
    });
  };
  events.forEach((evt) =>
    document.addEventListener(evt, unlockHandler, { capture: true, passive: true })
  );
}

/**
 * Synthesizes a gentle, kid-friendly musical chime or purr tone.
 */
export function playSynthChime({
  frequency = 523.25,
  duration = 0.18,
  type = 'triangle',
  gain = 0.14,
} = {}) {
  const ctx = getAudioContext();
  const out = getMasterGain();
  if (!ctx || !out) {
    return false;
  }
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.25, now + duration);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(env);
    env.connect(out);
    osc.start(now);
    osc.stop(now + duration + 0.02);
    return true;
  } catch {
    return false;
  }
}

/**
 * HybridAudioTransport
 * Provides sample-accurate time when AudioContext is running AND seamless
 * monotonic fallback to `performance.now() / 1000` + manual frame stepping
 * when AudioContext is suspended (e.g. headless Chromium verification).
 */
export class HybridAudioTransport {
  constructor({ bpm = 128 } = {}) {
    this.bpm = bpm;
    this.isPlaying = false;
    this._accumulatedSec = 0;
    this._lastWallSec = 0;
    this._lastAudioSec = null;
    this._manualOffsetSec = 0;
  }

  _nowWallSec() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now() / 1000;
    }
    return Date.now() / 1000;
  }

  start(bpm = this.bpm) {
    this.bpm = Number(bpm) || this.bpm;
    this._accumulatedSec = 0;
    this._manualOffsetSec = 0;
    this._lastWallSec = this._nowWallSec();
    const ctx = getAudioContext();
    this._lastAudioSec = ctx && ctx.state === 'running' ? ctx.currentTime : null;
    this.isPlaying = true;
    ensureAudioUnlocked();
    return this.getCurrentTime();
  }

  stop() {
    this.isPlaying = false;
    this._accumulatedSec = 0;
    this._manualOffsetSec = 0;
    this._lastAudioSec = null;
  }

  pause() {
    if (!this.isPlaying) {
      return;
    }
    this._accumulatedSec = this.getCurrentTime();
    this._manualOffsetSec = 0;
    this.isPlaying = false;
    this._lastAudioSec = null;
  }

  resume() {
    if (this.isPlaying) {
      return;
    }
    this._lastWallSec = this._nowWallSec();
    const ctx = getAudioContext();
    this._lastAudioSec = ctx && ctx.state === 'running' ? ctx.currentTime : null;
    this.isPlaying = true;
    ensureAudioUnlocked();
  }

  reset() {
    this._accumulatedSec = 0;
    this._manualOffsetSec = 0;
    this._lastWallSec = this._nowWallSec();
    const ctx = getAudioContext();
    this._lastAudioSec = ctx && ctx.state === 'running' ? ctx.currentTime : null;
  }

  setBpm(bpm) {
    const numeric = Number(bpm);
    if (numeric > 0 && Number.isFinite(numeric)) {
      this.bpm = numeric;
    }
    return this.bpm;
  }

  getBpm() {
    return this.bpm;
  }

  /**
   * Deterministically advances transport time by `deltaSec` seconds.
   * Used by headless E2E tests (`stepRhythmTime(deltaSec)`).
   */
  step(deltaSec = 0) {
    const delta = Number(deltaSec) || 0;
    if (delta > 0) {
      this._manualOffsetSec += delta;
    }
    return this.getCurrentTime();
  }

  advanceManualTime(deltaSec = 0) {
    return this.step(deltaSec);
  }

  /**
   * Returns current transport playback time in seconds (strictly monotonic).
   */
  getCurrentTime() {
    if (!this.isPlaying) {
      return this._accumulatedSec + this._manualOffsetSec;
    }

    const wallNow = this._nowWallSec();
    const wallDelta = Math.max(0, wallNow - this._lastWallSec);
    this._lastWallSec = wallNow;

    const ctx = getAudioContext();
    if (ctx && ctx.state === 'running') {
      if (this._lastAudioSec !== null) {
        const audioDelta = Math.max(0, ctx.currentTime - this._lastAudioSec);
        this._accumulatedSec += audioDelta;
      } else {
        this._accumulatedSec += wallDelta;
      }
      this._lastAudioSec = ctx.currentTime;
    } else {
      this._lastAudioSec = null;
      this._accumulatedSec += wallDelta;
    }

    return this._accumulatedSec + this._manualOffsetSec;
  }

  /**
   * Returns current fractional beat index based on current time and BPM.
   */
  getCurrentBeat() {
    return (this.getCurrentTime() * this.bpm) / 60;
  }

  getState() {
    const ctx = getAudioContext();
    const isAudioRunning = Boolean(ctx && ctx.state === 'running');
    return {
      isPlaying: this.isPlaying,
      bpm: this.bpm,
      currentTime: this.getCurrentTime(),
      currentBeat: this.getCurrentBeat(),
      audioContextState: ctx ? ctx.state : 'unavailable',
      mode: isAudioRunning ? 'web-audio-hardware-clock' : 'monotonic-performance-fallback',
    };
  }
}

export const sharedAudioTransport = new HybridAudioTransport({ bpm: 128 });

if (typeof window !== 'undefined') {
  window.HybridAudioTransport = HybridAudioTransport;
  window.sharedAudioTransport = sharedAudioTransport;
  bindUserGestureAudioUnlock();
}

export default {
  getAudioContext,
  getMasterGain,
  ensureAudioUnlocked,
  playSynthChime,
  HybridAudioTransport,
  sharedAudioTransport,
};
