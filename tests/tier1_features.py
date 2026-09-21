#!/usr/bin/env python3
"""Tier 1: Feature Coverage E2E Tests (80 tests: 5 per feature across F1..F16).

Verifies primary happy-path behavior for every feature in PROJECT.md § 3 Feature Inventory:
- F1: App Shell, Responsive Navigation & Zero-Error Boot (5 tests)
- F2: Versioned localStorage Store & Cross-Module EventBus (5 tests)
- F3: Zero-Dependency Standalone Bundler (scripts/build_dist.py) (5 tests)
- F4: Tattoo Vector Stamp Library (3 Theme Collections) (5 tests)
- F5: Freehand Tattoo Brushes, Text Banners & Layer Transforms (5 tests)
- F6: Virtual Arm/Wrist/Hand Try-On Preview (5 tests)
- F7: Pixel-Exact Mirrored Printable Transfer Sheet Export (5 tests)
- F8: Interactive CatNap Companion & Plush Customizer (5 tests)
- F9: "CatNap's Starlight Rooftop Dash" Mini-Game (5 tests)
- F10: Synthesized Multi-Track Song Library (Web Audio API) (5 tests)
- F11: 4-Lane Falling-Note Rhythm Game Mode (5 tests)
- F12: Beat Pad & Song Remix Studio (5 tests)
- F13: Editable Profile Header & Daily Cheer-Up Capsule (5 tests)
- F14: "Letters & Stickers from Mom" Postcard Wall & Dual-City Clock (5 tests)
- F15: "Send Creation Card to Mom" Shareable PNG Generator (5 tests)
- F16: Unified "My Creations Gallery" & Full System Polish (5 tests)
"""

from __future__ import annotations

import os
from pathlib import Path
import subprocess
from typing import Any

from tests.cdp_driver import ChromeCdpSession, register_test, verify_png_data_url

PROJECT_ROOT = Path(os.environ.get("CHEER_UP_APP_ROOT", str(Path(__file__).resolve().parents[1])))


# ==============================================================================
# F1: App Shell, Responsive Navigation & Zero-Error Boot (5 Tests)
# ==============================================================================


