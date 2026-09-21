# Survey Analysis: Requirement R4 (Bay Area ↔ Boston Connection Hub, Gallery Persistence & Zero-Backend Packaging) & Automated E2E Verification Architecture

**Core Summary**: Requirement R4 unites the creative outputs of R1 (Tattoo Studio), R2 (CatNap Playground & Rooftop Dash), and R3 (K-Pop Demon Hunters Stage) into a warm three-generation family portal linking San Francisco (`America/Los_Angeles`) and Boston (`America/New_York`), backed by a versioned `localStorage` persistence engine, a Canvas-composited "Share with Mom" PNG postcard generator, zero-backend single-file/static packaging (`dist/`), and a deterministic 4-tier headless Chromium verification suite (`TEST_INFRA.md`).

---

## 1. Empirical Host & Runtime Environment Audit

Before designing the R4 packaging and E2E verification architecture, we empirically audited the execution environment on `kunruiwang.c.googlers.com`:

| Tool / Capability | Observed Host Status | Architectural Impact on R4 & E2E Testing |
|---|---|---|
| **Browser Binary** | `/usr/bin/google-chrome` (`Google Chrome 153.0.8010.52`) | Supports `--headless=new`, `--no-sandbox`, `--disable-gpu`, `--autoplay-policy=no-user-gesture-required`, and `--remote-debugging-port=0` (Chrome DevTools Protocol / CDP). |
| **Python 3 Runtime** | `/usr/bin/python3` (`Python 3.13.15`) + stdlib `http.server`, `json`, `urllib`, `asyncio` | Available out-of-the-box for static HTTP serving, single-file `dist/` bundling (`scripts/build_dist.py`), and E2E test runner orchestration. |
| **Python `websockets`** | `websockets: AVAILABLE` (verified via `python3 -c "import websockets"`) | Enables direct asynchronous Chrome DevTools Protocol (CDP) control of headless Google Chrome (`Page.navigate`, `Runtime.evaluate`, `Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`, `Page.reload`, `Runtime.consoleAPICalled`, `Runtime.exceptionThrown`) with zero external package installs. |
| **Node.js / npm / Playwright CLI** | `node: command not found`, `playwright: NOT_INSTALLED` | **Critical constraint**: Neither the application build nor the automated headless verification suite may rely on `npm install` or external network registries. The app must be written in native browser ES Modules / HTML5 / CSS3 with a Python 3 single-file/static packager (`scripts/build_dist.py`), and the E2E test suite must run via Python 3 + CDP against `/usr/bin/google-chrome` (while also providing a declarative Playwright-compatible test helper API `PageDriver`). |

---

## 2. Requirement R4 Functional Decomposition & Architecture

### 2.1 Sub-Feature Inventory (R4)

