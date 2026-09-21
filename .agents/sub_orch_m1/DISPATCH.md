# Dispatch Assignment — sub_orch_m1

## Timestamp: 2026-09-21T02:27:00Z

- **Role**: Sub-Orchestrator for Milestone M1 (Core App Shell, Global Store, Persistence Engine, Navigation & Build/Bundler Infrastructure)
- **Working Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m1`
- **Project Root Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`
- **Parent Orchestrator Conversation ID**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- **Authoritative Documents to Read**:
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_1/analysis.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_3/analysis.md`

### Exclusive Write Ownership
You and your Workers own ONLY:
- `index.html`
- `src/styles/main.css`
- `src/core/store.js`
- `src/core/audio-context.js`
- `src/core/app-shell.js`
- `scripts/build_dist.py`
- `scripts/dev_server.py`
Do NOT modify files under `src/modules/*` or `tests/*`.

### Scope & Deliverables
1. Implement the responsive desktop/iPad App Shell (`index.html`, `src/styles/main.css`, `src/core/app-shell.js`) with top header, 4 navigation tabs (`[data-testid="nav-tab-tattoo"]`, `[data-testid="nav-tab-catnap"]`, `[data-testid="nav-tab-kpop"]`, `[data-testid="nav-tab-hub"]`), and 4 view containers (`#view-tattoo-studio`, `#view-catnap-playground`, `#view-kpop-stage`, `#view-connection-hub`) that dynamically mount each module's `init(container, store)` export (with graceful loading fallback if a peer module file is still being written).
2. Implement `src/core/store.js` (`window.CheerUpStore`) with versioned `localStorage` persistence for all schemas in `PROJECT.md § 5.1` (`STORAGE_KEYS`) plus pub/sub event bus (`subscribe`, `emit`).
3. Implement `src/core/audio-context.js` providing shared Web Audio API context management and `HybridAudioTransport` clock fallback for headless Chromium.
4. Implement `scripts/build_dist.py` (zero-dependency Python 3 bundler) that bundles `index.html`, CSS, and all ES modules under `src/` into a standalone self-contained single-file `dist/index.html` (`< 350 KB`, working over `file://` and HTTP) and static `dist/` directory.
5. Run the full Iteration Loop (Explorers → Worker → 2 Reviewers → 2 Challengers → Forensic Auditor `teamwork_preview_auditor`) and verify zero `console.error` / `pageerror` in headless Chrome (`--user-data-dir=/dev/shm/...`).
6. Write your self-contained `handoff.md` in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_m1/handoff.md` and send a completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.

## 2026-09-21T02:30:49Z

Worker `worker_m1` invoked for Milestone M1:
- Exclusive write ownership: `index.html`, `src/styles/main.css`, `src/core/store.js`, `src/core/audio-context.js`, `src/core/app-shell.js`, `scripts/build_dist.py`, `scripts/dev_server.py`.
- Implement versioned `localStorage` persistence (`window.CheerUpStore`), `HybridAudioTransport` + Web Audio context management, responsive desktop/iPad App Shell with 4 dynamic view containers and test API registries, and zero-dependency Python 3 bundler `scripts/build_dist.py`.

