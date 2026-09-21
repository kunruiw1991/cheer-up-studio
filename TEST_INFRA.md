# TEST_INFRA.md — Opaque-Box 4-Tier E2E Verification Architecture & Infrastructure

## 1. Executive Summary & Verification Philosophy

This document defines the **Requirement-Driven Opaque-Box 4-Tier End-to-End (E2E) Verification Architecture** for the **Boston ↔ Bay Area Creative Cheer-Up Studio** web application (`ORIGINAL_REQUEST.md` / `PROJECT.md`).

The verification suite exercises the running application inside a real **Google Chrome 153 (`--headless=new`)** browser instance driven over the **Chrome DevTools Protocol (CDP)** via Python 3.13 + `websockets`. Every test operates against observable user-facing behavior—DOM elements, pointer/keyboard events, HTML5 Canvas 2D pixel buffers (`ImageData`), Web Audio API synthesis graphs, `localStorage` persistence across full browser reloads (`Page.reload`), and standalone `dist/` offline portability—while simultaneously asserting zero `console.error` or uncaught `pageerror` exceptions.

---

## 2. Host Environment Constraints & Zero-Footprint Execution Rules

Per `PROJECT.md § 1`, all E2E infrastructure strictly enforces the following host constraints:

1. **Root Disk Protection (`/` has < 3 GB free / strict 63 MB safety budget)**:
   - **Zero `npm install` / Node.js dependencies**: Neither Playwright nor Puppeteer npm packages are installed or permitted.
   - **Mandatory `/dev/shm` Ephemeral Profile & Artifact Storage**: Every headless Chrome instance launches with:
     ```bash
     /usr/bin/google-chrome \
       --headless=new \
       --no-sandbox \
       --disable-gpu \
       --autoplay-policy=no-user-gesture-required \
       --user-data-dir=/dev/shm/e2e_chrome_<pid>_<run_id> \
       --remote-debugging-port=<free_port> \
       --window-size=1440,900
     ```
   - All temporary profiles, crash dumps, downloaded PNGs, screenshots, and JSON test reports are written exclusively to `/dev/shm/e2e_chrome_*` and automatically cleaned up on exit (`try ... finally: shutil.rmtree(...)`).
2. **Native Verified Runtime Stack**:
   - **Driver Runtime**: `/usr/bin/python3` (`Python 3.13.15`) + standard library (`asyncio`, `http.server`, `json`, `urllib.request`, `base64`, `zlib`, `struct`) + pre-installed `websockets`.
   - **Browser Engine**: `/usr/bin/google-chrome` (`Google Chrome 153.0.8010.52`).

---

## 3. Complete Feature Inventory & Acceptance Criteria Mapping

Every feature in `PROJECT.md § 3 Feature Inventory` (`F1`–`F16`) and all 5 Acceptance Criteria (`AC-1`–`AC-5`) from `ORIGINAL_REQUEST.md` are mapped below with 100% test coverage:

### 3.1 Acceptance Criteria Gate (`AC-1` through `AC-5`)

| ID | Requirement & Acceptance Criterion | Programmatic Verification Method |
|---|---|---|
| **AC-1** | **Clean Headless Boot & Zero Console/Page Errors** | Attach CDP listeners to `Runtime.consoleAPICalled` (`type === 'error'`) and `Runtime.exceptionThrown` prior to page navigation. Navigate through all 4 navigation tabs (`tattoo`, `catnap`, `kpop`, `hub`). Assert `consoleErrors.length === 0` and `pageExceptions.length === 0`. |
| **AC-2** | **R1 Tattoo Studio & Pixel-Exact Mirrored Printable Sheet** | Place vector stamps from all 3 categories (`catnap`, `kpop`, `bay_boston`), draw freehand brush strokes on `[data-testid="tattoo-canvas"]`, render the virtual arm preview, and invoke the **Mirrored Printable Sheet Export**. Verify non-empty image output and exact pixel-for-pixel horizontal reflection across every coordinate: $$\forall y \in [0, H-1], \forall x \in [0, W-1]: \quad \text{Mirrored}(x, y) === \text{Source}(W - 1 - x, y)$$ |
| **AC-3** | **R2 CatNap Playground & Rooftop Dash Mini-Game** | Verify interactive CatNap companion responds to clicks/petting (purr counter & dream-mist particles) and outfit changes (jacket, headphones, pendant, scarf), and verify **CatNap's Starlight Rooftop Dash** starts (`running`), updates score/collectibles over simulated frames (`stepFrames(n)`), handles obstacle game-over (`gameover`), and restarts cleanly (`score === 0`). |
| **AC-4** | **R3 K-Pop Demon Hunters Stage & Rhythm / Remix Studio** | Verify Web Audio API synthesis graph initializes without errors for all 3 featured tracks (*Golden*, *Takedown*, *Soda Pop*), verify 4-lane falling-note rhythm game spawns notes and registers hit judgements (`PERFECT`/`GREAT`/`GOOD`) & combo multipliers on simulated key (`D`, `F`, `J`, `K`) and touch inputs, and verify Beat Pad mixer toggles loops cleanly. |
| **AC-5** | **R4 Gallery Persistence Across Reload & "Share with Mom" Postcard** | Save custom creations to the Gallery, execute a full browser page reload (`Page.reload`), assert saved items persist intact via `localStorage`, and verify the **"Send Creation Card to Mom"** postcard generator produces a valid downloadable PNG image (`\x89PNG\r\n\x1a\n` header, `1200×800` resolution, non-zero pixel variance). |

