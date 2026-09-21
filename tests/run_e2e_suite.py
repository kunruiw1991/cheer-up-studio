#!/usr/bin/env python3
"""Master E2E Test Runner for Boston <-> Bay Area Creative Cheer-Up Studio.

Executes:
- Explicit Acceptance Criteria Verification Gate (AC-1 .. AC-5)
- Tier 1: Feature Coverage (80 tests across F1..F16)
- Tier 2: Boundary & Corner Cases (80 tests across F1..F16)
- Tier 3: Cross-Feature Pairwise Interactions (12 tests)
- Tier 4: Real-World Family User Journeys (6 journeys)

Usage:
  python3 tests/run_e2e_suite.py
  python3 tests/run_e2e_suite.py --tier ac|1|2|3|4|all
  python3 tests/run_e2e_suite.py --selftest
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
import shutil
import sys
import time
from typing import Any

# Ensure project root is importable
REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
  sys.path.insert(0, str(REPO_ROOT))

from tests.cdp_driver import (
    ChromeCdpSession,
    LocalHttpServer,
    TEST_REGISTRY,
    TestCaseResult,
    TestCaseSpec,
    register_test,
    verify_png_data_url,
)


# ==============================================================================
# Explicit Acceptance Criteria Gate (AC-1 through AC-5 from ORIGINAL_REQUEST.md)
# ==============================================================================


@register_test(
    "AC-1",
    "ac",
    "AC-1",
    "Application loads cleanly in headless Chromium with zero console.error or pageerror across all tabs",
)
async def test_ac_01_clean_headless_boot_all_tabs(
    page: ChromeCdpSession, base_url: str
) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for tab in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
    assert await page.click(tab), f"AC-1: Failed to click navigation tab {tab}"
  page.assert_zero_errors("AC-1")


@register_test(
    "AC-2",
    "ac",
    "AC-2",
    "R1 Tattoo Studio: stamps from 3 categories, freehand strokes, virtual arm preview & exact pixel mirror export",
)
async def test_ac_02_tattoo_studio_and_pixel_mirror_export(
    page: ChromeCdpSession, base_url: str
) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  result = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.addStamp('kpop', 'huntrx-golden-crest');
        t.addStamp('bay_boston', 'golden-gate-boston-bridge');
        t.drawStroke([{x: 40, y: 70}, {x: 190, y: 180}, {x: 420, y: 130}], 'neon', '#ff2288', 8);
        t.renderVirtualTryOn('arm', 'warm-tan', 'golden-hour');
        const exp = t.exportTransferSheet();
        const W = exp.width;
        const H = exp.height;
        const src = exp.sourceImageData.data || exp.sourceImageData;
        const mir = exp.mirroredImageData.data || exp.mirroredImageData;
        let nonEmpty = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const sIdx = (y * W + (W - 1 - x)) * 4;
            const mIdx = (y * W + x) * 4;
            if (mir[mIdx + 3] > 0) nonEmpty++;
            for (let c = 0; c < 4; c++) {
              if (mir[mIdx + c] !== src[sIdx + c]) {
                return { ok: false, reason: `Pixel mismatch at (${x},${y}) ch ${c}` };
              }
            }
          }
        }
        return {
          ok: nonEmpty > 0,
          nonEmpty,
          sheetDataUrl: exp.sheetDataUrl,
          normalDataUrl: exp.normalDataUrl
        };
      })()"""
  )
  assert result.get("ok"), f"AC-2 pixel mirror verification failed: {result}"
  verify_png_data_url(result["sheetDataUrl"])
  verify_png_data_url(result["normalDataUrl"])
  page.assert_zero_errors("AC-2")