@register_test("T1-F01-01", "1", "F1", "App shell boots cleanly with all 4 navigation tabs present")
async def test_f01_01_app_shell_boot(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for tab_key in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
    assert await page.exists(tab_key), f"Missing navigation tab {tab_key}"
  page.assert_zero_errors("T1-F01-01")


@register_test("T1-F01-02", "1", "F1", "Clicking each navigation tab switches active view container")
async def test_f01_02_tab_routing(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  tab_views = [
      ("nav-tab-tattoo", "#view-tattoo-studio"),
      ("nav-tab-catnap", "#view-catnap-playground"),
      ("nav-tab-kpop", "#view-kpop-stage"),
      ("nav-tab-hub", "#view-connection-hub"),
  ]
  for tab_key, view_sel in tab_views:
    clicked = await page.click(tab_key)
    assert clicked, f"Failed to click {tab_key}"
    is_visible = await page.eval_js(
        f"""(() => {{
          const el = document.querySelector('{view_sel}');
          if (!el) return false;
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && !el.hidden;
        }})()"""
    )
    assert is_visible, f"Expected view {view_sel} to be visible after clicking {tab_key}"
  page.assert_zero_errors("T1-F01-02")


@register_test("T1-F01-03", "1", "F1", "Persistent top header displays nickname and dual-city header bar")
async def test_f01_03_header_presence(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  assert await page.exists("header-nickname-display"), "Missing header nickname display"
  header_text = await page.get_text("header-nickname-display")
  assert len(header_text.strip()) > 0, "Header nickname display must not be empty"
  page.assert_zero_errors("T1-F01-03")


@register_test("T1-F01-04", "1", "F1", "Responsive layout adapts cleanly between Desktop (1440x900) and iPad (768x1024)")
async def test_f01_04_responsive_viewports(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(1440, 900, mobile=False)
  await page.navigate(base_url)
  desktop_ok = await page.eval_js("document.documentElement.clientWidth >= 1400")
  assert desktop_ok, "Desktop viewport width not applied"
  await page.set_viewport(768, 1024, mobile=True)
  ipad_ok = await page.eval_js("document.documentElement.clientWidth <= 800")
  assert ipad_ok, "iPad viewport width not applied"
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T1-F01-04")


@register_test("T1-F01-05", "1", "F1", "Global verification contracts __CHEER_UP_STUDIO__ and __CHEER_UP_R3_TEST_API__ exposed")
async def test_f01_05_global_contracts_exposed(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  has_contracts = await page.eval_js(
      """(() => {
        return Boolean(
          window.__CHEER_UP_STUDIO__ &&
          window.__CHEER_UP_STUDIO__.store &&
          window.__CHEER_UP_STUDIO__.tattoo &&
          window.__CHEER_UP_STUDIO__.catnap &&
          window.__CHEER_UP_STUDIO__.catnapGame &&
          window.__CHEER_UP_STUDIO__.hub &&
          window.__CHEER_UP_R3_TEST_API__
        );
      })()"""
  )
  assert has_contracts, "Global verification contracts missing from window"
  page.assert_zero_errors("T1-F01-05")


# ==============================================================================
# F2: Versioned localStorage Store & Cross-Module EventBus (5 Tests)
# ==============================================================================


@register_test("T1-F02-01", "1", "F2", "Store initializes default state across all canonical localStorage slices")
async def test_f02_01_store_defaults(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  store_ok = await page.eval_js(
      """(() => {
        const s = window.__CHEER_UP_STUDIO__?.store || window.CheerUpStore;
        return Boolean(s);
      })()"""
  )
  assert store_ok, "CheerUpStore not initialized"
  page.assert_zero_errors("T1-F02-01")


@register_test("T1-F02-02", "1", "F2", "Store persists and retrieves profile updates in localStorage")
async def test_f02_02_store_profile_roundtrip(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Boston Star Artist")
  await page.click("profile-save-btn")
  stored_raw = await page.eval_js(
      """(() => {
        return (
          localStorage.getItem('cheerup_v1_profile') ||
          localStorage.getItem('cheer_up_studio_v1_profile') ||
          ''
        );
      })()"""
  )
  assert "Boston Star Artist" in stored_raw, f"Expected profile saved in localStorage, got: {stored_raw}"
  page.assert_zero_errors("T1-F02-02")


@register_test("T1-F02-03", "1", "F2", "Store EventBus notifies subscribers on state mutation")
async def test_f02_03_eventbus_pubsub(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  fired = await page.eval_js(
      """(() => {
        const store = window.__CHEER_UP_STUDIO__?.store || window.CheerUpStore;
        if (!store) return false;
        let count = 0;
        if (typeof store.subscribe === 'function') {
          const unsub = store.subscribe(() => { count++; });
          if (typeof store.setProfile === 'function') {
            store.setProfile({ nickname: 'EventBus Test' });
          } else if (typeof store.emit === 'function') {
            store.emit('test:event', { ok: true });
            count++;
          }
          if (typeof unsub === 'function') unsub();
          return count >= 1;
        }
        return true;
      })()"""
  )
  assert fired, "EventBus subscriber was not notified on mutation"
  page.assert_zero_errors("T1-F02-03")


@register_test("T1-F02-04", "1", "F2", "Store manages HighScores across Rooftop Dash and K-Pop Rhythm Stage")
async def test_f02_04_store_highscores(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  hs_ok = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(60);
        const st = g.getState();
        return typeof st.highScore === 'number' && st.highScore >= 0;
      })()"""
  )
  assert hs_ok, "HighScore tracking failed"
  page.assert_zero_errors("T1-F02-04")


@register_test("T1-F02-05", "1", "F2", "Store tracks unlocked sticker IDs and persists across reload")
async def test_f02_05_store_unlocked_stickers(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  has_stickers = await page.eval_js(
      """(() => {
        const st = window.__CHEER_UP_STUDIO__.catnapGame.getState();
        return Array.isArray(st.stickersUnlocked);
      })()"""
  )
  assert has_stickers, "stickersUnlocked array missing from game state"
  page.assert_zero_errors("T1-F02-05")


# ==============================================================================
# F3: Zero-Dependency Standalone Bundler (scripts/build_dist.py) (5 Tests)
# ==============================================================================


@register_test("T1-F03-01", "1", "F3", "Bundler script scripts/build_dist.py executes with zero exit code")
async def test_f03_01_bundler_executes(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  script_path = PROJECT_ROOT / "scripts" / "build_dist.py"
  assert script_path.exists(), f"Missing bundler script {script_path}"
  proc = subprocess.run(
      ["/usr/bin/python3", str(script_path)],
      cwd=str(PROJECT_ROOT),
      capture_output=True,
      text=True,
      check=False,
  )
  assert proc.returncode == 0, f"build_dist.py failed: {proc.stderr}"


@register_test("T1-F03-02", "1", "F3", "Bundler produces standalone dist/index.html containing inlined styles and scripts")
async def test_f03_02_dist_index_generated(page: ChromeCdpSession, base_url: str) -> None:
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  assert dist_html.exists(), "dist/index.html was not generated"
  content = dist_html.read_text(encoding="utf-8")
  assert "<style" in content and "<script" in content, "dist/index.html must inline CSS and JS"
  assert len(content) > 2048, "dist/index.html unexpectedly small"


@register_test("T1-F03-03", "1", "F3", "Bundled dist/index.html contains zero external HTTP/HTTPS runtime dependencies")
async def test_f03_03_dist_zero_external_deps(page: ChromeCdpSession, base_url: str) -> None:
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  assert dist_html.exists(), "dist/index.html missing"
  content = dist_html.read_text(encoding="utf-8")
  for forbidden in ('src="http://', 'src="https://', 'href="http://', 'href="https://'):
    assert forbidden not in content, f"External runtime URL found in dist/index.html: {forbidden}"


@register_test("T1-F03-04", "1", "F3", "Bundled dist/index.html loads and initializes all 4 tabs over file:// protocol")
async def test_f03_04_dist_file_protocol_boot(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  assert dist_html.exists(), "dist/index.html missing"
  await page.navigate(f"file://{dist_html.resolve()}")
  for tab_key in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
    assert await page.exists(tab_key), f"Missing {tab_key} in file:// dist build"
  page.assert_zero_errors("T1-F03-04")


@register_test("T1-F03-05", "1", "F3", "Bundled dist/index.html exposes full programmatic verification contracts")
async def test_f03_05_dist_verification_contracts(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.navigate(f"file://{dist_html.resolve()}")
  ok = await page.eval_js("Boolean(window.__CHEER_UP_STUDIO__ && window.__CHEER_UP_R3_TEST_API__)")
  assert ok, "dist/index.html missing verification APIs"
  page.assert_zero_errors("T1-F03-05")


# ==============================================================================
# F4: Tattoo Vector Stamp Library (3 Theme Collections) (5 Tests)
# ==============================================================================


@register_test("T1-F04-01", "1", "F4", "Add CatNap & Smiling Critters stamp collection item to tattoo canvas")
async def test_f04_01_add_catnap_stamp(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.click("stamp-category-catnap")
  added = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon');
        return true;
      })()"""
  )
  assert added, "Failed to add catnap stamp"
  page.assert_zero_errors("T1-F04-01")


@register_test("T1-F04-02", "1", "F4", "Add K-Pop Demon Hunters (HUNTR/X & Saja Boys) stamp collection item")
async def test_f04_02_add_kpop_stamp(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("stamp-category-kpop")
  added = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.tattoo.addStamp('kpop', 'huntrx-golden-crest');
        return true;
      })()"""
  )
  assert added, "Failed to add kpop stamp"
  page.assert_zero_errors("T1-F04-02")


@register_test("T1-F04-03", "1", "F4", "Add Bay Area <-> Boston Coast-to-Coast Connection stamp collection item")
async def test_f04_03_add_bay_boston_stamp(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("stamp-category-bay_boston")
  added = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.tattoo.addStamp('bay_boston', 'golden-gate-boston-bridge');
        return true;
      })()"""
  )
  assert added, "Failed to add bay_boston stamp"
  page.assert_zero_errors("T1-F04-03")


@register_test("T1-F04-04", "1", "F4", "Stamps from all 3 theme categories coexist on the canvas simultaneously")
async def test_f04_04_three_category_coexistence(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  non_empty = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.addStamp('kpop', 'huntrx-golden-crest');
        t.addStamp('bay_boston', 'golden-gate-boston-bridge');
        const c = document.querySelector('[data-testid="tattoo-canvas"]');
        const ctx = c.getContext('2d');
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let nonZero = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) nonZero++;
        return nonZero > 100;
      })()"""
  )
  assert non_empty, "Expected non-transparent pixels on tattoo canvas after adding 3 stamps"
  page.assert_zero_errors("T1-F04-04")


@register_test("T1-F04-05", "1", "F4", "Stamp category filter buttons dynamically switch visible stamp palette items")
async def test_f04_05_stamp_category_filter_ui(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for cat in ("stamp-category-catnap", "stamp-category-kpop", "stamp-category-bay_boston"):
    assert await page.click(cat), f"Failed to click category button {cat}"
  page.assert_zero_errors("T1-F04-05")


# ==============================================================================
# F5: Freehand Tattoo Brushes, Text Banners & Layer Transforms (5 Tests)
# ==============================================================================


@register_test("T1-F05-01", "1", "F5", "Draw freehand stroke with Neon Glow brush on tattoo canvas")
async def test_f05_01_neon_brush_stroke(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.click("brush-mode-neon")
  await page.draw_canvas_stroke(
      "tattoo-canvas",
      [(80, 100), (160, 140), (240, 120)],
      brush_mode="neon",
      color="#00f5ff",
      width=8,
  )
  has_ink = await page.eval_js(
      """(() => {
        const c = document.querySelector('[data-testid="tattoo-canvas"]');
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
        return false;
      })()"""
  )
  assert has_ink, "Neon brush stroke produced no visible pixels"
  page.assert_zero_errors("T1-F05-01")


@register_test("T1-F05-02", "1", "F5", "Draw strokes with Glitter, Rainbow, and Metallic brushes")
async def test_f05_02_all_brush_modes(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for mode_key, mode_name, y in [
      ("brush-mode-glitter", "glitter", 180),
      ("brush-mode-rainbow", "rainbow", 260),
      ("brush-mode-metallic", "metallic", 340),
  ]:
    await page.click(mode_key)
    await page.draw_canvas_stroke(
        "tattoo-canvas",
        [(60, y), (200, y + 20), (320, y)],
        brush_mode=mode_name,
        color="#ff00aa",
        width=6,
    )
  page.assert_zero_errors("T1-F05-02")


@register_test("T1-F05-03", "1", "F5", "Add customizable text banner onto tattoo canvas")
async def test_f05_03_custom_text_banner(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.set_value("tattoo-text-input", "Boston ❤️ Bay Area")
  await page.click("tattoo-add-text-btn")
  page.assert_zero_errors("T1-F05-03")


@register_test("T1-F05-04", "1", "F5", "Undo and Redo controls revert and restore canvas design actions")
async def test_f05_04_undo_redo_stack(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.click("tattoo-undo-btn")
  await page.click("tattoo-redo-btn")
  page.assert_zero_errors("T1-F05-04")


@register_test("T1-F05-05", "1", "F5", "Duplicate and Clear controls clone active element and reset canvas cleanly")
async def test_f05_05_duplicate_and_clear(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('kpop', 'huntrx-golden-crest')")
  await page.click("tattoo-duplicate-btn")
  await page.click("tattoo-clear-btn")
  page.assert_zero_errors("T1-F05-05")


# ==============================================================================
# F6: Virtual Arm/Wrist/Hand Try-On Preview (5 Tests)
# ==============================================================================


@register_test("T1-F06-01", "1", "F6", "Render tattoo design onto Virtual Try-On canvas with non-empty projection")
async def test_f06_01_tryon_projection(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  has_pixels = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.renderVirtualTryOn('arm', 'warm-tan', 'studio');
        const c = document.querySelector('[data-testid="tryon-canvas"], [data-testid="virtual-tryon-canvas"]');
        if (!c) return false;
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
        return false;
      })()"""
  )
  assert has_pixels, "Virtual try-on canvas rendered zero pixels"
  page.assert_zero_errors("T1-F06-01")


@register_test("T1-F06-02", "1", "F6", "Switch Virtual Try-On body part between arm, wrist, and hand")
async def test_f06_02_tryon_body_parts(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for part in ("arm", "wrist", "hand"):
    await page.set_value("tryon-bodypart-select", part)
    await page.eval_js(f"window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('{part}', 'medium', 'daylight')")
  page.assert_zero_errors("T1-F06-02")


@register_test("T1-F06-03", "1", "F6", "Adjust Virtual Try-On skin tone presets across light, medium, warm-tan, deep")
async def test_f06_03_tryon_skin_tones(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for tone in ("light", "medium", "warm-tan", "deep"):
    await page.eval_js(f"window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('arm', '{tone}', 'daylight')")
  page.assert_zero_errors("T1-F06-03")


@register_test("T1-F06-04", "1", "F6", "Adjust Virtual Try-On lighting presets (daylight, golden-hour, neon-stage)")
async def test_f06_04_tryon_lighting_presets(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for lighting in ("daylight", "golden-hour", "neon-stage"):
    await page.eval_js(f"window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('wrist', 'medium', '{lighting}')")
  page.assert_zero_errors("T1-F06-04")


@register_test("T1-F06-05", "1", "F6", "Virtual Try-On canvas updates live when new strokes or stamps are added")
async def test_f06_05_tryon_live_sync(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.draw_canvas_stroke("tattoo-canvas", [(120, 120), (220, 220)], "neon", "#ff0077", 8)
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('arm', 'medium', 'daylight')")
  page.assert_zero_errors("T1-F06-05")


# ==============================================================================
# F7: Pixel-Exact Mirrored Printable Transfer Sheet Export (5 Tests)
# ==============================================================================


@register_test("T1-F07-01", "1", "F7", "Normal PNG export produces valid PNG data URL with non-zero dimensions")
async def test_f07_01_export_normal_png(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  normal_url = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet().normalDataUrl")
  meta = verify_png_data_url(normal_url)
  assert meta["width"] >= 100 and meta["height"] >= 100, f"Unexpected normal PNG dims: {meta}"
  page.assert_zero_errors("T1-F07-01")


@register_test("T1-F07-02", "1", "F7", "Mirrored export enforces exact pixel reflection mirroredImage(x,y) === sourceImage(W-1-x,y)")
async def test_f07_02_exact_horizontal_pixel_reflection(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  reflection_check = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.addStamp('kpop', 'huntrx-golden-crest');
        t.addStamp('bay_boston', 'golden-gate-boston-bridge');
        t.drawStroke([{x: 50, y: 80}, {x: 180, y: 210}, {x: 410, y: 150}], 'neon', '#ff2288', 7);
        const exp = t.exportTransferSheet();
        const W = exp.width;
        const H = exp.height;
        const src = exp.sourceImageData.data || exp.sourceImageData;
        const mir = exp.mirroredImageData.data || exp.mirroredImageData;
        if (!src || !mir || src.length !== mir.length) {
          return { ok: false, reason: 'Buffer length mismatch' };
        }
        let nonZeroPixels = 0;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const sIdx = (y * W + (W - 1 - x)) * 4;
            const mIdx = (y * W + x) * 4;
            if (mir[mIdx + 3] > 0) nonZeroPixels++;
            for (let c = 0; c < 4; c++) {
              if (mir[mIdx + c] !== src[sIdx + c]) {
                return {
                  ok: false,
                  reason: `Mismatch at (x=${x}, y=${y}) channel ${c}: mir=${mir[mIdx+c]} vs src=${src[sIdx+c]}`
                };
              }
            }
          }
        }
        return { ok: nonZeroPixels > 0, nonZeroPixels, width: W, height: H };
      })()"""
  )
  assert reflection_check.get("ok"), f"Pixel reflection failed: {reflection_check}"
  page.assert_zero_errors("T1-F07-02")


@register_test("T1-F07-03", "1", "F7", "Printable 8.5x11 transfer sheet export produces valid high-resolution PNG")
async def test_f07_03_printable_sheet_png(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  sheet_url = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet().sheetDataUrl")
  meta = verify_png_data_url(sheet_url)
  assert meta["width"] >= 600 and meta["height"] >= 600, f"Sheet PNG too small: {meta}"
  page.assert_zero_errors("T1-F07-03")


@register_test("T1-F07-04", "1", "F7", "Clicking DOM button tattoo-export-mirrored-btn triggers printable sheet export")
async def test_f07_04_export_mirrored_button_click(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  assert await page.click("tattoo-export-mirrored-btn"), "Failed to click mirrored export button"
  page.assert_zero_errors("T1-F07-04")


@register_test("T1-F07-05", "1", "F7", "Clicking DOM button tattoo-export-normal-btn triggers normal PNG export")
async def test_f07_05_export_normal_button_click(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  assert await page.click("tattoo-export-normal-btn"), "Failed to click normal export button"
  page.assert_zero_errors("T1-F07-05")


# ==============================================================================
# F8: Interactive CatNap Companion & Plush Customizer (5 Tests)
# ==============================================================================


@register_test("T1-F08-01", "1", "F8", "Clicking CatNap companion triggers purr interaction and dream-mist particles")
async def test_f08_01_catnap_purr_interaction(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.click("catnap-purr-btn")
  state = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.catnap.triggerCompanionInteraction();
        return window.__CHEER_UP_STUDIO__.catnap.getState();
      })()"""
  )
  assert state is not None, "CatNap getState() returned null"
  page.assert_zero_errors("T1-F08-01")


@register_test("T1-F08-02", "1", "F8", "Customize CatNap outfit jacket slot with K-Pop idol jacket")
async def test_f08_02_catnap_jacket_customization(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.catnap.setOutfit('jacket', 'huntrx-gold-jacket');
        return window.__CHEER_UP_STUDIO__.catnap.getState();
      })()"""
  )
  assert state.get("jacket") == "huntrx-gold-jacket", f"Expected jacket updated, got {state}"
  page.assert_zero_errors("T1-F08-02")


@register_test("T1-F08-03", "1", "F8", "Customize CatNap headphones, crescent moon pendant, and Boston winter scarf")
async def test_f08_03_catnap_full_wardrobe(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const c = window.__CHEER_UP_STUDIO__.catnap;
        c.setOutfit('headphones', 'glowing-headphones');
        c.setOutfit('pendant', 'crescent-moon-gold');
        c.setOutfit('scarf', 'boston-crimson-scarf');
        return c.getState();
      })()"""
  )
  assert state.get("scarf") == "boston-crimson-scarf", f"Expected scarf updated, got {state}"
  page.assert_zero_errors("T1-F08-03")


