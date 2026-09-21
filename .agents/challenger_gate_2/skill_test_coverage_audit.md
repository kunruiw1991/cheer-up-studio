---
name: test-coverage-audit
description: >-
  Adversarial test coverage audit. Analyzes the specification and
  existing test suite to find untested features, then generates
  adversarial test cases to expose the gaps. Optionally reads
  implementation source for deeper whitebox analysis.
use_for: >-
  Auditing test suite completeness, finding untested features, or
  generating adversarial test cases.
dont_use_for: >-
  Writing the initial test suite, stress testing, or opaque-box test design.
---

# Test Coverage Audit Playbook

Adversarial audit of a test suite's feature coverage. Your job is to find what
the tests **don't** test — then write tests that expose those gaps.
