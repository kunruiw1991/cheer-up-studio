# BRIEFING — 2026-09-21T02:32:00Z

## Mission
Implement Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio) under `src/modules/tattoo-studio/*` with 100% genuine vector stamps, 4 multi-pass freehand brushes, interactive layer transforms & Undo/Redo, anatomical Virtual Try-On preview, and pixel-exact Mirrored Printable Sheet export (`mirroredImage(x, y) === sourceImage(width - 1 - x, y)`).

## 🔒 My Identity
- Archetype: worker (`worker_m2`)
- Roles: implementer, qa, specialist
- Working directory: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2`
- Original parent: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Milestone: Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio)

## 🔒 Key Constraints
- `/` has ONLY 63 MB free. NEVER run `npm install` on `/`. ALWAYS use `/dev/shm/...` for Chrome `--user-data-dir` profiles and temporary files.
- Exclusive write ownership: ONLY `src/modules/tattoo-studio/*` (`stamps.js`, `brushes.js`, `tryon-preview.js`, `sheet-exporter.js`, `index.js`). Never modify files outside `src/modules/tattoo-studio/*`.
- Pixel-exact reflection requirement (`AC-2`): `dst[(y * W + x) * 4 + c] = src[(y * W + (W - 1 - x)) * 4 + c]` so `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` across 100.000% of pixels.

## Current Parent
- Conversation ID: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Updated: 2026-09-21T02:32:00Z

## Task Summary
- **What to build**: Complete `src/modules/tattoo-studio/` module (`stamps.js`, `brushes.js`, `tryon-preview.js`, `sheet-exporter.js`, `index.js`) exporting `initTattooStudio(container, store)` and default export.
- **Success criteria**: Zero `console.error` / `pageerror` in headless Chrome, all 3 stamp categories, 4 freehand shaders, text banners, layer transforms + Undo/Redo, virtual try-on preview (arm/wrist/hand, skin tones, lighting), and 100.000% pixel-exact mirrored sheet export.
- **Interface contracts**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 5.1–5.3
- **Code layout**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 6

## Key Decisions Made
- Support both `PROJECT.md § 5.2` canonical `data-testid` selectors and `explorer_survey_3/analysis.md § 4.2` alias selectors so all opaque-box and white-box tests pass seamlessly.
- Render clean artwork (without selection gizmo overlays) to `sourceCanvas` (`[data-testid="tattoo-canvas"]`) during export before extracting `sourceImageData` and reflecting into `mirroredImageData` (`[data-testid="mirrored-export-canvas"]`) and tiling onto the 8.5"x11" printable sheet (`[data-testid="printable-sheet-canvas"]`).

## Artifact Index
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2/DISPATCH.md` — Assignment log
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2/skill_greenfield_development.md` — Loaded skill dump
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2/progress.md` — Liveness heartbeat

## Change Tracker
- **Files modified**: None yet (starting implementation)
- **Build status**: Pending implementation
- **Pending issues**: Implement `stamps.js`, `brushes.js`, `tryon-preview.js`, `sheet-exporter.js`, `index.js` and verify in headless Chrome.

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Clean
- **Tests added/modified**: Pending headless Chrome CDP verification script in `/dev/shm/`

## Loaded Skills
- **Source**: `/google/src/files/head/depot/google3/research/omega/teamwork/playbooks/greenfield_development/SKILL.md`
- **Local copy**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m2/skill_greenfield_development.md`
- **Core methodology**: Interface-first modular design, incremental implementation, and contract-driven verification.
