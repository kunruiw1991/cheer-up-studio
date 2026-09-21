# Survey Explorer 1 — Comprehensive Technical Analysis (`explorer_survey_1`)

## Executive Summary

1. **Host Environment & Runtime Toolchains**: The host runs Debian Linux (`7.1.6-1rodete1-amd64` x86_64) with `/usr/bin/python3` (**Python 3.13.15** + pre-installed `websockets` package) and `/usr/bin/google-chrome` (**Google Chrome 153.0.8010.52**) + `/usr/bin/xvfb-run`. Crucially, `/` (`/dev/glinux_20250818/root`, backing `/usr/local/google/home/kunruiwang/...`) has **only 63 MB of free disk space** (`100%` used out of 115 GB), whereas `/dev/shm` (`16 GB` free) and `/tmp` (`11 GB` free) are `tmpfs` RAM disks. Therefore, **installing npm packages (`node_modules`, Vite, Playwright, Puppeteer) onto `/` is strictly prohibited** as it will immediately fail with `ENOSPC`. Instead, we specify a rock-solid **Zero-Dependency Modular ES6 + Python 3 Build & CDP Verification Architecture** that consumes `< 1 MB` of disk, compiles both a multi-file static `dist/` directory and a standalone single-file `dist/index.html` (`file://`-compatible), and runs full headless Chrome 153 DevTools Protocol (CDP) E2E tests using `--user-data-dir=/dev/shm/...`.
2. **Requirement R1 (Temporary Tattoo Designer & Printable Transfer Sheet Studio)**: Fully specified scene-graph data models, 20 vector stamps across all 3 required collections (*CatNap & Smiling Critters*, *K-Pop Demon Hunters*, *Bay Area ↔ Boston Coast-to-Coast Connection*), 4 procedural HTML5 2D Canvas brushes (*Neon Glow*, *Glitter/Sparkle*, *Rainbow*, *Metallic Ink*), customizable text banners, non-destructive transform gizmos + immutable Undo/Redo stack, anatomical Virtual Try-On Preview (*Arm*, *Wrist*, *Hand* with adjustable skin tones & lighting), and a pixel-exact buffer-reflection algorithm for the 1-click **Mirrored Printable Transfer Sheet Export** guaranteed to satisfy `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` with zero sub-pixel anti-aliasing drift.
3. **Requirement R2 (CatNap & Smiling Critters Cozy Playground & Mini-Game)**: Fully specified kid-friendly, cozy-magical interactive SVG/Canvas CatNap companion with click/touch reactions, Web Audio purr synthesis, lavender dream-mist particle physics, facial expression state machine, 4-category plush customizer (*K-Pop Idol Jackets*, *Glowing Headphones*, *Crescent Moon Pendants*, *Boston Winter Scarves*), and the **"CatNap's Starlight Rooftop Dash"** arcade runner across Boston brownstones & San Francisco Golden Gate towers with collectible moons, musical notes, unlockable Tattoo Studio sticker rewards, high-score persistence, and deterministic frame-stepping verification hooks.

---

## 1. Host Environment Audit & Recommended Zero-Backend Architecture

### 1.1 Empirical Host Environment Inspection Results

All measurements were directly verified via shell execution on the target host:

