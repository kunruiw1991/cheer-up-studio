# Project: Boston ↔ Bay Area Creative Cheer-Up Studio

## 1. Executive Overview & Critical Host Constraints

### Mission
Build a standalone, zero-backend interactive web application ("Boston ↔ Bay Area Creative Cheer-Up Studio") designed for Kunrui's daughter living with her grandmother in Boston while her mom (Kunrui) is in the Bay Area. The app runs directly in any desktop or tablet browser (iPad/laptop/phone) and unites her three favorite creative passions—custom kid temporary tattoos (`R1`), CatNap from Poppy Playtime / Smiling Critters (`R2`), and K-Pop Demon Hunters / HUNTR/X & Saja Boys songs (`R3`)—along with a warm Bay Area ↔ Boston family connection hub & persistent gallery (`R4`).

### ⚠️ CRITICAL HOST ENVIRONMENT CONSTRAINTS (MANDATORY FOR ALL SUBAGENTS)
1. **Root Filesystem Disk Space Alert (`/` has ONLY 63 MB free)**:
   - `/` (`/dev/glinux_20250818/root`, which backs `/usr/local/google/home/kunruiwang/...`) has **only 63 MB free**.
   - **NEVER run `npm install`, `yarn`, `pnpm`, or install Playwright/Puppeteer packages onto `/`**. Doing so will immediately fail with `ENOSPC: no space left on device`.
   - `/dev/shm` (`16 GB` free) and `/tmp` (`11 GB` free) are `tmpfs` RAM disks with 27 GB available.
   - **ALWAYS pass `--user-data-dir=/dev/shm/chrome_profile_<id>`** whenever launching `/usr/bin/google-chrome` so browser caches never write to `~/.config/google-chrome` on `/`.
   - Write all temporary files, screenshots, or test artifacts to `/dev/shm/...` or `/tmp/...`.
2. **Verified Native Toolchains on Host**:
   - **Python 3**: `/usr/bin/python3` (`Python 3.13.15`) with pre-installed `websockets`, `http.server`, `urllib.request`, `json`.
   - **Browser**: `/usr/bin/google-chrome` (`Google Chrome 153.0.8010.52`) + `/usr/bin/xvfb-run`.
   - **Web Stack**: Pure browser-native ES2022 Modules (`src/`), HTML5 2D Canvas, Inline SVG, and Web Audio API. Zero external runtime or npm dependencies.
   - **Bundler**: Python 3 bundler (`scripts/build_dist.py`) compiling `index.html` + `src/` into a standalone, self-contained single-file `dist/index.html` (and static `dist/` assets) playable via `file://` or HTTP server.
   - **Headless E2E Verification Runner**: Python 3 + `websockets` driving `/usr/bin/google-chrome --headless=new --no-sandbox --disable-gpu --autoplay-policy=no-user-gesture-required --user-data-dir=/dev/shm/... --remote-debugging-port=<port>` via Chrome DevTools Protocol (CDP).

---

## 2. Architecture & Data Flow

```text
+-----------------------------------------------------------------------------------+
|                        App Shell & Navigation Bar (index.html)                    |
|  [Profile Header & Dual Clock]  |  Tabs: [Tattoo Studio] [CatNap] [K-Pop] [Hub]   |
+-----------------------------------------------------------------------------------+
         |                        |                        |                  |
         v                        v                        v                  v
+-----------------+    +--------------------+    +------------------+    +----------+
| R1: Tattoo      |    | R2: CatNap Cozy    |    | R3: K-Pop Demon  |    | R4: Hub  |
| Designer &      |    | Playground &       |    | Hunters Rhythm & |    | Postcard |
| Printable Sheet |    | Rooftop Dash Game  |    | Remix Stage      |    | & Gallery|
+-----------------+    +--------------------+    +------------------+    +----------+
         \                        |                        /                  /
          \                       v                       /                  /
           +----------------------------------------------------------------+
           |       Global Store & Persistence Engine (src/core/store.js)    |
           |  Versioned localStorage + EventBus + window.__CHEER_UP_STUDIO__|
           +----------------------------------------------------------------+
```

---

## 3. Feature Inventory

