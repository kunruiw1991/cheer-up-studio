#!/usr/bin/env python3
"""Tier 4: Real-World Application Scenarios / Family User Journeys (6 Journeys: T4-J-01..T4-J-06).

Simulates complete realistic user sessions for Kunrui's daughter living in Boston
connecting with Mom in the Bay Area across all 4 creative studios.
"""

from __future__ import annotations

from pathlib import Path

from tests.cdp_driver import ChromeCdpSession, register_test, verify_png_data_url


@register_test(
    "T4-J-01",
    "4",
    "Journey-1",
    "Sunday Afternoon in Boston in Boston: Tattoo Design -> Virtual Try-On -> Mirrored Printable Sheet",
)
async def test_j_01_sunday_afternoon_tattoo_session(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-hub")
  await page.set_value("profile-nickname-input", "Mia in Boston")
  await page.click("profile-save-btn")
  clocks = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.getDualClocks()")
  assert clocks["sf"]["tz"] == "America/Los_Angeles" and clocks["boston"]["tz"] == "America/New_York"

  await page.click("nav-tab-tattoo")
  await page.click("tattoo-clear-btn")
  await page.eval_js(
      """(() => {
        const t = window.__CHEER_UP_STUDIO__.tattoo;
        t.addStamp('catnap', 'catnap-moon');
        t.addStamp('kpop', 'huntrx-golden-crest');
        t.addStamp('bay_boston', 'golden-gate-boston-bridge');
        t.drawStroke([{x: 60, y: 90}, {x: 190, y: 150}, {x: 340, y: 110}], 'rainbow', '#ff33aa', 7);
        t.renderVirtualTryOn('arm', 'warm-tan', 'golden-hour');
      })()"""
  )
  await page.set_value("tattoo-text-input", "Boston ❤️ SF")
  await page.click("tattoo-add-text-btn")
  exp = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
  assert verify_png_data_url(exp["sheetDataUrl"])["width"] >= 600
  await page.click("tattoo-save-gallery-btn")
  page.assert_zero_errors("T4-J-01")


@register_test(
    "T4-J-02",
    "4",
    "Journey-2",
    "Cozy CatNap Playtime & Starlight Rooftop Dash Adventure Across Boston & Golden Gate",
)
async def test_j_02_catnap_playtime_and_rooftop_dash(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-catnap")
  await page.click("catnap-purr-btn")
  state = await page.eval_js(
      """(() => {
        const c = window.__CHEER_UP_STUDIO__.catnap;
        c.triggerCompanionInteraction();
        c.setOutfit('jacket', 'huntrx-gold-jacket');
        c.setOutfit('scarf', 'boston-crimson-scarf');
        const g = window.__CHEER_UP_STUDIO__.catnapGame;
        g.start();
        g.jump();
        g.stepFrames(200);
        const mid = g.getState();
        g.triggerGameOver();
        g.restart();
        g.stepFrames(50);
        return { midScore: mid.score, current: g.getState() };
      })()"""
  )
  assert state["midScore"] > 0 and state["current"]["state"] == "running"
  await page.click("catnap-save-outfit-btn")
  page.assert_zero_errors("T4-J-02")


@register_test(
    "T4-J-03",
    "4",
    "Journey-3",
    "K-Pop Demon Hunters Concert Jam (Golden, Takedown, Soda Pop) & Custom Beat Pad Remix",
)
async def test_j_03_kpop_demon_hunters_concert_and_remix(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-kpop")
  for song in ("golden", "takedown", "soda_pop"):
    info = await page.eval_js(f"window.__CHEER_UP_R3_TEST_API__.initializeAndVerifySongGraph('{song}')")
    assert info["initialized"] is True and not info["hasErrors"]

  rhythm = await page.eval_js(
      """(() => {
        const api = window.__CHEER_UP_R3_TEST_API__;
        api.startRhythmGame('golden');
        for (let i = 0; i < 20; i++) {
          api.stepRhythmTime(0.25);
          for (let lane = 0; lane < 4; lane++) api.triggerLaneInput(lane);
        }
        return api.getRhythmState();
      })()"""
  )
  assert rhythm["score"] > 0 and rhythm["combo"] >= 1
  await page.click("beatpad-record-btn")
  await page.eval_js("window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(0); window.__CHEER_UP_R3_TEST_API__.toggleBeatPad(5);")
  await page.click("beatpad-record-btn")
  await page.click("beatpad-save-btn")
  page.assert_zero_errors("T4-J-03")


@register_test(
    "T4-J-04",
    "4",
    "Journey-4",
    "Bay Area <-> Boston Family Connection: Persistence Across Reload & Sending Creation Card to Mom",
)
async def test_j_04_family_connection_reload_and_postcard_to_mom(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.navigate(base_url)
  await page.click("nav-tab-tattoo")
  await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.addStamp('catnap', 'catnap-moon')")
  await page.click("tattoo-save-gallery-btn")
  await page.reload()
  await page.click("nav-tab-hub")
  card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
  meta = verify_png_data_url(card["dataUrl"])
  assert meta["width"] == 1200 and meta["height"] == 800
  page.assert_zero_errors("T4-J-04")


@register_test(
    "T4-J-05",
    "4",
    "Journey-5",
    "iPad Portrait Tablet Session: Touch Controls Across Tattoo Studio, CatNap & Rhythm Stage",
)
async def test_j_05_ipad_tablet_touch_session(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  await page.set_viewport(768, 1024, mobile=True)
  try:
    await page.navigate(base_url)
    await page.click("nav-tab-tattoo")
    await page.draw_canvas_stroke("tattoo-canvas", [(100, 100), (200, 180)], "glitter", "#ffaa00", 6)
    await page.click("nav-tab-catnap")
    await page.click("rooftop-dash-start-btn")
    await page.click("rooftop-dash-jump-btn")
    await page.click("nav-tab-kpop")
    for btn in ("rhythm-lane-btn-0", "rhythm-lane-btn-1", "rhythm-lane-btn-2", "rhythm-lane-btn-3"):
      await page.click(btn)
    page.assert_zero_errors("T4-J-05")
  finally:
    await page.set_viewport(1440, 900, mobile=False)


@register_test(
    "T4-J-06",
    "4",
    "Journey-6",
    "AirDrop / Offline Standalone Bundle Journey: Full Studio Experience via file:// dist/index.html",
)
async def test_j_06_airdrop_offline_bundle_journey(page: ChromeCdpSession, base_url: str) -> None:
  page.reset_errors()
  import os
  app_root = Path(os.environ.get("CHEER_UP_APP_ROOT", str(Path(__file__).resolve().parents[1])))
  dist_html = app_root / "dist" / "index.html"
  await page.set_offline_mode(True)
  try:
    await page.navigate(f"file://{dist_html.resolve()}")
    await page.click("nav-tab-tattoo")
    exp = await page.eval_js("window.__CHEER_UP_STUDIO__.tattoo.exportTransferSheet()")
    assert verify_png_data_url(exp["sheetDataUrl"])["width"] >= 600
    await page.click("nav-tab-hub")
    card = await page.eval_js("window.__CHEER_UP_STUDIO__.hub.generateShareWithMomCard()")
    assert verify_png_data_url(card["dataUrl"])["width"] == 1200
    page.assert_zero_errors("T4-J-06")
  finally:
    await page.set_offline_mode(False)
