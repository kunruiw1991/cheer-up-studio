# Dispatch Assignment — sub_orch_m4

## Timestamp: 2026-09-21T02:27:00Z

- **Role**: Sub-Orchestrator for Milestone M4 (R3: K-Pop Demon Hunters Rhythm & Remix Stage)
- **Working Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4`
- **Project Root Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`
- **Parent Orchestrator Conversation ID**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- **Authoritative Documents to Read**:
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_2/analysis.md`

### Exclusive Write Ownership
You and your Workers own ONLY:
- `src/modules/kpop-stage/*` (`index.js`, `synth-engine.js`, `songs.js`, `rhythm-game.js`, `beat-pad.js`, etc.)
Do NOT modify files outside `src/modules/kpop-stage/*`.

### Scope & Deliverables
1. Implement all R3 requirements inside `src/modules/kpop-stage/` exporting `initKpopStage(container, store)`:
   - **Synthesized Multi-Track Song Library**: Procedural 6-stem Web Audio API synthesis (zero external MP3 dependencies) capturing the distinct energy of:
     - *"Golden"* (HUNTR/X uplifting power-pop anthem, 128 BPM, D Major)
     - *"Takedown"* (high-energy demon-hunter battle beat, 145 BPM, E Phrygian Dominant)
     - *"Soda Pop"* (Saja Boys upbeat fizzy K-pop groove, 118 BPM, F Major)
     - Includes `HybridAudioTransport` fallback so beatmap timing progresses deterministically even if headless Chromium suspends `AudioContext`.
   - **Falling-Note Rhythm Game Mode**: Playable 4-lane rhythm game (keyboard keys `D`, `F`, `J`, `K` + full touch/click lane buttons `[data-testid="rhythm-lane-btn-0..3"]`) synchronized to synthesized beats with hit judgements (`PERFECT`, `GREAT`, `GOOD`, `MISS`), combo multipliers (`1x`–`8x FEVER`), glowing stage pyrotechnics, and lyric/chant callouts.
   - **Beat Pad & Song Remix Studio**: Interactive 16-pad (4×4) loop/drum/synth/SFX matrix with BPM control (`90–160`), live timestamped event recording (`RemixEvent[]`), deterministic replay, and saving remixes to `CheerUpStore` gallery.
   - Expose all canonical `data-testid` attributes and register `window.__CHEER_UP_R3_TEST_API__` per `PROJECT.md § 5.2–5.3`.
2. Run the full Iteration Loop (Explorers → Worker → 2 Reviewers → 2 Challengers → Forensic Auditor `teamwork_preview_auditor`) and verify zero `console.error` / `pageerror` in headless Chrome (`--user-data-dir=/dev/shm/...`).
3. Write your self-contained `handoff.md` in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m4/handoff.md` and send a completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.

## 2026-09-21T02:30:51Z
Dispatched `worker_m4` to implement Milestone M4 (R3: K-Pop Demon Hunters Rhythm & Remix Stage) under `src/modules/kpop-stage/*`, verify in headless Google Chrome (`--user-data-dir=/dev/shm/...`), document verification in `handoff.md`, and send completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.