Every feature identified in the Survey phase (`explorer_survey_1`, `explorer_survey_2`, `explorer_survey_3`) is mapped below. **Zero features are unassigned.**

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F1 | App Shell, Responsive Navigation & Zero-Error Boot | Desktop/iPad responsive shell, 4-tab navigation (`tattoo`, `catnap`, `kpop`, `hub`), persistent top header, zero `console.error` / `pageerror` | M1 | survey_1, survey_3 |
| F2 | Versioned `localStorage` Store & Cross-Module EventBus | Unified state store (`UserProfile`, `SavedTattoos`, `SavedOutfits`, `SavedRemixes`, `HighScores`, `UnlockedStickers`, `Postcards`) with schema validation | M1 | survey_1, survey_3 |
| F3 | Zero-Dependency Standalone Bundler (`scripts/build_dist.py`) | Python 3 bundler generating self-contained single-file `dist/index.html` and static `dist/` directory working over `file://` and HTTP | M1 | survey_1, survey_3 |
| F4 | Tattoo Vector Stamp Library (3 Theme Collections) | Scalable vector stamps across CatNap & Smiling Critters, K-Pop Demon Hunters (HUNTR/X & Saja Boys), and Bay Area ↔ Boston Connection + unlockable rewards | M2 | survey_1 |
| F5 | Freehand Tattoo Brushes, Text Banners & Layer Transforms | Neon glow, glitter/sparkle, rainbow, and metallic ink brushes, color pickers, text banners, layer transforms (drag, scale, rotate, duplicate, undo/redo) | M2 | survey_1 |
| F6 | Virtual Arm/Wrist/Hand Try-On Preview | Interactive 2D/3D-shaded arm, wrist, and hand preview with adjustable skin tones and lighting presets | M2 | survey_1 |
| F7 | Pixel-Exact Mirrored Printable Transfer Sheet Export | 1-click export of normal PNG + horizontally mirrored 8.5"×11" printable sheet with cut guides & wet-sponge instructions, enforcing exact `ImageData` buffer reflection `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` | M2 | survey_1, survey_3 |
| F8 | Interactive CatNap Companion & Plush Customizer | Animated SVG/Canvas CatNap character with touch/click purr audio, lavender dream-mist particles, expressions, and 4 wardrobe categories (K-Pop jackets, headphones, crescent pendants, Boston scarves) | M3 | survey_1 |
| F9 | "CatNap's Starlight Rooftop Dash" Mini-Game | Keyboard/touch arcade runner across Boston brownstones & SF Golden Gate towers collecting crescent moons, musical notes, and tattoo stickers with high scores, unlockable stickers, `stepFrames(n)`, game-over & restart | M3 | survey_1 |
| F10 | Synthesized Multi-Track Song Library (Web Audio API) | Procedural 6-stem Web Audio API synthesis (zero external MP3s) for *"Golden"* (128 BPM, D Major), *"Takedown"* (145 BPM, E Phrygian Dominant), and *"Soda Pop"* (118 BPM, F Major) + `HybridAudioTransport` | M4 | survey_2 |
| F11 | 4-Lane Falling-Note Rhythm Game Mode | Playable 4-lane rhythm game (`D`, `F`, `J`, `K` + touch lane buttons) synced to synthesized tracks with `PERFECT`/`GREAT`/`GOOD`/`MISS` judgements, combo multipliers, pyrotechnics & lyric callouts | M4 | survey_2 |
| F12 | Beat Pad & Song Remix Studio | 16-pad (4×4) loop/drum/synth/SFX matrix with BPM slider (`90–160`), live timestamped event recording (`RemixEvent[]`), deterministic replay, and Gallery save | M4 | survey_2 |
| F13 | Editable Profile Header & Daily Cheer-Up Capsule | Customizable daughter name/nickname profile header persisted across reloads | M5 | survey_3 |
| F14 | "Letters & Stickers from Mom" Postcard Wall & Dual-City Clock | Interactive postcard wall with warm messages from Mom + live side-by-side San Francisco (`America/Los_Angeles`) & Boston (`America/New_York`) clocks & weather vibes | M5 | survey_3 |
| F15 | "Send Creation Card to Mom" Shareable PNG Generator | Canvas `1200×800` postcard generator bundling latest tattoo design + game high score + custom message into a downloadable PNG card | M5 | survey_3 |
| F16 | Unified "My Creations Gallery" & Full System Polish | Gallery view listing saved tattoos, CatNap outfits, and song remixes with reload persistence, re-open, and delete + final cross-module integration & E2E verification | M5, M6 | survey_3 |

