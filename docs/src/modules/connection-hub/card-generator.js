/**
 * @fileoverview "Send Creation Card to Mom" Shareable 1200x800 PNG Generator (R4.4).
 * Composites Daughter's profile nickname, latest Custom Tattoo design, CatNap Rooftop Dash
 * & K-Pop Demon Hunters high scores, and personal note into a downloadable 1200x800 PNG card.
 *
 * Exposes canonical `data-testid` selectors:
 * - `[data-testid="share-mom-card-canvas"]`
 * - `[data-testid="share-mom-generate-btn"]`
 * - `[data-testid="share-mom-download-btn"]`
 * - `[data-testid="download-mom-postcard-link"]`
 * - `[data-testid="mom-postcard-preview-img"]`
 * - `[data-testid="postcard-message-input"]`
 */

import { formatDualCityClocks } from './dual-clock.js';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 800;

export function renderCardGenerator(container, adapter) {
  let currentDataUrl = '';
  const cachedImages = new Map();

  function preloadTattooImages() {
    const tattoos = adapter.getSavedTattoos();
    for (const t of tattoos) {
      const url = t.previewDataUrl || t.thumbnailDataUrl;
      if (url && typeof url === 'string' && !cachedImages.has(url)) {
        const img = new Image();
        img.src = url;
        cachedImages.set(url, img);
      }
    }
  }

  function renderLayout() {
    const profile = adapter.getProfile();
    const defaultMessage = `Love you Mom! Look at my latest tattoo design and game high scores from Boston! 💖🌉🦆`;

    container.innerHTML = `
      <section class="hub-card hub-card-generator-section" aria-label="Send Creation Card to Mom PNG Generator">
        <div class="hub-section-header">
          <div>
            <h3 class="hub-section-title">
              🎨 Send Creation Card to Mom (1200×800 Shareable PNG Postcard)
            </h3>
            <p class="hub-section-subtitle">
              Bundles your latest Temporary Tattoo design, CatNap Rooftop Dash high score, K-Pop Demon Hunters stage record, and personal note into a keepsake card for Mom in San Francisco!
            </p>
          </div>
          <span class="hub-resolution-badge">1200 × 800 HD PNG</span>
        </div>

        <div class="hub-generator-controls">
          <div class="hub-form-row">
            <label class="hub-label" for="hub-postcard-msg-input">
              Personal Message to Mom:
            </label>
            <input
              id="hub-postcard-msg-input"
              type="text"
              class="hub-input"
              data-testid="postcard-message-input"
              maxlength="180"
              value="${escapeHtml(defaultMessage)}"
              placeholder="Write a sweet note to Mom in the Bay Area..."
            />
          </div>

          <div class="hub-generator-btn-row">
            <button
              type="button"
              class="hub-btn hub-btn-primary"
              data-testid="share-mom-generate-btn"
            >
              ✨ Generate Creation Card for Mom
            </button>

            <a
              class="hub-btn hub-btn-accent"
              data-testid="share-mom-download-btn"
              download="cheer-up-postcard-for-mom.png"
              href="#"
            >
              📥 Download Shareable PNG Card
            </a>

            <a
              class="hub-hidden-download-alias"
              data-testid="download-mom-postcard-link"
              download="cheer-up-postcard-for-mom.png"
              href="#"
            >
              Download Postcard PNG
            </a>
          </div>
        </div>

        <div class="hub-generator-preview-wrap">
          <canvas
            width="${CARD_WIDTH}"
            height="${CARD_HEIGHT}"
            class="hub-postcard-canvas"
            data-testid="share-mom-card-canvas"
          ></canvas>
          <img
            class="hub-postcard-preview-img"
            data-testid="mom-postcard-preview-img"
            alt="Generated Creation Card for Mom (${escapeHtml(profile.nickname)})"
          />
        </div>
      </section>
    `;

    preloadTattooImages();

    const generateBtn = container.querySelector('[data-testid="share-mom-generate-btn"]');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        generateCard();
      });
    }

    // Generate initial card immediately so canvas & download links are always populated
    generateCard();
  }

  /**
   * Draws a rounded rectangle path on a 2D context.
   */
  function roundRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Draws decorative Golden Gate Bridge silhouette on left side of canvas.
   */
  function drawGoldenGateBridge(ctx, offsetX, offsetY) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 120, 90, 0.45)';
    ctx.lineWidth = 4;
    // Left tower
    ctx.strokeRect(offsetX + 70, offsetY + 30, 18, 120);
    // Right tower
    ctx.strokeRect(offsetX + 210, offsetY + 30, 18, 120);
    // Road deck
    ctx.beginPath();
    ctx.moveTo(offsetX + 20, offsetY + 115);
    ctx.lineTo(offsetX + 270, offsetY + 115);
    ctx.stroke();
    // Suspension cable curve
    ctx.beginPath();
    ctx.moveTo(offsetX + 79, offsetY + 38);
    ctx.quadraticCurveTo(offsetX + 149, offsetY + 108, offsetX + 219, offsetY + 38);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws decorative Boston Zakim Bridge & stars silhouette on right side of canvas.
   */
  function drawBostonSkyline(ctx, offsetX, offsetY) {
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 160, 255, 0.45)';
    ctx.lineWidth = 4;
    // Zakim cable-stayed triangle tower
    ctx.beginPath();
    ctx.moveTo(offsetX + 140, offsetY + 25);
    ctx.lineTo(offsetX + 95, offsetY + 125);
    ctx.lineTo(offsetX + 185, offsetY + 125);
    ctx.closePath();
    ctx.stroke();
    // Cables
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + 140, offsetY + 35);
      ctx.lineTo(offsetX + 140 + i * 24, offsetY + 125);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draws emblem artwork when rendering tattoo showcase panel.
   */
  function drawTattooArtworkPanel(ctx, x, y, w, h, latestTattoo) {
    // Inner card gradient
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, '#2a1b4e');
    bg.addColorStop(1, '#1a2448');
    roundRectPath(ctx, x, y, w, h, 18);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff99cc';
    ctx.stroke();

    // Try drawing cached image or live tattoo canvas if available
    let drawnBitmap = false;
    const liveTattooCanvas = document.querySelector('[data-testid="tattoo-canvas"]');
    if (latestTattoo) {
      const url = latestTattoo.previewDataUrl || latestTattoo.thumbnailDataUrl;
      const cached = url ? cachedImages.get(url) : null;
      if (cached && cached.complete && cached.naturalWidth > 0) {
        try {
          ctx.drawImage(cached, x + 28, y + 56, w - 56, h - 115);
          drawnBitmap = true;
        } catch (_err) {
          drawnBitmap = false;
        }
      }
    }
    if (!drawnBitmap && liveTattooCanvas instanceof HTMLCanvasElement && liveTattooCanvas.width > 0) {
      try {
        ctx.drawImage(liveTattooCanvas, x + 28, y + 56, w - 56, h - 115);
        drawnBitmap = true;
      } catch (_err) {
        drawnBitmap = false;
      }
    }

    // Draw vibrant vector tattoo crest overlay / centerpiece
    const cx = x + w / 2;
    const cy = y + h / 2 + 6;

    // Outer neon halo ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 88, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Inner lavender moon circle
    ctx.beginPath();
    ctx.arc(cx, cy, 66, 0, Math.PI * 2);
    ctx.fillStyle = drawnBitmap ? 'rgba(65, 42, 115, 0.55)' : '#4c2c85';
    ctx.fill();

    // Star & Heart emblems
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌙  ❤️  🎤', cx, cy - 8);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('SF ↔ BOSTON CREATIVE STUDIO', cx, cy + 28);
    ctx.restore();

    // Panel Header & Footer labels
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 21px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✨ Featured Tattoo Creation', x + 24, y + 36);

    const tattooTitle = latestTattoo
      ? latestTattoo.title || latestTattoo.name || 'Custom Starlight Tattoo'
      : 'CatNap & HUNTR/X Family Crest';
    ctx.fillStyle = '#f8f0ff';
    ctx.font = 'bold 19px sans-serif';
    ctx.fillText(`Design: ${tattooTitle}`, x + 24, y + h - 24);
  }

  /**
   * Generates the full 1200x800 PNG postcard on the canvas and updates download links.
   * @param {Object} [customOptions]
   * @returns {{ dataUrl: string, width: number, height: number }}
   */
  function generateCard(customOptions = {}) {
    const canvas = container.querySelector('[data-testid="share-mom-card-canvas"]');
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { dataUrl: currentDataUrl, width: CARD_WIDTH, height: CARD_HEIGHT };
    }
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext('2d');

    const profile = adapter.getProfile();
    const scores = adapter.getHighScores();
    const tattoos = adapter.getSavedTattoos();
    const outfits = adapter.getSavedOutfits();
    const remixes = adapter.getSavedRemixes();
    const clocks = formatDualCityClocks();

    const msgInput = container.querySelector('[data-testid="postcard-message-input"]');
    const personalNote =
      customOptions.message ||
      (msgInput && msgInput.value.trim()) ||
      `Love you Mom! Sending hugs from Boston to San Francisco!`;

    // 1. Rich split-city twilight sky gradient background (1200x800)
    const skyGrad = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    skyGrad.addColorStop(0, '#1e1348');
    skyGrad.addColorStop(0.45, '#3b1d70');
    skyGrad.addColorStop(0.75, '#6a2c70');
    skyGrad.addColorStop(1, '#b83b5e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // 2. Decorative outer frame border
    roundRectPath(ctx, 18, 18, CARD_WIDTH - 36, CARD_HEIGHT - 36, 26);
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ffd166';
    ctx.stroke();

    // Inner subtle border
    roundRectPath(ctx, 28, 28, CARD_WIDTH - 56, CARD_HEIGHT - 56, 20);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.stroke();

    // 3. Draw Golden Gate Bridge & Boston Skyline silhouettes
    drawGoldenGateBridge(ctx, 45, 35);
    drawBostonSkyline(ctx, 915, 35);

    // 4. Top Header Banner
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
      '🌉 BAY AREA (SAN FRANCISCO)  ↔  BOSTON, MASSACHUSETTS 🏛️',
      CARD_WIDTH / 2,
      68
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(
      `From ${profile.nickname} in Boston ❤️ To Mom!`,
      CARD_WIDTH / 2,
      114
    );

    ctx.fillStyle = '#e0c3fc';
    ctx.font = '18px sans-serif';
    ctx.fillText(
      `SF Time: ${clocks.sf.timeStr} (${clocks.sf.tzShort})   •   Boston Time: ${clocks.boston.timeStr} (${clocks.boston.tzShort})`,
      CARD_WIDTH / 2,
      146
    );

    // 5. Left Panel: Featured Custom Tattoo Showcase (x=54, y=172, w=525, h=420)
    const latestTattoo = tattoos[0] || null;
    drawTattooArtworkPanel(ctx, 54, 172, 525, 420, latestTattoo);

    // 6. Right Panel: Game High-Score & Studio Achievements Board (x=620, y=172, w=526, h=420)
    const rightGrad = ctx.createLinearGradient(620, 172, 1146, 592);
    rightGrad.addColorStop(0, '#231942');
    rightGrad.addColorStop(1, '#3a225d');
    roundRectPath(ctx, 620, 172, 526, 420, 18);
    ctx.fillStyle = rightGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#7bdff2';
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#7bdff2';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏆 Creative Studio & Game Scoreboard', 648, 212);

    const rows = [
      {
        icon: '🐱🌙',
        label: "CatNap's Starlight Rooftop Dash",
        value: `${scores.rooftopDash} pts  (${scores.moonsCollected} Moons)`,
      },
      {
        icon: '🎤✨',
        label: 'HUNTR/X — "Golden" Rhythm Stage',
        value: `${scores.rhythmGolden} pts`,
      },
      {
        icon: '⚔️🔥',
        label: 'HUNTR/X — "Takedown" Battle Beat',
        value: `${scores.rhythmTakedown} pts`,
      },
      {
        icon: '🥤🎶',
        label: 'Saja Boys — "Soda Pop" Groove',
        value: `${scores.rhythmSodaPop} pts`,
      },
      {
        icon: '🎨💾',
        label: 'My Saved Gallery Creations',
        value: `${tattoos.length} Tattoos • ${outfits.length} Outfits • ${remixes.length} Remixes`,
      },
    ];

    let rowY = 262;
    for (const r of rows) {
      roundRectPath(ctx, 646, rowY - 28, 474, 56, 12);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${r.icon}  ${r.label}`, 664, rowY + 4);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffd166';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(r.value, 1102, rowY + 4);
      ctx.textAlign = 'left';

      rowY += 68;
    }

    // 7. Bottom Personal Message Banner (x=54, y=616, w=1092, h=132)
    roundRectPath(ctx, 54, 616, 1092, 132, 18);
    ctx.fillStyle = 'rgba(255, 248, 231, 0.95)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ff758f';
    ctx.stroke();

    ctx.fillStyle = '#6a1b4d';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('💌 Personal Note from Boston to Mom in San Francisco:', 82, 652);

    ctx.fillStyle = '#2b193d';
    ctx.font = 'bold 22px sans-serif';
    const clippedNote =
      personalNote.length > 92 ? `${personalNote.slice(0, 89)}...` : personalNote;
    ctx.fillText(`"${clippedNote}"`, 82, 692);

    ctx.fillStyle = '#7a5c8f';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      `Created with love in Boston ↔ Bay Area Creative Cheer-Up Studio • ${clocks.boston.dateStr}`,
      82,
      728
    );

    // 8. Export valid PNG Data URL & sync DOM preview + download buttons
    currentDataUrl = canvas.toDataURL('image/png');

    const dlBtn = container.querySelector('[data-testid="share-mom-download-btn"]');
    const dlAlias = container.querySelector('[data-testid="download-mom-postcard-link"]');
    const previewImg = container.querySelector('[data-testid="mom-postcard-preview-img"]');

    if (dlBtn) dlBtn.setAttribute('href', currentDataUrl);
    if (dlAlias) dlAlias.setAttribute('href', currentDataUrl);
    if (previewImg) previewImg.setAttribute('src', currentDataUrl);

    return {
      dataUrl: currentDataUrl,
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
    };
  }

  renderLayout();

  return {
    generateShareWithMomCard: generateCard,
    render: renderLayout,
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