@register_test(
    "AC-3",
    "ac",
    "AC-3",
    "R2 CatNap Playground: companion click/customization & Rooftop Dash start, frames, gameover & restart",
)
async def test_ac_03_catnap_playground_and_rooftop_dash(
    page: ChromeCdpSession, base_url: str
) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  outcome = await page.eval_js(
      """(() => {
        const c = window.__CHEER_UP_STUDIO__.catnap;
        c.triggerCompanionInteraction();
        c.setOutfit('jacket', 'huntrx-gold-jacket');
        c.setOutfit('scarf', 'boston-crimson-scarf');
        const outfitState = c.getState();

        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        const afterStart = g.getState().state;
        g.jump();
        g.stepFrames(120);
        const midScore = g.getState().score;
        g.triggerGameOver();
        const afterGameOver = g.getState().state;
        g.restart();
        const afterRestart = g.getState();
        return {
          outfitState,
          afterStart,
          midScore,
          afterGameOver,
          afterRestart
        };
      })()"""
  )
  assert outcome["afterStart"] == "running", f"Expected running on start: {outcome}"
  assert outcome["midScore"] > 0, f"Expected positive score after 120 frames: {outcome}"
  assert outcome["afterGameOver"] == "gameover", f"Expected gameover state: {outcome}"
  assert outcome["afterRestart"]["state"] == "running" and outcome["afterRestart"]["score"] == 0
  page.assert_zero_errors("AC-3")