| Subsystem / Resource | Observed State / Path | Version / Capacity | Architectural Impact |
| :--- | :--- | :--- | :--- |
| **OS & Kernel** | `Linux kunruiwang.c.googlers.com 7.1.6-1rodete1-amd64` | Debian x86_64 | Standard POSIX environment |
| **Root Filesystem (`/`)** | `/dev/glinux_20250818/root` (mounts `/usr/local/google/home/...`) | **63 MB Avail / 115 GB Total (100% used)** | **CRITICAL**: Zero room for `node_modules` or browser downloads; all build artifacts must stay compact (`< 2 MB`). |
| **Shared Memory (`/dev/shm`)** | `tmpfs` mounted on `/dev/shm` | **16 GB Avail / 16 GB Total (1% used)** | **IDEAL**: Use `/dev/shm` for all temporary Chrome headless profiles (`--user-data-dir=/dev/shm/...`) and test artifacts. |
| **Temp Directory (`/tmp`)** | `tmpfs` mounted on `/tmp` | **11 GB Avail / 16 GB Total (33% used)** | Abundant fast RAM-backed scratch space. |
| **Python 3 Runtime** | `/usr/bin/python3` | **Python 3.13.15** | Pre-installed with `http.server`, `urllib.request`, `json`, `asyncio`, and **`websockets`**. |
| **Headless Browser** | `/usr/bin/google-chrome` + `/usr/bin/xvfb-run` | **Google Chrome 153.0.8010.52** | Verified working with `--headless=new --no-sandbox --disable-gpu --remote-debugging-port=<port>`. |
| **Node.js Binaries** | Not on default `$PATH`, but present at:<br>1. `/usr/local/google/home/kunruiwang/.jetski-server/bin/2.0.20260427120035-2a385bc01a463b9e1c179b8cd6ec8c5490efe27f/node`<br>2. `/usr/local/google/home/kunruiwang/.cache/ms-playwright-go/1.57.0/node` | **v22.21.1**<br>**v24.11.1** | Available for JS syntax checks (`node --check`), though Python 3 handles serving, bundling, and CDP automation with zero external dependencies. |
| **NPM Registry Access** | `https://registry.npmjs.org/vite` | HTTP `200 OK` | Network is open, but downloading packages to `/` is unsafe due to the 63 MB disk ceiling. |

### 1.2 Recommended Web Stack & Dual-Mode Build Pipeline

To guarantee **zero `ENOSPC` risk**, **zero external runtime dependencies**, **100% deterministic headless verification**, and **seamless execution both over HTTP (`http://127.0.0.1:<port>`) and standalone `file://` / AirDrop / email delivery**, we recommend:

1. **Frontend Runtime Stack**:
   - **Pure Modern Browser Standards (HTML5 + CSS3 Custom Properties + ES2022 Modules + HTML5 2D Canvas + Inline SVG + Web Audio API)**.
   - Zero external CDN or runtime npm dependencies required—ensuring the app works 100% offline on an iPad, laptop, or phone in Boston or the Bay Area.
2. **Modular Source Layout (`src/`)**:
   - `index.html` — Main app shell with navigation tabs (`Tattoo Studio`, `CatNap Playground`, `K-Pop Demon Hunters Stage`, `Bay ↔ Boston Hub & Gallery`).
   - `src/styles/main.css` — Responsive, kid-friendly glassmorphic & neon-pastel UI theme optimized for both desktop mouse/keyboard and iPad touch targets (`min-height: 44px`).
   - `src/state/store.js` — Central reactive state store + `localStorage` persistence manager (`cheer_up_studio_v1_*` keys) + cross-module event bus (e.g., unlocking a sticker in CatNap Rooftop Dash immediately makes it available in the Tattoo Studio).
   - `src/assets/vector_stamps.js` — Pure SVG path/group definitions for all 3 stamp collections + unlockable rewards.
   - `src/modules/tattoo_studio/` — Scene graph, freehand brush shaders, transform gizmos, Undo/Redo stack, Virtual Try-On renderer, and Pixel-Exact Mirrored Sheet Exporter.
   - `src/modules/catnap_playground/` — Interactive SVG/Canvas CatNap plush companion, lavender dream-mist particle engine, 4-slot wardrobe customizer, and Starlight Rooftop Dash arcade game engine.
   - `src/modules/kpop_stage/` — Web Audio API multi-track synthesizer (*Golden*, *Takedown*, *Soda Pop*), 4-lane falling-note rhythm engine, and Beat Pad loop/remix studio.
   - `src/modules/connection_hub/` — Editable profile header, dual-city live clock/weather-vibe widget (`America/Los_Angeles` vs. `America/New_York`), Mom's postcard wall, "Send Creation Card to Mom" PNG card compositor, and Creations Gallery.
3. **Zero-Dependency Python 3 Bundler (`scripts/build_dist.py`)**:
   - Because browsers enforce CORS restrictions on `<script type="module" src="...">` when opened directly via `file:///...`, `scripts/build_dist.py` topologically resolves all local ES module imports and CSS files and emits:
     - `dist/index.html`: A **single, self-contained HTML file** with all CSS and JavaScript bundled inline (`<style>...</style>` + `<script>...</script>`), playable anywhere via double-click (`file://`), AirDrop, or static hosting.
     - `dist/assets/`: Clean static copy for standard web servers.
