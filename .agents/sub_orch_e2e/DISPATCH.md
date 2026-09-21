# Dispatch Assignment — sub_orch_e2e

## Timestamp: 2026-09-21T02:27:00Z

- **Role**: Sub-Orchestrator for E2E Testing Track (Requirement-Driven Opaque-Box 4-Tier Verification Suite)
- **Working Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_e2e`
- **Project Root Directory**: `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio`
- **Parent Orchestrator Conversation ID**: `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`
- **Authoritative Documents to Read**:
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/ORIGINAL_REQUEST.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/PROJECT.md`
  - `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/explorer_survey_3/analysis.md`

### Exclusive Write Ownership
You and your Test Writers/Workers own ONLY:
- `TEST_INFRA.md`
- `TEST_READY.md`
- `tests/*` (`cdp_driver.py`, `run_e2e_suite.py`, `tier1_features.py`, `tier2_boundaries.py`, `tier3_interactions.py`, `tier4_scenarios.py`, etc.)
Do NOT modify application source code under `index.html`, `src/*`, or `scripts/*`.

### Scope & Deliverables
1. Create `TEST_INFRA.md` at project root following the template in the Project Pattern specification and `explorer_survey_3/analysis.md`.
2. Build the zero-install Python 3 + `websockets` + Google Chrome 153 CDP headless verification harness (`tests/cdp_driver.py` and `tests/run_e2e_suite.py`) using `--headless=new --no-sandbox --disable-gpu --autoplay-policy=no-user-gesture-required --user-data-dir=/dev/shm/e2e_chrome_<pid>`.
3. Implement all 4 Tiers of the Opaque-Box E2E Test Suite covering 100% of `PROJECT.md § 3 Feature Inventory` and all 5 Acceptance Criteria in `ORIGINAL_REQUEST.md`:
   - **Tier 1 (Feature Coverage)**: ≥5 tests per feature across all inventoried features
   - **Tier 2 (Boundary & Corner Cases)**: ≥5 tests per feature
   - **Tier 3 (Cross-Feature Combinations)**: Pairwise interaction tests across R1, R2, R3, R4
   - **Tier 4 (Real-World Application Scenarios)**: Realistic daughter-in-Boston & mom-in-Bay-Area user journeys
   - Plus explicit verification of all 5 Acceptance Criteria (`AC-1` zero console/page errors across all tabs, `AC-2` R1 Tattoo Studio + exact pixel horizontal mirror `mirroredImage(x, y) === sourceImage(width - 1 - x, y)`, `AC-3` R2 CatNap companion + Rooftop Dash start/frames/gameover/restart, `AC-4` R3 3-track Web Audio graph init + 4-lane rhythm game hit judgements/combos + Beat Pad loop toggling, `AC-5` `localStorage` gallery persistence across `page.reload()` + "Share with Mom" PNG export).
4. Run your verification loop (including Reviewers & Forensic Auditor) to confirm the test harness and test cases are syntactically valid, self-contained, and ready.
5. Publish `TEST_READY.md` at project root with the exact test runner command (`python3 tests/run_e2e_suite.py`) and coverage summary.
6. Write your self-contained `handoff.md` in `/usr/local/google/home/kunruiwang/teamwork_projects/cheer_up_studio/.agents/sub_orch_e2e/handoff.md` and send a completion message to `8cc81a44-9cb1-4426-b839-d8d31e0c69a5`.

## 2026-09-21T02:30:52Z

You are `test_writer_e2e`, E2E Test Writer for the **E2E Testing Track (Requirement-Driven Opaque-Box 4-Tier Verification Suite)** of the "Boston ↔ Bay Area Creative Cheer-Up Studio" project.
Implement `TEST_INFRA.md`, `tests/cdp_driver.py`, `tests/tier1_features.py`, `tests/tier2_boundaries.py`, `tests/tier3_interactions.py`, `tests/tier4_scenarios.py`, `tests/run_e2e_suite.py`, `TEST_READY.md`, and `handoff.md`.