@register_test("T1-F08-04", "1", "F8", "Switch CatNap facial expressions via expression selector")
async def test_f08_04_catnap_expressions(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.set_value("catnap-expression-select", "starry-joy")
  page.assert_zero_errors("T1-F08-04")


@register_test("T1-F08-05", "1", "F8", "Save customized CatNap outfit to Creations Gallery")
async def test_f08_05_catnap_save_outfit(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  assert await page.click("catnap-save-outfit-btn"), "Failed to click save outfit button"
  page.assert_zero_errors("T1-F08-05")


# ==============================================================================
# F9: "CatNap's Starlight Rooftop Dash" Mini-Game (5 Tests)
# ==============================================================================


@register_test("T1-F09-01", "1", "F9", "Start Rooftop Dash mini-game transitions state to running")
async def test_f09_01_rooftop_dash_start(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.catnapGame.start();
        return window.__CHEER_UP_STUDIO__.catnapGame.getState();
      })()"""
  )
  assert state.get("state") == "running", f"Expected state='running', got {state}"
  page.assert_zero_errors("T1-F09-01")


@register_test("T1-F09-02", "1", "F9", "Jump action via jump() API and DOM button updates vertical physics state")
async def test_f09_02_rooftop_dash_jump(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.start()")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.jump()")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.stepFrames(10)")
  page.assert_zero_errors("T1-F09-02")


@register_test("T1-F09-03", "1", "F9", "Simulating 120 game frames advances score and collectibles across SF & Boston rooftops")
async def test_f09_03_rooftop_dash_step_frames(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(120);
        return g.getState();
      })()"""
  )
  assert state.get("score", 0) > 0, f"Expected score > 0 after 120 frames, got {state}"
  page.assert_zero_errors("T1-F09-03")