4. **Verified Headless Chrome DevTools Protocol (CDP) Test Harness (`scripts/verify_e2e.py`)**:
   - Launches `python3 -m http.server <port>` in a background thread.
   - Spawns `/usr/bin/google-chrome --headless=new --no-sandbox --disable-gpu --autoplay-policy=no-user-gesture-required --user-data-dir=/dev/shm/cheer_up_cdp_<pid> --remote-debugging-port=<cdp_port>`.
   - Connects via Python's pre-installed `websockets` library to subscribe to `Runtime.consoleAPICalled` and `Runtime.exceptionThrown` (asserting zero `console.error` / uncaught `pageerror`) and executes programmatic assertions for all 5 acceptance criteria.

---

## 2. Requirement R1 Survey: Temporary Tattoo Designer & Printable Transfer Sheet Studio

### 2.1 Vector Stamp Collections & Schema (3 Mandatory Collections + Unlockables)

Every stamp is defined as a resolution-independent vector descriptor rendered crisply at any scale on both the design canvas and high-DPI printable sheets:

```ts
interface TattooStampDefinition {
  id: string;
  collection: 'catnap_critters' | 'kpop_demon_hunters' | 'bay_boston_connection';
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  unlockable?: boolean; // true for bonus stickers earned in R2 Rooftop Dash
  defaultColors: string[];
  render(ctx: CanvasRenderingContext2D, w: number, h: number, palette?: string[]): void;
  svgMarkup: string; // Self-contained <svg viewBox="0 0 200 200">...</svg> for UI palette & SVG export
}
```

#### Complete Required Stamp Catalog:
1. **Collection A — CatNap & Smiling Critters (`catnap_critters`)**:
   - `catnap_crescent_pendant`: Cozy purple CatNap silhouette with glowing golden crescent moon necklace charm and starry eyes.
   - `lavender_dream_cloud`: Fluffy pastel lavender cloud exhaling shimmering starlight mist and tiny sleeping Zzzs.
   - `starry_night_paw`: Plush purple cat paw print with constellation stars inside each toe bean.
   - `dogday_sun_emblem`: Warm golden-orange DogDay smiling sun medallion (Smiling Critters best friend).
   - `craftycorn_rainbow_star`: CraftyCorn magical pastel rainbow arc with shooting star tip.
   - `hoppy_hopscotch_lightning`: Hoppy Hopscotch mint-green star-bolt badge.
2. **Collection B — K-Pop Demon Hunters (`kpop_demon_hunters`)**:
   - `huntrx_rumi_emblem`: HUNTR/X leader Rumi's crimson-and-gold celestial demon-hunter crest with winged star blade.
   - `huntrx_mira_emblem`: HUNTR/X Mira's electric violet cyber-rune shield & twin crescent daggers.
   - `huntrx_zoey_emblem`: HUNTR/X Zoey's holographic cyan sonic-wave star & heart-lock sigil.
   - `demon_hunter_lightstick_blade`: Dual-mode K-Pop concert lightstick / glowing crystal demon-slayer wand.
   - `saja_boys_golden_crest`: Saja Boys radiant solar crown emblem inspired by *"Golden"*.
   - `saja_boys_takedown_sigil`: High-voltage neon slash & tiger-claw emblem inspired by *"Takedown"*.
   - `saja_boys_soda_pop_neon`: Bubbly pastel-neon fizzy soda crown & star-straw crest inspired by *"Soda Pop"*.
3. **Collection C — Bay Area ↔ Boston Coast-to-Coast Connection (`bay_boston_connection`)**:
   - `golden_gate_to_boston_bridge`: Split-circle unity badge joining San Francisco's International Orange Golden Gate suspension tower with Boston's Zakim Bridge & brownstone skyline under a shared starry sky.
   - `boston_duckling_bridge_badge`: Beloved Boston Public Garden *Make Way for Ducklings* mama duck + ducklings crossing the lagoon bridge with a heart balloon.
   - `mom_heart_daughter_crest`: "Mom ❤️ Daughter — SF ↔ Boston" ribbon banner encircling twin intertwined hearts & coast-to-coast paper airplane.
   - `boston_superstar_crest`: "Boston Superstar" warm teacup, cozy knit scarf, and Boston Common swan boat crest.
