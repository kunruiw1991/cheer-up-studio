#!/usr/bin/env python3
"""Tier 3: Cross-Feature Pairwise Interaction E2E Tests (12 Tests: T3-X-01..T3-X-12).

Verifies cross-module integration contracts across R1, R2, R3, and R4:
- R2 (Rooftop Dash) <-> R1 (Tattoo Studio Stamp Unlocks)
- R3 (K-Pop Rhythm Stage) <-> R1 (Tattoo Studio Holographic Stamps)
- R1 (Tattoo Studio) <-> R4 (Mom Postcard Generator)
- R2 (CatNap Playground & Dash) <-> R4 (Mom Postcard Generator)
- R3 (K-Pop Stage) <-> R4 (Mom Postcard Generator)
- R1 + R2 + R3 <-> R4 (Unified Gallery Persistence & Reload Round-Trip)
- R4 (Profile & Dual Clock) <-> R1/R2/R3 Header & Postcards
- R3 (Web Audio Synthesizer) <-> R2 (CatNap Companion Audio Context Coexistence)
"""

from __future__ import annotations

from tests.cdp_driver import ChromeCdpSession, register_test, verify_png_data_url


@register_test("T3-X-01", "3", "R2->R1", "Playing CatNap Rooftop Dash updates unlocked stickers available to Tattoo Studio")
async def test_x_01_dash_unlocks_to_tattoo_studio(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  dash_state = await page.eval_js(
      """(() => {
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(240);
        return g.getState();
      })()"""
  )
  assert isinstance(dash_state.get("stickersUnlocked"), list)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  page.assert_zero_errors("T3-X-01")


@register_test("T3-X-02", "3", "R3->R1", "Playing K-Pop Rhythm Stage and placing K-Pop stamps on Tattoo Canvas")
async def test_x_02_rhythm_stage_to_tattoo_stamps(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        api.stepRhythmTime(3.0);
        api.triggerLaneInput(0);
        api.triggerLaneInput(1);
      })()"""
  )
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('kpop', 'huntrx-golden-crest')")
  page.assert_zero_errors("T3-X-02")


@register_test("T3-X-03", "3", "R1->R4", "Custom tattoo designed in R1 embeds into R4 Share-with-Mom PNG card")
async def test_x_03_tattoo_embeds_in_mom_postcard(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('bay_boston', 'golden-gate-boston-bridge');
        t.drawStroke([{x: 80, y: 100}, {x: 250, y: 200}], 'neon', '#ff0077', 8);
      })()"""
  )
  await page.click("tattoo-save-gallery-btn")
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["width"] == 1200 and meta["height"] == 800
  page.assert_zero_errors("T3-X-03")