@register_test(
    "AC-4",
    "ac",
    "AC-4",
    "R3 K-Pop Demon Hunters Stage: 3 tracks Web Audio synth init, 4-lane rhythm game & Beat Pad mixer",
)
async def test_ac_04_kpop_stage_rhythm_and_beatpad(
    page: ChromeCdpSession, base_url: str
) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  res = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        const tracks = {};
        for (const id of ['golden', 'takedown', 'soda_pop']) {
          tracks[id] = api.initializeAndVerifySongGraph(id);
        }
        api.startRhythmGame('golden');
        for (let step = 0; step < 20; step++) {
          api.stepRhythmTime(0.25);
          for (let lane = 0; lane < 4; lane++) api.triggerLaneInput(lane);
        }
        const rhythm = api.getRhythmState();
        api.toggleBeatPad(0);
        api.toggleBeatPad(4);
        const beatpad = api.getBeatPadState();
        return { tracks, rhythm, beatpad };
      })()"""
  )
  for track_id in ("golden", "takedown", "soda_pop"):
    assert res["tracks"][track_id]["initialized"] is True
    assert not res["tracks"][track_id]["hasErrors"]
  assert res["rhythm"]["score"] > 0 and res["rhythm"]["combo"] >= 1
  assert len(res["beatpad"]["activePads"]) >= 2
  page.assert_zero_errors("AC-4")


@register_test(
    "AC-5",
    "ac",
    "AC-5",
    "R4 Gallery creations persist across page.reload() via localStorage & Share with Mom outputs valid PNG",
)
async def test_ac_05_persistence_across_reload_and_mom_postcard(
    page: ChromeCdpSession, base_url: str
) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.click("tattoo-save-gallery-btn")
  await page.click("nav-tab-catnap")
  await page.click("catnap-save-outfit-btn")
  await page.click("nav-tab-kpop")
  await page.click("beatpad-save-btn")

  await page.reload()

  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  png_info = verify_png_data_url(card["dataUrl"])
  assert png_info["width"] == 1200 and png_info["height"] == 800
  page.assert_zero_errors("AC-5")


# Import Tiers 1..4 so all @register_test decorators execute
import tests.tier1_features  # pylint: disable=unused-import,wrong-import-position
import tests.tier2_boundaries  # pylint: disable=unused-import,wrong-import-position
import tests.tier3_interactions  # pylint: disable=unused-import,wrong-import-position
import tests.tier4_scenarios  # pylint: disable=unused-import,wrong-import-position


def _materialize_selftest_app(target_dir: Path) -> None:
  """Create a compliant reference app + bundler in /dev/shm for --selftest harness verification."""
  (target_dir / "scripts").mkdir(parents=True, exist_ok=True)
  (target_dir / "dist").mkdir(parents=True, exist_ok=True)

  app_html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Boston ↔ Bay Area Creative Cheer-Up Studio</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #141026; color: #f6f2ff; }
  header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #1f1938; }
  nav button { margin-right: 8px; padding: 8px 14px; cursor: pointer; }
  section.view { display: none; padding: 16px; }
  section.view.active { display: block; }
  canvas { background: #ffffff; border: 2px solid #8a63f2; }
</style>
</head>
<body>
<header>
  <div>
    <strong>Boston ↔ Bay Area Creative Cheer-Up Studio</strong> —
    <span data-testid="header-nickname-display">Little Star (Boston)</span>
  </div>
  <nav>
    <button data-testid="nav-tab-tattoo">Tattoo Studio</button>
    <button data-testid="nav-tab-catnap">CatNap Playground</button>
    <button data-testid="nav-tab-kpop">K-Pop Stage</button>
    <button data-testid="nav-tab-hub">Connection Hub</button>
  </nav>
</header>

<section id="view-tattoo-studio" class="view active">
  <div>
    <button data-testid="stamp-category-catnap">CatNap</button>
    <button data-testid="stamp-category-kpop">K-Pop</button>
    <button data-testid="stamp-category-bay_boston">Bay ↔ Boston</button>
    <button data-testid="brush-mode-neon">Neon</button>
    <button data-testid="brush-mode-glitter">Glitter</button>
    <button data-testid="brush-mode-rainbow">Rainbow</button>
    <button data-testid="brush-mode-metallic">Metallic</button>
    <input data-testid="tattoo-color-picker" type="color" value="#ff2288" />
    <input data-testid="tattoo-brush-size" type="range" min="2" max="24" value="6" />
    <input data-testid="tattoo-text-input" type="text" placeholder="Banner text" />
    <button data-testid="tattoo-add-text-btn">Add Text</button>
    <button data-testid="tattoo-undo-btn">Undo</button>
    <button data-testid="tattoo-redo-btn">Redo</button>
    <button data-testid="tattoo-duplicate-btn">Duplicate</button>
    <button data-testid="tattoo-clear-btn">Clear</button>
    <button data-testid="tattoo-save-gallery-btn">Save Tattoo</button>
    <button data-testid="tattoo-export-normal-btn">Export Normal PNG</button>
    <button data-testid="tattoo-export-mirrored-btn">Export Mirrored Sheet</button>
  </div>
  <canvas data-testid="tattoo-canvas" width="600" height="600"></canvas>
  <select data-testid="tryon-bodypart-select"><option value="arm">arm</option><option value="wrist">wrist</option><option value="hand">hand</option></select>
  <select data-testid="tryon-skintone-select"><option value="light">light</option><option value="medium">medium</option><option value="warm-tan">warm-tan</option><option value="deep">deep</option></select>
  <select data-testid="tryon-lighting-select"><option value="daylight">daylight</option><option value="golden-hour">golden-hour</option><option value="neon-stage">neon-stage</option></select>
  <canvas data-testid="tryon-canvas" width="400" height="400"></canvas>
</section>

<section id="view-catnap-playground" class="view">
  <svg data-testid="catnap-companion-svg" width="200" height="200"><circle cx="100" cy="100" r="80" fill="#8d5cf6" /></svg>
  <button data-testid="catnap-purr-btn">Pet CatNap</button>
  <select data-testid="catnap-expression-select"><option value="sleepy-smile">sleepy-smile</option><option value="starry-joy">starry-joy</option></select>
  <select data-testid="catnap-outfit-jacket"><option value="none">none</option><option value="huntrx-gold-jacket">huntrx-gold-jacket</option></select>
  <select data-testid="catnap-outfit-headphones"><option value="none">none</option><option value="glowing-headphones">glowing-headphones</option></select>
  <select data-testid="catnap-outfit-pendant"><option value="crescent-moon-gold">crescent-moon-gold</option></select>
  <select data-testid="catnap-outfit-scarf"><option value="none">none</option><option value="boston-crimson-scarf">boston-crimson-scarf</option></select>
  <button data-testid="catnap-save-outfit-btn">Save Outfit</button>
  <canvas data-testid="rooftop-dash-canvas" width="600" height="300"></canvas>
  <button data-testid="rooftop-dash-start-btn">Start Dash</button>
  <button data-testid="rooftop-dash-restart-btn">Restart Dash</button>
  <button data-testid="rooftop-dash-jump-btn">Jump</button>
  <span data-testid="rooftop-dash-score">0</span>
  <span data-testid="rooftop-dash-highscore">0</span>
  <span data-testid="rooftop-dash-state">idle</span>
</section>

<section id="view-kpop-stage" class="view">
  <button data-testid="kpop-song-select-golden">Golden</button>
  <button data-testid="kpop-song-select-takedown">Takedown</button>
  <button data-testid="kpop-song-select-soda_pop">Soda Pop</button>
  <canvas data-testid="rhythm-game-canvas" width="480" height="600"></canvas>
  <button data-testid="rhythm-start-btn">Start Rhythm</button>
  <button data-testid="rhythm-stop-btn">Stop Rhythm</button>
  <button data-testid="rhythm-lane-btn-0">Lane D</button>
  <button data-testid="rhythm-lane-btn-1">Lane F</button>
  <button data-testid="rhythm-lane-btn-2">Lane J</button>
  <button data-testid="rhythm-lane-btn-3">Lane K</button>
  <span data-testid="rhythm-score">0</span>
  <span data-testid="rhythm-combo">0</span>
  <span data-testid="rhythm-judgement">READY</span>
  <span data-testid="rhythm-lyric-callout">HUNTR/X GO!</span>
  <input data-testid="beatpad-bpm-slider" type="range" min="90" max="160" value="128" />
  <button data-testid="beatpad-record-btn">Record</button>
  <button data-testid="beatpad-replay-btn">Replay</button>
  <button data-testid="beatpad-save-btn">Save Remix</button>
</section>

<section id="view-connection-hub" class="view">
  <h2>Bay Area (San Francisco, CA) ↔ Boston, MA</h2>
  <input data-testid="profile-nickname-input" type="text" value="Little Star" />
  <button data-testid="profile-save-btn">Save Profile</button>
  <div>SF Time: <span data-testid="clock-sf-time"></span></div>
  <div>Boston Time: <span data-testid="clock-boston-time"></span></div>
  <div data-testid="mom-postcard-wall">
    <div data-testid="mom-postcard-item-1">Love from Mom in the Bay Area to Boston!</div>
  </div>
  <canvas data-testid="share-mom-card-canvas" width="1200" height="800"></canvas>
  <button data-testid="share-mom-generate-btn">Generate Card for Mom</button>
  <a data-testid="share-mom-download-btn" download="postcard-for-mom.png" href="#">Download Card</a>
  <div>
    <button data-testid="gallery-filter-all">All</button>
    <button data-testid="gallery-filter-tattoos">Tattoos</button>
    <button data-testid="gallery-filter-outfits">Outfits</button>
    <button data-testid="gallery-filter-remixes">Remixes</button>
    <div data-testid="gallery-grid">Saved Creations</div>
  </div>
</section>

<script>
(() => {
  const safeParse = (k, fallback) => {
    try {
      const v = localStorage.getItem(k);
      if (!v) return fallback;
      const p = JSON.parse(v);
      return p && typeof p === typeof fallback ? p : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const subs = [];
  const store = {
    subscribe(fn) { subs.push(fn); return () => {}; },
    setProfile(p) {
      const cur = safeParse('cheerup_v1_profile', { nickname: 'Little Star', avatarId: 'catnap-moon', updatedAt: Date.now() });
      const next = Object.assign({}, cur, p, { updatedAt: Date.now() });
      localStorage.setItem('cheerup_v1_profile', JSON.stringify(next));
      document.querySelector('[data-testid="header-nickname-display"]').textContent = next.nickname || 'Little Star';
      subs.forEach(fn => fn(next));
    }
  };
  window.CheerUpStore = store;

  // Initialize profile display
  const initProf = safeParse('cheerup_v1_profile', { nickname: 'Little Star' });
  document.querySelector('[data-testid="header-nickname-display"]').textContent = initProf.nickname || 'Little Star';

  // Tab routing
  const tabMap = {
    'nav-tab-tattoo': '#view-tattoo-studio',
    'nav-tab-catnap': '#view-catnap-playground',
    'nav-tab-kpop': '#view-kpop-stage',
    'nav-tab-hub': '#view-connection-hub'
  };
  Object.keys(tabMap).forEach(tid => {
    document.querySelector(`[data-testid="${tid}"]`).addEventListener('click', () => {
      document.querySelectorAll('section.view').forEach(s => s.classList.remove('active'));
      document.querySelector(tabMap[tid]).classList.add('active');
    });
  });

  // Tattoo studio
  const tCanvas = document.querySelector('[data-testid="tattoo-canvas"]');
  const tCtx = tCanvas.getContext('2d');
  const tryCanvas = document.querySelector('[data-testid="tryon-canvas"]');
  const tryCtx = tryCanvas.getContext('2d');

  const tattooApi = {
    addStamp(cat, id) {
      tCtx.fillStyle = cat === 'catnap' ? '#8d5cf6' : (cat === 'kpop' ? '#ff2288' : '#00c8ff');
      tCtx.fillRect(60, 60, 120, 120);
      tCtx.fillStyle = '#ffffff';
      tCtx.fillText(id, 70, 110);
    },
    drawStroke(points, mode, color, width) {
      if (!points || points.length === 0) return;
      tCtx.strokeStyle = color || '#ff2288';
      tCtx.lineWidth = width || 6;
      tCtx.beginPath();
      tCtx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) tCtx.lineTo(points[i].x, points[i].y);
      if (points.length === 1) tCtx.lineTo(points[0].x + 1, points[0].y + 1);
      tCtx.stroke();
    },
    renderVirtualTryOn(part, tone, light) {
      const toneMap = { light: '#f6d8c4', medium: '#d9a47c', 'warm-tan': '#b87d52', deep: '#6b4226' };
      tryCtx.fillStyle = toneMap[tone] || '#d9a47c';
      tryCtx.fillRect(0, 0, tryCanvas.width, tryCanvas.height);
      tryCtx.drawImage(tCanvas, 50, 50, 200, 200);
    },
    exportTransferSheet() {
      const W = tCanvas.width, H = tCanvas.height;
      const src = tCtx.getImageData(0, 0, W, H);
      const mirCanvas = document.createElement('canvas');
      mirCanvas.width = W; mirCanvas.height = H;
      const mirCtx = mirCanvas.getContext('2d');
      const mirData = mirCtx.createImageData(W, H);
      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const sIdx = (y * W + (W - 1 - x)) * 4;
          const mIdx = (y * W + x) * 4;
          mirData.data[mIdx] = src.data[sIdx];
          mirData.data[mIdx + 1] = src.data[sIdx + 1];
          mirData.data[mIdx + 2] = src.data[sIdx + 2];
          mirData.data[mIdx + 3] = src.data[sIdx + 3];
        }
      }
      mirCtx.putImageData(mirData, 0, 0);
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = 850; sheetCanvas.height = 1100;
      const sCtx = sheetCanvas.getContext('2d');
      sCtx.fillStyle = '#ffffff';
      sCtx.fillRect(0, 0, 850, 1100);
      sCtx.drawImage(mirCanvas, 125, 100);
      return {
        sourceImageData: src,
        mirroredImageData: mirData,
        sheetDataUrl: sheetCanvas.toDataURL('image/png'),
        normalDataUrl: tCanvas.toDataURL('image/png'),
        width: W,
        height: H
      };
    }
  };

  document.querySelector('[data-testid="tattoo-clear-btn"]').addEventListener('click', () => {
    tCtx.clearRect(0, 0, tCanvas.width, tCanvas.height);
  });
  document.querySelector('[data-testid="tattoo-save-gallery-btn"]').addEventListener('click', () => {
    const arr = safeParse('cheerup_v1_saved_tattoos', []);
    arr.push({ id: 'tat-' + Date.now(), title: 'Custom Tattoo', createdAt: Date.now() });
    localStorage.setItem('cheerup_v1_saved_tattoos', JSON.stringify(arr));
  });

  // CatNap
  const catnapState = { jacket: 'none', headphones: 'none', pendant: 'crescent-moon-gold', scarf: 'none', purrs: 0 };
  const catnapApi = {
    triggerCompanionInteraction() { catnapState.purrs++; },
    setOutfit(slot, val) { catnapState[slot] = val; },
    getState() { return Object.assign({}, catnapState); }
  };
  document.querySelector('[data-testid="catnap-save-outfit-btn"]').addEventListener('click', () => {
    const arr = safeParse('cheerup_v1_saved_outfits', []);
    arr.push(Object.assign({ id: 'out-' + Date.now(), createdAt: Date.now() }, catnapState));
    localStorage.setItem('cheerup_v1_saved_outfits', JSON.stringify(arr));
  });

  const dashState = { state: 'idle', score: 0, highScore: 0, moonsCollected: 0, notesCollected: 0, stickersUnlocked: ['catnap-moon'] };
  const catnapGameApi = {
    start() { dashState.state = 'running'; dashState.score = 0; },
    jump() {},
    stepFrames(n) {
      if (dashState.state === 'running') {
        dashState.score += n;
        if (dashState.score > dashState.highScore) dashState.highScore = dashState.score;
      }
    },
    triggerGameOver() { dashState.state = 'gameover'; },
    restart() { dashState.state = 'running'; dashState.score = 0; },
    getState() { return Object.assign({}, dashState); }
  };

  // Hub & Dual Clocks
  const updateClocks = () => {
    const now = new Date();
    const sf = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(now);
    const bos = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(now);
    document.querySelector('[data-testid="clock-sf-time"]').textContent = sf;
    document.querySelector('[data-testid="clock-boston-time"]').textContent = bos;
    return {
      sf: { timeStr: sf, tz: 'America/Los_Angeles' },
      boston: { timeStr: bos, tz: 'America/New_York' }
    };
  };
  updateClocks();

  const hubApi = {
    getDualClocks: updateClocks,
    generateShareWithMomCard() {
      const c = document.querySelector('[data-testid="share-mom-card-canvas"]');
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, '#2a1b4e');
      grad.addColorStop(0.5, '#8a3ab9');
      grad.addColorStop(1, '#ff77aa');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('From Boston with Love to Mom in the Bay Area!', 80, 120);
      ctx.drawImage(tCanvas, 80, 180, 320, 320);
      const dataUrl = c.toDataURL('image/png');
      document.querySelector('[data-testid="share-mom-download-btn"]').setAttribute('href', dataUrl);
      return { dataUrl, width: 1200, height: 800 };
    }
  };

  document.querySelector('[data-testid="profile-save-btn"]').addEventListener('click', () => {
    const raw = document.querySelector('[data-testid="profile-nickname-input"]').value.trim() || 'Little Star';
    store.setProfile({ nickname: raw.slice(0, 60) });
  });
  document.querySelector('[data-testid="share-mom-generate-btn"]').addEventListener('click', () => {
    hubApi.generateShareWithMomCard();
  });

  // R3 K-Pop Stage
  const songMeta = {
    golden: { bpm: 128, activeStems: ['drums', 'bass', 'lead', 'chords', 'vocal', 'fx'] },
    takedown: { bpm: 145, activeStems: ['drums', 'bass', 'lead', 'chords', 'vocal', 'fx'] },
    soda_pop: { bpm: 118, activeStems: ['drums', 'bass', 'lead', 'chords', 'vocal', 'fx'] }
  };
  const rhythmState = {
    isPlaying: false, score: 0, combo: 0, maxCombo: 0,
    judgements: { PERFECT: 0, GREAT: 0, GOOD: 0, MISS: 0 },
    activeNotesCount: 4, currentLyric: 'HUNTR/X GOLDEN!'
  };
  const activePads = new Set();
  const r3Api = {
    initializeAndVerifySongGraph(songId) {
      const m = songMeta[songId] || songMeta.golden;
      return { initialized: true, activeStems: m.activeStems, bpm: m.bpm, hasErrors: false };
    },
    startRhythmGame(songId) {
      rhythmState.isPlaying = true;
      rhythmState.score = 0;
      rhythmState.combo = 0;
    },
    stepRhythmTime(dt) {
      rhythmState.activeNotesCount = 4;
    },
    triggerLaneInput(lane) {
      if (lane < 0 || lane > 3) return;
      rhythmState.score += 100;
      rhythmState.combo += 1;
      if (rhythmState.combo > rhythmState.maxCombo) rhythmState.maxCombo = rhythmState.combo;
      rhythmState.judgements.PERFECT += 1;
    },
    getRhythmState() { return JSON.parse(JSON.stringify(rhythmState)); },
    toggleBeatPad(idx) {
      if (idx < 0 || idx >= 16) return;
      if (activePads.has(idx)) activePads.delete(idx);
      else activePads.add(idx);
    },
    getBeatPadState() {
      return { activePads: Array.from(activePads), bpm: 128, isRecording: false, recordedEventsCount: 0 };
    }
  };
  document.querySelector('[data-testid="beatpad-save-btn"]').addEventListener('click', () => {
    const arr = safeParse('cheerup_v1_saved_remixes', []);
    arr.push({ id: 'rmx-' + Date.now(), createdAt: Date.now(), activeLoops: Array.from(activePads) });
    localStorage.setItem('cheerup_v1_saved_remixes', JSON.stringify(arr));
  });

  window.__CHEER_UP_STUDIO__ = {
    store,
    tattoo: tattooApi,
    catnap: catnapApi,
    catnapGame: catnapGameApi,
    hub: hubApi
  };
  window.__CHEER_UP_R3_TEST_API__ = r3Api;
})();
</script>
</body>
</html>
"""
  (target_dir / "index.html").write_text(app_html, encoding="utf-8")
  (target_dir / "dist" / "index.html").write_text(app_html, encoding="utf-8")
  bundler_code = """#!/usr/bin/env python3
from pathlib import Path
root = Path(__file__).resolve().parents[1]
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "index.html").write_text((root / "index.html").read_text(encoding="utf-8"), encoding="utf-8")
"""
  script_file = target_dir / "scripts" / "build_dist.py"
  script_file.write_text(bundler_code, encoding="utf-8")
  script_file.chmod(0o755)


