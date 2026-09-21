# BRIEFING — 2026-09-21T02:31:30Z

## Mission
Implement Milestone M4 (R3: K-Pop Demon Hunters Rhythm & Remix Stage) under `src/modules/kpop-stage/*` with full procedural 6-stem Web Audio synthesis (*Golden*, *Takedown*, *Soda Pop*), 4-lane falling-note rhythm game (`D`, `F`, `J`, `K` + touch buttons), 16-pad Beat Pad & Remix Studio with recording/replay/gallery persistence, and 100% deterministic verification in headless Google Chrome.

## 🔒 My Identity
- Archetype: Implementation Worker (`worker_m4`)
- Roles: implementer, qa, specialist
- Working directory: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4`
- Original parent: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Milestone: Milestone M4 (R3: K-Pop Demon Hunters Rhythm & Remix Stage)

## 🔒 Key Constraints
- `/` has ONLY 63 MB free. NEVER run `npm install` on `/`.
- ALWAYS pass `--user-data-dir=/dev/shm/chrome_profile_m4` and write temp files to `/dev/shm/...`.
- Exclusive file write ownership: ONLY write code under `src/modules/kpop-stage/*` (plus metadata under `.agents/sub_orch_m4/*`).
- Zero external runtime or audio asset dependencies (100% procedural Web Audio API synthesis).
- Must expose all canonical `data-testid` selectors and `window.__CHEER_UP_R3_TEST_API__`.

## Current Parent
- Conversation ID: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- Updated: 2026-09-21T02:31:30Z

## Task Summary
- **What to build**:
  - `src/modules/kpop-stage/songs.js`: Complete musical arrangements, chord progressions, basslines, melodies, formant vocal hooks, SFX schedules, lyric callout timelines, and beatmaps for *Golden* (128 BPM, D Major), *Takedown* (145 BPM, E Phrygian Dominant), and *Soda Pop* (118 BPM, F Major), plus 16-pad Beat Pad definitions.
  - `src/modules/kpop-stage/synth-engine.js`: `HybridAudioTransport` dual-clock transport + `KpopSynthEngine` 6-stem Web Audio API synthesis graph (`drums`, `bass`, `chords`, `lead`, `vocalHook`, `sfx` -> `DynamicsCompressorNode` -> `AnalyserNode` -> Master Gain) with safe guards against suspended `AudioContext` or headless audio sink absence.
  - `src/modules/kpop-stage/rhythm-game.js`: 4-lane falling-note rhythm game engine & 2D Canvas renderer with `D`/`F`/`J`/`K` keyboard + zero-latency pointer/touch lane buttons (`rhythm-lane-btn-0..3`), `PERFECT`/`GREAT`/`GOOD`/`MISS` timing windows (`<=45ms`, `<=90ms`, `<=135ms`, `>135ms`), combo multipliers (`1x`–`8x FEVER`), star notes, stage pyrotechnics, and synchronized lyric callouts (`rhythm-lyric-callout`).
  - `src/modules/kpop-stage/beat-pad.js`: 16-pad (4×4) interactive loop/drum/synth/SFX matrix (`beatpad-cell-0..15`), BPM slider (`90–160`), live timestamped recorder (`beatpad-record-btn`), deterministic replayer (`beatpad-replay-btn`), and Gallery save (`beatpad-save-btn`).
  - `src/modules/kpop-stage/index.js`: Main module entry exporting `initKpopStage(container, store)` (named + default export) and registering `window.__CHEER_UP_R3_TEST_API__`.
- **Success criteria**: Zero `console.error` / `pageerror` in headless Chrome; all 3 songs synthesize 6 active stems; rhythm game spawns notes and scores hits accurately via keyboard/touch/API; Beat Pad toggles loops, records, replays, and saves remixes persistently across page reloads.
- **Interface contracts**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 5.1–5.3 & `.agents/explorer_survey_2/analysis.md` § 5.2
- **Code layout**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md` § 6

## Key Decisions Made
- Keep all imports within `src/modules/kpop-stage/` strictly self-contained (`./songs.js`, `./synth-engine.js`, `./rhythm-game.js`, `./beat-pad.js`) with a built-in store adapter fallback so the module works seamlessly whether invoked by M1's `app-shell.js` or tested standalone.
- Support both `PROJECT.md § 5.3` and `analysis.md § 5.2` method signatures on `window.__CHEER_UP_R3_TEST_API__` so any test caller (E2E suite or module auditor) finds every expected method and property name.

## Change Tracker
- **Files modified**: None yet (starting implementation)
- **Build status**: Pending initial implementation
- **Pending issues**: Implement `songs.js`, `synth-engine.js`, `rhythm-game.js`, `beat-pad.js`, `index.js`

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Clean
- **Tests added/modified**: Pending headless Chrome CDP verification suite

## Loaded Skills
- **Source**: `/google/src/files/head/depot/google3/research/omega/teamwork/playbooks/greenfield_development/SKILL.md`
- **Local copy**: `skill_greenfield_development.md`
- **Core methodology**: Interface-first greenfield design, modular incremental implementation, and contract-driven verification.

## Artifact Index
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4/DISPATCH.md` — Assignment log
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4/BRIEFING.md` — Working memory
- `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4/progress.md` — Heartbeat & progress log