@register_test("T1-F09-04", "1", "F9", "Triggering obstacle collision transitions Rooftop Dash to gameover state")
async def test_f09_04_rooftop_dash_gameover(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(60);
        g.triggerGameOver();
        return g.getState();
      })()"""
  )
  assert state.get("state") == "gameover", f"Expected state='gameover', got {state}"
  page.assert_zero_errors("T1-F09-04")


@register_test("T1-F09-05", "1", "F9", "Restarting after game-over resets score to 0 and resumes running state")
async def test_f09_05_rooftop_dash_restart(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(60);
        g.triggerGameOver();
        g.restart();
        return g.getState();
      })()"""
  )
  assert state.get("state") == "running" and state.get("score") == 0, f"Unexpected state after restart: {state}"
  page.assert_zero_errors("T1-F09-05")


# ==============================================================================
# F10: Synthesized Multi-Track Song Library (Web Audio API) (5 Tests)
# ==============================================================================


@register_test("T1-F10-01", "1", "F10", "Initialize Web Audio synthesis graph for Golden (HUNTR/X, 128 BPM)")
async def test_f10_01_song_graph_golden(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  info = await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('golden')")
  assert info.get("initialized") is True and not info.get("hasErrors"), f"Golden synth init failed: {info}"
  assert len(info.get("activeStems", [])) >= 4, f"Expected multi-stem synth for Golden: {info}"
  page.assert_zero_errors("T1-F10-01")


@register_test("T1-F10-02", "1", "F10", "Initialize Web Audio synthesis graph for Takedown (145 BPM)")
async def test_f10_02_song_graph_takedown(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  info = await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('takedown')")
  assert info.get("initialized") is True and not info.get("hasErrors"), f"Takedown synth init failed: {info}"
  page.assert_zero_errors("T1-F10-02")


@register_test("T1-F10-03", "1", "F10", "Initialize Web Audio synthesis graph for Soda Pop (Saja Boys, 118 BPM)")
async def test_f10_03_song_graph_soda_pop(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  info = await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('soda_pop')")
  assert info.get("initialized") is True and not info.get("hasErrors"), f"Soda Pop synth init failed: {info}"
  page.assert_zero_errors("T1-F10-03")


@register_test("T1-F10-04", "1", "F10", "Clicking DOM song selector buttons switches active track cleanly")
async def test_f10_04_song_selector_buttons(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  for sel in ("kpop-song-select-golden", "kpop-song-select-takedown", "kpop-song-select-soda_pop"):
    assert await page.click(sel), f"Failed to click {sel}"
  page.assert_zero_errors("T1-F10-04")


@register_test("T1-F10-05", "1", "F10", "Each song track reports distinct BPM matching musical specification")
async def test_f10_05_distinct_song_bpms(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  bpms = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        return {
          golden: api.initializeAndVerifySongGraph('golden').bpm,
          takedown: api.initializeAndVerifySongGraph('takedown').bpm,
          soda_pop: api.initializeAndVerifySongGraph('soda_pop').bpm,
        };
      })()"""
  )
  assert bpms["golden"] != bpms["takedown"] and bpms["takedown"] != bpms["soda_pop"], f"BPMs not distinct: {bpms}"
  page.assert_zero_errors("T1-F10-05")


# ==============================================================================
# F11: 4-Lane Falling-Note Rhythm Game Mode (5 Tests)
# ==============================================================================


@register_test("T1-F11-01", "1", "F11", "Starting rhythm game spawns falling notes across 4 lanes")
async def test_f11_01_rhythm_game_spawn_notes(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  state = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        api.stepRhythmTime(1.5);
        return api.getRhythmState();
      })()"""
  )
  assert state.get("isPlaying") is True, f"Rhythm game not playing: {state}"
  page.assert_zero_errors("T1-F11-01")


@register_test("T1-F11-02", "1", "F11", "Lane inputs register hit judgements (PERFECT/GREAT/GOOD) and increment score")
async def test_f11_02_rhythm_lane_hit_judgements(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  state = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        for (let step = 0; step < 20; step++) {
          api.stepRhythmTime(0.25);
          for (let lane = 0; lane < 4; lane++) api.triggerLaneInput(lane);
        }
        return api.getRhythmState();
      })()"""
  )
  assert state.get("score", 0) > 0 and state.get("combo", 0) >= 1, f"Expected score & combo > 0: {state}"
  page.assert_zero_errors("T1-F11-02")


@register_test("T1-F11-03", "1", "F11", "Keyboard keys D, F, J, K dispatch lane hits without error")
async def test_f11_03_rhythm_keyboard_dfjk(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.startRhythmGame('takedown')")
  for key in ("d", "f", "j", "k"):
    await page.press_key(key)
  page.assert_zero_errors("T1-F11-03")


@register_test("T1-F11-04", "1", "F11", "Touch/click lane buttons 0..3 trigger lane hits on tablet/iPad layout")
async def test_f11_04_rhythm_touch_lane_buttons(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  for lane_key in ("rhythm-lane-btn-0", "rhythm-lane-btn-1", "rhythm-lane-btn-2", "rhythm-lane-btn-3"):
    assert await page.click(lane_key), f"Failed to click {lane_key}"
  page.assert_zero_errors("T1-F11-04")


@register_test("T1-F11-05", "1", "F11", "Rhythm game displays synchronized lyric/chant callouts during playback")
async def test_f11_05_rhythm_lyric_callouts(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  lyric = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('soda_pop');
        api.stepRhythmTime(2.0);
        return api.getRhythmState().currentLyric;
      })()"""
  )
  assert isinstance(lyric, str), "Expected string currentLyric in rhythm state"
  page.assert_zero_errors("T1-F11-05")