def _select_tests(tier_filter: str) -> list[TestCaseSpec]:
  if tier_filter == "all":
    return list(TEST_REGISTRY)
  return [t for t in TEST_REGISTRY if t.tier == tier_filter]


async def run_suite_async(
    tier_filter: str,
    chrome_binary: str,
    app_root: Path,
    report_json_path: Path | None,
) -> int:
  selected = _select_tests(tier_filter)
  if not selected:
    print(f"No tests matched --tier {tier_filter!r}", file=sys.stderr)
    return 2

  results: list[TestCaseResult] = []
  suite_start = time.monotonic()

  with LocalHttpServer(app_root) as server:
    async with ChromeCdpSession(chrome_binary=chrome_binary) as page:
      for spec in selected:
        t0 = time.monotonic()
        passed = False
        err_msg = ""
        try:
          await spec.fn(page, server.base_url)
          passed = True
        except Exception as exc:  # pylint: disable=broad-except
          err_msg = f"{type(exc).__name__}: {exc}"
        dt_ms = (time.monotonic() - t0) * 1000.0
        res = TestCaseResult(
            test_id=spec.test_id,
            tier=spec.tier,
            feature=spec.feature,
            title=spec.title,
            passed=passed,
            duration_ms=round(dt_ms, 2),
            error_message=err_msg,
            console_error_count=len(page.console_errors),
            page_exception_count=len(page.page_exceptions),
        )
        results.append(res)
        status_icon = "PASS" if passed else "FAIL"
        print(
            f"[{status_icon}] {spec.test_id:<10} (Tier {spec.tier:<2} | {spec.feature:<12}) "
            f"{spec.title} ({dt_ms:.1f} ms)"
        )
        if not passed:
          print(f"       └── {err_msg}")

  total_ms = (time.monotonic() - suite_start) * 1000.0
  passed_count = sum(1 for r in results if r.passed)
  failed_count = len(results) - passed_count

  summary: dict[str, Any] = {
      "timestamp_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
      "tier_filter": tier_filter,
      "app_root": str(app_root),
      "total_tests": len(results),
      "passed": passed_count,
      "failed": failed_count,
      "pass_rate_pct": round((passed_count / len(results)) * 100.0, 2) if results else 0.0,
      "duration_ms": round(total_ms, 2),
      "results": [r.__dict__ for r in results],
  }

  out_path = report_json_path or Path(f"/dev/shm/e2e_report_{os.getpid()}.json")
  out_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

  print("\n" + "=" * 78)
  print(
      f"E2E VERIFICATION SUMMARY: {passed_count}/{len(results)} PASSED "
      f"({summary['pass_rate_pct']}%) in {total_ms / 1000.0:.2f}s"
  )
  print(f"Report written to: {out_path}")
  print("=" * 78)
  return 0 if failed_count == 0 else 1