4. **Unlockable Bonus Stamps (Earned via R2 CatNap Rooftop Dash)**:
   - `starlight_rooftop_champion`: Unlocked upon collecting 5+ crescent moons / stickers in Rooftop Dash.
   - `coast_to_coast_superstar`: Unlocked upon reaching score threshold in Rooftop Dash.

### 2.2 Freehand Brushes, Color Pickers & Customizable Text Banners

All drawing operations record vector point streams (`{ x, y, pressure, t }[]`) so strokes re-render cleanly during layer transforms, Undo/Redo, and high-DPI sheet export:

1. **Four Required Freehand Brush Shaders**:
   - **Neon Glow (`neon_glow`)**: 3-pass stroke shader: outer wide colored bloom (`ctx.shadowColor = color; ctx.shadowBlur = size * 2.2; globalAlpha = 0.45`), mid saturated core (`lineWidth = size`), and inner bright white-hot filament (`strokeStyle = '#ffffff'; lineWidth = size * 0.35`).
   - **Glitter / Sparkle (`glitter_sparkle`)**: Base translucent ink stroke overlaid with deterministic seeded PRNG (`mulberry32(strokeSeed)`) 4-point star sparkles and diamond micro-glints distributed along stroke arc length with varying rotation, scale, and high-luminance pastel highlights.
   - **Rainbow (`rainbow`)**: Segmented Catmull-Rom spline renderer advancing hue continuously by arc length (`hsl((startHue + cumulativeDistance * 0.8) % 360, 95%, 60%)`) with smooth round caps.
   - **Metallic Ink (`metallic_ink`)**: Parallel multi-ribbon shader combining a deep metallic base tone with offset specular sheen highlights (`#fff8d6` / `#e8f4ff`) simulating gold, silver, rose-gold, or holographic chrome foil.
2. **Color Pickers**:
   - Curated quick-swatch palettes (*CatNap Lavender & Midnight*, *HUNTR/X Neon Cyber*, *Saja Boys Soda Pop*, *Metallic Foil*) + full `<input type="color">` custom hex picker + brush size slider (`2px–36px`) + opacity slider.
3. **Customizable Text Banners**:
   - Interactive text banner tool allowing custom text input (e.g., `"HUNTR/X FOREVER"`, `"BOSTON ♡ SF"`, custom name), font style selector (*K-Pop Bold Display*, *Cozy Bubble Script*, *Varsity Crest*), text color + outline color, optional curved ribbon scroll banner background, and full layer transform support.

### 2.3 Scene Graph & Layer Transform Engine

```ts
interface TattooLayer {
  id: string;
  type: 'stamp' | 'stroke' | 'text';
  x: number;          // Center X in normalized design canvas coordinates (e.g. 0..600)
  y: number;          // Center Y in normalized design canvas coordinates (e.g. 0..600)
  scale: number;      // Uniform scale factor (0.2 .. 4.0)
  rotation: number;   // Rotation angle in radians (-π .. +π)
  opacity: number;    // 0.0 .. 1.0
  flipX?: boolean;
  data: StampLayerData | StrokeLayerData | TextLayerData;
}
```