### 3.2 Complete Feature Inventory Coverage Matrix (`F1`–`F16`)

| Feature ID | Feature Name (`PROJECT.md § 3`) | Milestone | Tier 1 Tests | Tier 2 Tests | Tier 3 & 4 Coverage |
|---|---|---|---|---|---|
| **F1** | App Shell, Responsive Navigation & Zero-Error Boot | M1 | `T1-F01-01`..`05` (5) | `T2-F01-01`..`05` (5) | `AC-1`, `T3-X-06`, `T4-J-01`..`06` |
| **F2** | Versioned `localStorage` Store & Cross-Module EventBus | M1 | `T1-F02-01`..`05` (5) | `T2-F02-01`..`05` (5) | `AC-5`, `T3-X-01`..`07`, `T4-J-04` |
| **F3** | Zero-Dependency Standalone Bundler (`scripts/build_dist.py`) | M1 | `T1-F03-01`..`05` (5) | `T2-F03-01`..`05` (5) | `T3-X-12`, `T4-J-06` |
| **F4** | Tattoo Vector Stamp Library (3 Theme Collections) | M2 | `T1-F04-01`..`05` (5) | `T2-F04-01`..`05` (5) | `AC-2`, `T3-X-01`, `T3-X-02`, `T4-J-01` |
| **F5** | Freehand Tattoo Brushes, Text Banners & Layer Transforms | M2 | `T1-F05-01`..`05` (5) | `T2-F05-01`..`05` (5) | `AC-2`, `T3-X-03`, `T4-J-01` |
| **F6** | Virtual Arm/Wrist/Hand Try-On Preview | M2 | `T1-F06-01`..`05` (5) | `T2-F06-01`..`05` (5) | `AC-2`, `T3-X-09`, `T4-J-01` |
| **F7** | Pixel-Exact Mirrored Printable Transfer Sheet Export | M2 | `T1-F07-01`..`05` (5) | `T2-F07-01`..`05` (5) | `AC-2`, `T3-X-09`, `T4-J-01` |
| **F8** | Interactive CatNap Companion & Plush Customizer | M3 | `T1-F08-01`..`05` (5) | `T2-F08-01`..`05` (5) | `AC-3`, `T3-X-04`, `T3-X-08`, `T4-J-02` |
| **F9** | "CatNap's Starlight Rooftop Dash" Mini-Game | M3 | `T1-F09-01`..`05` (5) | `T2-F09-01`..`05` (5) | `AC-3`, `T3-X-01`, `T3-X-04`, `T4-J-02` |
| **F10** | Synthesized Multi-Track Song Library (Web Audio API) | M4 | `T1-F10-01`..`05` (5) | `T2-F10-01`..`05` (5) | `AC-4`, `T3-X-08`, `T4-J-03` |
| **F11** | 4-Lane Falling-Note Rhythm Game Mode | M4 | `T1-F11-01`..`05` (5) | `T2-F11-01`..`05` (5) | `AC-4`, `T3-X-02`, `T3-X-05`, `T4-J-03` |
| **F12** | Beat Pad & Song Remix Studio | M4 | `T1-F12-01`..`05` (5) | `T2-F12-01`..`05` (5) | `AC-4`, `T3-X-06`, `T3-X-10`, `T4-J-03` |
| **F13** | Editable Profile Header & Daily Cheer-Up Capsule | M5 | `T1-F13-01`..`05` (5) | `T2-F13-01`..`05` (5) | `T3-X-07`, `T3-X-11`, `T4-J-01`, `T4-J-04` |
| **F14** | "Letters & Stickers from Mom" Postcard Wall & Dual-City Clock | M5 | `T1-F14-01`..`05` (5) | `T2-F14-01`..`05` (5) | `T3-X-07`, `T3-X-11`, `T4-J-04`, `T4-J-05` |
| **F15** | "Send Creation Card to Mom" Shareable PNG Generator | M5 | `T1-F15-01`..`05` (5) | `T2-F15-01`..`05` (5) | `AC-5`, `T3-X-03`..`05`, `T4-J-04` |
| **F16** | Unified "My Creations Gallery" & Full System Polish | M5, M6 | `T1-F16-01`..`05` (5) | `T2-F16-01`..`05` (5) | `AC-5`, `T3-X-06`, `T4-J-04`..`06` |
| **TOTAL** | **16 Features (100% Inventory Coverage)** | **M1–M6** | **80 Tests** | **80 Tests** | **5 AC + 12 Tier 3 + 6 Tier 4 = 183 Total** |

