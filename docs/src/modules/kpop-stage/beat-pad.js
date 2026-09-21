/**
 * @fileoverview 16-Pad (4x4) Beat Pad & Song Remix Studio Controller for
 * Milestone M4 (Requirement R3: K-Pop Demon Hunters Rhythm & Remix Stage).
 *
 * Features:
 *  - 16-pad (4x4) loop/drum/synth/SFX matrix (`beatpad-cell-0..15`)
 *  - BPM tempo slider (`90..160` BPM, `beatpad-bpm-slider`)
 *  - Live timestamped event recorder (`beatpad-record-btn`)
 *  - Deterministic performance replayer (`beatpad-replay-btn`)
 *  - Gallery persistence (`beatpad-save-btn`) writing to `CheerUpStore`
 *    and canonical `localStorage` key `'cheerup_v1_saved_remixes'`
 */

import { BEAT_PAD_CELLS } from './songs.js';

export const REMIXES_STORAGE_KEY = 'cheerup_v1_saved_remixes';

/**
 * Interactive 16-Pad Beat Pad & Song Remix Studio.
 */
export class KpopBeatPadStudio {
  /**
   * @param {Object} options
   * @param {import('./synth-engine.js').KpopSynthEngine} options.synthEngine
   * @param {Object} [options.store]
   * @param {Object} [options.domRefs]
   */
  constructor({ synthEngine, store, domRefs }) {
    this.synthEngine = synthEngine;
    this.store = store || null;
    this.domRefs = domRefs || {};

    this.bpm = 128;
    this.isRecording = false;
    this.isReplaying = false;
    this.recordStartTimeMs = 0;
    /** @type {number[]} */
    this.initialActivePads = [];
    /** @type {Array<Object>} */
    this.recordedEvents = [];
    /** @type {number[]} */
    this.replayTimeoutIds = [];
    this.savedRemixCount = 0;
  }

  /**
   * Toggles a Beat Pad cell (0..15), triggers its synthesized audio voice,
   * updates UI state, and logs a `RemixEvent` if recording is active.
   * @param {number} padIndex
   * @returns {boolean} New active state of the pad.
   */
  togglePad(padIndex) {
    const idx = Number(padIndex);
    if (idx < 0 || idx > 15) return false;

    const isActive = this.synthEngine.toggleBeatPadActive(idx);
    const cell = BEAT_PAD_CELLS[idx];

    if (this.isRecording) {
      const elapsedMs = Math.max(0, Math.round(performance.now() - this.recordStartTimeMs));
      const action =
        cell && cell.mode === 'oneshot'
          ? 'oneshot_trigger'
          : isActive
            ? 'loop_on'
            : 'loop_off';

      this.recordedEvents.push({
        t: elapsedMs,
        timestampMs: elapsedMs,
        pad: idx,
        padIndex: idx,
        padId: cell ? cell.padId : `pad-${idx}`,
        action,
        bpm: this.bpm,
      });
    }

    this._syncPadDomState(idx, isActive);
    this._syncStatusDisplay();
    return isActive;
  }

  /**
   * Sets Beat Pad BPM (clamped to `90..160`).
   * @param {number} bpm
   */
  setBpm(bpm) {
    const clamped = Math.max(90, Math.min(160, Math.round(Number(bpm) || 128)));
    this.bpm = clamped;
    this.synthEngine.setBeatPadBpm(clamped);
    if (this.domRefs.bpmSlider && Number(this.domRefs.bpmSlider.value) !== clamped) {
      this.domRefs.bpmSlider.value = String(clamped);
    }
    if (this.domRefs.bpmValue) {
      this.domRefs.bpmValue.textContent = `${clamped} BPM`;
    }
  }