- **Interactive Gizmo & Toolbar Transforms**:
  - **Drag**: Pointer drag inside selected layer bounding box translates `(x, y)`.
  - **Scale**: Corner handle drag or toolbar `+ / - / slider` scales uniformly.
  - **Rotate**: Top rotation handle drag or toolbar `-15° / +15° / slider` updates `rotation`.
  - **Duplicate**: Clones selected layer with `(+20, +20)` offset and pushes to top of layer stack.
  - **Delete / Z-Order**: Delete selected layer, Bring Forward, Send Backward, Clear Canvas.
  - **Undo / Redo Stack**: Every discrete mutation pushes a deep-cloned `TattooLayer[]` snapshot onto `historyStack` (capped at 50 states), enabling instant Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`).

### 2.4 Virtual Try-On Preview Engine

- Renders a dedicated interactive preview canvas (`#virtual-tryon-canvas`) alongside the design studio with:
  - **3 Body Placement Views**:
    1. `forearm` (Inner Forearm / Arm)
    2. `wrist` (Inner Wrist with bracelet/charm accent)
    3. `hand` (Back of Hand / Thumb web)
  - **Adjustable Skin Tone Selector**:
    - 6 inclusive skin tone presets (ranging from warm ivory/porcelain and golden peach to warm tan, caramel, bronze, and deep espresso) + continuous warmth/undertone slider.
  - **Adjustable Lighting Environment**:
    - `daylight`: Crisp natural Boston afternoon sunlight.
    - `golden_hour`: Warm California Golden Gate sunset glow.
    - `kpop_stage`: Dual-rim magenta/cyan K-Pop concert stage lighting.
  - **Realistic Skin Adhesion Shader**:
    - Composites the live tattoo design canvas onto the anatomical limb silhouette using cylindrical shading, soft edge feathering, subtle skin texture multiply blend (`globalCompositeOperation = 'multiply'` combined with `source-over` at `0.88` opacity for metallic/neon highlights), and limb clipping mask so the tattoo conforms naturally to the arm/wrist/hand boundary.

### 2.5 Printable Mirrored Tattoo Sheet Export & Exact Pixel Reflection Guarantee

#### Mathematical Acceptance Requirement
Acceptance Criterion 2 explicitly requires:
> **Tattoo Studio Verification**: Programmatic test confirms adding stamps from all 3 theme categories, drawing strokes on the canvas, rendering the virtual arm preview, and invoking the **Mirrored Printable Sheet Export**—verifying pixel-level horizontal reflection (`mirroredImage(x, y) === sourceImage(width - 1 - x, y)`) and non-empty image data output.

#### Critical Engineering Insight — Avoiding Sub-Pixel Rasterization Drift
If an implementation generates the mirrored image by re-executing Canvas 2D drawing commands under `ctx.scale(-1, 1); ctx.translate(-width, 0)`, browser GPU/CPU scanline anti-aliasing at fractional pixel edges produces `±1..3` LSB discrepancies (`mirroredImage(x, y) !== sourceImage(width - 1 - x, y)`).

#### Mandatory Exact Pixel Reflection Pipeline
1. Render the final high-resolution normal tattoo canvas (`sourceCanvas`, width $W$, height $H$, e.g. $W = 600, H = 600$).
2. Extract `sourceImageData = sourceCtx.getImageData(0, 0, W, H)`.
3. Construct `mirroredCanvas` (width $W$, height $H$) and allocate `mirroredImageData = mirroredCtx.createImageData(W, H)`.
4. Execute exact pixel-by-pixel horizontal reflection across every row $y \in [0, H-1]$ and column $x \in [0, W-1]$:
   ```js
   for (let y = 0; y < H; y++) {
     for (let x = 0; x < W; x++) {
       const srcOffset = (y * W + (W - 1 - x)) * 4;
       const dstOffset = (y * W + x) * 4;
       mirroredImageData.data[dstOffset]     = sourceImageData.data[srcOffset];     // R
       mirroredImageData.data[dstOffset + 1] = sourceImageData.data[srcOffset + 1]; // G
       mirroredImageData.data[dstOffset + 2] = sourceImageData.data[srcOffset + 2]; // B
       mirroredImageData.data[dstOffset + 3] = sourceImageData.data[srcOffset + 3]; // A
     }
   }
   mirroredCtx.putImageData(mirroredImageData, 0, 0);
   ```
5. Compose the **8.5"×11" Printable Transfer Sheet Canvas** (`sheetCanvas`, $1275 \times 1650$ px at 150 DPI, exact $8.5:11$ aspect ratio):
   - Top banner: *"Boston ↔ Bay Area Creative Cheer-Up Studio — Printable Temporary Tattoo Transfer Sheet (MIRRORED FOR INKJET TATTOO PAPER)"*.
   - Multi-up grid (e.g., $2 \times 2$ large tattoos + $3$ mini wrist/finger badges) stamped directly from `mirroredCanvas` with crisp dashed scissor cut guides (`setLineDash([8, 6])`) and corner trim marks around each transfer patch.
   - Bottom illustrated step-by-step instruction card:
     - **Step 1**: Print this sheet onto Inkjet Temporary Tattoo Transfer Paper (image is already horizontally mirrored so text & crests appear right-way-round on skin!).
     - **Step 2**: Apply the clear adhesive carrier sheet smoothly over the printed ink and cut closely around each tattoo along the dashed scissor guides.
     - **Step 3**: Peel off the clear protective film and press the tattoo face-down onto clean, dry skin (arm, wrist, or hand).
     - **Step 4**: Hold a wet sponge or damp cloth firmly against the paper backing for 30 seconds until thoroughly soaked, then gently slide the paper off to reveal your custom tattoo!
