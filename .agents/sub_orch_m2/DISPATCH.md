# Dispatch Assignment — sub_orch_m2

## Timestamp: 2026-09-21T02:27:00Z

- **Role**: Sub-Orchestrator for Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio)
- **Working Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2`
- **Project Root Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`
- **Parent Orchestrator Conversation ID**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- **Authoritative Documents to Read**:
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_1/analysis.md`

### Exclusive Write Ownership
You and your Workers own ONLY:
- `src/modules/tattoo-studio/*` (`index.js`, `stamps.js`, `brushes.js`, `tryon-preview.js`, `sheet-exporter.js`, etc.)
Do NOT modify files outside `src/modules/tattoo-studio/*`.

### Scope & Deliverables
1. Implement all R1 requirements inside `src/modules/tattoo-studio/` exporting `initTattooStudio(container, store)`:
   - 3 Rich Vector Stamp Collections:
     - **CatNap & Smiling Critters** (`catnap`): CatNap purple cat with crescent moon pendant, lavender dream clouds, starry night paws, Smiling Critters icons.
     - **K-Pop Demon Hunters** (`kpop`): HUNTR/X (Rumi, Mira, Zoey) glowing demon-hunter emblems, magical lightstick/weapon motifs, Saja Boys neon idol crests (*Golden*, *Takedown*, *Soda Pop*).
     - **Bay Area ↔ Boston Connection** (`bay_boston`): Golden Gate Bridge + Boston skyline/duckling bridge badges, "Mom ❤️ Daughter", "Boston Superstar" crests.
   - Freehand drawing tools with 4 shaders (*neon glow*, *glitter/sparkle*, *rainbow*, *metallic ink*), color picker, brush size slider, customizable text banners, and layer/stamp transforms (*drag, scale, rotate, duplicate, undo/redo*).
   - **Virtual Try-On Preview**: Interactive preview rendering the custom tattoo onto a virtual arm, wrist, or hand with adjustable skin tones and lighting presets.
   - **Printable Mirrored Tattoo Sheet Export**: 1-click export generating both normal high-resolution PNG and a horizontally mirrored 8.5"×11" printable transfer sheet (with cut guides and step-by-step wet-sponge instructions).
     - **CRITICAL REQUIREMENT**: Must compute `mirroredImageData` via exact `ImageData` pixel buffer index reflection (`dst[(y * W + x) * 4 + c] = src[(y * W + (W - 1 - x)) * 4 + c]`) so that `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` holds across 100.000% of pixels with zero anti-aliasing discrepancy.
   - Expose all canonical `data-testid` attributes and register `window.__CHEER_UP_STUDIO__.tattoo` API per `PROJECT.md § 5.2–5.3`.
2. Run the full Iteration Loop (Explorers → Worker → 2 Reviewers → 2 Challengers → Forensic Auditor `teamwork_preview_auditor`) and verify zero `console.error` / `pageerror` in headless Chrome (`--user-data-dir=/dev/shm/...`).
3. Write your self-contained `handoff.md` in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2/handoff.md` and send a completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.

## 2026-09-21T02:30:49Z

Invoked as `worker_m2` (Implementation Worker for Milestone M2: R1 Temporary Tattoo Designer & Printable Transfer Sheet Studio) with exclusive write ownership of `src/modules/tattoo-studio/*`.
