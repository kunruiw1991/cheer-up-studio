---
name: greenfield-development
description: >-
  Software engineering methodology for building new code from scratch — entire
  modules, packages, or systems that don't yet exist. Covers interface-first
  design, BUILD target creation, incremental implementation, and contract-driven
  testing. Use when building a new module/package, implementing a milestone in
  a greenfield project, or creating infrastructure from scratch. Don't use for
  modifying existing code (use software-engineering) or algorithmic puzzles
  (use competitive-programming).
use_for: >-
  Building a new module/package, implementing a milestone in a greenfield
  project, or creating infrastructure from scratch.
dont_use_for: >-
  Modifying existing code (use software-engineering) or algorithmic puzzles
  (use competitive-programming).
---

# Greenfield Development Playbook

## Context

You are building a new module or package. Your inputs are:

-   **Task specification** — What to build, target directory, interface
    constraints, and success criteria. Your task may reference files containing
    detailed architecture or scope information — read them.
-   **Existing source** (if any) — Other modules you must integrate with.

Your job: produce a working, tested module that satisfies the specification and
integrates cleanly with the rest of the project.

## Phase 1: Understand Before You Build

1.  **Understand your task** — Read your task description. Identify what needs
    to be built, the public interfaces, and the success criteria.
2.  **Read the project specification** — Read `PROJECT.md` and survey analysis.
3.  **Read modules you depend on** — Read public interfaces of `src/core/*`.
4.  **Read existing code in your target directory** — Check `src/modules/catnap-playground/`.

## Phase 2: Scaffold First

Build the skeleton before filling in logic and verify module imports.

## Phase 3: Implement Incrementally

Implement in increments and verify continuously.

## Phase 4: Integration

Verify interface conformance, DOM `data-testid` selectors, `window.__CHEER_UP_STUDIO__` contracts, and headless Chrome execution.
