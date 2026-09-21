/**
 * @fileoverview 4-Lane Falling-Note Rhythm Game Engine & 2D Canvas Stage
 * Renderer for Milestone M4 (Requirement R3: K-Pop Demon Hunters Stage).
 *
 * Features:
 *  - Deterministic beatmap synchronization via `HybridAudioTransport`
 *  - Multi-device input handling (`KeyD`/`KeyF`/`KeyJ`/`KeyK`, Arrow keys,
 *    and zero-latency `pointerdown` iPad/touch lane buttons)
 *  - Precision hit windows:
 *      PERFECT: |dt| <= 45ms  (1000 pts)
 *      GREAT:   |dt| <= 90ms  (700 pts)
 *      GOOD:    |dt| <= 135ms (400 pts)
 *      MISS:    dt > +135ms   (0 pts, combo reset)
 *  - Combo multiplier tiers (`1x`, `2x`, `4x`, `8x FEVER`) + star note 1.5x bonus
 *  - Synchronized lyric/chant callout banner & stage pyrotechnics particle engine
 */

import { KPOP_SONGS, RHYTHM_LANES, createSongBeatmap } from './songs.js';

export const APPROACH_TIME_SEC = 1.6;
export const HIT_WINDOWS_SEC = {
  PERFECT: 0.045,
  GREAT: 0.090,
  GOOD: 0.135,
};

/**
 * Computes combo multiplier tier (`1x`, `2x`, `4x`, `8x`).
 * @param {number} combo
 * @returns {number}
 */
export function getComboMultiplier(combo) {
  if (combo >= 50) return 8;
  if (combo >= 25) return 4;
  if (combo >= 10) return 2;
  return 1;
}

/**
 * 4-Lane Falling-Note Rhythm Game Controller.
 */
export class KpopRhythmGame {
  /**
   * @param {Object} options
   * @param {import('./synth-engine.js').KpopSynthEngine} options.synthEngine
   * @param {HTMLCanvasElement} options.canvas
   * @param {Object} options.domRefs
   * @param {Function} [options.onHighScoreUpdate]
   */
  constructor({ synthEngine, canvas, domRefs, onHighScoreUpdate }) {
    this.synthEngine = synthEngine;
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.domRefs = domRefs || {};
    this.onHighScoreUpdate = onHighScoreUpdate || (() => {});

    this.songId = 'golden';
    this.isPlaying = false;
    this.notes = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.multiplier = 1;
    this.lastJudgement = 'READY';
    this.currentLyric = KPOP_SONGS.golden.lyrics[0].text;

    /** @type {Record<'PERFECT'|'GREAT'|'GOOD'|'MISS', number>} */
    this.judgements = {
      PERFECT: 0,
      GREAT: 0,
      GOOD: 0,
      MISS: 0,
    };

    /** @type {Array<{x: number, y: number, vx: number, vy: number, color: string, life: number, maxLife: number, size: number}>} */
    this.particles = [];
    /** @type {number[]} */
    this.laneFlashTimers = [0, 0, 0, 0];
    this.stageFlashAlpha = 0;
    this.animFrameId = null;

    this._boundKeyDown = this._handleKeyDown.bind(this);
    window.addEventListener('keydown', this._boundKeyDown);

    // Pre-load initial beatmap so canvas renders stage & preview notes immediately
    this.loadSong('golden');
    this.renderFrame();
  }

  /**
   * Loads beatmap and stage metadata for `songId` without starting playback.
   * @param {string} songId
   */
  loadSong(songId) {
    const song = KPOP_SONGS[songId] || KPOP_SONGS.golden;
    this.songId = song.id;
    this.notes = createSongBeatmap(song.id);
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.multiplier = 1;
    this.lastJudgement = 'READY';
    this.currentLyric = song.lyrics[0]?.text || '';
    this.judgements = { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 };
    this.particles = [];
    this.laneFlashTimers = [0, 0, 0, 0];
    this._syncDomDisplays();
    this.renderFrame();
  }

  /**
   * Starts the 4-lane rhythm game and synchronized multi-track synthesizer for `songId`.
   * @param {string} [songId]
   */
  start(songId) {
    const targetId = songId || this.songId || 'golden';
    this.stop();
    this.loadSong(targetId);
    this.isPlaying = true;
    this.synthEngine.startSong(targetId);
    this._syncDomDisplays();
    this._startRenderLoop();
  }

  /**
   * Stops active rhythm game session.
   */
  stop() {
    this.isPlaying = false;
    this.synthEngine.stopSong();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this._syncDomDisplays();
    this.renderFrame();
  }

