# BRIEFING — 2026-09-21T02:31:30Z

## Mission
Implement Milestone M3 (R2: CatNap & Smiling Critters Cozy Playground & Mini-Game) inside `src/modules/catnap-playground/*`, exposing all required UI elements, Web Audio purr synthesis, 4-category wardrobe customizer, Starlight Rooftop Dash arcade game, store persistence, and deterministic verification hooks.

## 🔒 My Identity
- Archetype: worker_m3
- Roles: implementer, qa, specialist
- Working directory: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m3`
- Original parent: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Milestone: Milestone M3 (R2: CatNap & Smiling Critters Cozy Playground & Mini-Game)

## 🔒 Key Constraints
- `/` filesystem has ONLY 63 MB free: NEVER run `npm install` on `/`. Always use `/dev/shm/...` for Chrome `--user-data-dir` profiles and temporary test artifacts.
- Exclusive write ownership: `src/modules/catnap-playground/*` (`index.js`, `companion.js`, `wardrobe.js`, `rooftop-dash.js`). Do NOT modify files outside `src/modules/catnap-playground/*`.
- All implementations must be 100% genuine, kid-friendly, cozy-magical, with zero hardcoded/dummy test shortcuts.

## Current Parent
- Conversation ID: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Updated: 2026-09-21T02:31:30Z

## Task Summary
- **What to build**: `src/modules/catnap-playground/index.js`, `companion.js`, `wardrobe.js`, `rooftop-dash.js`
- **Success criteria**: Interactive CatNap companion & 4-slot wardrobe customizer + Starlight Rooftop Dash mini-game passing all DOM `data-testid` and `window.__CHEER_UP_STUDIO__.catnap` / `window.__CHEER_UP_STUDIO__.catnapGame` verification tests with zero console/page errors.
- **Interface contracts**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 5.1–5.3
- **Code layout**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 6

## Key Decisions Made
- Structure `src/modules/catnap-playground/` into 4 cohesive ES modules: `wardrobe.js` (catalog, presets, SVG/Canvas accessory renderers), `companion.js` (animated SVG + Canvas dream-mist particle engine, Web Audio purr synthesizer, expression state machine, interaction meter), `rooftop-dash.js` (fixed-timestep 60Hz dual-city Boston brownstone & SF Golden Gate parallax arcade runner, collectibles, obstacles, unlockable stickers, deterministic `stepFrames(n)`), and `index.js` (orchestration, store binding, DOM layout, and `window.__CHEER_UP_STUDIO__` registration).

## Change Tracker
- **Files modified**: None yet (Phase 1 inspection in progress)
- **Build status**: Pending initial implementation
- **Pending issues**: Inspect `src/core/*` and existing `src/modules/catnap-playground/*`

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Headless Chrome CDP verification script to be executed in `/dev/shm/`

## Loaded Skills
- **Source**: `/google/src/files/head/depot/google3/research/omega/teamwork/playbooks/greenfield_development/SKILL.md`
- **Local copy**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m3/skill_greenfield_development.md`
- **Core methodology**: Interface-first greenfield module design: read upstream contracts and core dependencies before coding, build clean modular interfaces, and verify incrementally with contract-driven headless tests.

## Artifact Index
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m3/DISPATCH.md` — Dispatch assignment log
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m3/BRIEFING.md` — Persistent working memory
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m3/progress.md` — Liveness heartbeat & step tracker
