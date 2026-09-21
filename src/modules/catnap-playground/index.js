/**
 * @fileoverview Entry point for Milestone M3 (R2: CatNap & Smiling Critters Cozy Playground & Mini-Game).
 * Exports `initCatNapPlayground(container, store)` and registers programmatic verification APIs
 * under `window.__CHEER_UP_STUDIO__.catnap` and `window.__CHEER_UP_STUDIO__.catnapGame`.
 */

import { EXPRESSIONS, WARDROBE_CATALOG, OUTFIT_PRESETS } from './wardrobe.js';
import { CatNapCompanion } from './companion.js';
import { RooftopDashGame } from './rooftop-dash.js';

/**
 * Renders `<option>` HTML for a wardrobe category or expression list.
 */
function renderOptionsHtml(items) {
  return items
    .map((item) => `<option value="${item.id}">${item.label}</option>`)
    .join('');
}

/**
 * Initializes the CatNap Cozy Playground & Starlight Rooftop Dash Mini-Game inside `container`.
 *
 * @param {HTMLElement} container
 * @param {object} [store]
 * @returns {{ companion: CatNapCompanion, game: RooftopDashGame }}
 */
export function initCatNapPlayground(container, store) {
  if (!container) {
    throw new Error('initCatNapPlayground requires a valid DOM container element.');
  }

  container.innerHTML = `
    <div class="catnap-playground-wrapper" style="display: flex; flex-direction: column; gap: 24px; padding: 12px; color: #f8fafc;">
      <!-- Top Banner -->
      <div style="background: linear-gradient(135deg, rgba(76, 29, 149, 0.85), rgba(131, 24, 67, 0.78)); border: 1px solid rgba(196, 181, 253, 0.4); border-radius: 18px; padding: 16px 22px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;">
        <div>
          <h2 style="margin: 0; font-size: 1.45rem; color: #fde047;">🌙 CatNap & Smiling Critters Cozy Starlight Playground</h2>
          <p style="margin: 6px 0 0; font-size: 0.95rem; color: #e9d5ff;">
            Pet CatNap for soothing lavender purrs, customize his K-Pop & Boston winter plush wardrobe, and leap across Boston ↔ San Francisco rooftops to unlock Tattoo Studio stickers!
          </p>
        </div>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span data-testid="catnap-save-status" style="font-size: 0.88rem; color: #fde047; font-weight: 600;"></span>
        </div>
      </div>

      <!-- Main Interactive Grid: Left = Companion & Plush Customizer | Right = Starlight Rooftop Dash -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 22px; align-items: start;">
        
        <!-- PANEL 1: Interactive CatNap Companion & Plush Customizer -->
        <section style="background: rgba(30, 27, 75, 0.78); border: 1px solid rgba(167, 139, 250, 0.35); border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <h3 style="margin: 0; font-size: 1.18rem; color: #f3e8ff;">💜 Interactive CatNap Plush Companion</h3>
            <div style="display: flex; align-items: center; gap: 10px; font-size: 0.88rem; background: rgba(76, 29, 149, 0.65); padding: 5px 12px; border-radius: 999px;">
              <span>Purrs: <strong data-testid="catnap-purr-counter" style="color: #fde047;">0</strong></span>
              <span>•</span>
              <div style="width: 72px; height: 10px; background: rgba(15, 23, 42, 0.7); border-radius: 999px; overflow: hidden;">
                <div data-testid="catnap-friendship-fill" style="width: 45%; height: 100%; background: linear-gradient(90deg, #f472b6, #fde047);"></div>
              </div>
            </div>
          </div>

          <!-- Interactive Stage (SVG + Canvas Dream-Mist Particle Overlay) -->
          <div
            data-testid="catnap-companion-stage"
            style="position: relative; width: 100%; max-width: 400px; height: 390px; margin: 0 auto; cursor: pointer; user-select: none; border-radius: 18px; background: radial-gradient(circle at 50% 42%, rgba(91, 33, 182, 0.52), rgba(15, 23, 42, 0.88)); border: 1px solid rgba(196, 181, 253, 0.28); overflow: hidden;"
            title="Click or tap CatNap to hear him purr & release lavender dream-mist!"
          >
            <svg
              data-testid="catnap-companion-svg"
              viewBox="0 0 400 420"
              style="width: 100%; height: 100%; display: block;"
            ></svg>
            <canvas
              data-testid="catnap-companion-canvas"
              width="400"
              height="420"
              style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;"
            ></canvas>
          </div>

          <!-- Mood Telemetry & Pet / Purr Action Buttons -->
          <div style="text-align: center; font-size: 0.9rem; color: #ddd6fe; min-height: 22px;" data-testid="catnap-mood-status">
            Cozy Starry Smile — Feeling warm, safe, and full of starlight hugs!
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            <button
              type="button"
              data-testid="catnap-purr-btn"
              style="min-height: 44px; padding: 10px 18px; border-radius: 12px; border: none; background: linear-gradient(135deg, #a855f7, #ec4899); color: #fff; font-weight: 700; cursor: pointer;"
            >
              ♫ Pet CatNap & Soothing Purr
            </button>
            <button
              type="button"
              data-testid="catnap-pet-btn"
              style="min-height: 44px; padding: 10px 16px; border-radius: 12px; border: 1px solid rgba(253, 224, 71, 0.6); background: rgba(76, 29, 149, 0.75); color: #fde047; font-weight: 600; cursor: pointer;"
            >
              ☁️ Lavender Dream Hug
            </button>
          </div>

          <!-- Curated Look Presets -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;">
            ${OUTFIT_PRESETS.map(
              (preset) => `
              <button
                type="button"
                data-preset-id="${preset.id}"
                style="padding: 6px 11px; border-radius: 999px; border: 1px solid rgba(196, 181, 253, 0.4); background: rgba(49, 16, 66, 0.7); color: #f3e8ff; font-size: 0.8rem; cursor: pointer;"
              >
                ✨ ${preset.title}
              </button>
            `
            ).join('')}
          </div>

          <!-- Plush Wardrobe Customizer (4 Categories + Expression) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; background: rgba(15, 23, 42, 0.55); padding: 14px; border-radius: 14px;">
            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #c4b5fd;">
              <span>😊 Facial Expression</span>
              <select data-testid="catnap-expression-select" style="min-height: 38px; border-radius: 8px; background: #1e1b4b; color: #fff; border: 1px solid #7c3aed; padding: 4px 8px;">
                ${renderOptionsHtml(EXPRESSIONS)}
              </select>
            </label>

            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #c4b5fd;">
              <span>🧥 K-Pop Idol Jacket</span>
              <select data-testid="catnap-outfit-jacket" style="min-height: 38px; border-radius: 8px; background: #1e1b4b; color: #fff; border: 1px solid #7c3aed; padding: 4px 8px;">
                ${renderOptionsHtml(WARDROBE_CATALOG.jacket)}
              </select>
              <select data-testid="outfit-jacket-select" aria-hidden="true" style="display: none;">
                ${renderOptionsHtml(WARDROBE_CATALOG.jacket)}
              </select>
            </label>

            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #c4b5fd;">
              <span>🎧 Glowing Headphones</span>
              <select data-testid="catnap-outfit-headphones" style="min-height: 38px; border-radius: 8px; background: #1e1b4b; color: #fff; border: 1px solid #7c3aed; padding: 4px 8px;">
                ${renderOptionsHtml(WARDROBE_CATALOG.headphones)}
              </select>
              <select data-testid="outfit-headwear-select" aria-hidden="true" style="display: none;">
                ${renderOptionsHtml(WARDROBE_CATALOG.headphones)}
              </select>
            </label>

            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #c4b5fd;">
              <span>🌙 Crescent Moon Pendant</span>
              <select data-testid="catnap-outfit-pendant" style="min-height: 38px; border-radius: 8px; background: #1e1b4b; color: #fff; border: 1px solid #7c3aed; padding: 4px 8px;">
                ${renderOptionsHtml(WARDROBE_CATALOG.pendant)}
              </select>
              <select data-testid="outfit-pendant-select" aria-hidden="true" style="display: none;">
                ${renderOptionsHtml(WARDROBE_CATALOG.pendant)}
              </select>
            </label>

            <label style="display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; color: #c4b5fd;">
              <span>🧣 Boston Winter Scarf</span>
              <select data-testid="catnap-outfit-scarf" style="min-height: 38px; border-radius: 8px; background: #1e1b4b; color: #fff; border: 1px solid #7c3aed; padding: 4px 8px;">
                ${renderOptionsHtml(WARDROBE_CATALOG.scarf)}
              </select>
              <select data-testid="outfit-scarf-select" aria-hidden="true" style="display: none;">
                ${renderOptionsHtml(WARDROBE_CATALOG.scarf)}
              </select>
            </label>
          </div>

          <!-- Save Custom Outfit to Gallery -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <input
              type="text"
              data-testid="catnap-outfit-title-input"
              placeholder="Name your CatNap outfit (e.g. HUNTR/X Boston Star)..."
              style="flex: 1; min-width: 180px; min-height: 40px; border-radius: 10px; border: 1px solid #7c3aed; background: #0f172a; color: #fff; padding: 6px 12px;"
            />
            <button
              type="button"
              data-testid="catnap-save-outfit-btn"
              style="min-height: 42px; padding: 8px 16px; border-radius: 10px; border: none; background: linear-gradient(135deg, #f59e0b, #ec4899); color: #fff; font-weight: 700; cursor: pointer;"
            >
              💾 Save Outfit to Gallery
            </button>
            <button
              type="button"
              data-testid="save-outfit-gallery-btn"
              style="display: none;"
            >
              Save Outfit Alias
            </button>
          </div>
        </section>

        <!-- PANEL 2: "CatNap's Starlight Rooftop Dash" Arcade Mini-Game -->
        <section style="background: rgba(30, 27, 75, 0.78); border: 1px solid rgba(167, 139, 250, 0.35); border-radius: 20px; padding: 18px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="margin: 0; font-size: 1.18rem; color: #fde047;">🌠 CatNap’s Starlight Rooftop Dash</h3>
              <div data-testid="rooftop-dash-biome" style="font-size: 0.82rem; color: #c4b5fd; margin-top: 2px;">
                Boston Starry Brownstones & Zakim Bridge
              </div>
            </div>
            <div style="display: flex; gap: 12px; align-items: center; background: rgba(15, 23, 42, 0.75); padding: 6px 14px; border-radius: 12px; font-size: 0.88rem;">
              <span>Score: <strong data-testid="rooftop-dash-score" style="color: #38bdf8;">0</strong><span data-testid="dash-score-value" style="display: none;">0</span></span>
              <span>Best: <strong data-testid="rooftop-dash-highscore" style="color: #fde047;">0</strong><span data-testid="dash-highscore-value" style="display: none;">0</span></span>
              <span>State: <strong data-testid="rooftop-dash-state" style="color: #f472b6;">idle</strong><span data-testid="dash-game-state" style="display: none;">idle</span></span>
            </div>
          </div>

          <!-- Game Canvas -->
          <div style="position: relative; width: 100%; overflow: hidden; border-radius: 14px; border: 2px solid rgba(196, 181, 253, 0.4);">
            <canvas
              data-testid="rooftop-dash-canvas"
              width="760"
              height="340"
              style="width: 100%; height: auto; display: block; cursor: pointer;"
            ></canvas>
          </div>

          <!-- Game Controls Bar -->
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center;">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button
                type="button"
                data-testid="rooftop-dash-start-btn"
                style="min-height: 44px; padding: 8px 18px; border-radius: 12px; border: none; background: linear-gradient(135deg, #10b981, #059669); color: #fff; font-weight: 700; cursor: pointer;"
              >
                ▶ Start Dash
              </button>
              <button type="button" data-testid="dash-start-btn" style="display: none;">Start Alias</button>

              <button
                type="button"
                data-testid="rooftop-dash-jump-btn"
                style="min-height: 44px; padding: 8px 20px; border-radius: 12px; border: none; background: linear-gradient(135deg, #38bdf8, #6366f1); color: #fff; font-weight: 700; cursor: pointer;"
              >
                ⬆ Jump / Double-Jump (Space)
              </button>
              <button type="button" data-testid="dash-jump-btn" style="display: none;">Jump Alias</button>

              <button
                type="button"
                data-testid="rooftop-dash-restart-btn"
                style="min-height: 44px; padding: 8px 16px; border-radius: 12px; border: 1px solid #f472b6; background: rgba(131, 24, 67, 0.7); color: #fce7f3; font-weight: 700; cursor: pointer;"
              >
                ↺ Restart Dash
              </button>
              <button type="button" data-testid="dash-restart-btn" style="display: none;">Restart Alias</button>
            </div>

            <div data-testid="rooftop-dash-stickers-count" style="font-size: 0.84rem; color: #fde047; font-weight: 600;">
              0 / 2 Tattoo Stickers Unlocked
            </div>
          </div>

          <div style="font-size: 0.82rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.5); padding: 10px 14px; border-radius: 10px;">
            💡 <strong>How to Play:</strong> Collect Golden Crescent Moons (<code>+10</code>), K-Pop Musical Notes (<code>+25</code>), and Pink Star Capsules (<code>+50</code> + unlocks exclusive stamps in the Tattoo Studio!). Jump over sleepy chimney puffs!
          </div>
        </section>
      </div>
    </div>
  `;

  // Instantiate Companion & Rooftop Dash Game
  const companion = new CatNapCompanion(container, store);
  const game = new RooftopDashGame(container, store, () => companion.getState());

  // Wire Companion Interactions
  const stageEl = container.querySelector('[data-testid="catnap-companion-stage"]');
  const purrBtn = container.querySelector('[data-testid="catnap-purr-btn"]');
  const petBtn = container.querySelector('[data-testid="catnap-pet-btn"]');

  if (stageEl) {
    stageEl.addEventListener('click', () => companion.triggerCompanionInteraction());
  }
  if (purrBtn) {
    purrBtn.addEventListener('click', () => companion.triggerCompanionInteraction());
  }
  if (petBtn) {
    petBtn.addEventListener('click', () => companion.triggerCompanionInteraction());
  }

  // Wire Expression & Wardrobe Selects (Canonical + Survey Aliases)
  const bindSelectPair = (canonicalSel, aliasSel, slot) => {
    const canonicalEl = container.querySelector(canonicalSel);
    const aliasEl = container.querySelector(aliasSel);
    if (canonicalEl) {
      canonicalEl.addEventListener('change', (e) => {
        companion.setOutfit(slot, e.target.value);
        game.render();
      });
    }
    if (aliasEl) {
      aliasEl.addEventListener('change', (e) => {
        companion.setOutfit(slot, e.target.value);
        game.render();
      });
    }
  };

  bindSelectPair('[data-testid="catnap-expression-select"]', null, 'expression');
  bindSelectPair('[data-testid="catnap-outfit-jacket"]', '[data-testid="outfit-jacket-select"]', 'jacket');
  bindSelectPair('[data-testid="catnap-outfit-headphones"]', '[data-testid="outfit-headwear-select"]', 'headphones');
  bindSelectPair('[data-testid="catnap-outfit-pendant"]', '[data-testid="outfit-pendant-select"]', 'pendant');
  bindSelectPair('[data-testid="catnap-outfit-scarf"]', '[data-testid="outfit-scarf-select"]', 'scarf');

  // Wire Preset Buttons
  container.querySelectorAll('[data-preset-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetId = btn.getAttribute('data-preset-id');
      companion.applyPreset(presetId);
      game.render();
    });
  });

  // Wire Save Outfit Buttons
  const saveOutfitBtn = container.querySelector('[data-testid="catnap-save-outfit-btn"]');
  const saveOutfitAliasBtn = container.querySelector('[data-testid="save-outfit-gallery-btn"]');
  if (saveOutfitBtn) {
    saveOutfitBtn.addEventListener('click', () => companion.saveOutfitToGallery());
  }
  if (saveOutfitAliasBtn) {
    saveOutfitAliasBtn.addEventListener('click', () => companion.saveOutfitToGallery());
  }

  // Wire Game Controls
  const bindButtonPair = (selA, selB, handler) => {
    const btnA = container.querySelector(selA);
    const btnB = container.querySelector(selB);
    if (btnA) btnA.addEventListener('click', handler);
    if (btnB) btnB.addEventListener('click', handler);
  };

  bindButtonPair('[data-testid="rooftop-dash-start-btn"]', '[data-testid="dash-start-btn"]', () => game.start());
  bindButtonPair('[data-testid="rooftop-dash-jump-btn"]', '[data-testid="dash-jump-btn"]', () => game.jump());
  bindButtonPair('[data-testid="rooftop-dash-restart-btn"]', '[data-testid="dash-restart-btn"]', () => game.restart());

  const dashCanvas = container.querySelector('[data-testid="rooftop-dash-canvas"]');
  if (dashCanvas) {
    dashCanvas.addEventListener('click', () => game.jump());
  }

  // Keyboard listener for Space / ArrowUp / KeyW when not typing in an input
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (container.offsetParent !== null) {
        e.preventDefault();
        game.jump();
      }
    }
  });

  // Mount Companion & Game
  companion.mount();
  game.mount();

  // Register Programmatic Verification Contracts on window.__CHEER_UP_STUDIO__
  window.__CHEER_UP_STUDIO__ = window.__CHEER_UP_STUDIO__ || {};
  window.__CHEER_UP_STUDIO__.catnap = {
    triggerCompanionInteraction: () => companion.triggerCompanionInteraction(),
    setOutfit: (slot, value) => companion.setOutfit(slot, value),
    saveOutfitToGallery: (title) => companion.saveOutfitToGallery(title),
    getState: () => companion.getState(),
  };

  window.__CHEER_UP_STUDIO__.catnapGame = {
    start: () => game.start(),
    jump: () => game.jump(),
    stepFrames: (frameCount = 60) => game.stepFrames(frameCount),
    triggerGameOver: () => game.triggerGameOver(),
    restart: () => game.restart(),
    getState: () => game.getState(),
  };

  window.__CHEER_UP_DEBUG__ = window.__CHEER_UP_DEBUG__ || {};
  window.__CHEER_UP_DEBUG__.stepDashFrames = (frameCount = 60) => game.stepFrames(frameCount);

  return { companion, game };
}

export const init = initCatNapPlayground;
export default initCatNapPlayground;