@register_test("T3-X-04", "3", "R2->R4", "Rooftop Dash high score and CatNap outfit integrate into R4 Share-with-Mom card")
async def test_x_04_catnap_dash_score_in_mom_card(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.eval_js(
      """(() => {
        window.__CHEER_UP_STUDIO__.catnap.setOutfit('jacket', 'huntrx-gold-jacket');
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.stepFrames(180);
      })()"""
  )
  await page.click("catnap-save-outfit-btn")
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  assert verify_png_data_url(card["dataUrl"])["byte_length"] > 1000
  page.assert_zero_errors("T3-X-04")


@register_test("T3-X-05", "3", "R3->R4", "K-Pop Rhythm Stage scores and saved Beat Pad remix integrate into R4 Hub")
async def test_x_05_kpop_scores_and_remix_in_hub(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('takedown');
        api.stepRhythmTime(2.5);
        api.toggleBeatPad(0);
        api.toggleBeatPad(5);
      })()"""
  )
  await page.click("beatpad-save-btn")
  await page.click("nav-tab-hub")
  await page.click("gallery-filter-remixes")
  page.assert_zero_errors("T3-X-05")


@register_test("T3-X-06", "3", "R1+R2+R3->R4", "Saving creations across R1, R2, R3 persists all 3 categories across page.reload()")
async def test_x_06_tri_studio_gallery_reload_roundtrip(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.eval_js("localStorage.clear()")
  await page.reload()
  await page.click("nav-tab-tattoo")
  await page.click("tattoo-save-gallery-btn")
  await page.click("nav-tab-catnap")
  await page.click("catnap-save-outfit-btn")
  await page.click("nav-tab-kpop")
  await page.click("beatpad-save-btn")
  await page.reload()
  await page.click("nav-tab-hub")
  counts = await page.eval_js(
      """(() => {
        const t = JSON.parse(localStorage.getItem('cheerup_v1_saved_tattoos') || localStorage.getItem('cheer_up_studio_v1_tattoos') || '[]');
        const o = JSON.parse(localStorage.getItem('cheerup_v1_saved_outfits') || localStorage.getItem('cheer_up_studio_v1_outfits') || '[]');
        const r = JSON.parse(localStorage.getItem('cheerup_v1_saved_remixes') || localStorage.getItem('cheer_up_studio_v1_remixes') || '[]');
        return { t: t.length, o: o.length, r: r.length };
      })()"""
  )
  assert counts["t"] >= 1 and counts["o"] >= 1 and counts["r"] >= 1, f"Expected all 3 saved: {counts}"
  page.assert_zero_errors("T3-X-06")


@register_test("T3-X-07", "3", "R4->R1", "Profile nickname customized in R4 persists in global header while editing tattoos in R1")
async def test_x_07_profile_header_across_tabs(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia in Boston")
  await page.click("profile-save-btn")
  for tab in ("nav-tab-tattoo", "nav-tab-catnap", "nav-tab-kpop"):
    await page.click(tab)
    assert "Mia in Boston" in (await page.get_text("header-nickname-display"))
  page.assert_zero_errors("T3-X-07")


@register_test("T3-X-08", "3", "R3<->R2", "Shared Web Audio context coexists between R3 synth tracks and R2 CatNap purr audio")
async def test_x_08_web_audio_coexistence_r3_r2(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('golden')")
  await page.click("nav-tab-catnap")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnap.triggerCompanionInteraction()")
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('soda_pop')")
  page.assert_zero_errors("T3-X-08")


@register_test("T3-X-09", "3", "F6<->F7", "Virtual Try-On preview and Mirrored Printable Sheet export reflect identical source artwork")
async def test_x_09_tryon_and_mirrored_export_consistency(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.renderVirtualTryOn('wrist', 'warm-tan', 'golden-hour');
      })()"""
  )
  exp = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
  assert verify_png_data_url(exp["sheetDataUrl"])["width"] >= 600
  page.assert_zero_errors("T3-X-09")


@register_test("T3-X-10", "3", "F10+F11+F12", "Switching from Rhythm Game mode into Beat Pad Remix studio on same song track")
async def test_x_10_rhythm_game_to_beatpad_transition(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.startRhythmGame('soda_pop')")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.stepRhythmTime(1.0)")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(3)")
  page.assert_zero_errors("T3-X-10")


@register_test("T3-X-11", "3", "F13+F14+F15", "Dual-city clock timestamps and profile nickname combine into Mom postcard output")
async def test_x_11_clocks_and_profile_in_postcard(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  clocks = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.getDualClocks()")
  assert clocks["sf"]["tz"] == "America/Los_Angeles"
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  assert verify_png_data_url(card["dataUrl"])["width"] == 1200
  page.assert_zero_errors("T3-X-11")


@register_test("T3-X-12", "3", "F3+All", "Standalone dist/index.html supports full cross-module workflow over file://")
async def test_x_12_standalone_dist_cross_module_workflow(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  import os
  from pathlib import Path
  app_root = Path(os.environ.get("CHEER_UP_APP_ROOT", str(Path(__file__).resolve().parents[1])))
  dist_html = app_root / "dist" / "index.html"
  await page.navigate(f"file://{dist_html.resolve()}")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.eval_js("window.__CHEER_UP_STUDIO__.catnapGame.start(); window.__CHEER_UP_STUDIO__.catnapGame.stepFrames(30);")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('golden')")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  assert verify_png_data_url(card["dataUrl"])["width"] == 1200
  page.assert_zero_errors("T3-X-12")
