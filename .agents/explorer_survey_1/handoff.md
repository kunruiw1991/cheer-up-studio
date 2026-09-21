# Handoff Report — Survey Explorer 1 (`explorer_survey_1`)

- **Handoff Type**: Hard (Survey Phase Complete)
- **Author**: `explorer_survey_1`
- **Target Recipient**: Parent Orchestrator (`8cc81a44-9cb1-4426-b839-d8d31e0c69a5`)
- **Detailed Technical Analysis Artifact**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_1/analysis.md`

---

## 1. Observation

All empirical observations below were obtained directly via shell commands and `view_file` inspections against `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`:

1. **Authoritative Project Specification (`ORIGINAL_REQUEST.md:1-49`)**:
   - Line 5: *"Build a standalone, zero-backend interactive web application ('Boston ↔ Bay Area Creative Cheer-Up Studio') designed for Kunrui's daughter living with her grandmother in Boston while her mom (Kunrui) is in the Bay Area. The app runs directly in any desktop or tablet browser (iPad/laptop/phone) and unites her three favorite creative passions—custom kid temporary tattoos, CatNap from Poppy Playtime (Smiling Critters), and K-Pop Demon Hunters (HUNTR/X & Saja Boys songs)—into an engaging, richly animated creative studio and game portal."*
   - Lines 12–20 (`R1`): Temporary Tattoo Designer & Printable Transfer Sheet Studio requiring 3 vector stamp collections (*CatNap & Smiling Critters*, *K-Pop Demon Hunters*, *Bay Area ↔ Boston Coast-to-Coast Connection*), 4 freehand brush shaders (*neon glow*, *glitter/sparkle*, *rainbow*, *metallic ink*), color pickers, text banners, layer transforms (*drag, scale, rotate, duplicate, undo/redo*), Virtual Try-On Preview (*arm/wrist/hand* with adjustable skin tones & lighting), and 1-click export of normal PNG + horizontally mirrored 8.5"×11" printable transfer sheet with cut guides & wet-sponge instructions.
   - Lines 22–25 (`R2`): CatNap & Smiling Critters Cozy Playground & Mini-Game requiring a kid-friendly interactive SVG/Canvas CatNap character (purrs, lavender dream-mist particles, facial expressions, and 4 customizable accessory categories: *K-Pop idol jackets, glowing headphones, crescent moon pendants, Boston winter scarves*) plus *"CatNap's Starlight Rooftop Dash"* arcade mini-game across Boston brownstones & San Francisco Golden Gate towers collecting crescent moons, musical notes, and unlockable tattoo stickers.
   - Lines 44–46 (`Acceptance Criteria`):
     - Line 44: *"Application loads cleanly in a headless Chromium browser with zero `console.error` or uncaught `pageerror` exceptions across all navigation tabs/views."*
     - Line 45: *"Tattoo Studio Verification: Programmatic test confirms adding stamps from all 3 theme categories, drawing strokes on the canvas, rendering the virtual arm preview, and invoking the Mirrored Printable Sheet Export—verifying pixel-level horizontal reflection (`mirroredImage(x, y) === sourceImage(width - 1 - x, y)`) and non-empty image data output."*
     - Line 46: *"CatNap Playground Verification: Programmatic test confirms interactive CatNap companion responds to clicks/customization changes and that the CatNap Rooftop Dash mini-game starts, updates score/state over simulated frames, and cleanly handles game-over and restart."*

2. **Host OS, Toolchain & Disk Capacity Observations (`run_command` outputs)**:
   - **OS & Kernel**:
     ```text
     Linux kunruiwang.c.googlers.com 7.1.6-1rodete1-amd64 #1 SMP PREEMPT_DYNAMIC Debian 7.1.6-1rodete1 (2026-08-05) x86_64 GNU/Linux
     ```
   - **Disk Space Alert (`df -h / /dev/shm /tmp`)**:
     ```text
     Filesystem                 Size  Used Avail Use% Mounted on
     /dev/glinux_20250818/root  115G  109G   63M 100% /
     tmpfs                       16G  4.0K   16G   1% /dev/shm
     tmpfs                       16G  5.1G   11G  33% /tmp
     ```
   - **Python 3 & Pre-Installed Modules**:
     - `/usr/bin/python3` is `Python 3.13.15`.
     - Verified importable modules: `http.server` (`[OK]`), `urllib.request` (`[OK]`), `json` (`[OK]`), `websockets` (`[OK]`).
     - Not installed in system Python: `playwright` (`[--]`), `selenium` (`[--]`), `PIL` (`[--]`), `numpy` (`[--]`).
   - **Browser Binaries & Headless Execution**:
     - `/usr/bin/google-chrome` is `Google Chrome 153.0.8010.52`.
     - `/usr/bin/xvfb-run` is present.
     - Verified live execution of `google-chrome --headless=new --no-sandbox --disable-gpu --dump-dom 'data:text/html,<h1>CheerUpStudioTest</h1>'`:
       ```text
       <html><head></head><body><h1>CheerUpStudioTest</h1></body></html>
       ```
     - Verified live end-to-end Python 3 + `websockets` + Chrome DevTools Protocol (CDP) evaluation (`--remote-debugging-port=9229 --user-data-dir=/dev/shm/cdp_test_...`):
       ```text
       CDP Runtime.evaluate(1+2+3) result: 6
       ```
   - **Node.js Binaries**:
     - `node`, `npm`, `npx`, `pnpm`, `yarn`, `bun` are NOT on default `/usr/bin:/bin` `$PATH`.
     - Standalone `node` binaries exist at:
       - `/usr/local/google/home/kunruiwang/.jetski-server/bin/2.0.20260427120035-2a385bc01a463b9e1c179b8cd6ec8c5490efe27f/node` (`v22.21.1`)
       - `/usr/local/google/home/kunruiwang/.cache/ms-playwright-go/1.57.0/node` (`v24.11.1`)

---

## 2. Logic Chain

1. **From Observation 2 (Root partition `/` has only 63 MB free, while `/dev/shm` has 16 GB free)**:
   - Any build or test workflow that runs `npm install` (e.g. installing `vite`, `playwright`, `puppeteer`, or TypeScript toolchains into `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/node_modules`) will attempt to write 80–350 MB onto `/` and **immediately fail with `ENOSPC: no space left on device`**.
   - Furthermore, launching `/usr/bin/google-chrome` without `--user-data-dir=/dev/shm/...` defaults to writing cache files under `~/.config/google-chrome` on `/`, risking disk exhaustion.
   - Therefore, the project MUST use:
     - **Zero-dependency browser-native ES Modules (`src/`)** for development.
     - **Python 3 (`python3 -m http.server`)** as the local static web server.
     - **Python 3 bundler (`scripts/build_dist.py`)** to produce both a static `dist/` directory and a standalone single-file `dist/index.html` (`< 350 KB` total) that works seamlessly via `file://` (avoiding browser CORS restrictions on `file://` ES module imports) and HTTP.
     - **Python 3 + `websockets` + Google Chrome 153 CDP (`--user-data-dir=/dev/shm/...`)** for all automated E2E browser verification.