  /**
   * Advances transport & game logic deterministically by `deltaSec` seconds.
   * Used by automated tests (`window.__CHEER_UP_R3_TEST_API__.stepRhythmTime`).
   * @param {number} deltaSec
   * @returns {Object} Current rhythm state after stepping.
   */
  stepTime(deltaSec) {
    const nextTime = this.synthEngine.transport.stepTime(deltaSec);
    this.updateLogic(nextTime);
    this.renderFrame();
    return this.getState();
  }

  /**
   * Sets transport clock to an exact deterministic timestamp in seconds.
   * @param {number} timeSec
   */
  setTransportTimeSec(timeSec) {
    this.synthEngine.transport.setDeterministicTestTimeSec(timeSec);
    this.updateLogic(timeSec);
    this.renderFrame();
  }

  /**
   * Evaluates missed notes, scheduled lyric callouts, and song completion at `currentTimeSec`.
   * @param {number} [explicitTimeSec]
   */
  updateLogic(explicitTimeSec) {
    const currentTimeSec =
      typeof explicitTimeSec === 'number'
        ? explicitTimeSec
        : this.synthEngine.transport.getCurrentTimeSec();

    const song = KPOP_SONGS[this.songId] || KPOP_SONGS.golden;

    // Update synchronized lyric callout banner based on timeline
    let latestLyric = song.lyrics[0]?.text || '';
    for (const entry of song.lyrics) {
      if (currentTimeSec >= entry.timeSec) {
        latestLyric = entry.text;
      }
    }
    if (latestLyric && latestLyric !== this.currentLyric) {
      this.currentLyric = latestLyric;
    }

    // Check for unhit notes that passed the +135ms miss window
    let stateChanged = false;
    for (const note of this.notes) {
      if (note.state === 'pending' && currentTimeSec - note.hitTimeSec > HIT_WINDOWS_SEC.GOOD) {
        note.state = 'missed';
        note.judgement = 'MISS';
        this.judgements.MISS += 1;
        this.combo = 0;
        this.multiplier = 1;
        this.lastJudgement = 'MISS';
        stateChanged = true;
      }
    }

    // Decay visual timers & particles
    for (let i = 0; i < 4; i++) {
      if (this.laneFlashTimers[i] > 0) {
        this.laneFlashTimers[i] = Math.max(0, this.laneFlashTimers[i] - 0.05);
      }
    }
    if (this.stageFlashAlpha > 0) {
      this.stageFlashAlpha = Math.max(0, this.stageFlashAlpha - 0.04);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.life -= 1;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (stateChanged) {
      this._syncDomDisplays();
    } else if (this.domRefs.lyricCallout && this.domRefs.lyricCallout.textContent !== this.currentLyric) {
      this.domRefs.lyricCallout.textContent = this.currentLyric;
    }
  }

  /**
   * Processes a player input on `laneIndex` (0..3) at the current transport timestamp.
   * @param {number} laneIndex
   * @returns {'PERFECT'|'GREAT'|'GOOD'|'MISS'|null}
   */
  triggerLaneInput(laneIndex) {
    const lane = Number(laneIndex);
    if (lane < 0 || lane > 3) return null;

    this.laneFlashTimers[lane] = 1.0;

    const currentTimeSec = this.synthEngine.transport.getCurrentTimeSec();

    // Find the earliest pending note in this lane within the active hit window (±135ms)
    let bestNote = null;
    let bestAbsDiff = Infinity;

    for (const note of this.notes) {
      if (note.lane !== lane || note.state !== 'pending') continue;
      const absDiff = Math.abs(currentTimeSec - note.hitTimeSec);
      if (absDiff <= HIT_WINDOWS_SEC.GOOD && absDiff < bestAbsDiff) {
        bestAbsDiff = absDiff;
        bestNote = note;
      }
    }

    if (!bestNote) {
      return null;
    }

    /** @type {'PERFECT'|'GREAT'|'GOOD'} */
    let judgement = 'GOOD';
    let basePoints = 400;

    if (bestAbsDiff <= HIT_WINDOWS_SEC.PERFECT) {
      judgement = 'PERFECT';
      basePoints = 1000;
    } else if (bestAbsDiff <= HIT_WINDOWS_SEC.GREAT) {
      judgement = 'GREAT';
      basePoints = 700;
    }

    bestNote.state = 'hit';
    bestNote.judgement = judgement;
    this.judgements[judgement] += 1;
    this.combo += 1;
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    this.multiplier = getComboMultiplier(this.combo);
    const starBonus = bestNote.type === 'star_note' ? 1.5 : 1.0;
    const gained = Math.round(basePoints * this.multiplier * starBonus);
    this.score += gained;
    this.lastJudgement = judgement;

    if (bestNote.lyricCallout) {
      this.currentLyric = bestNote.lyricCallout;
    }

    // Play audio hit chime and spawn stage pyrotechnics particles
    this.synthEngine.playRhythmHitSound(lane, judgement);
    this._spawnHitPyrotechnics(lane, judgement, bestNote.type === 'star_note');

    // Notify high score listener
    this.onHighScoreUpdate(this.songId, this.score);

    this._syncDomDisplays();
    this.renderFrame();
    return judgement;
  }

  /**
   * Handles desktop keyboard events (`KeyD`, `KeyF`, `KeyJ`, `KeyK`, and Arrow keys).
   * @param {KeyboardEvent} event
   */
  _handleKeyDown(event) {
    if (event.repeat) return;
    // Ignore typing inside input/textarea fields
    const tag = event.target && event.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    for (const laneCfg of RHYTHM_LANES) {
      if (laneCfg.keyCodes.includes(event.code)) {
        this.triggerLaneInput(laneCfg.index);
        break;
      }
    }
  }

  /**
   * Spawns glowing stage pyrotechnics particles at the receptor line for `laneIndex`.
   * @param {number} laneIndex
   * @param {string} judgement
   * @param {boolean} isStarNote
   */
  _spawnHitPyrotechnics(laneIndex, judgement, isStarNote) {
    if (!this.canvas) return;
    const width = this.canvas.width || 640;
    const height = this.canvas.height || 420;
    const laneWidth = width / 4;
    const cx = laneIndex * laneWidth + laneWidth / 2;
    const cy = height - 62;
    const laneColor = RHYTHM_LANES[laneIndex]?.color || '#FFD166';
    const count = isStarNote ? 28 : judgement === 'PERFECT' ? 20 : 12;

    if (isStarNote || judgement === 'PERFECT') {
      this.stageFlashAlpha = 0.45;
    }

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2.2 + (i % 5) * 1.1;
      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        color: i % 2 === 0 ? laneColor : '#FFFFFF',
        life: 24 + (i % 10),
        maxLife: 34,
        size: isStarNote ? 5.5 : 4.0,
      });
    }
  }

  /**
   * Updates all DOM counter badges (`rhythm-score`, `rhythm-combo`, `rhythm-judgement`, `rhythm-lyric-callout`).
   */
  _syncDomDisplays() {
    if (this.domRefs.score) {
      this.domRefs.score.textContent = String(this.score);
    }
    if (this.domRefs.combo) {
      const feverTag = this.multiplier >= 8 ? ' (8x FEVER!)' : ` (${this.multiplier}x)`;
      this.domRefs.combo.textContent = `${this.combo}${feverTag}`;
    }
    if (this.domRefs.judgement) {
      this.domRefs.judgement.textContent = this.lastJudgement;
    }
    if (this.domRefs.lyricCallout) {
      this.domRefs.lyricCallout.textContent = this.currentLyric;
    }
  }

  /**
   * Starts the `requestAnimationFrame` visual & transport loop.
   */
  _startRenderLoop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    const loop = () => {
      if (!this.isPlaying) return;
      this.updateLogic();
      this.renderFrame();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Renders the complete K-Pop Demon Hunters concert stage, real-time audio spectrum
   * visualizer, 4 note highways, judgement line, falling notes, and pyrotechnics.
   */
  renderFrame() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const width = this.canvas.width || 640;
    const height = this.canvas.height || 420;
    const song = KPOP_SONGS[this.songId] || KPOP_SONGS.golden;
    const currentTimeSec = this.synthEngine.transport.getCurrentTimeSec();

    // 1. Concert Stage Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0E0725');
    bgGrad.addColorStop(0.55, '#1B0E3B');
    bgGrad.addColorStop(1, '#261147');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Real-Time Audio Spectrum Visualizer Backdrop
    const spectrum = this.synthEngine.getVisualizerSpectrum();
    const barWidth = width / spectrum.length;
    ctx.save();
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < spectrum.length; i++) {
      const barHeight = (spectrum[i] / 255) * (height * 0.45);
      ctx.fillStyle = i % 2 === 0 ? song.themeColors.primary : song.themeColors.secondary;
      ctx.fillRect(i * barWidth + 2, height - barHeight - 62, barWidth - 4, barHeight);
    }
    ctx.restore();

    // Stage flash overlay on PERFECT / star notes
    if (this.stageFlashAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.stageFlashAlpha;
      ctx.fillStyle = song.themeColors.primary;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // 3. Render 4 Glowing Note Lanes & Receptors
    const laneWidth = width / 4;
    const receptorY = height - 62;

    for (let i = 0; i < 4; i++) {
      const laneCfg = RHYTHM_LANES[i];
      const lx = i * laneWidth;

      // Lane vertical separator & subtle lane tint
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(lx, 0, laneWidth, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, height);
      ctx.stroke();

      // Active lane flash beam when pressed
      if (this.laneFlashTimers[i] > 0) {
        ctx.save();
        ctx.globalAlpha = this.laneFlashTimers[i] * 0.45;
        const beamGrad = ctx.createLinearGradient(0, receptorY, 0, 0);
        beamGrad.addColorStop(0, laneCfg.color);
        beamGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(lx + 4, 0, laneWidth - 8, receptorY);
        ctx.restore();
      }

      // Receptor target pad
      ctx.save();
      ctx.strokeStyle = laneCfg.color;
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(15, 10, 35, 0.85)';
      ctx.beginPath();
      ctx.roundRect(lx + 14, receptorY - 14, laneWidth - 28, 28, 8);
      ctx.fill();
      ctx.stroke();

      // Key badge & member label inside receptor
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${laneCfg.keyLabel} • ${laneCfg.memberName}`, lx + laneWidth / 2, receptorY + 5);
      ctx.restore();
    }

    // 4. Render Falling Notes within [currentTimeSec, currentTimeSec + APPROACH_TIME_SEC]
    for (const note of this.notes) {
      if (note.state !== 'pending') continue;
      const timeUntilHit = note.hitTimeSec - currentTimeSec;
      if (timeUntilHit > APPROACH_TIME_SEC || timeUntilHit < -HIT_WINDOWS_SEC.GOOD) {
        continue;
      }

      const yNorm = 1.0 - timeUntilHit / APPROACH_TIME_SEC;
      const ny = yNorm * receptorY;
      const lx = note.lane * laneWidth;
      const laneCfg = RHYTHM_LANES[note.lane];

      ctx.save();
      ctx.fillStyle = note.type === 'star_note' ? '#FFD166' : laneCfg.color;
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = note.type === 'star_note' ? 3 : 2;

      ctx.beginPath();
      ctx.roundRect(lx + 18, ny - 12, laneWidth - 36, 24, 7);
      ctx.fill();
      ctx.stroke();

      if (note.type === 'star_note') {
        ctx.fillStyle = '#1B0E3B';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ STAR', lx + laneWidth / 2, ny + 4);
      }
      ctx.restore();
    }

    // 5. Render Stage Pyrotechnics Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Top Stage HUD Overlay (Song title + Judgement banner)
    ctx.save();
    ctx.fillStyle = 'rgba(10, 6, 28, 0.72)';
    ctx.fillRect(0, 0, width, 36);
    ctx.fillStyle = song.themeColors.primary;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🎵 ${song.title} — ${song.artist} (${song.bpm} BPM)`, 12, 23);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(
      `SCORE: ${this.score}  |  COMBO: ${this.combo} (${this.multiplier}x)`,
      width - 12,
      23
    );
    ctx.restore();
  }

  /**
   * Returns complete snapshot of the Rhythm Game state (matching both `PROJECT.md § 5.3`
   * and `analysis.md § 5.2` property contracts).
   * @returns {Object}
   */
  getState() {
    const currentTimeSec = this.synthEngine.transport.getCurrentTimeSec();
    const visibleNotes = this.notes.filter((n) => {
      if (n.state !== 'pending') return false;
      const dt = n.hitTimeSec - currentTimeSec;
      return dt <= APPROACH_TIME_SEC && dt >= -HIT_WINDOWS_SEC.GOOD;
    });

    return {
      isPlaying: this.isPlaying,
      songId: this.songId,
      currentTimeSec,
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      multiplier: this.multiplier,
      judgements: { ...this.judgements },
      activeNotesCount: visibleNotes.length,
      visibleNotesCount: visibleNotes.length,
      currentLyric: this.currentLyric,
      currentLyricCallout: this.currentLyric,
    };
  }

  /**
   * Cleans up event listeners and timers.
   */
  destroy() {
    this.stop();
    window.removeEventListener('keydown', this._boundKeyDown);
  }
}
