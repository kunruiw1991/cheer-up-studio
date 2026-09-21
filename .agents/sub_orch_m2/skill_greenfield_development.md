---
name: greenfield-development
description: >-
  Software engineering methodology for building new code from scratch — entire
  modules, packages, or systems that don't yet exist. Covers interface-first
  design, BUILD target creation, incremental implementation, and contract-driven
  testing.
---

# Greenfield Development Playbook

1. Understand Before You Build: Read specifications, contracts, and upstream modules.
2. Scaffold First: Create clean module layout and interface signatures.
3. Implement Incrementally: Build modular components (`stamps.js`, `brushes.js`, `tryon-preview.js`, `sheet-exporter.js`, `index.js`) with full state management.
4. Verify Interface Conformance & Edge Cases: Validate all selectors, programmatic APIs, and pixel-level invariants in headless Chrome via CDP.