2. **From Observation 1 (Acceptance Criterion 2: exact pixel-level horizontal reflection `mirroredImage(x, y) === sourceImage(width - 1 - x, y)`)**:
   - Re-rendering vector/stroke commands onto a second canvas with `ctx.scale(-1, 1); ctx.translate(-width, 0)` introduces 1-LSB anti-aliasing discrepancies along diagonal edges in Skia/Chromium rasterization.
   - To guarantee strict mathematical identity across every pixel `(x, y)` and every RGBA channel, the exporter MUST rasterize `sourceCanvas` once to `sourceImageData = ctx.getImageData(0, 0, W, H)`, compute `mirroredImageData` by exact index reversal (`dst[(y * W + x) * 4 + c] = src[(y * W + (W - 1 - x)) * 4 + c]`), put `mirroredImageData` onto `mirroredCanvas`, tile `mirroredCanvas` onto the 8.5"×11" printable transfer sheet canvas with cut guides and wet-sponge instructions, and return both buffers from `window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()`.

3. **From Observation 1 (Acceptance Criterion 3: CatNap Playground & Rooftop Dash verification)**:
   - Headless browser tests must verify both interactive companion state changes (click reaction, expression change, particle emission, outfit updates across jacket/headphones/pendant/scarf) and arcade mini-game lifecycle (`start()` → simulated frame updates increasing score/distance → `GAME_OVER` → `restart()`).
   - Providing a deterministic fixed-timestep simulation hook (`window.__CHEER_UP_STUDIO__.catnapGame.stepFrames(n)`) alongside the `requestAnimationFrame` loop guarantees fast, non-flaky verification in headless Chrome.

---

## 3. Caveats

1. **Scope Boundary with Peer Explorers**: Detailed Web Audio API multi-track song synthesis and 4-lane rhythm engine specifications (`R3`) are covered by `explorer_survey_2`, and detailed Connection Hub / Postcard Wall / `localStorage` gallery schema specifications (`R4`) are covered by `explorer_survey_3`. Cross-module integration contracts between `R1`/`R2` and `R3`/`R4` have been explicitly defined in `analysis.md` Section 4.
2. **Disk Space Vigilance**: Implementers must ensure generated PNG test artifacts or temporary logs are either written to `/dev/shm` / `/tmp` or cleaned up promptly so `/` retains its `~63 MB` headroom.

---

## 4. Conclusion

1. **Architecture & Build Stack**: Implement the application using clean modular ES2022 + HTML5 Canvas + Inline SVG + Web Audio API under `src/`, bundled via a zero-dependency Python 3 script (`scripts/build_dist.py`) into a standalone single-file `dist/index.html` and static `dist/` folder (`< 350 KB`). Never run `npm install` on `/`.
2. **Headless Verification Harness**: Run E2E verification via `/usr/bin/python3` (`websockets`) driving `/usr/bin/google-chrome --headless=new --no-sandbox --disable-gpu --autoplay-policy=no-user-gesture-required --user-data-dir=/dev/shm/... --remote-debugging-port=<port>`.
3. **R1 & R2 Blueprint Readiness**: All data structures, 20 vector stamps across 3 collections, 4 freehand brush shaders, transform gizmos, Undo/Redo stack, Virtual Try-On preview, exact buffer-reversed Mirrored Printable Sheet exporter, CatNap companion & 4-slot wardrobe customizer, and Starlight Rooftop Dash game engine with programmatic hooks are fully specified in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_1/analysis.md`.

---

## 5. Verification Method

To independently verify all findings in this report:

1. **Verify Host Disk & Toolchain Observations**:
   ```bash
   df -h / /dev/shm /tmp
   /usr/bin/python3 --version
   /usr/bin/google-chrome --version
   /usr/bin/python3 -c "import websockets; print(websockets.__file__)"
   ```
2. **Verify Detailed Technical Blueprint**:
   - Inspect `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_1/analysis.md`.
3. **Invalidation Conditions**:
   - If `/` free space drops below `10 MB`, move all temporary files to `/tmp` or `/dev/shm`.
   - If any Canvas export uses vector re-rendering with `ctx.scale(-1, 1)` rather than exact `ImageData` buffer reflection, `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` will fail on anti-aliased edge pixels.