| Feature ID | Feature Name | Scope & Functional Requirements (`ORIGINAL_REQUEST.md` lines 36–39) |
|---|---|---|
| **R4.1** | **Personalized Profile & Daily Cheer-Up Capsule** | Editable header displaying daughter's customizable name/nickname, avatar badge, and Boston/Mom greeting banner, plus a daily rotating/interactive "Cheer-Up Capsule" fortune/sticker reward from Mom in the Bay Area. Persisted in `localStorage`. |
| **R4.2** | **Dual-City Live Clock & Weather-Vibe Widget** | Real-time side-by-side widget displaying **San Francisco, CA (Mom — PST/PDT, IANA `America/Los_Angeles`)** and **Boston, MA (Daughter & Mom — EST/EDT, IANA `America/New_York`)** local times (formatted via `Intl.DateTimeFormat`), exact 3-hour timezone delta badge (`+3h ahead in Boston`), time-of-day sky gradients (morning/afternoon/golden-hour/starry-night), and cozy weather-vibe animations (Golden Gate fog/sunshine vs. Boston Public Garden ducklings/starlight). |
| **R4.3** | **"Letters & Stickers from Mom (Bay Area → Boston)" Postcard Wall** | Interactive postcard board pre-populated with heartfelt, illustrated Bay Area → Boston postcards from Mom (featuring Golden Gate Bridge, CatNap lavender hugs, HUNTR/X & Saja Boys concert cheers, and Mom appreciation notes), plus interactive sticker-stamping (allowing daughter to decorate Mom's postcards with hearts/stars/paws, flip postcards front/back, filter by theme, or write/pin new reply notes). |
| **R4.4** | **"Send Creation Card to Mom" Postcard Generator** | 1-click HTML5 Canvas compositor that bundles: (a) Daughter's profile nickname & timestamp, (b) Latest/selected custom Tattoo design thumbnail (from R1/Gallery), (c) Highest game scores & achievements from CatNap Rooftop Dash (R2) and K-Pop Demon Hunters Rhythm Stage (R3), (d) Selected postcard border theme & personal note to Mom, into a high-resolution (`1200×800` px) downloadable PNG card (`<a download="postcard-for-mom.png">`) with valid PNG header (`\x89PNG\r\n\x1a\n`) and non-zero pixel variance. |
| **R4.5** | **My Creations Gallery (`localStorage` Persistence Engine)** | Unified persistent gallery displaying, filtering, previewing, re-loading into editors, favoriting, and deleting creations across all three studios: **Custom Tattoos (R1)**, **CatNap Plush Outfits (R2)**, and **K-Pop Song Remixes (R3)**. Guaranteed 100% state survival across `page.reload()`. |
| **R4.6** | **Zero-Backend Portability & `dist/` Single-File Packaging** | Complete runtime independence (zero backend API calls, zero external audio/image URLs that fail offline). Bundler script `python3 scripts/build_dist.py` produces both a multi-file static folder `dist/` and a self-contained single-file bundle `dist/index.html` (all CSS/JS/SVG assets inlined) suitable for emailing, AirDropping to an iPad, or opening via `file://` or any HTTP server. |

---

## 3. Data Schemas & State Management Contracts

### 3.1 Canonical `localStorage` Namespace & Keys

All persistent state is stored under a versioned namespace (`cheer_up_studio_v1_*`) with automatic schema validation and fallback recovery if corrupted JSON is encountered:

```typescript
export const STORAGE_KEYS = {
  SCHEMA_VERSION: 'cheer_up_studio_v1_version',        // number (current: 1)
  PROFILE: 'cheer_up_studio_v1_profile',               // UserProfileState
  POSTCARD_WALL: 'cheer_up_studio_v1_postcards',       // PostcardWallState
  GALLERY_TATTOOS: 'cheer_up_studio_v1_tattoos',       // SavedTattooItem[]
  GALLERY_OUTFITS: 'cheer_up_studio_v1_outfits',       // SavedCatNapOutfit[]
  GALLERY_REMIXES: 'cheer_up_studio_v1_remixes',       // SavedSongRemix[]
  GAME_RECORDS: 'cheer_up_studio_v1_game_records',     // GameHighScoresState
  UNLOCKED_REWARDS: 'cheer_up_studio_v1_unlockables',  // string[] (sticker IDs unlocked in R2/R3)
} as const;
```

### 3.2 Complete Entity Schemas

```typescript
/** R4.1: Profile & Daily Cheer-Up Capsule State */
export interface UserProfileState {
  daughterName: string;           // Default: "Little Star" (editable 1..40 chars)
  nickname: string;               // Default: "Boston Starlight Artist"
  avatarId: 'catnap-moon' | 'rumi-star' | 'saja-soda' | 'boston-duckling';
  momCityLabel: string;           // Default: "San Francisco, CA (Bay Area)"
  daughterCityLabel: string;      // Default: "Boston, MA"
  openedCapsuleIds: string[];     // IDs of daily cheer-up capsules opened
  lastCapsuleDate: string;        // ISO YYYY-MM-DD
  updatedAt: number;              // Epoch ms
}

/** R4.3: Letters & Stickers from Mom Postcard Wall */
export interface MomPostcard {
  id: string;
  title: string;
  sender: 'Mom (Bay Area)' | 'Daughter (Boston)';
  dateLabel: string;
  frontArtworkTheme: 'golden-gate-sunset' | 'catnap-lavender-dream' | 'huntrx-golden-stage' | 'boston-public-garden';
  messageBody: string;
  attachedStickerIds: string[];   // Stickers placed on postcard by daughter
  isPinned: boolean;
  isFlipped: boolean;
  heartCount: number;
}

/** R4.5: Gallery Item — R1 Custom Tattoo Creation */
export interface SavedTattooItem {
  id: string;                     // UUID / timestamp-slug
  name: string;                   // User-assigned or default title
  createdAt: number;
  skinTonePreset: string;         // Virtual try-on skin tone setting
  bodyPlacement: 'arm' | 'wrist' | 'hand';
  stamps: Array<{
    stampId: string;
    category: 'catnap' | 'kpop' | 'bay_boston';
    x: number;
    y: number;
    scale: number;
    rotationDeg: number;
  }>;
  strokes: Array<{
    brushType: 'neon' | 'glitter' | 'rainbow' | 'metallic';
    color: string;
    width: number;
    points: Array<{ x: number; y: number }>;
  }>;
  textBanners: Array<{
    text: string;
    fontFamily: string;
    color: string;
    x: number;
    y: number;
  }>;
  thumbnailDataUrl: string;       // Normal PNG Data URL (`data:image/png;base64,...`)
}

/** R4.5: Gallery Item — R2 CatNap Plush Outfit Creation */
export interface SavedCatNapOutfit {
  id: string;
  name: string;
  createdAt: number;
  furTint: string;
  expression: 'sleepy-smile' | 'starry-joy' | 'purr-bliss' | 'kpop-wink';
  jacketId: 'none' | 'huntrx-gold-jacket' | 'saja-neon-hoodie' | 'boston-fleece';
  headwearId: 'none' | 'glowing-headphones' | 'idol-crown' | 'winter-beanie';
  pendantId: 'crescent-moon-gold' | 'lavender-star' | 'golden-gate-heart';
  scarfId: 'none' | 'boston-crimson-scarf' | 'lavender-cloud-scarf';
  dreamMistColor: string;
}

/** R4.5: Gallery Item — R3 K-Pop Demon Hunters Beat Pad Remix */
export interface SavedSongRemix {
  id: string;
  name: string;
  createdAt: number;
  baseSongId: 'golden' | 'takedown' | 'soda_pop';
  bpm: number;
  activeLoopIds: string[];        // Active drum/bass/synth/vocal loop tracks
  recordedEvents: Array<{
    timeOffsetMs: number;
    padId: string;
    type: 'trigger' | 'toggle_on' | 'toggle_off';
  }>;
  durationMs: number;
}

/** R2 & R3 High Scores & Unlockables for Postcard Generator */
export interface GameHighScoresState {
  catnapDashHighScore: number;
  catnapDashBestMoons: number;
  rhythmStageScores: {
    golden: { highScore: number; maxCombo: number; grade: string };
    takedown: { highScore: number; maxCombo: number; grade: string };
    soda_pop: { highScore: number; maxCombo: number; grade: string };
  };
}
```

### 3.3 Dual-City Clock & Weather-Vibe Specification (R4.2)

To ensure deterministic timezone calculation across any browser/server locale:
- **San Francisco (Mom)**: `new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })`
- **Boston (Daughter)**: `new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' })`
- Supports an optional deterministic `referenceTimestampMs?: number` override parameter in `formatDualCityClocks(nowMs)` so unit/E2E tests can verify both standard time (`PST`/`EST`), daylight saving time (`PDT`/`EDT`), and midnight date-rollover boundaries (`21:30 PDT` in SF = `00:30 EDT (+1 day)` in Boston).

### 3.4 "Send Creation Card to Mom" Canvas PNG Compositor Specification (R4.4)

When the user clicks `[data-testid="generate-mom-postcard-btn"]`:
1. Creates an offscreen/preview HTML5 `<canvas width="1200" height="800" data-testid="mom-postcard-canvas">`.
2. Renders a decorative split-city frame (Golden Gate Bridge sunset arch on left ↔ Boston Zakim Bridge & Public Garden swan boats on right).
3. Draws the header banner: `"From [daughterName] in Boston ❤️ To Mom in the Bay Area"`.
4. Embeds the selected/latest Tattoo Studio design (`SavedTattooItem.thumbnailDataUrl` or live tattoo canvas snapshot) inside a framed Polaroid badge on the left panel.
5. Renders the Game Achievement Scoreboard badge on the right panel:
   - CatNap Rooftop Dash High Score (`catnapDashHighScore` pts & moons collected)
   - K-Pop Demon Hunters Top Song Score & Max Combo (*Golden* / *Takedown* / *Soda Pop*)
   - Equipped CatNap Plush Outfit badge summary
6. Renders daughter's personal message note + dual-city timestamp footer.
7. Exports via `canvas.toDataURL('image/png')`, updates `<img data-testid="mom-postcard-preview-img">`, and triggers/exposes `<a data-testid="download-mom-postcard-link" download="cheer-up-postcard-for-mom.png" href="data:image/png;base64,...">`.

---

## 4. Canonical DOM `data-testid` Contract Across All Modules (R1–R4)

To guarantee zero selector drift between implementation agents and the opaque-box E2E test suite, all views must adhere to the following deterministic `data-testid` contract:

### 4.1 Global App Shell & Navigation
- `[data-testid="app-shell"]` — Root application container
- `[data-testid="nav-tab-tattoo"]` — Navigation tab for R1 Tattoo Studio
- `[data-testid="nav-tab-catnap"]` — Navigation tab for R2 CatNap Playground & Rooftop Dash
- `[data-testid="nav-tab-kpop"]` — Navigation tab for R3 K-Pop Demon Hunters Stage
- `[data-testid="nav-tab-hub"]` — Navigation tab for R4 Bay Area ↔ Boston Connection Hub & Gallery

### 4.2 R1: Temporary Tattoo Designer & Printable Sheet Studio
- `[data-testid="tattoo-canvas"]` — Main interactive `<canvas>` for tattoo design
- `[data-testid="stamp-category-catnap"]`, `[data-testid="stamp-category-kpop"]`, `[data-testid="stamp-category-bay_boston"]` — Stamp collection filter tabs
- `[data-testid="stamp-item-<id>"]` — Individual vector stamp buttons (at least 3 per category)
- `[data-testid="brush-type-neon"]`, `[data-testid="brush-type-glitter"]`, `[data-testid="brush-type-rainbow"]`, `[data-testid="brush-type-metallic"]` — Brush selectors
- `[data-testid="tattoo-text-input"]` & `[data-testid="tattoo-add-text-btn"]` — Custom text banner controls
- `[data-testid="tattoo-undo-btn"]`, `[data-testid="tattoo-redo-btn"]`, `[data-testid="tattoo-clear-btn"]` — History controls
- `[data-testid="virtual-tryon-canvas"]` — Virtual arm/wrist/hand preview `<canvas>`
- `[data-testid="skin-tone-slider"]` & `[data-testid="body-part-select"]` — Try-on customization controls
- `[data-testid="save-tattoo-gallery-btn"]` — Save current tattoo design to Gallery
- `[data-testid="export-normal-png-btn"]` — Export standard orientation PNG
- `[data-testid="export-mirrored-sheet-btn"]` — Export horizontally mirrored 8.5"×11" transfer sheet
- `[data-testid="mirrored-export-canvas"]` — Output `<canvas>` containing the horizontally mirrored tattoo image (`mirroredImage(x, y) === sourceImage(width - 1 - x, y)`) and printable transfer sheet layout

### 4.3 R2: CatNap Cozy Playground & Rooftop Dash Mini-Game
- `[data-testid="catnap-companion-stage"]` — Interactive SVG/Canvas CatNap character container
- `[data-testid="catnap-pet-btn"]` / clickable character target — Triggers purr audio/visual & dream-mist particles
- `[data-testid="catnap-purr-counter"]` & `[data-testid="catnap-mood-status"]` — Reaction telemetry display
- `[data-testid="outfit-jacket-select"]`, `[data-testid="outfit-headwear-select"]`, `[data-testid="outfit-pendant-select"]`, `[data-testid="outfit-scarf-select"]` — Plush outfit selectors
- `[data-testid="save-outfit-gallery-btn"]` — Save CatNap outfit to Gallery
- `[data-testid="rooftop-dash-canvas"]` — Arcade mini-game `<canvas>`
- `[data-testid="dash-start-btn"]`, `[data-testid="dash-jump-btn"]`, `[data-testid="dash-restart-btn"]` — Game controls
- `[data-testid="dash-score-value"]`, `[data-testid="dash-highscore-value"]`, `[data-testid="dash-game-state"]` — Live score & state (`idle` | `running` | `gameover`)

### 4.4 R3: K-Pop Demon Hunters Rhythm & Remix Stage
- `[data-testid="song-select-golden"]`, `[data-testid="song-select-takedown"]`, `[data-testid="song-select-soda_pop"]` — Featured track selectors
- `[data-testid="audio-engine-status"]` — Web Audio synthesis graph status (`ready` | `playing` | `paused`)
- `[data-testid="rhythm-game-canvas"]` — 4-lane falling note canvas
- `[data-testid="rhythm-start-btn"]`, `[data-testid="rhythm-stop-btn"]` — Rhythm game session controls
- `[data-testid="rhythm-lane-0"]`, `[data-testid="rhythm-lane-1"]`, `[data-testid="rhythm-lane-2"]`, `[data-testid="rhythm-lane-3"]` — Touch/click lane buttons corresponding to keys `D`, `F`, `J`, `K`
- `[data-testid="rhythm-score-value"]`, `[data-testid="rhythm-combo-value"]`, `[data-testid="rhythm-last-judgement"]` — Score, combo, and judgement (`PERFECT` | `GREAT` | `GOOD` | `MISS`)
- `[data-testid="beatpad-loop-<id>"]` — Interactive Beat Pad loop toggle buttons (drums, bass, synth, vocal/CatNap FX)
- `[data-testid="remix-record-btn"]`, `[data-testid="remix-stop-btn"]`, `[data-testid="remix-play-btn"]`, `[data-testid="save-remix-gallery-btn"]` — Remix recorder & gallery save controls

### 4.5 R4: Bay Area ↔ Boston Connection Hub & Creations Gallery
- `[data-testid="profile-name-input"]`, `[data-testid="profile-nickname-input"]`, `[data-testid="profile-save-btn"]` — Profile customization
- `[data-testid="profile-display-name"]` — Rendered daughter greeting header
- `[data-testid="daily-capsule-open-btn"]` & `[data-testid="daily-capsule-message"]` — Daily Cheer-Up Capsule
- `[data-testid="clock-sf-time"]`, `[data-testid="clock-sf-zone"]`, `[data-testid="clock-sf-vibe"]` — San Francisco clock & weather vibe
- `[data-testid="clock-boston-time"]`, `[data-testid="clock-boston-zone"]`, `[data-testid="clock-boston-vibe"]` — Boston clock & weather vibe
- `[data-testid="postcard-wall-list"]` & `[data-testid="mom-postcard-item-<id>"]` — Mom's Postcard Wall items
- `[data-testid="mom-postcard-flip-btn-<id>"]`, `[data-testid="mom-postcard-add-sticker-btn-<id>"]` — Postcard wall interactions
- `[data-testid="add-custom-postcard-input"]` & `[data-testid="add-custom-postcard-btn"]` — Add new family note to wall
- `[data-testid="postcard-message-input"]` & `[data-testid="generate-mom-postcard-btn"]` — Share with Mom PNG generator controls
- `[data-testid="mom-postcard-canvas"]`, `[data-testid="mom-postcard-preview-img"]`, `[data-testid="download-mom-postcard-link"]` — Generated PNG postcard output elements
- `[data-testid="gallery-filter-all"]`, `[data-testid="gallery-filter-tattoos"]`, `[data-testid="gallery-filter-outfits"]`, `[data-testid="gallery-filter-remixes"]` — Gallery filter tabs
- `[data-testid="gallery-grid"]`, `[data-testid="gallery-item-card"]`, `[data-testid="gallery-load-item-btn"]`, `[data-testid="gallery-delete-item-btn"]` — Gallery item cards & actions

---

## 5. Automated Functional & Headless Browser Verification Architecture (`TEST_INFRA.md`)

### 5.1 Mapping the 5 Core Acceptance Criteria (`ORIGINAL_REQUEST.md` lines 43–48)

| Acceptance Criterion | Verification Method & Programmatic Assertion |
|---|---|
| **AC-1: Clean Headless Boot & Zero Console/Page Errors** | Attach listeners to CDP `Runtime.consoleAPICalled` (filtering `type === 'error'`) and `Runtime.exceptionThrown` before navigating to the app URL. Navigate through all 4 top-level views (`tattoo`, `catnap`, `kpop`, `hub`). Assert `consoleErrors.length === 0` and `pageExceptions.length === 0`. |
| **AC-2: Tattoo Studio & Pixel-Level Mirrored Printable Sheet Verification** | Place 1 stamp from `catnap`, 1 from `kpop`, and 1 from `bay_boston`; dispatch pointer stroke across `[data-testid="tattoo-canvas"]`; verify `[data-testid="virtual-tryon-canvas"]` has non-zero non-transparent pixel count; trigger `[data-testid="export-mirrored-sheet-btn"]`; read RGBA pixel buffers from source design canvas ($W \times H$) and mirrored export canvas ($W \times H$) via `ctx.getImageData(0, 0, W, H)` and assert exact horizontal reflection across every row/column: $$\forall y \in [0, H-1], \forall x \in [0, W-1]: \quad \text{Mirrored}(x, y) === \text{Source}(W - 1 - x, y)$$ plus non-empty image byte payload. |
| **AC-3: CatNap Playground & Rooftop Dash Mini-Game Verification** | Click `[data-testid="catnap-pet-btn"]` and verify purr counter increments & particle count $> 0$; change jacket/pendant selectors and verify DOM/canvas state updates; click `[data-testid="dash-start-btn"]`, step game loop frames (`window.__CHEER_UP_DEBUG__.stepDashFrames(120)` or real RAF wait), assert score $> 0$, trigger obstacle collision / game-over state (`state === 'gameover'`), click `[data-testid="dash-restart-btn"]`, and assert score resets to `0` and state returns to `'running'`. |
| **AC-4: K-Pop Demon Hunters Stage Verification** | Sequentially select *Golden*, *Takedown*, and *Soda Pop*; verify Web Audio API synthesis graph initializes (`AudioContext` created with active nodes and zero exceptions); start 4-lane rhythm game, spawn falling notes, dispatch keydown/click on lanes `D`/`F`/`J`/`K` when notes intersect hit zone, assert `score > 0`, `combo >= 1`, and judgement in `{'PERFECT','GREAT','GOOD'}`; toggle Beat Pad loops on/off and verify active loop state array updates cleanly. |
| **AC-5: Persistence Across `page.reload()` & "Share with Mom" Postcard Export** | Save 1 custom tattoo, 1 CatNap outfit, and 1 Beat Pad remix to Gallery; execute full browser reload via `Page.reload` (`await page.reload()`); navigate to Gallery and assert all 3 saved items render with intact metadata; click `[data-testid="generate-mom-postcard-btn"]` and assert `[data-testid="download-mom-postcard-link"]` has `href` starting with `data:image/png;base64,`, base64-decoded bytes begin with PNG magic signature `89 50 4E 47 0D 0A 1A 0A`, dimensions equal `1200×800`, and pixel variance is non-zero. |

---

### 5.2 Complete 4-Tier Opaque-Box E2E Test Suite Specification (`TEST_INFRA.md`)

To satisfy the strict 4-Tier Opaque-Box Verification standard:
- **8 Inventoried Features** across R1–R4:
  - **F1**: R1 Tattoo Vector Stamps, Freehand Brushes & Layer Transforms
  - **F2**: R1 Virtual Try-On Preview & Mirrored 8.5"×11" Printable Sheet Export
  - **F3**: R2 Interactive CatNap Companion & Plush Outfit Customizer
  - **F4**: R2 "CatNap's Starlight Rooftop Dash" Arcade Mini-Game
  - **F5**: R3 K-Pop Demon Hunters Multi-Track Web Audio Synthesizer (*Golden*, *Takedown*, *Soda Pop*)
  - **F6**: R3 4-Lane Falling-Note Rhythm Game & Beat Pad Remix Studio
  - **F7**: R4 Profile Capsule, Dual-City Clock (`America/Los_Angeles` ↔ `America/New_York`), Mom's Postcard Wall & Share-with-Mom PNG Generator
  - **F8**: R4 Unified `localStorage` Creations Gallery & Zero-Backend `dist/` Bundle Portability

#### Tier 1: Feature Coverage (≥ 5 Tests per Feature × 8 Features = 40 Tests)

| Feature | 5 Mandatory Feature Coverage Tests |
|---|---|
| **F1 (Tattoo Canvas & Stamps)** | `T1-F1-01`: Add CatNap stamp collection item to canvas and verify layer count = 1.<br>`T1-F1-02`: Add HUNTR/X & Saja Boys stamp collection item and verify distinct coordinates.<br>`T1-F1-03`: Add Bay Area ↔ Boston bridge/family stamp and verify all 3 categories coexist.<br>`T1-F1-04`: Draw freehand strokes with Neon, Glitter, Rainbow, and Metallic brushes.<br>`T1-F1-05`: Add custom text banner, scale/rotate active stamp, and verify Undo/Redo stack. |
| **F2 (Try-On & Mirrored Export)** | `T1-F2-01`: Render tattoo onto Virtual Try-On canvas and confirm non-empty pixel projection.<br>`T1-F2-02`: Adjust skin tone slider across 5 presets and verify background RGB shift on try-on canvas.<br>`T1-F2-03`: Switch body placement between Arm, Wrist, and Hand templates.<br>`T1-F2-04`: Export normal PNG and verify valid PNG header and dimensions.<br>`T1-F2-05`: Export Mirrored Printable Transfer Sheet and verify exact pixel-for-pixel horizontal reflection (`mirrored(x, y) === source(W - 1 - x, y)`) plus cut-guide & wet-sponge instruction overlay. |
| **F3 (CatNap Companion & Customizer)** | `T1-F3-01`: Click CatNap companion and verify purr counter increments and dream-mist particles spawn.<br>`T1-F3-02`: Equip K-Pop idol jacket and verify visual state updates.<br>`T1-F3-03`: Equip glowing headphones / crescent moon pendant / Boston winter scarf.<br>`T1-F3-04`: Toggle CatNap facial expressions (`sleepy-smile`, `starry-joy`, `purr-bliss`, `kpop-wink`).<br>`T1-F3-05`: Save customized CatNap outfit to Gallery and verify confirmation toast/badge. |
| **F4 (CatNap Rooftop Dash Game)** | `T1-F4-01`: Start Rooftop Dash game and verify transition from `idle` to `running`.<br>`T1-F4-02`: Trigger jump action via keyboard (`Space`/`ArrowUp`) and touch button and verify player vertical velocity.<br>`T1-F4-03`: Collect crescent moons, musical notes, and tattoo stickers and verify score increment.<br>`T1-F4-04`: Collide with rooftop obstacle, verify transition to `gameover` and high-score persistence.<br>`T1-F4-05`: Click Restart after game-over and verify score resets to 0 and game loop resumes cleanly. |
| **F5 (K-Pop Web Audio Synthesizer)** | `T1-F5-01`: Select *Golden* (HUNTR/X) and verify Web Audio graph initializes with BPM and active synth tracks.<br>`T1-F5-02`: Select *Takedown* and verify high-energy battle beat synth graph initializes without audio glitches.<br>`T1-F5-03`: Select *Soda Pop* (Saja Boys) and verify fizzy K-pop groove synth graph initializes.<br>`T1-F5-04`: Verify play/pause/stop transport transitions update playback time and audio engine state.<br>`T1-F5-05`: Verify master volume / mute controls scale Web Audio `GainNode` gain cleanly. |
| **F6 (4-Lane Rhythm Game & Beat Pad)** | `T1-F6-01`: Start 4-lane rhythm mode and verify falling notes spawn across lanes 0–3 (`D`, `F`, `J`, `K`).<br>`T1-F6-02`: Dispatch key events `D`, `F`, `J`, `K` on note arrival and verify `PERFECT`/`GREAT`/`GOOD` judgement & combo increment.<br>`T1-F6-03`: Dispatch touch/click events on iPad lane buttons `[data-testid="rhythm-lane-0..3"]` and verify hit registration.<br>`T1-F6-04`: Toggle Beat Pad drum, bass, synth, and CatNap FX loops and verify simultaneous multi-loop playback.<br>`T1-F6-05`: Record a custom Beat Pad remix sequence, stop recording, replay it, and save to Gallery. |
| **F7 (Connection Hub, Clocks & Postcard Generator)** | `T1-F7-01`: Edit daughter name/nickname in Profile Header and verify header updates immediately.<br>`T1-F7-02`: Open Daily Cheer-Up Capsule from Mom and verify warm message & bonus sticker unlock.<br>`T1-F7-03`: Verify Dual-City Clock displays San Francisco (`America/Los_Angeles`) and Boston (`America/New_York`) side by side with exact 3-hour delta.<br>`T1-F7-04`: Flip Mom's postcards on Postcard Wall, attach decorative stickers, and add a new family note.<br>`T1-F7-05`: Generate "Send Creation Card to Mom" PNG postcard and verify downloadable PNG contains tattoo thumbnail + high scores + message. |
| **F8 (Gallery Persistence & Zero-Backend Portability)** | `T1-F8-01`: Save Tattoo, CatNap Outfit, and Song Remix items and verify all 3 appear in Gallery grid.<br>`T1-F8-02`: Filter Gallery by `All`, `Tattoos`, `CatNap Outfits`, and `Song Remixes`.<br>`T1-F8-03`: Execute `page.reload()` and verify 100% of Gallery items, profile name, and high scores persist.<br>`T1-F8-04`: Load a saved creation from Gallery back into its originating studio editor (Tattoo / CatNap / Beat Pad).<br>`T1-F8-05`: Build standalone `dist/` bundle via `python3 scripts/build_dist.py` and verify zero-network offline execution. |

#### Tier 2: Boundary & Corner Cases (≥ 5 Tests per Feature × 8 Features = 40 Tests)

| Feature | 5 Mandatory Boundary & Corner Case Tests |
|---|---|
| **F1 Boundaries** | `T2-F1-01`: Export & preview on completely empty canvas (0 stamps, 0 strokes).<br>`T2-F1-02`: Undo when history stack is empty and Redo when at head of history stack (no-op without error).<br>`T2-F1-03`: Rapidly add 50 stamps and 30 freehand strokes (stress test canvas z-order & frame budget).<br>`T2-F1-04`: Custom text banner with Unicode emojis, CJK characters, and max-length string (`"Mom ❤️ Daughter 🌟 Boston 2026"`).<br>`T2-F1-05`: Out-of-bounds drag coordinates (dragging stamp past negative or $> \text{width}$ canvas edges clamps safely). |
| **F2 Boundaries** | `T2-F2-01`: Mirrored export verification on asymmetric 1px marker placed at top-left corner `(0, 0)` mapping strictly to `(W - 1, 0)`.<br>`T2-F2-02`: Extreme skin tone slider bounds (`0.0` min and `1.0` max).<br>`T2-F2-03`: Rapid repeated clicks (5× in 100ms) on Mirrored Printable Sheet Export button without memory leak or duplicate modal crash.<br>`T2-F2-04`: Asymmetric multi-color gradient stroke horizontal reflection verification across center axis $x = \lfloor W/2 \rfloor$.<br>`T2-F2-05`: Viewport resize between desktop (`1440×900`) and iPad portrait (`768×1024`) preserving try-on aspect ratio. |
| **F3 Boundaries** | `T2-F3-01`: Rapid 30× clicking on CatNap companion (particle pool cap prevents unbounded array growth).<br>`T2-F3-02`: Equipping `"none"` for all optional outfit slots simultaneously.<br>`T2-F3-03`: Switching rapidly through all outfit combinations while dream-mist animation is active.<br>`T2-F3-04`: Saving CatNap outfit with empty custom name (falls back to auto-generated timestamped title).<br>`T2-F3-05`: Touch interaction simulation on mobile viewport (`375×812`). |
| **F4 Boundaries** | `T2-F4-01`: Pressing jump repeatedly while CatNap is already airborne (double-jump cap enforced cleanly).<br>`T2-F4-02`: Immediate obstacle collision on first frame after start (`score === 0` game-over handling).<br>`T2-F4-03`: High score tie / lower score run does not overwrite existing higher `catnapDashHighScore`.<br>`T2-F4-04`: Switching navigation tabs mid-game cleanly pauses/cancels `requestAnimationFrame` loop without background errors.<br>`T2-F4-05`: Extended high-speed run (simulating 1,000+ frames) verifying obstacle despawn/recycling prevents memory growth. |
| **F5 Boundaries** | `T2-F5-01`: Switching directly between *Golden* → *Takedown* → *Soda Pop* while playing without overlapping orphan oscillators.<br>`T2-F5-02`: Initializing audio engine in headless browser before/after user gesture (`AudioContext.resume()` handling).<br>`T2-F5-03`: Rapid play/stop toggling (10× in 200ms) without throwing `InvalidStateError` on Web Audio nodes.<br>`T2-F5-04`: Setting master volume to `0.0` (mute) and back to `1.0` mid-playback.<br>`T2-F5-05`: Navigating away from K-Pop Stage while track is playing cleanly silences/suspends synthesis nodes. |
| **F6 Boundaries** | `T2-F6-01`: Simultaneous chord press (`D` + `F` + `J` + `K` pressed on the exact same frame).<br>`T2-F6-02`: Pressing lane keys when lane has zero notes in judgement window (empty lane press / anti-spam handling).<br>`T2-F6-03`: Letting notes pass bottom boundary untouched (registers `MISS` and resets combo counter to `0`).<br>`T2-F6-04`: Toggling all Beat Pad loops ON simultaneously and then toggling all OFF.<br>`T2-F6-05`: Recording a 0-event empty Beat Pad remix and attempting replay/save. |
| **F7 Boundaries** | `T2-F7-01`: Dual-city clock midnight rollover test (`2026-09-21T05:30:00Z` → SF is `22:30 PDT` Sunday Sept 20 while Boston is `01:30 EDT` Monday Sept 21).<br>`T2-F7-02`: Dual-city clock DST vs Standard Time transition test (`2026-01-15T17:00:00Z` PST/EST vs `2026-07-15T17:00:00Z` PDT/EDT).<br>`T2-F7-03`: Generating "Send Creation Card to Mom" when Gallery has 0 saved tattoos and 0 game scores played yet (renders graceful default starter art & friendly encouragement message).<br>`T2-F7-04`: Profile name input with whitespace-only or 100+ character string (sanitized & clamped cleanly).<br>`T2-F7-05`: Adding 20+ stickers onto a single Mom postcard on the Postcard Wall. |
| **F8 Boundaries** | `T2-F8-01`: Corrupted JSON injected into `localStorage.setItem('cheer_up_studio_v1_tattoos', '{invalid-json')` followed by `page.reload()` (graceful self-healing recovery with zero uncaught exceptions).<br>`T2-F8-02`: Deleting the last remaining item in Gallery (clean empty-state placeholder rendered).<br>`T2-F8-03`: Saving 25+ creations across all 3 categories and verifying pagination/scroll & storage quota handling.<br>`T2-F8-04`: Opening `dist/index.html` with all external network requests blocked (`Fetch.enable` / offline mode) and confirming 100% asset/audio/font integrity.<br>`T2-F8-05`: Deleting an item that is currently selected for the "Share with Mom" postcard preview (gracefully falls back to next available item or default). |

#### Tier 3: Cross-Feature Combinations (Pairwise R1, R2, R3, R4 Integration Matrix — 8 Tests)

| Test ID | Interacting Modules | Pairwise Cross-Feature Verification Scenario |
|---|---|---|
| `T3-X-01` | **R2 (Rooftop Dash) → R1 (Tattoo Studio)** | Playing CatNap Rooftop Dash and collecting milestone moons unlocks exclusive bonus CatNap/Boston-SF stamps that immediately become selectable and placeable on the R1 Tattoo Studio canvas. |
| `T3-X-02` | **R3 (Rhythm Stage) → R1 (Tattoo Studio)** | Achieving a high combo on *Golden* / *Takedown* / *Soda Pop* unlocks special glowing HUNTR/X & Saja Boys holographic crest stamps in the R1 Tattoo Studio. |
| `T3-X-03` | **R1 (Tattoo Studio) → R4 (Mom Postcard Generator)** | Designing and saving a custom tattoo in R1 automatically populates the Tattoo Showcase frame inside R4's "Send Creation Card to Mom" PNG generator and embeds the exact tattoo artwork pixels into the exported PNG. |
| `T3-X-04` | **R2 (Rooftop Dash & Customizer) → R4 (Mom Postcard Generator)** | Setting a new Rooftop Dash high score and equipping a custom CatNap outfit in R2 dynamically updates the High-Score & CatNap Companion badges rendered onto R4's exported Mom Postcard PNG. |
| `T3-X-05` | **R3 (Rhythm Stage) → R4 (Mom Postcard Generator)** | Achieving high scores across *Golden*, *Takedown*, and *Soda Pop* in R3 updates the K-Pop Demon Hunters Concert Scoreboard section on R4's exported Mom Postcard PNG. |
| `T3-X-06` | **R1 + R2 + R3 → R4 (Unified Gallery Round-Trip Reload)** | Saving creations in R1 (tattoo), R2 (CatNap outfit), and R3 (song remix), executing `page.reload()`, opening R4 Gallery, and clicking "Load in Studio" for each item restores the exact canvas layers in R1, plush outfit in R2, and Beat Pad loop sequence in R3. |
| `T3-X-07` | **R4 (Daily Cheer-Up Capsule & Postcard Wall) → R1 & R2** | Opening Mom's Daily Cheer-Up Capsule in R4 awards a Bay Area ↔ Boston family sticker that can be stamped both onto Mom's postcards (R4) and onto a temporary tattoo design (R1). |
| `T3-X-08` | **R3 (Web Audio Engine) ↔ R2 (Rooftop Dash & CatNap Purr FX)** | Verifying shared Web Audio `AudioContext` coordination: switching between R3 song synthesis, R2 CatNap purr/jump sound effects, and R4 postcard chimes produces zero audio node conflicts or console errors. |

#### Tier 4: Real-World Application Scenarios (End-to-End Family User Journeys — 4 Tests)

| Journey ID | Persona & Scenario Name | End-to-End Multi-Step Verification Flow |
|---|---|---|
| `T4-J-01` | **Journey 1: Sunday Afternoon in Boston with Mom (Tattoo Creation → Virtual Try-On → Printable Transfer Sheet)** | Daughter opens app in Boston → sets profile name to `"Mia in Boston"` → checks Dual-City Clock (sees Mom's Bay Area time vs Boston time) → opens Tattoo Studio → combines a CatNap moon stamp, a HUNTR/X *Golden* emblem, and a `"Boston ❤️ SF"` bridge badge → adds rainbow glitter strokes → previews on virtual arm with skin tone adjustment → exports the **Mirrored 8.5"×11" Printable Transfer Sheet** → verifies pixel-exact horizontal reflection and wet-sponge transfer instructions. |
| `T4-J-02` | **Journey 2: Cozy CatNap Playtime & Starlight Rooftop Adventure** | Daughter visits CatNap Playground → pets CatNap to see lavender dream mist → dresses CatNap in a HUNTR/X idol jacket + Boston winter scarf → plays **CatNap's Starlight Rooftop Dash** across Boston brownstones and Golden Gate towers → collects moons & stickers → beats high score → restarts for a second run → saves her CatNap outfit to the Gallery. |
| `T4-J-03` | **Journey 3: K-Pop Demon Hunters Concert & Beat Pad Remix Session** | Daughter enters K-Pop Demon Hunters Stage → jams to *Golden*, *Takedown*, and *Soda Pop* in the 4-lane Rhythm Game (`D`/`F`/`J`/`K` + touch lanes) hitting `PERFECT` combos → opens Beat Pad & Song Remix Studio → layers drums, bassline, synth lead, and CatNap purr FX → records a custom remix track → saves remix to Gallery. |
| `T4-J-04` | **Journey 4: Bay Area ↔ Boston Connection & Sending Creation Card to Mom Across Reloads** | Daughter reloads the browser (`page.reload()`) → verifies her profile, tattoos, CatNap outfits, song remixes, and high scores are all intact in Gallery → reads Mom's warm postcards on the Postcard Wall and decorates them with stickers → opens **"Send Creation Card to Mom"** generator → writes a personal message (`"Love you Mom! Look at my tattoo and high score!"`) → generates and downloads the composite `1200×800` PNG postcard to send to Mom in the Bay Area. |

---

## 6. Deterministic Execution Commands for Packaging & E2E Verification

### 6.1 Packaging Command (Zero-Backend `dist/` Builder)
```bash
python3 scripts/build_dist.py
```
- **Outputs**:
  - `dist/index.html` — Complete standalone single-file application bundle (all CSS, ES modules, SVG stamps, and synth presets inlined; zero external network requests).
  - `dist/assets/` — Static asset mirror for standard web hosting.

### 6.2 Automated Headless Browser Verification Suite Runner
```bash
python3 tests/run_e2e_suite.py --browser /usr/bin/google-chrome --target dist/index.html
```
- **Execution Architecture**:
  1. Starts an ephemeral local HTTP server on `127.0.0.1:<free_port>` serving the application root / `dist/`.
  2. Launches `/usr/bin/google-chrome --headless=new --no-sandbox --disable-gpu --autoplay-policy=no-user-gesture-required --remote-debugging-port=<free_cdp_port> --window-size=1440,900`.
  3. Connects via Python `websockets` to the CDP WebSocket endpoint (`ws://127.0.0.1:<cdp_port>/devtools/page/<target_id>`).
  4. Executes all **5 Core Acceptance Criteria** + **Tier 1 (40 tests)** + **Tier 2 (40 tests)** + **Tier 3 (8 tests)** + **Tier 4 (4 journeys)** = **92 automated assertions**, asserting zero `console.error` / `pageerror` events across the entire run and outputting a structured JSON + Markdown verification report.