6. Expose both the 1-click UI download triggers (`normalPngDataUrl`, `mirroredDesignPngDataUrl`, `printableSheetPngDataUrl`) AND the synchronous programmatic verification API:
   ```js
   window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()
   // Returns:
   // {
   //   width: W,
   //   height: H,
   //   sourceImageData,        // ImageData of normal design (W x H)
   //   mirroredImageData,      // ImageData of mirrored design (W x H) -> GUARANTEED mirroredImage(x,y) === sourceImage(W-1-x,y)
   //   normalPngDataUrl,       // "data:image/png;base64,..."
   //   mirroredPngDataUrl,     // "data:image/png;base64,..."
   //   printableSheetPngDataUrl // "data:image/png;base64,..." (8.5"x11" layout with cut guides & wet-sponge instructions)
   // }
   ```

---

## 3. Requirement R2 Survey: CatNap & Smiling Critters Cozy Playground & Mini-Game

### 3.1 Interactive CatNap Companion & Plush Customizer

Designed specifically to be **100% cozy, magical, warm, and non-frightening**:
- **Visual & Interactive Character Rig**:
  - Layered SVG/Canvas character rig featuring plush royal-lavender fur, oversized friendly eyes with starry pupils, floppy cat ears, wagging tail, and animated breathing/bobbing idle cycle.
  - **Interactive Touch/Click Reaction System**:
    - Clicking/tapping CatNap triggers:
      1. Incrementing `interactionCount` & friendship heart meter.
      2. Synthesizing a warm, soothing musical purr & starlight chime via Web Audio API (`playCozyPurr()`).
      3. Spawning a burst of **Lavender Dream-Mist Particles** (soft glowing lavender puffs, crescent moons, and floating hearts drifting upward with gentle sinusoidal sway).
      4. Cycling/triggering expressive facial states: `happy_smile`, `sleepy_purr`, `starry_excited`, `giggle_wink`, `cozy_hug`.
- **Plush Wardrobe Customizer (4 Required Categories)**:
  1. **Outfits / Jackets (`jacket`)**:
     - `none` (Classic Cozy Plush)
     - `kpop_idol_jacket` (HUNTR/X Holographic Sequined Stage Jacket)
     - `saja_neon_bomber` (Saja Boys *Soda Pop* Pastel-Neon Varsity Bomber)
     - `starlight_sleepover_hoodie` (Lavender Cloud Hoodie)
  2. **Headphones / Headgear (`headphones`)**:
     - `none`
     - `glowing_neon_headphones` (Glowing Cyber-Idol Cat-Ear Headphones)
     - `demon_hunter_crown_headset` (Rumi Stage Mic & Tiara Headset)
     - `starlight_sleep_cap` (Crescent Nightcap)
  3. **Pendants / Charms (`pendant`)**:
     - `crescent_moon_gold` (Signature Golden Crescent Moon Pendant)
     - `huntrx_crystal_pendant` (Glowing Demon-Hunter Prism Pendant)
     - `sf_boston_heart_locket` (Bay Area ↔ Boston Golden Bridge Heart Locket)
  4. **Boston Winter Scarves (`scarf`)**:
     - `none`
     - `boston_crimson_knit_scarf` (Cozy Back Bay Crimson & Cream Winter Scarf)
     - `fenway_emerald_scarf` (Boston Common Emerald & Gold Snowflake Scarf)
     - `golden_gate_sunset_scarf` (SF Warm Fog & Sunset Gradient Scarf)
  - All outfit selections update the character live, persist to `localStorage`, and can be saved directly to the **My Creations Gallery** (`R4`).

### 3.2 "CatNap's Starlight Rooftop Dash" Mini-Game Architecture