---

## 4. Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core App Shell, Global Store, Persistence & Bundler (`F1`, `F2`, `F3`) | `index.html`, `src/styles/main.css`, `src/core/*`, `scripts/build_dist.py`, `scripts/dev_server.py` | none | DONE |
| M2 | R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio (`F4`, `F5`, `F6`, `F7`) | `src/modules/tattoo-studio/*` | M1 | DONE |
| M3 | R2: CatNap & Smiling Critters Cozy Playground & Mini-Game (`F8`, `F9`) | `src/modules/catnap-playground/*` | M1 | DONE |
| M4 | R3: K-Pop Demon Hunters Rhythm & Remix Stage (`F10`, `F11`, `F12`) | `src/modules/kpop-stage/*` | M1 | DONE |
| M5 | R4: Bay Area ↔ Boston Connection Hub, Postcard Wall & Gallery (`F13`, `F14`, `F15`, `F16`) | `src/modules/connection-hub/*` | M1 | DONE |
| M6 | Final Milestone: Full System Integration, 100% E2E Pass (Phase 1: Tiers 1–4) & Adversarial Hardening (Phase 2: Tier 5) | Cross-module integration polish, `dist/` packaging, 100% E2E pass & Tier 5 coverage hardening | M2, M3, M4, M5, E2E Track | DONE |
| E2E | E2E Testing Track: Opaque-Box 4-Tier Verification Suite (`TEST_INFRA.md` + `tests/*`) | `TEST_INFRA.md`, `TEST_READY.md`, `tests/cdp_driver.py`, `tests/run_e2e_suite.py`, `tests/tier1..4_*.py` | none | DONE |

---

## 5. Interface Contracts

### 5.1 Canonical `localStorage` Keys & State Schemas (`src/core/store.js`)
All modules read/write state through `window.CheerUpStore` (backed by `localStorage` with automatic JSON serialization and fallback defaults):

```javascript
export const STORAGE_KEYS = {
  PROFILE: 'cheerup_v1_profile',             // { nickname: string, avatarId: string, updatedAt: number }
  TATTOOS: 'cheerup_v1_saved_tattoos',       // Array<{ id, title, createdAt, previewDataUrl, layers, skinTone, lighting }>
  OUTFITS: 'cheerup_v1_saved_outfits',       // Array<{ id, title, createdAt, jacket, headphones, pendant, scarf, expression }>
  REMIXES: 'cheerup_v1_saved_remixes',       // Array<{ id, title, createdAt, bpm, activeLoops: number[], events: Array<{t, pad, action}> }>
  HIGH_SCORES: 'cheerup_v1_high_scores',     // { rooftopDash: number, rhythmGolden: number, rhythmTakedown: number, rhythmSodaPop: number }
  UNLOCKED_STICKERS: 'cheerup_v1_stickers',  // Array<string> (stamp IDs unlocked via Rooftop Dash or Postcard Wall)
  MOM_POSTCARDS: 'cheerup_v1_mom_postcards', // Array<{ id, date, fromCity, toCity, title, message, stickerId, read: boolean, reaction: string }>
};
```

### 5.2 Canonical Navigation Tabs & DOM `data-testid` Selectors
Every module MUST expose these deterministic DOM selectors so both users and the CDP Headless Chrome test suite can interact reliably:

- **Global App Shell (`M1`)**:
  - `[data-testid="nav-tab-tattoo"]` → Switches active view to `#view-tattoo-studio`
  - `[data-testid="nav-tab-catnap"]` → Switches active view to `#view-catnap-playground`
  - `[data-testid="nav-tab-kpop"]` → Switches active view to `#view-kpop-stage`
  - `[data-testid="nav-tab-hub"]` → Switches active view to `#view-connection-hub`
  - `[data-testid="header-nickname-display"]` → Displays active profile nickname