  /**
   * Toggles live event recording on/off.
   * @returns {boolean} New `isRecording` state.
   */
  toggleRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this._syncStatusDisplay();
      return false;
    }

    this.stopReplay();
    this.isRecording = true;
    this.recordStartTimeMs = performance.now();
    this.initialActivePads = Array.from(this.synthEngine.activeBeatPads).sort((a, b) => a - b);
    this.recordedEvents = [];
    this._syncStatusDisplay();
    return true;
  }

  /**
   * Deterministically replays the most recently recorded Beat Pad sequence.
   */
  startReplay() {
    this.stopReplay();
    if (this.isRecording) {
      this.isRecording = false;
    }
    this.isReplaying = true;

    // Reset active pads to the snapshot at recording start
    this.synthEngine.activeBeatPads.clear();
    for (let i = 0; i < 16; i++) {
      const shouldBeActive = this.initialActivePads.includes(i);
      if (shouldBeActive) {
        this.synthEngine.activeBeatPads.add(i);
      }
      this._syncPadDomState(i, shouldBeActive);
    }

    // Schedule recorded pad events
    let maxTimeMs = 400;
    for (const ev of this.recordedEvents) {
      const delayMs = Math.max(0, ev.timestampMs ?? ev.t ?? 0);
      if (delayMs > maxTimeMs) maxTimeMs = delayMs;
      const tid = window.setTimeout(() => {
        if (!this.isReplaying) return;
        this.synthEngine.toggleBeatPadActive(ev.padIndex ?? ev.pad);
        const activeNow = this.synthEngine.activeBeatPads.has(ev.padIndex ?? ev.pad);
        this._syncPadDomState(ev.padIndex ?? ev.pad, activeNow);
      }, delayMs);
      this.replayTimeoutIds.push(tid);
    }

    const endTid = window.setTimeout(() => {
      this.isReplaying = false;
      this._syncStatusDisplay();
    }, maxTimeMs + 250);
    this.replayTimeoutIds.push(endTid);

    this._syncStatusDisplay();
  }

  /**
   * Stops any in-progress replay timers.
   */
  stopReplay() {
    this.isReplaying = false;
    for (const tid of this.replayTimeoutIds) {
      clearTimeout(tid);
    }
    this.replayTimeoutIds = [];
  }

  /**
   * Saves the current Beat Pad remix configuration & recorded event sequence to
   * `CheerUpStore` and `localStorage` so it persists across page reloads and
   * appears in the My Creations Gallery.
   *
   * @param {string} [customTitle]
   * @returns {Object} The saved remix record.
   */
  saveRemixToGallery(customTitle) {
    this.savedRemixCount += 1;
    const nowIso = new Date().toISOString();
    const activeLoops = Array.from(this.synthEngine.activeBeatPads).sort((a, b) => a - b);
    const title =
      (customTitle && String(customTitle).trim()) ||
      `HUNTR/X Starlight Remix #${this.savedRemixCount} (${this.bpm} BPM)`;

    const savedRemix = {
      id: `remix_${Date.now()}_${this.savedRemixCount}`,
      title,
      createdAt: nowIso,
      baseTrackId: this.synthEngine.activeSongId || 'golden',
      bpm: this.bpm,
      durationMs:
        this.recordedEvents.length > 0
          ? this.recordedEvents[this.recordedEvents.length - 1].timestampMs + 500
          : 4000,
      activeLoops,
      initialActivePads: [...this.initialActivePads],
      events: this.recordedEvents.map((e) => ({ ...e })),
      stemVolumes: {
        drums: this.synthEngine.stemVolumes.drums,
        bass: this.synthEngine.stemVolumes.bass,
        chords: this.synthEngine.stemVolumes.chords,
        sfx: this.synthEngine.stemVolumes.sfx,
      },
    };

    // Persist directly to canonical localStorage key (`cheerup_v1_saved_remixes`)
    try {
      const existingRaw = localStorage.getItem(REMIXES_STORAGE_KEY);
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const nextList = Array.isArray(existingList) ? existingList : [];
      nextList.unshift(savedRemix);
      localStorage.setItem(REMIXES_STORAGE_KEY, JSON.stringify(nextList));
    } catch (_e) {
      // Ignore storage quota errors in restricted sandboxes
    }

    // Also notify passed store instance if it provides helper methods
    if (this.store) {
      if (typeof this.store.saveRemix === 'function') {
        this.store.saveRemix(savedRemix);
      } else if (typeof this.store.addRemix === 'function') {
        this.store.addRemix(savedRemix);
      }
    }

    // Broadcast custom DOM event for live gallery synchronization
    window.dispatchEvent(
      new CustomEvent('cheerup:remix-saved', { detail: savedRemix })
    );

    if (this.domRefs.statusText) {
      this.domRefs.statusText.textContent = `Saved "${savedRemix.title}" to Gallery!`;
    }

    return savedRemix;
  }

  /**
   * Updates the DOM styling & `aria-pressed` attribute of a pad button.
   * @param {number} padIndex
   * @param {boolean} isActive
   */
  _syncPadDomState(padIndex, isActive) {
    const padBtn = this.domRefs.padButtons && this.domRefs.padButtons[padIndex];
    if (!padBtn) return;
    padBtn.classList.toggle('is-active', isActive);
    padBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    padBtn.dataset.active = isActive ? 'true' : 'false';
  }

  /**
   * Updates Beat Pad status badge and Record/Replay button labels.
   */
  _syncStatusDisplay() {
    if (this.domRefs.recordBtn) {
      this.domRefs.recordBtn.textContent = this.isRecording
        ? '⏹ Stop Recording'
        : '⏺ Record Remix';
      this.domRefs.recordBtn.classList.toggle('is-recording', this.isRecording);
    }
    if (this.domRefs.replayBtn) {
      this.domRefs.replayBtn.textContent = this.isReplaying
        ? '🔊 Replaying...'
        : '▶ Replay Take';
    }
    if (this.domRefs.statusText) {
      const activeCount = this.synthEngine.activeBeatPads.size;
      const recStatus = this.isRecording
        ? `RECORDING (${this.recordedEvents.length} events)`
        : this.isReplaying
          ? 'REPLAYING MIX'
          : 'READY';
      this.domRefs.statusText.textContent = `${recStatus} • Active Pads: ${activeCount} • Events: ${this.recordedEvents.length}`;
    }
  }

  /**
   * Returns complete snapshot of the Beat Pad state (supporting both `PROJECT.md § 5.3`
   * and `analysis.md § 5.2` property names).
   * @returns {{
   *   activePads: number[],
   *   activePadIndices: number[],
   *   bpm: number,
   *   isRecording: boolean,
   *   isReplaying: boolean,
   *   recordedEventsCount: number
   * }}
   */
  getState() {
    const active = Array.from(this.synthEngine.activeBeatPads).sort((a, b) => a - b);
    return {
      activePads: active,
      activePadIndices: active,
      bpm: this.bpm,
      isRecording: this.isRecording,
      isReplaying: this.isReplaying,
      recordedEventsCount: this.recordedEvents.length,
    };
  }
}
