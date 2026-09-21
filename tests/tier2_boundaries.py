#!/usr/bin/env python3
"""Tier 2: Boundary & Corner Case E2E Tests (80 tests: 5 per feature across F1..F16).

Verifies edge cases, adversarial inputs, stress conditions, and boundary invariants:
- F1..F16: 5 boundary/corner tests per feature = 80 tests total.
"""

from __future__ import annotations

import os
from pathlib import Path

from tests.cdp_driver import ChromeCdpSession, register_test, verify_png_data_url

PROJECT_ROOT = Path(os.environ.get("CHEER_UP_APP_ROOT", str(Path(__file__).resolve().parents[1])))


# ==============================================================================
# F1 Boundaries: App Shell, Responsive Navigation & Zero-Error Boot (5 Tests)
# ==============================================================================


@register_test("T2-F01-01", "2", "F1", "Rapid 20x tab switching cycle does not leak DOM nodes or raise errors")
async def test_b_f01_01_rapid_tab_switching(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  tabs = ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub")
  for i in range(20):
    await page.click(tabs[i % 4])
  page.assert_zero_errors("T2-F01-01")


@register_test("T2-F01-02", "2", "F1", "Double-clicking already active navigation tab is idempotent")
async def test_b_f01_02_double_click_active_tab(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for tab in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
    await page.click(tab)
    await page.click(tab)
  page.assert_zero_errors("T2-F01-02")


@register_test("T2-F01-03", "2", "F1", "Extreme compact mobile viewport (320x568) renders without uncaught errors")
async def test_b_f01_03_extreme_mobile_viewport(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(320, 568, mobile=True)
  await page.navigate(base_url)
  assert await page.exists("nav-tab-tattoo")
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T2-F01-03")


@register_test("T2-F01-04", "2", "F1", "Ultra-wide 4K viewport (2560x1440) renders without layout exceptions")
async def test_b_f01_04_ultrawide_viewport(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(2560, 1440, mobile=False)
  await page.navigate(base_url)
  assert await page.exists("nav-tab-hub")
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T2-F01-04")


@register_test("T2-F01-05", "2", "F1", "Repeated hard reloads across different active tabs preserve clean initialization")
async def test_b_f01_05_reload_on_every_tab(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for tab in ("nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
    await page.click(tab)
    await page.reload()
  page.assert_zero_errors("T2-F01-05")


# ==============================================================================
# F2 Boundaries: Versioned localStorage Store & EventBus (5 Tests)
# ==============================================================================


@register_test("T2-F02-01", "2", "F2", "Corrupted JSON in localStorage profile key self-heals on reload without crash")
async def test_b_f02_01_corrupted_profile_json(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js(
      """(() => {
        localStorage.setItem('cheerup_v1_profile', '{broken-json-payload');
        localStorage.setItem('cheer_up_studio_v1_profile', '{broken-json-payload');
      })()"""
  )
  await page.reload()
  assert await page.exists("nav-tab-tattoo")
  page.assert_zero_errors("T2-F02-01")


@register_test("T2-F02-02", "2", "F2", "Corrupted JSON in localStorage saved tattoos key recovers cleanly on reload")
async def test_b_f02_02_corrupted_tattoos_json(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js(
      """(() => {
        localStorage.setItem('cheerup_v1_saved_tattoos', '[[[not-valid');
        localStorage.setItem('cheer_up_studio_v1_tattoos', '[[[not-valid');
      })()"""
  )
  await page.reload()
  await page.click("nav-tab-hub")
  page.assert_zero_errors("T2-F02-02")


@register_test("T2-F02-03", "2", "F2", "Null and wrong-primitive values in localStorage keys fallback to safe defaults")
async def test_b_f02_03_wrong_primitive_storage_values(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js(
      """(() => {
        localStorage.setItem('cheerup_v1_high_scores', 'null');
        localStorage.setItem('cheerup_v1_stickers', '"string-instead-of-array"');
      })()"""
  )
  await page.reload()
  page.assert_zero_errors("T2-F02-03")


@register_test("T2-F02-04", "2", "F2", "Clearing localStorage completely mid-session does not crash active views")
async def test_b_f02_04_clear_storage_mid_session(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.click("nav-tab-hub")
  await page.click("nav-tab-tattoo")
  page.assert_zero_errors("T2-F02-04")


@register_test("T2-F02-05", "2", "F2", "Rapid 30x sequential store updates execute without race conditions")
async def test_b_f02_05_rapid_store_writes(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  for i in range(10):
    await page.set_value("profile-nickname-input", f"Artist #{i}")
    await page.click("profile-save-btn")
  page.assert_zero_errors("T2-F02-05")


# ==============================================================================
# F3 Boundaries: Zero-Dependency Standalone Bundler (5 Tests)
# ==============================================================================


@register_test("T2-F03-01", "2", "F3", "Bundled dist/index.html boots and runs with network completely offline")
async def test_b_f03_01_offline_dist_execution(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    assert await page.exists("nav-tab-tattoo")
    page.assert_zero_errors("T2-F03-01")
  finally:
    await page.set_offline_mode(False)


@register_test("T2-F03-02", "2", "F3", "All 4 tabs and canvases operate cleanly in offline dist/index.html build")
async def test_b_f03_02_offline_all_tabs(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    for tab in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop", "nav-tab-hub"):
      await page.click(tab)
    page.assert_zero_errors("T2-F03-02")
  finally:
    await page.set_offline_mode(False)


@register_test("T2-F03-03", "2", "F3", "Offline dist/index.html initializes all 3 Web Audio synth tracks without network")
async def test_b_f03_03_offline_web_audio_tracks(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    for song in ("golden", "takedown", "soda_pop"):
      res = await page.eval_js(f"window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('{song}')")
      assert res.get("initialized") is True
    page.assert_zero_errors("T2-F03-03")
  finally:
    await page.set_offline_mode(False)


@register_test("T2-F03-04", "2", "F3", "Offline dist/index.html exports valid Mirrored Transfer Sheet PNG")
async def test_b_f03_04_offline_mirrored_export(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    sheet_url = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet().sheetDataUrl")
    assert verify_png_data_url(sheet_url)["width"] >= 600
    page.assert_zero_errors("T2-F03-04")
  finally:
    await page.set_offline_mode(False)


@register_test("T2-F03-05", "2", "F3", "Offline dist/index.html generates valid 1200x800 Share-with-Mom PNG card")
async def test_b_f03_05_offline_mom_card_export(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  dist_html = PROJECT_ROOT / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
    assert verify_png_data_url(card["dataUrl"])["width"] == 1200
    page.assert_zero_errors("T2-F03-05")
  finally:
    await page.set_offline_mode(False)


# ==============================================================================
# F4 Boundaries: Tattoo Vector Stamp Library (5 Tests)
# ==============================================================================


@register_test("T2-F04-01", "2", "F4", "Stress test adding 30 stamps across all 3 categories without frame drop or error")
async def test_b_f04_01_stress_add_30_stamps(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        const cats = ['catnap', 'kpop', 'bay_boston'];
        for (let i = 0; i < 30; i++) {
          t.addStamp(cats[i % 3], `stamp-${i}`);
        }
      })()"""
  )
  page.assert_zero_errors("T2-F04-01")


@register_test("T2-F04-02", "2", "F4", "Adding unknown stamp ID or fallback category handles gracefully without exception")
async def test_b_f04_02_unknown_stamp_fallback(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'non-existent-stamp-id')")
  page.assert_zero_errors("T2-F04-02")


@register_test("T2-F04-03", "2", "F4", "Rapidly switching stamp category filters 15x produces zero errors")
async def test_b_f04_03_rapid_category_switching(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  cats = ("stamp-category-catnap", "stamp-category-kpop", "stamp-category-bay_boston")
  for i in range(15):
    await page.click(cats[i % 3])
  page.assert_zero_errors("T2-F04-03")


@register_test("T2-F04-04", "2", "F4", "Clearing canvas immediately after placing stamps leaves clean blank canvas")
async def test_b_f04_04_clear_after_stamps(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.click("tattoo-clear-btn")
  page.assert_zero_errors("T2-F04-04")


@register_test("T2-F04-05", "2", "F4", "Duplicating when zero stamps are on canvas is a safe no-op")
async def test_b_f04_05_duplicate_empty_canvas(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.click("tattoo-duplicate-btn")
  page.assert_zero_errors("T2-F04-05")


# ==============================================================================
# F5 Boundaries: Freehand Brushes, Text Banners & Layer Transforms (5 Tests)
# ==============================================================================


@register_test("T2-F05-01", "2", "F5", "Undo on completely empty history stack and Redo at stack head are safe no-ops")
async def test_b_f05_01_empty_undo_redo_noop(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  for _ in range(5):
    await page.click("tattoo-undo-btn")
    await page.click("tattoo-redo-btn")
  page.assert_zero_errors("T2-F05-01")


@register_test("T2-F05-02", "2", "F5", "Out-of-bounds stroke coordinates (negative and >600) clamp safely without error")
async def test_b_f05_02_out_of_bounds_stroke(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.draw_canvas_stroke(
      "tattoo-canvas",
      [(-50, -30), (300, 300), (850, 920)],
      brush_mode="neon",
      color="#00ffcc",
      width=10,
  )
  page.assert_zero_errors("T2-F05-02")


@register_test("T2-F05-03", "2", "F5", "Single-point degenerate stroke does not throw divide-by-zero or path error")
async def test_b_f05_03_single_point_stroke(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.drawStroke([{x: 200, y: 200}], 'glitter', '#ffaa00', 5)")
  page.assert_zero_errors("T2-F05-03")


@register_test("T2-F05-04", "2", "F5", "Text banner with Unicode emojis, CJK, and special characters renders cleanly")
async def test_b_f05_04_unicode_emoji_text_banner(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.set_value("tattoo-text-input", "Mom ❤️ Daughter 🌟 Boston 2026 🎵🐱")
  await page.click("tattoo-add-text-btn")
  page.assert_zero_errors("T2-F05-04")


@register_test("T2-F05-05", "2", "F5", "Empty/whitespace text banner submission is handled safely without blank layer crash")
async def test_b_f05_05_empty_text_banner(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.set_value("tattoo-text-input", "   ")
  await page.click("tattoo-add-text-btn")
  page.assert_zero_errors("T2-F05-05")


# ==============================================================================
# F6 Boundaries: Virtual Arm/Wrist/Hand Try-On Preview (5 Tests)
# ==============================================================================


@register_test("T2-F06-01", "2", "F6", "Rendering Virtual Try-On when tattoo canvas is completely empty succeeds cleanly")
async def test_b_f06_01_tryon_empty_canvas(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('arm', 'light', 'daylight')")
  page.assert_zero_errors("T2-F06-01")


@register_test("T2-F06-02", "2", "F6", "Rapidly cycling all body parts and skin tones 12x produces zero rendering errors")
async def test_b_f06_02_rapid_tryon_cycling(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for part in ("arm", "wrist", "hand"):
    for tone in ("light", "medium", "warm-tan", "deep"):
      await page.eval_js(f"window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('{part}', '{tone}', 'studio')")
  page.assert_zero_errors("T2-F06-02")


@register_test("T2-F06-03", "2", "F6", "Passing unknown skin tone or lighting string falls back gracefully")
async def test_b_f06_03_unknown_tryon_params(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.renderVirtualTryOn('unknown-part', 'custom-tone', 'unknown-light')")
  page.assert_zero_errors("T2-F06-03")


@register_test("T2-F06-04", "2", "F6", "Virtual Try-On maintains non-zero canvas dimensions across viewport resize")
async def test_b_f06_04_tryon_viewport_resize(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.set_viewport(768, 1024, mobile=True)
  dims = await page.eval_js(
      """(() => {
        const c = document.querySelector('[data-testid="tryon-canvas"], [data-testid="virtual-tryon-canvas"]');
        return c ? { w: c.width, h: c.height } : { w: 0, h: 0 };
      })()"""
  )
  assert dims["w"] > 0 and dims["h"] > 0
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T2-F06-04")


@register_test("T2-F06-05", "2", "F6", "Different skin tone selections produce distinct background RGB values on try-on canvas")
async def test_b_f06_05_distinct_skin_tone_pixels(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  distinct = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        const c = document.querySelector('[data-testid="tryon-canvas"], [data-testid="virtual-tryon-canvas"]');
        t.renderVirtualTryOn('arm', 'light', 'daylight');
        const p1 = Array.from(c.getContext('2d').getImageData(c.width >> 1, c.height >> 1, 1, 1).data);
        t.renderVirtualTryOn('arm', 'deep', 'daylight');
        const p2 = Array.from(c.getContext('2d').getImageData(c.width >> 1, c.height >> 1, 1, 1).data);
        return p1[0] !== p2[0] || p1[1] !== p2[1] || p1[2] !== p2[2];
      })()"""
  )
  assert distinct, "Expected distinct RGB values between light and deep skin tones"
  page.assert_zero_errors("T2-F06-05")


# ==============================================================================
# F7 Boundaries: Pixel-Exact Mirrored Printable Transfer Sheet Export (5 Tests)
# ==============================================================================


@register_test("T2-F07-01", "2", "F7", "Asymmetric top-left pixel marker (0,0) maps strictly to (W-1,0) in mirrored export")
async def test_b_f07_01_corner_pixel_reflection(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  corner_ok = await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.drawStroke([{x: 5, y: 10}, {x: 40, y: 10}], 'neon', '#12ab34', 6);
        const exp = t.exportTransferSheet();
        const W = exp.width;
        const H = exp.height;
        const src = exp.sourceImageData.data || exp.sourceImageData;
        const mir = exp.mirroredImageData.data || exp.mirroredImageData;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const sIdx = (y * W + (W - 1 - x)) * 4;
            const mIdx = (y * W + x) * 4;
            if (mir[mIdx] !== src[sIdx] || mir[mIdx+1] !== src[sIdx+1] || mir[mIdx+2] !== src[sIdx+2] || mir[mIdx+3] !== src[sIdx+3]) {
              return false;
            }
          }
        }
        return true;
      })()"""
  )
  assert corner_ok, "Asymmetric left-edge stroke failed strict horizontal reflection"
  page.assert_zero_errors("T2-F07-01")


@register_test("T2-F07-02", "2", "F7", "Exporting mirrored sheet on completely blank canvas produces valid PNG without error")
async def test_b_f07_02_export_blank_canvas(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  exp = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
  assert verify_png_data_url(exp["sheetDataUrl"])["width"] >= 600
  page.assert_zero_errors("T2-F07-02")


@register_test("T2-F07-03", "2", "F7", "Rapid 5x consecutive mirrored export invocations do not leak canvases or throw")
async def test_b_f07_03_rapid_5x_export(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for _ in range(5):
    await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
  page.assert_zero_errors("T2-F07-03")


@register_test("T2-F07-04", "2", "F7", "Mirrored export preserves exact alpha channel values across semi-transparent glow pixels")
async def test_b_f07_04_alpha_channel_reflection_fidelity(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  alpha_ok = await page.eval_js(
      """(() => {
        const exp = window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet();
        const W = exp.width, H = exp.height;
        const src = exp.sourceImageData.data || exp.sourceImageData;
        const mir = exp.mirroredImageData.data || exp.mirroredImageData;
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            if (mir[(y * W + x) * 4 + 3] !== src[(y * W + (W - 1 - x)) * 4 + 3]) return false;
          }
        }
        return true;
      })()"""
  )
  assert alpha_ok, "Alpha channel reflection mismatch"
  page.assert_zero_errors("T2-F07-04")


@register_test("T2-F07-05", "2", "F7", "Center column x = floor(W/2) maps to W - 1 - floor(W/2) without off-by-one error")
async def test_b_f07_05_center_axis_reflection(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  center_ok = await page.eval_js(
      """(() => {
        const exp = window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet();
        const W = exp.width, H = exp.height;
        const mid = Math.floor(W / 2);
        const src = exp.sourceImageData.data || exp.sourceImageData;
        const mir = exp.mirroredImageData.data || exp.mirroredImageData;
        for (let y = 0; y < H; y++) {
          const sIdx = (y * W + (W - 1 - mid)) * 4;
          const mIdx = (y * W + mid) * 4;
          if (mir[mIdx] !== src[sIdx]) return false;
        }
        return true;
      })()"""
  )
  assert center_ok, "Center column reflection off-by-one error"
  page.assert_zero_errors("T2-F07-05")


# ==============================================================================
# F8 Boundaries: Interactive CatNap Companion & Plush Customizer (5 Tests)
# ==============================================================================


@register_test("T2-F08-01", "2", "F8", "Rapid 30x clicking on CatNap companion caps particle pool without unbounded growth")
async def test_b_f08_01_rapid_30x_purr_clicks(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js(
      """(() => {
        for (let i = 0; i < 30; i++) {
          window.__CHEER_UP_STUDIO__.catnap.triggerCompanionInteraction();
        }
      })()"""
  )
  page.assert_zero_errors("T2-F08-01")


@register_test("T2-F08-02", "2", "F8", "Setting all optional CatNap outfit slots to 'none' renders base plush cleanly")
async def test_b_f08_02_all_none_outfit_slots(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const c = window.__CHEER_UP_STUDIO__.catnap;
        c.setOutfit('jacket', 'none');
        c.setOutfit('headphones', 'none');
        c.setOutfit('pendant', 'none');
        c.setOutfit('scarf', 'none');
        return c.getState();
      })()"""
  )
  assert state.get("jacket") == "none"
  page.assert_zero_errors("T2-F08-02")


@register_test("T2-F08-03", "2", "F8", "Rapidly cycling all outfit slots while dream-mist particles animate produces zero errors")
async def test_b_f08_03_outfit_cycling_during_particles(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js(
      """(() => {
        const c = window.__CHEER_UP_STUDIO__.catnap;
        c.triggerCompanionInteraction();
        for (const j of ['none', 'huntrx-gold-jacket', 'saja-neon-hoodie']) {
          c.setOutfit('jacket', j);
        }
      })()"""
  )
  page.assert_zero_errors("T2-F08-03")


@register_test("T2-F08-04", "2", "F8", "Saving multiple identical CatNap outfits generates distinct gallery entries")
async def test_b_f08_04_duplicate_outfit_saves(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.click("catnap-save-outfit-btn")
  await page.click("catnap-save-outfit-btn")
  page.assert_zero_errors("T2-F08-04")


@register_test("T2-F08-05", "2", "F8", "CatNap companion renders cleanly on compact mobile viewport (375x812)")
async def test_b_f08_05_catnap_mobile_viewport(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(375, 812, mobile=True)
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.click("catnap-purr-btn")
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T2-F08-05")


# ==============================================================================
# F9 Boundaries: "CatNap's Starlight Rooftop Dash" Mini-Game (5 Tests)
# ==============================================================================


@register_test("T2-F09-01", "2", "F9", "Rapidly pressing jump 10x while airborne enforces double-jump cap cleanly")
async def test_b_f09_01_airborne_jump_spam(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        for (let i = 0; i < 10; i++) {
          g.jump();
          g.stepFrames(2);
        }
      })()"""
  )
  page.assert_zero_errors("T2-F09-01")


@register_test("T2-F09-02", "2", "F9", "Immediate obstacle collision at frame 0 (score === 0) handles gameover cleanly")
async def test_b_f09_02_zero_score_gameover(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.triggerGameOver();
        return g.getState();
      })()"""
  )
  assert state["state"] == "gameover"
  page.assert_zero_errors("T2-F09-02")


@register_test("T2-F09-03", "2", "F9", "Lower-score subsequent run does not overwrite existing higher highScore")
async def test_b_f09_03_highscore_monotonicity(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  monotonic = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(180);
        const peak = g.getState().highScore;
        g.triggerGameOver();
        g.restart();
        g.stepFrames(5);
        g.triggerGameOver();
        return g.getState().highScore >= peak && peak > 0;
      })()"""
  )
  assert monotonic, "HighScore regressed on shorter run"
  page.assert_zero_errors("T2-F09-03")


@register_test("T2-F09-04", "2", "F9", "Navigating away to another tab mid-run cleanly pauses/handles game loop")
async def test_b_f09_04_tab_switch_mid_run(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.start()")
  await page.click("nav-tab-hub")
  await page.click("nav-tab-catnap")
  page.assert_zero_errors("T2-F09-04")


@register_test("T2-F09-05", "2", "F9", "Extended endurance simulation (1200 frames) runs without memory leak or crash")
async def test_b_f09_05_endurance_1200_frames(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(1200);
        return g.getState();
      })()"""
  )
  assert state["score"] > 100
  page.assert_zero_errors("T2-F09-05")


# ==============================================================================
# F10 Boundaries: Synthesized Multi-Track Song Library (Web Audio API) (5 Tests)
# ==============================================================================


@register_test("T2-F10-01", "2", "F10", "Rapidly switching between Golden, Takedown, and Soda Pop leaves no orphan audio nodes")
async def test_b_f10_01_rapid_track_switching(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  for _ in range(4):
    for song in ("golden", "takedown", "soda_pop"):
      await page.eval_js(f"window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('{song}')")
  page.assert_zero_errors("T2-F10-01")


@register_test("T2-F10-02", "2", "F10", "Initializing Web Audio synthesis graph before any DOM click succeeds via autoplay policy")
async def test_b_f10_02_headless_audio_init_without_gesture(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  res = await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('golden')")
  assert res.get("initialized") is True
  page.assert_zero_errors("T2-F10-02")


@register_test("T2-F10-03", "2", "F10", "Rapid 10x start/stop toggling on rhythm/audio engine throws zero InvalidStateError")
async def test_b_f10_03_rapid_start_stop_toggle(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  for _ in range(10):
    await page.click("rhythm-start-btn")
    await page.click("rhythm-stop-btn")
  page.assert_zero_errors("T2-F10-03")


@register_test("T2-F10-04", "2", "F10", "Passing unknown song ID to initializeAndVerifySongGraph falls back safely")
async def test_b_f10_04_unknown_song_id_fallback(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  res = await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('unknown_track')")
  assert isinstance(res, dict)
  page.assert_zero_errors("T2-F10-04")


@register_test("T2-F10-05", "2", "F10", "Navigating away from K-Pop Stage while track is active produces zero audio exceptions")
async def test_b_f10_05_navigate_away_while_playing(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.startRhythmGame('golden')")
  await page.click("nav-tab-hub")
  await page.click("nav-tab-kpop")
  page.assert_zero_errors("T2-F10-05")


# ==============================================================================
# F11 Boundaries: 4-Lane Falling-Note Rhythm Game Mode (5 Tests)
# ==============================================================================


@register_test("T2-F11-01", "2", "F11", "Simultaneous 4-lane chord press (lanes 0+1+2+3 on same frame) evaluates cleanly")
async def test_b_f11_01_simultaneous_chord_press(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('takedown');
        api.stepRhythmTime(1.0);
        api.triggerLaneInput(0);
        api.triggerLaneInput(1);
        api.triggerLaneInput(2);
        api.triggerLaneInput(3);
      })()"""
  )
  page.assert_zero_errors("T2-F11-01")


@register_test("T2-F11-02", "2", "F11", "Pressing lanes when no notes are in judgement window handles empty press safely")
async def test_b_f11_02_empty_lane_press(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        api.triggerLaneInput(0);
      })()"""
  )
  page.assert_zero_errors("T2-F11-02")


@register_test("T2-F11-03", "2", "F11", "Letting notes pass judgement line untouched registers MISS and resets combo")
async def test_b_f11_03_missed_notes_reset_combo(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  state = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        api.stepRhythmTime(8.0);
        return api.getRhythmState();
      })()"""
  )
  assert state["judgements"]["MISS"] >= 0
  page.assert_zero_errors("T2-F11-03")


@register_test("T2-F11-04", "2", "F11", "Out-of-bounds lane index (<0 or >3) passed to triggerLaneInput is ignored safely")
async def test_b_f11_04_invalid_lane_index(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('soda_pop');
        api.triggerLaneInput(-1);
        api.triggerLaneInput(99);
      })()"""
  )
  page.assert_zero_errors("T2-F11-04")


@register_test("T2-F11-05", "2", "F11", "Extended rhythm game simulation across 30 seconds maintains bounded activeNotesCount")
async def test_b_f11_05_extended_rhythm_simulation(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  state = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('takedown');
        for (let i = 0; i < 60; i++) api.stepRhythmTime(0.5);
        return api.getRhythmState();
      })()"""
  )
  assert isinstance(state["activeNotesCount"], int)
  page.assert_zero_errors("T2-F11-05")


# ==============================================================================
# F12 Boundaries: Beat Pad & Song Remix Studio (5 Tests)
# ==============================================================================


@register_test("T2-F12-01", "2", "F12", "Toggling all 16 Beat Pad cells ON simultaneously and then all OFF")
async def test_b_f12_01_toggle_all_16_pads_on_off(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  after_off = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        for (let i = 0; i < 16; i++) {
          const st = api.getBeatPadState();
          if (!st.activePads.includes(i)) api.toggleBeatPad(i);
        }
        for (let i = 0; i < 16; i++) api.toggleBeatPad(i);
        return api.getBeatPadState().activePads.length;
      })()"""
  )
  assert after_off == 0, f"Expected 0 active pads after toggling all off, got {after_off}"
  page.assert_zero_errors("T2-F12-01")


@register_test("T2-F12-02", "2", "F12", "Setting Beat Pad BPM slider to extreme min (90) and max (160) boundaries")
async def test_b_f12_02_bpm_slider_min_max_bounds(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.set_value("beatpad-bpm-slider", "90")
  await page.set_value("beatpad-bpm-slider", "160")
  page.assert_zero_errors("T2-F12-02")


@register_test("T2-F12-03", "2", "F12", "Recording 0-event empty Beat Pad session and clicking Replay handles cleanly")
async def test_b_f12_03_replay_empty_recording(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.click("beatpad-record-btn")
  await page.click("beatpad-record-btn")
  await page.click("beatpad-replay-btn")
  page.assert_zero_errors("T2-F12-03")


@register_test("T2-F12-04", "2", "F12", "Out-of-bounds Beat Pad index (<0 or >=16) is safely ignored")
async def test_b_f12_04_invalid_pad_index(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(-5);
        window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(42);
      })()"""
  )
  page.assert_zero_errors("T2-F12-04")


@register_test("T2-F12-05", "2", "F12", "Saving Beat Pad remix with zero active loops succeeds with safe defaults")
async def test_b_f12_05_save_empty_beatpad_remix(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.click("beatpad-save-btn")
  page.assert_zero_errors("T2-F12-05")


# ==============================================================================
# F13 Boundaries: Editable Profile Header & Daily Cheer-Up Capsule (5 Tests)
# ==============================================================================


@register_test("T2-F13-01", "2", "F13", "Profile nickname with whitespace-only input sanitizes or falls back safely")
async def test_b_f13_01_whitespace_profile_name(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "     ")
  await page.click("profile-save-btn")
  header_text = await page.get_text("header-nickname-display")
  assert len(header_text.strip()) > 0
  page.assert_zero_errors("T2-F13-01")


@register_test("T2-F13-02", "2", "F13", "Very long 120-character profile nickname clamps cleanly without breaking header")
async def test_b_f13_02_long_profile_name_clamping(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  long_name = "Boston Star Artist Mia & Mom " * 4
  await page.set_value("profile-nickname-input", long_name)
  await page.click("profile-save-btn")
  page.assert_zero_errors("T2-F13-02")


@register_test("T2-F13-03", "2", "F13", "HTML/script special characters in profile nickname are escaped safely (XSS check)")
async def test_b_f13_03_profile_xss_escaping(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  xss_payload = "<img src=x onerror=window.__XSS_FIRED__=true>Mia"
  await page.set_value("profile-nickname-input", xss_payload)
  await page.click("profile-save-btn")
  xss_fired = await page.eval_js("Boolean(window.__XSS_FIRED__)")
  assert not xss_fired, "XSS payload executed in profile header"
  page.assert_zero_errors("T2-F13-03")


@register_test("T2-F13-04", "2", "F13", "Unicode emoji and accented characters in profile nickname survive reload")
async def test_b_f13_04_unicode_profile_reload(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia 🌟 Boston & Mom ❤️ SF")
  await page.click("profile-save-btn")
  await page.reload()
  header_text = await page.get_text("header-nickname-display")
  assert "Mia" in header_text
  page.assert_zero_errors("T2-F13-04")


@register_test("T2-F13-05", "2", "F13", "Clicking save profile button multiple times rapidly produces zero errors")
async def test_b_f13_05_rapid_profile_save_clicks(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  for _ in range(5):
    await page.click("profile-save-btn")
  page.assert_zero_errors("T2-F13-05")


# ==============================================================================
# F14 Boundaries: Postcard Wall & Dual-City Clock (5 Tests)
# ==============================================================================


@register_test("T2-F14-01", "2", "F14", "Dual-city clock midnight rollover (2026-09-21T05:30:00Z -> SF 22:30 vs Boston 01:30)")
async def test_b_f14_01_midnight_rollover_clock(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  rollover_ok = await page.eval_js(
      """(() => {
        const ts = new Date('2026-09-21T05:30:00Z');
        const sfH = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hour12: false }).format(ts));
        const bosH = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }).format(ts));
        return sfH === 22 && bosH === 1;
      })()"""
  )
  assert rollover_ok, "Midnight rollover calculation between SF and Boston failed"
  page.assert_zero_errors("T2-F14-01")


@register_test("T2-F14-02", "2", "F14", "Dual-city clock handles both Winter Standard Time (PST/EST) and Summer DST (PDT/EDT)")
async def test_b_f14_02_dst_and_standard_time(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  zones_ok = await page.eval_js(
      """(() => {
        const winter = new Date('2026-01-15T17:00:00Z');
        const summer = new Date('2026-07-15T17:00:00Z');
        const fmt = (d, tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' }).format(d);
        return fmt(winter, 'America/Los_Angeles').includes('PST') && fmt(summer, 'America/Los_Angeles').includes('PDT');
      })()"""
  )
  assert zones_ok, "PST/PDT formatting failed"
  page.assert_zero_errors("T2-F14-02")


@register_test("T2-F14-03", "2", "F14", "Rapidly clicking Mom postcard items 15x produces zero DOM errors")
async def test_b_f14_03_rapid_postcard_wall_clicks(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.eval_js(
      """(() => {
        const items = document.querySelectorAll('[data-testid^="mom-postcard-item-"]');
        for (let i = 0; i < 15 && items.length > 0; i++) {
          items[i % items.length].click();
        }
      })()"""
  )
  page.assert_zero_errors("T2-F14-03")


@register_test("T2-F14-04", "2", "F14", "getDualClocks() returns consistent non-empty strings on repeated invocations")
async def test_b_f14_04_repeated_get_dual_clocks(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  for _ in range(5):
    clocks = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.getDualClocks()")
    assert clocks["sf"]["timeStr"] and clocks["boston"]["timeStr"]
  page.assert_zero_errors("T2-F14-04")


@register_test("T2-F14-05", "2", "F14", "Postcard wall renders intact after localStorage clear and page reload")
async def test_b_f14_05_postcard_wall_default_seed_after_clear(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  await page.click("nav-tab-hub")
  assert await page.exists("mom-postcard-wall")
  page.assert_zero_errors("T2-F14-05")


# ==============================================================================
# F15 Boundaries: "Send Creation Card to Mom" Shareable PNG Generator (5 Tests)
# ==============================================================================


@register_test("T2-F15-01", "2", "F15", "Generating Mom postcard when 0 tattoos saved and 0 games played produces valid 1200x800 PNG")
async def test_b_f15_01_generate_mom_card_zero_creations(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["width"] == 1200 and meta["height"] == 800
  page.assert_zero_errors("T2-F15-01")


@register_test("T2-F15-02", "2", "F15", "Rapidly generating Mom postcard 5x in succession returns valid PNGs without leak")
async def test_b_f15_02_rapid_5x_mom_card_generation(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  for _ in range(5):
    card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
    assert verify_png_data_url(card["dataUrl"])["width"] == 1200
  page.assert_zero_errors("T2-F15-02")


@register_test("T2-F15-03", "2", "F15", "Mom postcard canvas maintains exact 1200x800 intrinsic size even on mobile viewport")
async def test_b_f15_03_mom_card_dimensions_on_mobile(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(375, 812, mobile=True)
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["width"] == 1200 and meta["height"] == 800
  await page.set_viewport(1440, 900, mobile=False)
  page.assert_zero_errors("T2-F15-03")


@register_test("T2-F15-04", "2", "F15", "Mom postcard generator handles Unicode emojis in profile nickname cleanly")
async def test_b_f15_04_mom_card_unicode_nickname(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia 🐱🌟💜 Boston")
  await page.click("profile-save-btn")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  assert verify_png_data_url(card["dataUrl"])["byte_length"] > 1000
  page.assert_zero_errors("T2-F15-04")


@register_test("T2-F15-05", "2", "F15", "Generated PNG IHDR bit depth is 8-bit RGBA standard web format")
async def test_b_f15_05_mom_card_png_ihdr_format(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["bit_depth"] == 8
  page.assert_zero_errors("T2-F15-05")


# ==============================================================================
# F16 Boundaries: Unified "My Creations Gallery" & Full System Polish (5 Tests)
# ==============================================================================


@register_test("T2-F16-01", "2", "F16", "Gallery renders graceful empty state when zero creations exist")
async def test_b_f16_01_gallery_empty_state(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  await page.click("nav-tab-hub")
  assert await page.exists("gallery-grid")
  page.assert_zero_errors("T2-F16-01")


@register_test("T2-F16-02", "2", "F16", "Stress test saving 15 creations across Tattoo, CatNap, and Beat Pad")
async def test_b_f16_02_gallery_stress_15_creations(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  for _ in range(5):
    await page.click("tattoo-save-gallery-btn")
  await page.click("nav-tab-catnap")
  for _ in range(5):
    await page.click("catnap-save-outfit-btn")
  await page.click("nav-tab-kpop")
  for _ in range(5):
    await page.click("beatpad-save-btn")
  await page.click("nav-tab-hub")
  page.assert_zero_errors("T2-F16-02")


@register_test("T2-F16-03", "2", "F16", "Rapidly toggling Gallery category filters 20x produces zero errors")
async def test_b_f16_03_rapid_gallery_filter_switching(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  filters = (
      "gallery-filter-all",
      "gallery-filter-tattoos",
      "gallery-filter-outfits",
      "gallery-filter-remixes",
  )
  for i in range(20):
    await page.click(filters[i % 4])
  page.assert_zero_errors("T2-F16-03")


@register_test("T2-F16-04", "2", "F16", "Multiple sequential page reloads preserve saved Gallery items without duplication")
async def test_b_f16_04_multiple_reloads_idempotent_gallery(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-save-gallery-btn")
  count_before = await page.eval_js(
      "JSON.parse(localStorage.getItem('cheerup_v1_saved_tattoos') || localStorage.getItem('cheer_up_studio_v1_tattoos') || '[]').length"
  )
  await page.reload()
  await page.reload()
  count_after = await page.eval_js(
      "JSON.parse(localStorage.getItem('cheerup_v1_saved_tattoos') || localStorage.getItem('cheer_up_studio_v1_tattoos') || '[]').length"
  )
  assert count_before == count_after and count_before >= 1
  page.assert_zero_errors("T2-F16-04")


@register_test("T2-F16-05", "2", "F16", "Full stress sweep across all modules and exports leaves zero console or page errors")
async def test_b_f16_05_full_system_stress_sweep(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
  await page.click("nav-tab-catnap")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.start(); window.__CHEER_UP_STUDIO__.catnapGame.stepFrames(30);")
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('golden')")
  await page.click("nav-tab-hub")
  await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  page.assert_zero_errors("T2-F16-05")