- **R1 Tattoo Studio (`M2` inside `#view-tattoo-studio`)**:
  - `[data-testid="tattoo-canvas"]` → Main interactive design canvas (`width=600, height=600`)
  - `[data-testid="stamp-category-catnap"]`, `[data-testid="stamp-category-kpop"]`, `[data-testid="stamp-category-bay_boston"]`
  - `[data-testid="stamp-item-<stampId>"]` → Adds vector stamp to canvas
  - `[data-testid="brush-mode-neon"]`, `[data-testid="brush-mode-glitter"]`, `[data-testid="brush-mode-rainbow"]`, `[data-testid="brush-mode-metallic"]`
  - `[data-testid="tattoo-color-picker"]`, `[data-testid="tattoo-brush-size"]`
  - `[data-testid="tattoo-text-input"]`, `[data-testid="tattoo-add-text-btn"]`
  - `[data-testid="tattoo-undo-btn"]`, `[data-testid="tattoo-redo-btn"]`, `[data-testid="tattoo-duplicate-btn"]`, `[data-testid="tattoo-clear-btn"]`
  - `[data-testid="tryon-canvas"]`, `[data-testid="tryon-bodypart-select"]`, `[data-testid="tryon-skintone-select"]`, `[data-testid="tryon-lighting-select"]`
  - `[data-testid="tattoo-save-gallery-btn"]` → Saves current tattoo to `CheerUpStore` gallery
  - `[data-testid="tattoo-export-normal-btn"]` → Exports normal high-res PNG
  - `[data-testid="tattoo-export-mirrored-btn"]` → Exports 8.5"×11" Mirrored Printable Transfer Sheet PNG
- **R2 CatNap Playground & Rooftop Dash (`M3` inside `#view-catnap-playground`)**:
  - `[data-testid="catnap-companion-svg"]` / `[data-testid="catnap-companion-canvas"]` → Interactive CatNap character
  - `[data-testid="catnap-purr-btn"]`, `[data-testid="catnap-expression-select"]`
  - `[data-testid="catnap-outfit-jacket"]`, `[data-testid="catnap-outfit-headphones"]`, `[data-testid="catnap-outfit-pendant"]`, `[data-testid="catnap-outfit-scarf"]`
  - `[data-testid="catnap-save-outfit-btn"]` → Saves current outfit to `CheerUpStore` gallery
  - `[data-testid="rooftop-dash-canvas"]` → Mini-game canvas
  - `[data-testid="rooftop-dash-start-btn"]`, `[data-testid="rooftop-dash-restart-btn"]`, `[data-testid="rooftop-dash-jump-btn"]`
  - `[data-testid="rooftop-dash-score"]`, `[data-testid="rooftop-dash-highscore"]`, `[data-testid="rooftop-dash-state"]`
- **R3 K-Pop Demon Hunters Stage (`M4` inside `#view-kpop-stage`)**:
  - `[data-testid="kpop-song-select-golden"]`, `[data-testid="kpop-song-select-takedown"]`, `[data-testid="kpop-song-select-soda_pop"]`
  - `[data-testid="rhythm-game-canvas"]`, `[data-testid="rhythm-start-btn"]`, `[data-testid="rhythm-stop-btn"]`
  - `[data-testid="rhythm-lane-btn-0"]`, `[data-testid="rhythm-lane-btn-1"]`, `[data-testid="rhythm-lane-btn-2"]`, `[data-testid="rhythm-lane-btn-3"]`
  - `[data-testid="rhythm-score"]`, `[data-testid="rhythm-combo"]`, `[data-testid="rhythm-judgement"]`, `[data-testid="rhythm-lyric-callout"]`
  - `[data-testid="beatpad-cell-0"]` .. `[data-testid="beatpad-cell-15"]`
  - `[data-testid="beatpad-bpm-slider"]`, `[data-testid="beatpad-record-btn"]`, `[data-testid="beatpad-replay-btn"]`, `[data-testid="beatpad-save-btn"]`