---

## 4. Test Suite Architecture & File Layout

```text
tests/
├── __init__.py               # Package initializer
├── cdp_driver.py             # Async CDP WebSocket client, local HTTP server & Chrome lifecycle manager
├── tier1_features.py         # Tier 1: Feature Coverage (80 tests: 5 per feature F1..F16)
├── tier2_boundaries.py       # Tier 2: Boundary & Corner Cases (80 tests: 5 per feature F1..F16)
├── tier3_interactions.py     # Tier 3: Cross-Feature Pairwise Interactions (12 tests across R1..R4)
├── tier4_scenarios.py        # Tier 4: Real-World Family User Journeys (6 multi-step scenarios)
└── run_e2e_suite.py          # Master CLI test runner (--tier ac|1|2|3|4|all, --selftest, JSON/MD reports)
```

### Dual-Layer Opaque-Box + Programmatic Verification Protocol
To prevent false positives and facade passes, every test exercises both:
1. **DOM & User Event Layer**: Clicking buttons (`[data-testid="..."]`), dispatching pointer strokes, typing text inputs, pressing keyboard keys (`D`, `F`, `J`, `K`, `Space`), and reloading pages via CDP (`Page.reload`).
2. **Programmatic State & Pixel Buffer Layer**: Inspecting RGBA pixel buffers (`ctx.getImageData`), base64 PNG headers (`\x89PNG\r\n\x1a\n`), IHDR dimensions, Web Audio synthesis graph telemetry (`window.__CHEER_UP_R3_TEST_API__`), game frame stepping (`window.__CHEER_UP_STUDIO__`), and `localStorage` JSON records.

---

## 5. Execution Commands & Coverage Thresholds

### Standard Full Suite Execution
```bash
python3 tests/run_e2e_suite.py
```

### Targeted Tier Execution
```bash
python3 tests/run_e2e_suite.py --tier ac      # Run 5 Acceptance Criteria checks (AC-1..AC-5)
python3 tests/run_e2e_suite.py --tier 1       # Run Tier 1 Feature Coverage (80 tests)
python3 tests/run_e2e_suite.py --tier 2       # Run Tier 2 Boundary & Corner Cases (80 tests)
python3 tests/run_e2e_suite.py --tier 3       # Run Tier 3 Cross-Feature Interactions (12 tests)
python3 tests/run_e2e_suite.py --tier 4       # Run Tier 4 End-to-End Family Journeys (6 tests)
python3 tests/run_e2e_suite.py --tier all     # Run all 183 tests + Acceptance Criteria gate
```

### Standalone Harness Self-Verification (`--selftest`)
Before Milestone M1–M5 application modules are merged, the test infrastructure can be independently verified end-to-end against an embedded reference fixture server in `/dev/shm`:
```bash
python3 tests/run_e2e_suite.py --selftest
```

### Mandatory Pass Thresholds
- **Console / Page Error Budget**: `0` errors across all test executions.
- **Acceptance Criteria Gate (`AC-1`–`AC-5`)**: `100%` pass rate required.
- **Tier 1–4 Pass Rate**: `100%` pass rate required for Milestone M6 sign-off.