- **Setting & Dual-City Parallax Scenery**:
  - Background layer 1: Deep twilight indigo-violet sky with twinkling constellations, shooting stars, and a glowing crescent moon.
  - Background layer 2 (Alternating City Biomes every 500m):
    - **Boston Starry Brownstones Biome**: Beacon Hill Victorian brick rooftops, glowing bay windows, Citgo sign neon glow, and Zakim Bridge cables.
    - **San Francisco Golden Gate Biome**: Towering Art Deco International Orange suspension towers, shimmering Bay waves, Painted Ladies silhouettes, and Coit Tower.
  - Foreground layer: Scrollable rooftop platforms, bouncy lavender cloud trampolines, and rooftop gaps/chimneys.
- **State Machine**:
  - States: `IDLE` → `RUNNING` → `GAME_OVER` (with instant `restart()` back to `RUNNING`).
- **Physics & Controls**:
  - Fixed-timestep simulation (`dt = 1/60s`) ensuring identical behavior across 60Hz/120Hz displays and headless frame stepping.
  - Keyboard (`Space`, `ArrowUp`, `KeyW`) + Touch/Click support:
    - Single jump (`vy = -520 px/s`), double jump in mid-air (`vy = -460 px/s`) with a puff of lavender dream-mist, and optional hold-to-glide (`gravity * 0.45`).
- **Collectibles, Obstacles & Unlockable Sticker Rewards**:
  - **Crescent Moons**: `+10` score, `+1` moon counter.
  - **Glowing Musical Notes**: `+25` score, plays pentatonic chime.
  - **Tattoo Sticker Capsules**: `+50` score, unlocks exclusive stamps (`starlight_rooftop_champion`, `coast_to_coast_superstar`) directly inside the **R1 Tattoo Studio** stamp picker and persists unlock state in `localStorage`.
  - **Obstacles**: Sleepy chimney puffs / rooftop antennas. Colliding with an obstacle transitions state to `GAME_OVER`, updates `highScore = Math.max(highScore, score)` in `localStorage`, and displays a cheerful *"Cozy Landing! Play Again or Use Unlocked Stickers in Tattoo Studio"* modal.
- **Programmatic Verification Hooks (`window.__CHEER_UP_STUDIO__.catnapGame`)**:
  ```js
  window.__CHEER_UP_STUDIO__.catnapGame = {
    start(),                       // Transitions IDLE/GAME_OVER -> RUNNING, resets score=0
    stepFrames(count = 60),        // Deterministically advances physics, spawners, collisions, and score by `count` frames
    jump(),                        // Triggers player jump impulse
    triggerGameOver(),             // Deterministically triggers collision / GAME_OVER state for testing
    restart(),                     // Cleanly restarts game from GAME_OVER -> RUNNING with score=0
    getState()                     // Returns { status, score, highScore, distance, moonsCollected, unlockedStickers, playerY, playerVy }
  };
  ```

---

## 4. Cross-Module Integration Contracts (R1 ↔ R2 ↔ R3 ↔ R4)

| Producer Module | Consumer Module | Shared Contract / Mechanism |
| :--- | :--- | :--- |
| **R2 CatNap Rooftop Dash** | **R1 Tattoo Studio** | Collecting Tattoo Sticker pickups in Rooftop Dash unlocks bonus stamps in `store.state.unlockedStampIds` (persisted in `localStorage`) and refreshes the R1 stamp picker. |
| **R1 Tattoo Studio** | **R4 Gallery & Postcard Generator** | `saveTattooToGallery()` serializes `{ id, timestamp, title, layers, previewPngDataUrl, mirroredSheetPngDataUrl }` to `localStorage` and provides the latest tattoo image to the "Send Creation Card to Mom" generator. |
| **R2 CatNap Customizer & Game** | **R4 Gallery & Postcard Generator** | Saves custom CatNap outfits to Gallery and supplies `catnapGame.highScore` to the "Send Creation Card to Mom" postcard badge. |
| **All Modules (`R1–R4`)** | **Headless Verification Suite** | Unified `window.__CHEER_UP_STUDIO__` namespace exposing deterministic inspection and simulation methods for opaque-box & white-box automated verification. |