- **R4 Connection Hub & Gallery (`M5` inside `#view-connection-hub`)**:
  - `[data-testid="profile-nickname-input"]`, `[data-testid="profile-save-btn"]`
  - `[data-testid="clock-sf-time"]`, `[data-testid="clock-boston-time"]`
  - `[data-testid="mom-postcard-wall"]`, `[data-testid="mom-postcard-item-<id>"]`
  - `[data-testid="share-mom-card-canvas"]`, `[data-testid="share-mom-generate-btn"]`, `[data-testid="share-mom-download-btn"]`
  - `[data-testid="gallery-grid"]`, `[data-testid="gallery-filter-all"]`, `[data-testid="gallery-filter-tattoos"]`, `[data-testid="gallery-filter-outfits"]`, `[data-testid="gallery-filter-remixes"]`

### 5.3 Programmatic Verification Contracts (`window.__CHEER_UP_STUDIO__` & `window.__CHEER_UP_R3_TEST_API__`)
To enable deterministic verification of pixel buffers, physics frames, and Web Audio synthesis graphs in headless Chrome:

```javascript
window.__CHEER_UP_STUDIO__ = {
  store: CheerUpStore,
  tattoo: {
    addStamp(categoryId, stampId),
    drawStroke(points, brushMode, color, width),
    renderVirtualTryOn(bodyPart, skinTone, lighting),
    exportTransferSheet(), // Returns { sourceImageData, mirroredImageData, sheetDataUrl, normalDataUrl, width, height }
  },
  catnap: {
    triggerCompanionInteraction(),
    setOutfit(slot, value),
    getState(),
  },
  catnapGame: {
    start(),
    jump(),
    stepFrames(frameCount),
    triggerGameOver(),
    restart(),
    getState(), // Returns { state, score, highScore, moonsCollected, notesCollected, stickersUnlocked }
  },
  hub: {
    generateShareWithMomCard(), // Returns { dataUrl, width, height }
    getDualClocks(), // Returns { sf: { timeStr, tz }, boston: { timeStr, tz } }
  },
};

window.__CHEER_UP_R3_TEST_API__ = {
  initializeAndVerifySongGraph(songId), // Returns { initialized: boolean, activeStems: string[], bpm: number, hasErrors: boolean }
  startRhythmGame(songId),
  stepRhythmTime(deltaSec),
  triggerLaneInput(laneIndex), // 0..3
  getRhythmState(), // Returns { isPlaying, score, combo, maxCombo, judgements: { PERFECT, GREAT, GOOD, MISS }, activeNotesCount, currentLyric }
  toggleBeatPad(padIndex), // 0..15
  getBeatPadState(), // Returns { activePads: number[], bpm: number, isRecording: boolean, recordedEventsCount: number }
};
```

---

## 6. Code Layout & Exclusive Write Ownership

| Directory / File | Owning Milestone | Description |
|------------------|------------------|-------------|
| `index.html` | M1 | Main application entry point & view containers |
| `src/styles/main.css` | M1 | Shared CSS variables, responsive layout, animations |
| `src/core/store.js` | M1 | Versioned `localStorage` persistence & cross-module `EventBus` |
| `src/core/audio-context.js` | M1 | Shared Web Audio API context unlock & `HybridAudioTransport` clock |
| `src/core/app-shell.js` | M1 | Main bootstrapper, tab router, global test API registry |
| `scripts/build_dist.py` | M1 | Zero-dependency Python 3 bundler producing single-file `dist/index.html` |
| `scripts/dev_server.py` | M1 | Local HTTP server helper |
| `src/modules/tattoo-studio/*` | M2 | All R1 Tattoo Designer, Try-On & Mirrored Sheet Exporter modules |
| `src/modules/catnap-playground/*` | M3 | All R2 CatNap Companion, Wardrobe & Rooftop Dash Mini-Game modules |
| `src/modules/kpop-stage/*` | M4 | All R3 Web Audio Multi-Track Synth, 4-Lane Rhythm Game & Beat Pad modules |
| `src/modules/connection-hub/*` | M5 | All R4 Profile Header, Postcard Wall, Dual Clock, Card Generator & Gallery modules |
| `TEST_INFRA.md`, `TEST_READY.md`, `tests/*` | E2E Track | All E2E verification infrastructure, CDP driver & Tiers 1–4 test suites |
