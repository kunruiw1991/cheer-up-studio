/**
 * @fileoverview Main Entry Point for Milestone M4 (Requirement R3):
 * K-Pop Demon Hunters (HUNTR/X & Saja Boys) Rhythm & Remix Stage.
 *
 * Exports:
 *   - `initKpopStage(container, store)` (Named & Default Export)
 *
 * Registers:
 *   - `window.__CHEER_UP_R3_TEST_API__` per `PROJECT.md § 5.3` & `analysis.md § 5.2`.
 */

import { KPOP_SONGS, RHYTHM_LANES, BEAT_PAD_CELLS } from './songs.js';
import { KpopSynthEngine } from './synth-engine.js';
import { KpopRhythmGame } from './rhythm-game.js';
import { KpopBeatPadStudio } from './beat-pad.js';

const HIGH_SCORES_STORAGE_KEY = 'cheerup_v1_high_scores';

/**
 * Injects responsive concert-stage styling once into `document.head`.
 */
function ensureKpopStageStyles() {
  if (document.getElementById('kpop-stage-module-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'kpop-stage-module-styles';
  styleEl.textContent = `
    .kpop-stage-root {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #F8F7FF;
      background: linear-gradient(145deg, #0D0620 0%, #1B0C38 55%, #120829 100%);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
      border: 1px solid rgba(255, 209, 102, 0.25);
    }
    .kpop-stage-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
    }
    .kpop-stage-title {
      margin: 0;
      font-size: 1.45rem;
      background: linear-gradient(90deg, #FFD166, #FF2E93, #00F5D4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
      letter-spacing: 0.4px;
    }
    .kpop-stage-subtitle {
      margin: 4px 0 0;
      font-size: 0.88rem;
      color: #C7B9FF;
    }
    .kpop-song-selector {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }
    .kpop-song-card {
      background: rgba(255, 255, 255, 0.06);
      border: 2px solid rgba(255, 255, 255, 0.15);
      border-radius: 14px;
      padding: 12px 14px;
      color: #FFFFFF;
      text-align: left;
      cursor: pointer;
      transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .kpop-song-card:hover {
      transform: translateY(-2px);
      border-color: #FFD166;
    }
    .kpop-song-card.is-selected {
      background: rgba(255, 46, 147, 0.18);
      border-color: #FFD166;
      box-shadow: 0 0 18px rgba(255, 209, 102, 0.35);
    }
    .kpop-song-card-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: #FFD166;
    }
    .kpop-song-card-meta {
      font-size: 0.8rem;
      color: #E0D7FF;
      margin-top: 3px;
    }
    .kpop-stage-grid {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 980px) {
      .kpop-stage-grid {
        grid-template-columns: 1fr;
      }
    }
    .kpop-panel {
      background: rgba(16, 8, 38, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 16px;
      padding: 16px;
    }
    .kpop-lyric-banner {
      background: linear-gradient(90deg, rgba(255, 46, 147, 0.25), rgba(155, 93, 229, 0.28));
      border: 1px solid rgba(255, 209, 102, 0.45);
      border-radius: 10px;
      padding: 9px 12px;
      text-align: center;
      font-weight: 800;
      font-size: 0.96rem;
      color: #FFD166;
      margin-bottom: 12px;
      min-height: 22px;
      letter-spacing: 0.3px;
    }
    .kpop-hud-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .kpop-stat-pill {
      background: rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .kpop-stat-pill strong {
      color: #00F5D4;
      font-size: 1rem;
    }
    .kpop-action-btn {
      border: none;
      border-radius: 10px;
      padding: 9px 16px;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      color: #120829;
      background: linear-gradient(90deg, #FFD166, #FF9F1C);
      transition: transform 0.12s ease, opacity 0.12s ease;
    }
    .kpop-action-btn:hover {
      transform: scale(1.03);
    }
    .kpop-action-btn.secondary {
      background: rgba(255, 255, 255, 0.14);
      color: #FFFFFF;
    }
    .kpop-canvas-wrap {
      width: 100%;
      overflow: hidden;
      border-radius: 12px;
      border: 2px solid rgba(255, 255, 255, 0.18);
      background: #0D0620;
    }
    .kpop-canvas-wrap canvas {
      display: block;
      width: 100%;
      height: auto;
    }
    .kpop-lane-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .kpop-lane-btn {
      touch-action: manipulation;
      user-select: none;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 12px;
      padding: 14px 6px;
      font-weight: 800;
      font-size: 0.9rem;
      color: #FFFFFF;
      cursor: pointer;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      transition: transform 0.08s ease;
    }
    .kpop-lane-btn:active {
      transform: scale(0.95);
    }
    .kpop-beatpad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 14px 0;
    }
    .kpop-beatpad-cell {
      touch-action: manipulation;
      user-select: none;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 12px 6px;
      background: rgba(255, 255, 255, 0.06);
      color: #FFFFFF;
      cursor: pointer;
      text-align: center;
      font-weight: 700;
      font-size: 0.78rem;
      transition: all 0.12s ease;
    }
    .kpop-beatpad-cell.is-active {
      background: linear-gradient(135deg, rgba(255, 46, 147, 0.55), rgba(0, 245, 212, 0.45));
      border-color: #FFD166;
      box-shadow: 0 0 14px rgba(0, 245, 212, 0.5);
      transform: translateY(-2px);
    }
    .kpop-beatpad-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-top: 10px;
    }
    .kpop-stem-mixer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.12);
    }
    .kpop-stem-slider-box {
      font-size: 0.75rem;
      color: #D2C7FF;
    }
    .kpop-stem-slider-box input[type="range"] {
      width: 100%;
    }
  `;
  document.head.appendChild(styleEl);
}

/**
 * Updates high score in `localStorage` and `store` for the given song.
 * @param {string} songId
 * @param {number} score
 * @param {Object} [store]
 */
function persistRhythmHighScore(songId, score, store) {
  const keyMap = {
    golden: 'rhythmGolden',
    takedown: 'rhythmTakedown',
    soda_pop: 'rhythmSodaPop',
  };
  const field = keyMap[songId] || 'rhythmGolden';

  try {
    const raw = localStorage.getItem(HIGH_SCORES_STORAGE_KEY);
    const parsed = raw
      ? JSON.parse(raw)
      : { rooftopDash: 0, rhythmGolden: 0, rhythmTakedown: 0, rhythmSodaPop: 0 };
    if (score > (parsed[field] || 0)) {
      parsed[field] = score;
      localStorage.setItem(HIGH_SCORES_STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch (_e) {
    // Ignore storage errors
  }

  if (store && typeof store.updateHighScore === 'function') {
    store.updateHighScore(field, score);
  }
}

/**
 * Initializes the complete K-Pop Demon Hunters Rhythm & Remix Stage inside `container`.
 *
 * @param {HTMLElement} container DOM element (`#view-kpop-stage`)
 * @param {Object} [store] Global store instance (`window.CheerUpStore`)
 * @returns {Object} Public stage controller & test API handle.
 */
export function initKpopStage(container, store = null) {
  if (!container) {
    throw new Error('initKpopStage requires a valid container HTMLElement.');
  }

  ensureKpopStageStyles();
  const activeStore = store || window.CheerUpStore || null;
  const synthEngine = new KpopSynthEngine();

  // Build Stage HTML Layout with all Canonical `data-testid` Selectors
  container.innerHTML = `
    <div class="kpop-stage-root">
      <div class="kpop-stage-header">
        <div>
          <h2 class="kpop-stage-title">🎤 K-Pop Demon Hunters: Rhythm & Remix Stage</h2>
          <p class="kpop-stage-subtitle">
            HUNTR/X (Rumi • Mira • Zoey) &amp; Saja Boys — Procedural 6-Stem Web Audio Synthesizer &amp; 4-Lane Stage
          </p>
        </div>
        <div class="kpop-stat-pill" id="kpop-audio-status-badge">
          🎹 Synth Engine: <strong>6-Stem Ready</strong>
        </div>
      </div>

      <!-- Featured Multi-Track Song Selector -->
      <div class="kpop-song-selector" role="region" aria-label="Featured K-Pop Demon Hunters Tracks">
        <button
          type="button"
          class="kpop-song-card is-selected"
          data-testid="kpop-song-select-golden"
          data-song-id="golden"
        >
          <div class="kpop-song-card-title">✨ "Golden" — HUNTR/X</div>
          <div class="kpop-song-card-meta">128 BPM • D Major • Uplifting Power-Pop Anthem</div>
        </button>

        <button
          type="button"
          class="kpop-song-card"
          data-testid="kpop-song-select-takedown"
          data-song-id="takedown"
        >
          <div class="kpop-song-card-title">⚔️ "Takedown" — HUNTR/X Battle</div>
          <div class="kpop-song-card-meta">145 BPM • E Phrygian Dominant • Demon-Hunter Drop</div>
        </button>

        <button
          type="button"
          class="kpop-song-card"
          data-testid="kpop-song-select-soda_pop"
          data-song-id="soda_pop"
        >
          <div class="kpop-song-card-title">🥤 "Soda Pop" — Saja Boys</div>
          <div class="kpop-song-card-meta">118 BPM • F Major • Fizzy K-Pop Nu-Disco Groove</div>
        </button>
      </div>

      <div class="kpop-stage-grid">
        <!-- LEFT PANEL: 4-Lane Falling-Note Rhythm Game -->
        <section class="kpop-panel" aria-label="Falling-Note Rhythm Game">
          <div class="kpop-lyric-banner" data-testid="rhythm-lyric-callout">
            ✨ HUNTR/X ON STAGE — RUMI • MIRA • ZOEY! ✨
          </div>

          <div class="kpop-hud-bar">
            <div class="kpop-stat-pill">
              Score: <strong data-testid="rhythm-score">0</strong>
            </div>
            <div class="kpop-stat-pill">
              Combo: <strong data-testid="rhythm-combo">0 (1x)</strong>
            </div>
            <div class="kpop-stat-pill">
              Judgement: <strong data-testid="rhythm-judgement">READY</strong>
            </div>
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="kpop-action-btn"
                data-testid="rhythm-start-btn"
              >
                ▶ Start Show
              </button>
              <button
                type="button"
                class="kpop-action-btn secondary"
                data-testid="rhythm-stop-btn"
              >
                ⏹ Stop
              </button>
            </div>
          </div>

          <div class="kpop-canvas-wrap">
            <canvas
              data-testid="rhythm-game-canvas"
              width="640"
              height="420"
            ></canvas>
          </div>

          <!-- iPad / Touch & Click 4-Lane Trigger Pads -->
          <div class="kpop-lane-buttons" role="group" aria-label="Rhythm Game Lane Controls">
            ${RHYTHM_LANES.map(
              (lane) => `
              <button
                type="button"
                class="kpop-lane-btn"
                data-testid="rhythm-lane-btn-${lane.index}"
                data-lane="${lane.index}"
                style="background: linear-gradient(180deg, ${lane.color}CC, ${lane.color}66);"
              >
                <div>[${lane.keyLabel}]</div>
                <div style="font-size: 0.75rem; opacity: 0.92;">${lane.memberName}</div>
              </button>
            `
            ).join('')}
          </div>

          <!-- 6-Stem Multi-Track Volume Mixer -->
          <div class="kpop-stem-mixer" aria-label="6-Stem Synthesizer Mixer">
            ${['drums', 'bass', 'chords', 'lead', 'vocalHook', 'sfx']
              .map(
                (stem) => `
              <label class="kpop-stem-slider-box">
                <span>${stem.toUpperCase()}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value="85"
                  data-stem="${stem}"
                />
              </label>
            `
              )
              .join('')}
          </div>
        </section>

        <!-- RIGHT PANEL: 16-Pad Beat Pad & Song Remix Studio -->
        <section class="kpop-panel" aria-label="Beat Pad and Song Remix Studio">
          <h3 style="margin: 0 0 6px; color: #FFD166;">🎛️ 16-Pad Beat Pad &amp; Song Remix Studio</h3>
          <p style="margin: 0 0 12px; font-size: 0.82rem; color: #D2C7FF;">
            Layer HUNTR/X drums, Reese growl bass, supersaws, Saja Boys slap grooves &amp; CatNap dream chimes!
          </p>

          <div class="kpop-stat-pill" id="beatpad-status-text" style="margin-bottom: 10px;">
            READY • Active Pads: 0 • Events: 0
          </div>

          <!-- 4x4 Interactive Loop & SFX Matrix -->
          <div class="kpop-beatpad-grid" role="group" aria-label="16-Pad Remix Matrix">
            ${BEAT_PAD_CELLS.map(
              (cell) => `
              <button
                type="button"
                class="kpop-beatpad-cell"
                data-testid="beatpad-cell-${cell.index}"
                data-pad-index="${cell.index}"
                aria-pressed="false"
              >
                <div style="font-size: 1.25rem; margin-bottom: 3px;">${cell.icon}</div>
                <div>${cell.title}</div>
                <div style="font-size: 0.68rem; color: #FFD166; margin-top: 2px;">
                  ${cell.mode.toUpperCase()}
                </div>
              </button>
            `
            ).join('')}
          </div>

          <!-- BPM Slider & Recording / Replay / Gallery Persistence Controls -->
          <div class="kpop-beatpad-controls">
            <label style="font-size: 0.82rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>Tempo:</span>
              <input
                type="range"
                min="90"
                max="160"
                value="128"
                data-testid="beatpad-bpm-slider"
              />
              <span id="beatpad-bpm-display">128 BPM</span>
            </label>
          </div>

          <div class="kpop-beatpad-controls" style="margin-top: 12px;">
            <button
              type="button"
              class="kpop-action-btn"
              data-testid="beatpad-record-btn"
            >
              ⏺ Record Remix
            </button>
            <button
              type="button"
              class="kpop-action-btn secondary"
              data-testid="beatpad-replay-btn"
            >
              ▶ Replay Take
            </button>
            <button
              type="button"
              class="kpop-action-btn"
              data-testid="beatpad-save-btn"
              style="background: linear-gradient(90deg, #00F5D4, #00BBF9);"
            >
              💾 Save Remix to Gallery
            </button>
          </div>
        </section>
      </div>
    </div>
  `;

  // Gather DOM References
  const canvas = container.querySelector('[data-testid="rhythm-game-canvas"]');
  const scoreEl = container.querySelector('[data-testid="rhythm-score"]');
  const comboEl = container.querySelector('[data-testid="rhythm-combo"]');
  const judgementEl = container.querySelector('[data-testid="rhythm-judgement"]');
  const lyricCalloutEl = container.querySelector('[data-testid="rhythm-lyric-callout"]');
  const startBtn = container.querySelector('[data-testid="rhythm-start-btn"]');
  const stopBtn = container.querySelector('[data-testid="rhythm-stop-btn"]');

  const bpmSlider = container.querySelector('[data-testid="beatpad-bpm-slider"]');
  const bpmValueEl = container.querySelector('#beatpad-bpm-display');
  const recordBtn = container.querySelector('[data-testid="beatpad-record-btn"]');
  const replayBtn = container.querySelector('[data-testid="beatpad-replay-btn"]');
  const saveBtn = container.querySelector('[data-testid="beatpad-save-btn"]');
  const statusTextEl = container.querySelector('#beatpad-status-text');

  const padButtons = [];
  for (let i = 0; i < 16; i++) {
    padButtons.push(container.querySelector(`[data-testid="beatpad-cell-${i}"]`));
  }

  // Instantiate Rhythm Game & Beat Pad Controllers
  const rhythmGame = new KpopRhythmGame({
    synthEngine,
    canvas,
    domRefs: {
      score: scoreEl,
      combo: comboEl,
      judgement: judgementEl,
      lyricCallout: lyricCalloutEl,
    },
    onHighScoreUpdate: (songId, score) => {
      persistRhythmHighScore(songId, score, activeStore);
    },
  });

  const beatPadStudio = new KpopBeatPadStudio({
    synthEngine,
    store: activeStore,
    domRefs: {
      padButtons,
      bpmSlider,
      bpmValue: bpmValueEl,
      recordBtn,
      replayBtn,
      saveBtn,
      statusText: statusTextEl,
    },
  });

  // Wire Song Selector Cards
  const songCards = Array.from(container.querySelectorAll('.kpop-song-card'));
  const selectSong = (songId) => {
    songCards.forEach((card) => {
      card.classList.toggle('is-selected', card.dataset.songId === songId);
    });
    const status = synthEngine.initializeAndVerifySongGraph(songId);
    rhythmGame.loadSong(songId);
    beatPadStudio.setBpm(KPOP_SONGS[songId]?.bpm || 128);
    return status;
  };

  songCards.forEach((card) => {
    card.addEventListener('click', () => {
      selectSong(card.dataset.songId);
    });
  });

  // Wire Rhythm Game Start / Stop Controls
  startBtn.addEventListener('click', () => {
    rhythmGame.start(rhythmGame.songId);
  });
  stopBtn.addEventListener('click', () => {
    rhythmGame.stop();
  });

  // Wire 4-Lane Touch / Click Buttons (`pointerdown` for zero-latency iPad response)
  for (let laneIdx = 0; laneIdx < 4; laneIdx++) {
    const laneBtn = container.querySelector(`[data-testid="rhythm-lane-btn-${laneIdx}"]`);
    if (laneBtn) {
      laneBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        rhythmGame.triggerLaneInput(laneIdx);
      });
      laneBtn.addEventListener('click', (e) => {
        // Fallback for synthetic CDP `.click()` calls that do not fire pointerdown
        if (e.detail === 0) {
          rhythmGame.triggerLaneInput(laneIdx);
        }
      });
    }
  }

  // Wire 6-Stem Mixer Sliders
  container.querySelectorAll('input[data-stem]').forEach((slider) => {
    slider.addEventListener('input', () => {
      const stem = slider.dataset.stem;
      const vol = Number(slider.value) / 100;
      synthEngine.setStemVolume(stem, vol);
    });
  });

  // Wire 16 Beat Pad Cells
  padButtons.forEach((btn, idx) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      beatPadStudio.togglePad(idx);
    });
  });

  // Wire Beat Pad BPM Slider, Record, Replay & Save Buttons
  bpmSlider.addEventListener('input', () => {
    beatPadStudio.setBpm(Number(bpmSlider.value));
  });
  recordBtn.addEventListener('click', () => {
    beatPadStudio.toggleRecording();
  });
  replayBtn.addEventListener('click', () => {
    beatPadStudio.startReplay();
  });
  saveBtn.addEventListener('click', () => {
    beatPadStudio.saveRemixToGallery();
  });

  // Register Canonical Verification API (`window.__CHEER_UP_R3_TEST_API__`)
  const testApi = {
    getAvailableSongs: () =>
      Object.values(KPOP_SONGS).map((s) => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        bpm: s.bpm,
      })),

    initializeAndVerifySongGraph: (songId) =>
      synthEngine.initializeAndVerifySongGraph(songId),

    startRhythmGame: (songId) => {
      if (songId) {
        selectSong(songId);
      }
      rhythmGame.start(songId || rhythmGame.songId);
    },

    stopRhythmGame: () => {
      rhythmGame.stop();
    },

    stepRhythmTime: (deltaSec) => rhythmGame.stepTime(deltaSec),

    setTransportTimeSec: (timeSec) => {
      rhythmGame.setTransportTimeSec(timeSec);
    },

    triggerLaneInput: (laneIndex) => rhythmGame.triggerLaneInput(laneIndex),

    getRhythmState: () => rhythmGame.getState(),

    getRhythmGameState: () => rhythmGame.getState(),

    toggleBeatPad: (padIndex) => beatPadStudio.togglePad(padIndex),

    toggleBeatPadCell: (padIndex) => beatPadStudio.togglePad(padIndex),

    getBeatPadState: () => beatPadStudio.getState(),

    saveCurrentRemixToGallery: (title) => beatPadStudio.saveRemixToGallery(title),
  };

  window.__CHEER_UP_R3_TEST_API__ = testApi;

  return {
    synthEngine,
    rhythmGame,
    beatPadStudio,
    testApi,
  };
}

export default initKpopStage;