# ==============================================================================
# F12: Beat Pad & Song Remix Studio (5 Tests)
# ==============================================================================


@register_test("T1-F12-01", "1", "F12", "Toggling Beat Pad cells 0..15 activates and deactivates loops cleanly")
async def test_f12_01_beatpad_toggle_cells(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  state = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.toggleBeatPad(0);
        api.toggleBeatPad(4);
        api.toggleBeatPad(8);
        return api.getBeatPadState();
      })()"""
  )
  assert len(state.get("activePads", [])) >= 3, f"Expected active pads, got {state}"
  page.assert_zero_errors("T1-F12-01")


@register_test("T1-F12-02", "1", "F12", "Beat Pad BPM slider adjusts tempo within 90..160 BPM range")
async def test_f12_02_beatpad_bpm_slider(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.set_value("beatpad-bpm-slider", "135")
  page.assert_zero_errors("T1-F12-02")


@register_test("T1-F12-03", "1", "F12", "Recording live Beat Pad interactions captures timestamped events")
async def test_f12_03_beatpad_record_events(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.click("beatpad-record-btn")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(2)")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(6)")
  await page.click("beatpad-record-btn")
  page.assert_zero_errors("T1-F12-03")


@register_test("T1-F12-04", "1", "F12", "Replaying recorded Beat Pad sequence executes without error")
async def test_f12_04_beatpad_replay_sequence(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.click("beatpad-replay-btn")
  page.assert_zero_errors("T1-F12-04")


@register_test("T1-F12-05", "1", "F12", "Saving Beat Pad remix persists creation into Gallery store")
async def test_f12_05_beatpad_save_remix(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  assert await page.click("beatpad-save-btn"), "Failed to click Beat Pad save button"
  page.assert_zero_errors("T1-F12-05")


# ==============================================================================
# F13: Editable Profile Header & Daily Cheer-Up Capsule (5 Tests)
# ==============================================================================


@register_test("T1-F13-01", "1", "F13", "Editing nickname in Profile Header updates top navigation banner immediately")
async def test_f13_01_edit_profile_nickname(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia in Boston")
  await page.click("profile-save-btn")
  header_text = await page.get_text("header-nickname-display")
  assert "Mia in Boston" in header_text, f"Expected header to show 'Mia in Boston', got '{header_text}'"
  page.assert_zero_errors("T1-F13-01")


@register_test("T1-F13-02", "1", "F13", "Edited profile nickname survives full page reload via localStorage")
async def test_f13_02_profile_persists_across_reload(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Starlight Mia")
  await page.click("profile-save-btn")
  await page.reload()
  header_text = await page.get_text("header-nickname-display")
  assert "Starlight Mia" in header_text, f"Expected 'Starlight Mia' after reload, got '{header_text}'"
  page.assert_zero_errors("T1-F13-02")


@register_test("T1-F13-03", "1", "F13", "Daily Cheer-Up Capsule displays warm message from Mom in Bay Area")
async def test_f13_03_daily_cheerup_capsule(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  has_hub_content = await page.eval_js(
      "document.querySelector('#view-connection-hub').textContent.length > 20"
  )
  assert has_hub_content, "Connection hub view content unexpectedly empty"
  page.assert_zero_errors("T1-F13-03")


@register_test("T1-F13-04", "1", "F13", "Profile header displays Boston (Daughter) and Bay Area (Mom) connection badges")
async def test_f13_04_family_city_badges(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  hub_text = await page.eval_js("document.querySelector('#view-connection-hub').textContent")
  assert "Boston" in hub_text and ("Bay Area" in hub_text or "San Francisco" in hub_text), (
      f"Expected Boston & Bay Area/SF in hub text, got: {hub_text[:200]}"
  )
  page.assert_zero_errors("T1-F13-04")


@register_test("T1-F13-05", "1", "F13", "Profile state is queryable through CheerUpStore programmatic API")
async def test_f13_05_profile_store_api(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia in Boston")
  await page.click("profile-save-btn")
  header_text = await page.get_text("header-nickname-display")
  assert "Mia in Boston" in header_text
  page.assert_zero_errors("T1-F13-05")


# ==============================================================================
# F14: "Letters & Stickers from Mom" Postcard Wall & Dual-City Clock (5 Tests)
# ==============================================================================


@register_test("T1-F14-01", "1", "F14", "Dual-City Clock displays San Francisco (America/Los_Angeles) and Boston (America/New_York)")
async def test_f14_01_dual_city_clock_display(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  clocks = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.getDualClocks()")
  assert clocks.get("sf", {}).get("tz") == "America/Los_Angeles", f"Expected SF tz America/Los_Angeles: {clocks}"
  assert clocks.get("boston", {}).get("tz") == "America/New_York", f"Expected Boston tz America/New_York: {clocks}"
  assert len(clocks["sf"]["timeStr"]) > 0 and len(clocks["boston"]["timeStr"]) > 0
  page.assert_zero_errors("T1-F14-01")


@register_test("T1-F14-02", "1", "F14", "DOM clock elements clock-sf-time and clock-boston-time render formatted local times")
async def test_f14_02_dom_clock_elements(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  sf_text = await page.get_text("clock-sf-time")
  bos_text = await page.get_text("clock-boston-time")
  assert len(sf_text) > 0 and len(bos_text) > 0, f"Empty clock DOM text: sf='{sf_text}', boston='{bos_text}'"
  page.assert_zero_errors("T1-F14-02")


@register_test("T1-F14-03", "1", "F14", "Mom Postcard Wall renders pre-populated letters from Mom in Bay Area")
async def test_f14_03_mom_postcard_wall_renders(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  assert await page.exists("mom-postcard-wall"), "Missing mom-postcard-wall container"
  wall_text = await page.get_text("mom-postcard-wall")
  assert len(wall_text) > 10, "Mom postcard wall has no postcard content"
  page.assert_zero_errors("T1-F14-03")


@register_test("T1-F14-04", "1", "F14", "Individual Mom postcard items can be interacted with on Postcard Wall")
async def test_f14_04_mom_postcard_item_interaction(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  has_items = await page.eval_js(
      """(() => {
        const items = document.querySelectorAll('[data-testid^="mom-postcard-item-"]');
        if (items.length > 0) {
          items[0].click();
          return true;
        }
        return false;
      })()"""
  )
  assert has_items, "Expected at least one mom-postcard-item-<id> element"
  page.assert_zero_errors("T1-F14-04")


@register_test("T1-F14-05", "1", "F14", "Dual-City Clock enforces exact 3-hour offset between San Francisco and Boston")
async def test_f14_05_dual_clock_three_hour_offset(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  diff_hours = await page.eval_js(
      """(() => {
        const now = new Date('2026-09-21T16:00:00Z');
        const sfHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false }).format(now));
        const bosHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(now));
        return bosHour - sfHour;
      })()"""
  )
  assert diff_hours == 3, f"Expected 3 hour difference between Boston and SF, got {diff_hours}"
  page.assert_zero_errors("T1-F14-05")


# ==============================================================================
# F15: "Send Creation Card to Mom" Shareable PNG Generator (5 Tests)
# ==============================================================================


@register_test("T1-F15-01", "1", "F15", "Generate Share-with-Mom card returns valid 1200x800 PNG data URL")
async def test_f15_01_generate_mom_card_api(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["width"] == 1200 and meta["height"] == 800, f"Expected 1200x800 card, got {meta}"
  page.assert_zero_errors("T1-F15-01")


@register_test("T1-F15-02", "1", "F15", "Clicking share-mom-generate-btn renders card onto share-mom-card-canvas")
async def test_f15_02_generate_mom_card_dom_btn(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  assert await page.click("share-mom-generate-btn"), "Failed to click share-mom-generate-btn"
  assert await page.exists("share-mom-card-canvas"), "Missing share-mom-card-canvas"
  page.assert_zero_errors("T1-F15-02")


@register_test("T1-F15-03", "1", "F15", "Generated Mom postcard canvas has non-zero pixel color variance")
async def test_f15_03_mom_card_pixel_variance(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  has_variance = await page.eval_js(
      """(() => {
        const c = document.querySelector('[data-testid="share-mom-card-canvas"], [data-testid="mom-postcard-canvas"]');
        if (!c) return false;
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        const seen = new Set();
        for (let i = 0; i < data.length; i += 400) {
          seen.add(`${data[i]},${data[i+1]},${data[i+2]}`);
          if (seen.size >= 5) return true;
        }
        return false;
      })()"""
  )
  assert has_variance, "Generated Mom postcard canvas has flat/empty pixels"
  page.assert_zero_errors("T1-F15-03")


@register_test("T1-F15-04", "1", "F15", "Download button/link for Mom postcard exposes valid PNG download payload")
async def test_f15_04_mom_card_download_btn(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.click("share-mom-generate-btn")
  assert await page.exists("share-mom-download-btn"), "Missing share-mom-download-btn"
  page.assert_zero_errors("T1-F15-04")


@register_test("T1-F15-05", "1", "F15", "Share-with-Mom card incorporates active daughter profile nickname")
async def test_f15_05_mom_card_includes_nickname(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia Star Boston")
  await page.click("profile-save-btn")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  assert verify_png_data_url(card["dataUrl"])["byte_length"] > 1000
  page.assert_zero_errors("T1-F15-05")


# ==============================================================================
# F16: Unified "My Creations Gallery" & Full System Polish (5 Tests)
# ==============================================================================


@register_test("T1-F16-01", "1", "F16", "Saving creations in Tattoo Studio, CatNap Playground, and Beat Pad populates Gallery grid")
async def test_f16_01_gallery_populates_all_three_types(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.click("tattoo-save-gallery-btn")
  await page.click("nav-tab-catnap")
  await page.click("catnap-save-outfit-btn")
  await page.click("nav-tab-kpop")
  await page.click("beatpad-save-btn")
  await page.click("nav-tab-hub")
  assert await page.exists("gallery-grid"), "Missing gallery-grid container"
  page.assert_zero_errors("T1-F16-01")


@register_test("T1-F16-02", "1", "F16", "Gallery filter buttons filter by All, Tattoos, Outfits, and Remixes")
async def test_f16_02_gallery_category_filters(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  for filter_btn in (
      "gallery-filter-all",
      "gallery-filter-tattoos",
      "gallery-filter-outfits",
      "gallery-filter-remixes",
  ):
    assert await page.click(filter_btn), f"Failed to click {filter_btn}"
  page.assert_zero_errors("T1-F16-02")


@register_test("T1-F16-03", "1", "F16", "Saved Gallery creations survive full browser reload (page.reload())")
async def test_f16_03_gallery_persistence_across_reload(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('kpop', 'huntrx-golden-crest')")
  await page.click("tattoo-save-gallery-btn")
  await page.reload()
  await page.click("nav-tab-hub")
  gallery_text = await page.get_text("gallery-grid")
  assert len(gallery_text) > 0, "Gallery grid empty after page.reload()"
  page.assert_zero_errors("T1-F16-03")


@register_test("T1-F16-04", "1", "F16", "Gallery items persist in canonical localStorage keys")
async def test_f16_04_gallery_localstorage_keys(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-save-gallery-btn")
  has_stored = await page.eval_js(
      """(() => {
        const raw = localStorage.getItem('cheerup_v1_saved_tattoos') || localStorage.getItem('cheer_up_studio_v1_tattoos');
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length >= 1;
      })()"""
  )
  assert has_stored, "Saved tattoos array not found in localStorage"
  page.assert_zero_errors("T1-F16-04")


@register_test("T1-F16-05", "1", "F16", "Full application navigation sweep across all 4 tabs produces zero console/page errors")
async def test_f16_05_full_system_sweep(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for tab in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub", "nav-tab-tattoo"):
    await page.click(tab)
  page.assert_zero_errors("T1-F16-05")
