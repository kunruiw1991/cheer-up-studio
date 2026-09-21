# Dispatch Assignment — sub_orch_m5

## Timestamp: 2026-09-21T02:27:00Z

- **Role**: Sub-Orchestrator for Milestone M5 (R4: Bay Area ↔ Boston Connection Hub, Postcard Wall & Gallery Portal)
- **Working Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m5`
- **Project Root Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`
- **Parent Orchestrator Conversation ID**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- **Authoritative Documents to Read**:
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_3/analysis.md`

### Exclusive Write Ownership
You and your Workers own ONLY:
- `src/modules/connection-hub/*` (`index.js`, `profile-header.js`, `postcard-wall.js`, `dual-clock.js`, `card-generator.js`, `gallery-view.js`, etc.)
Do NOT modify files outside `src/modules/connection-hub/*`.

### Scope & Deliverables
1. Implement all R4 requirements inside `src/modules/connection-hub/` exporting `initConnectionHub(container, store)`:
   - **Personalized Profile & Daily Cheer-Up Capsule**: Editable profile header customizable with daughter's name/nickname persisted in `CheerUpStore`.
   - **"Letters & Stickers from Mom (Bay Area → Boston)" Interactive Postcard Wall**: Warm pre-populated and interactive letters/postcards from Mom in the Bay Area to Daughter in Boston with sticker reactions and unlockable stamps.
   - **Live Dual-City Clock & Weather-Vibe Widget**: Side-by-side live clocks and cozy weather vibes showing San Francisco (Mom — `America/Los_Angeles` PST/PDT) and Boston (Daughter & Mom — `America/New_York` EST/EDT).
   - **"Send Creation Card to Mom" Postcard Generator**: Canvas `1200×800` generator bundling latest tattoo design + game high score + personal message into a downloadable shareable PNG image card (`window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()`).
   - **My Creations Gallery**: Persistent `localStorage` gallery displaying, filtering (`All`, `Tattoos`, `Outfits`, `Remixes`), re-opening, and deleting saved creations across full page reloads (`page.reload()`).
   - Expose all canonical `data-testid` attributes and register `window.__CHEER_UP_STUDIO__.hub` API per `PROJECT.md § 5.2–5.3`.
2. Run the full Iteration Loop (Explorers → Worker → 2 Reviewers → 2 Challengers → Forensic Auditor `teamwork_preview_auditor`) and verify zero `console.error` / `pageerror` in headless Chrome (`--user-data-dir=/dev/shm/...`).
3. Write your self-contained `handoff.md` in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m5/handoff.md` and send a completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.
