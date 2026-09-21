---
name: greenfield-development
description: >-
  Software engineering methodology for building new code from scratch — entire
  modules, packages, or systems that don't yet exist. Covers interface-first
  design, BUILD target creation, incremental implementation, and contract-driven
  testing.
---

# Greenfield Development Playbook

1. Understand Before You Build: Read task description, project specification (`PROJECT.md`), and detailed analysis (`analysis.md`).
2. Interface-First Design: Ensure all public exports (`initKpopStage`), DOM `data-testid` selectors, store keys (`cheerup_v1_saved_remixes`, `cheerup_v1_high_scores`), and test API contracts (`window.__CHEER_UP_R3_TEST_API__`) match `PROJECT.md § 5.1–5.3` and `analysis.md § 5.2`.
3. Implement Incrementally: Build modular, clean ES2022 modules (`songs.js`, `synth-engine.js`, `rhythm-game.js`, `beat-pad.js`, `index.js`) with zero external dependencies.
4. Contract-Driven Verification: Test all interactive flows, synthesis graphs, falling-note hit windows, beat pad recording/replay/persistence, and zero-error headless Chromium execution.