def main() -> int:
  parser = argparse.ArgumentParser(description="Run Cheer-Up Studio 4-Tier E2E Verification Suite")
  parser.add_argument(
      "--tier",
      choices=["ac", "1", "2", "3", "4", "all"],
      default="all",
      help="Test tier to execute (default: all)",
  )
  parser.add_argument(
      "--browser",
      default="/usr/bin/google-chrome",
      help="Path to Chromium/Chrome binary",
  )
  parser.add_argument(
      "--target",
      default=None,
      help="Optional path to application root or dist directory",
  )
  parser.add_argument(
      "--report-json",
      default=None,
      help="Optional output path for JSON test report (defaults to /dev/shm/e2e_report_<pid>.json)",
  )
  parser.add_argument(
      "--selftest",
      action="store_true",
      help="Run full 183-test harness self-verification against ephemeral /dev/shm reference app",
  )
  args = parser.parse_args()

  selftest_dir: Path | None = None
  try:
    if args.selftest:
      selftest_dir = Path(f"/dev/shm/e2e_selftest_{os.getpid()}")
      _materialize_selftest_app(selftest_dir)
      os.environ["CHEER_UP_APP_ROOT"] = str(selftest_dir)
      # Reload module-level PROJECT_ROOT bindings so F3 tests point at selftest_dir
      tests.tier1_features.PROJECT_ROOT = selftest_dir
      tests.tier2_boundaries.PROJECT_ROOT = selftest_dir
      app_root = selftest_dir
    elif args.target:
      target_path = Path(args.target).resolve()
      app_root = target_path.parent if target_path.is_file() else target_path
    else:
      app_root = REPO_ROOT

    report_path = Path(args.report_json) if args.report_json else None
    return asyncio.run(run_suite_async(args.tier, args.browser, app_root, report_path))
  finally:
    if selftest_dir and selftest_dir.exists():
      shutil.rmtree(selftest_dir, ignore_errors=True)


if __name__ == "__main__":
  sys.exit(main())
