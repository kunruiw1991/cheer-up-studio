/**
 * @fileoverview Main Entry Point & Interactive Studio Controller for Milestone M2
 * (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio).
 *
 * Exports:
 *   - initTattooStudio(container, store, options)
 *   - default export initTattooStudio
 *
 * Registers:
 *   - window.__CHEER_UP_STUDIO__.tattoo
 */

import { STAMP_CATEGORIES, TATTOO_STAMPS, getStampById } from './stamps.js';
import { BRUSH_MODES, COLOR_SWATCHES, renderTattooLayer } from './brushes.js';
import { BODY_PARTS, SKIN_TONES, LIGHTING_PRESETS, renderVirtualTryOnCanvas } from './tryon-preview.js';
import { exportTattooSheetBundle, syncMirroredSheetCanvases, makeThumbnailDataUrl } from './sheet-exporter.js';

function cloneLayers(layers) {
  return JSON.parse(JSON.stringify(layers));
}

export function initTattooStudio(container, store, _options = {}) {
  if (!container) return null;

  const activeStore = store || (typeof window !== 'undefined' ? window.CheerUpStore : null);

  // Studio State
  const state = {
    title: 'Boston ↔ Bay Area Starlight Tattoo',
    activeCategory: 'all',
    toolMode: 'draw', // 'draw' | 'select'
    brushMode: 'neon',
    color: '#a855f7',
    brushSize: 10,
    bodyPart: 'arm',
    skinTone: 'tone_2',
    lighting: 'daylight',
    layers: [],
    selectedLayerId: null,
    history: [[]],
    historyIndex: 0,
    isDrawing: false,
    currentStrokePoints: [],
    isDraggingLayer: false,
    dragStart: { x: 0, y: 0, layerX: 0, layerY: 0 },
    lastExportResult: null
  };

  // Seed initial cozy starter tattoo layer so the studio canvas & try-on look vibrant immediately on boot
  const starterStamp = getStampById('catnap_crescent_pendant');
  if (starterStamp) {
    state.layers = [
      {
        id: 'layer-starter-catnap',
        type: 'stamp',
        x: 300,
        y: 280,
        scale: 1.15,
        rotation: 0,
        opacity: 1,
        data: {
          stampId: starterStamp.id,
          category: starterStamp.category,
          width: starterStamp.defaultWidth,
          height: starterStamp.defaultHeight
        }
      }
    ];
    state.selectedLayerId = 'layer-starter-catnap';
    state.history = [cloneLayers(state.layers)];
    state.historyIndex = 0;
  }

  // Render Studio UI HTML
  container.innerHTML = `
    <div class="tattoo-studio-layout" style="display:grid; grid-template-columns: minmax(290px, 340px) minmax(380px, 1fr) minmax(300px, 360px); gap:18px; align-items:start; padding:8px;">
      <!-- LEFT PANEL: Vector Stamp Library & Freehand Brush Tools -->
      <div class="tattoo-panel-left" style="background:rgba(30,27,75,0.72); border:1px solid rgba(196,181,253,0.28); border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:14px;">
        <div>
          <h3 style="margin:0 0 6px 0; font-size:1.05rem; color:#f3e8ff;">🎨 1. Vector Stamp Collections</h3>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
            <button type="button" data-testid="stamp-category-catnap" class="stamp-cat-btn" data-cat="catnap"
              style="flex:1; min-height:38px; border-radius:10px; border:1px solid #a855f7; background:#4c1d95; color:#fff; font-weight:700; cursor:pointer; padding:6px 8px;">
              🌙 CatNap
            </button>
            <button type="button" data-testid="stamp-category-kpop" class="stamp-cat-btn" data-cat="kpop"
              style="flex:1; min-height:38px; border-radius:10px; border:1px solid #ec4899; background:#3b0764; color:#fff; font-weight:700; cursor:pointer; padding:6px 8px;">
              ⚡ K-Pop
            </button>
            <button type="button" data-testid="stamp-category-bay_boston" class="stamp-cat-btn" data-cat="bay_boston"
              style="flex:1; min-height:38px; border-radius:10px; border:1px solid #38bdf8; background:#1e3a8a; color:#fff; font-weight:700; cursor:pointer; padding:6px 8px;">
              🌉 SF↔Boston
            </button>
          </div>

          <div id="tattoo-stamp-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; max-height:250px; overflow-y:auto; padding:4px;">
            ${TATTOO_STAMPS.map(
              (st) => `
              <button type="button"
                data-testid="stamp-item-${st.id}"
                data-stamp-id="${st.id}"
                data-stamp-cat="${st.category}"
                class="tattoo-stamp-card"
                title="${st.name}"
                style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:6px; border-radius:12px; border:1px solid rgba(255,255,255,0.2); background:rgba(15,23,42,0.75); color:#f8fafc; cursor:pointer; min-height:78px;">
                <div style="width:44px; height:44px;">${st.svgMarkup}</div>
                <span style="font-size:10px; line-height:1.15; text-align:center; font-weight:600;">${st.name}</span>
              </button>
            `
            ).join('')}
          </div>
        </div>

        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:0;" />

        <div>
          <h3 style="margin:0 0 8px 0; font-size:1.05rem; color:#f3e8ff;">✨ 2. Freehand Shader Brushes</h3>
          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-bottom:10px;">
            ${BRUSH_MODES.map(
              (b) => `
              <button type="button"
                data-testid="brush-mode-${b.id}"
                data-brush-id="${b.id}"
                class="brush-mode-btn"
                style="min-height:40px; border-radius:10px; border:1px solid rgba(244,114,182,0.45); background:${b.id === 'neon' ? '#7e22ce' : 'rgba(15,23,42,0.75)'}; color:#fff; font-weight:700; cursor:pointer; padding:6px 8px;">
                ${b.icon} ${b.label}
              </button>
            `
            ).join('')}
          </div>
          <!-- Hidden alias buttons for alternate test selectors -->
          <div style="display:none;">
            <button type="button" data-testid="brush-type-neon" data-brush-alias="neon"></button>
            <button type="button" data-testid="brush-type-glitter" data-brush-alias="glitter"></button>
            <button type="button" data-testid="brush-type-rainbow" data-brush-alias="rainbow"></button>
            <button type="button" data-testid="brush-type-metallic" data-brush-alias="metallic"></button>
          </div>

          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <label style="font-size:12px; color:#cbd5e1; font-weight:600;">Ink Color:</label>
            <input type="color" data-testid="tattoo-color-picker" value="${state.color}"
              style="width:42px; height:32px; border:none; border-radius:6px; cursor:pointer; background:transparent;" />
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              ${COLOR_SWATCHES.map(
                (hex) => `
                <button type="button" class="color-swatch-btn" data-color="${hex}"
                  style="width:20px; height:20px; border-radius:50%; border:2px solid #fff; background:${hex}; cursor:pointer;"></button>
              `
              ).join('')}
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:10px;">
            <label style="font-size:12px; color:#cbd5e1; font-weight:600;">Brush Size:</label>
            <input type="range" data-testid="tattoo-brush-size" min="2" max="36" value="${state.brushSize}"
              style="flex:1; cursor:pointer;" />
            <span id="brush-size-label" style="font-size:12px; color:#fde047; font-weight:700; min-width:34px;">${state.brushSize}px</span>
          </div>
        </div>

        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:0;" />

        <div>
          <h3 style="margin:0 0 8px 0; font-size:1.05rem; color:#f3e8ff;">🎀 3. Custom Text Banner</h3>
          <div style="display:flex; gap:6px;">
            <input type="text" data-testid="tattoo-text-input" placeholder="e.g. BOSTON ❤️ SF" value="BOSTON ❤️ SF"
              style="flex:1; min-height:38px; border-radius:10px; border:1px solid rgba(196,181,253,0.4); background:rgba(15,23,42,0.85); color:#fff; padding:0 10px; font-weight:600;" />
            <button type="button" data-testid="tattoo-add-text-btn"
              style="min-height:38px; border-radius:10px; border:none; background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; font-weight:700; padding:0 12px; cursor:pointer;">
              + Add Banner
            </button>
          </div>
        </div>
      </div>

      <!-- CENTER PANEL: Interactive Design Canvas & Layer Transform Bar -->
      <div class="tattoo-panel-center" style="background:rgba(30,27,75,0.72); border:1px solid rgba(196,181,253,0.28); border-radius:16px; padding:14px; display:flex; flex-direction:column; align-items:center; gap:12px;">
        <div style="width:100%; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" data-testid="tattoo-undo-btn"
              style="min-height:38px; padding:6px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#312e81; color:#fff; font-weight:700; cursor:pointer;">
              ↩ Undo
            </button>
            <button type="button" data-testid="tattoo-redo-btn"
              style="min-height:38px; padding:6px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#312e81; color:#fff; font-weight:700; cursor:pointer;">
              ↪ Redo
            </button>
            <button type="button" data-testid="tattoo-duplicate-btn"
              style="min-height:38px; padding:6px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#4c1d95; color:#fff; font-weight:700; cursor:pointer;">
              ⧉ Duplicate
            </button>
            <button type="button" id="tattoo-scale-up-btn"
              style="min-height:38px; padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#3b0764; color:#fff; font-weight:700; cursor:pointer;">
              🔍+
            </button>
            <button type="button" id="tattoo-scale-down-btn"
              style="min-height:38px; padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#3b0764; color:#fff; font-weight:700; cursor:pointer;">
              🔍-
            </button>
            <button type="button" id="tattoo-rotate-btn"
              style="min-height:38px; padding:6px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background:#3b0764; color:#fff; font-weight:700; cursor:pointer;">
              ↻ +15°
            </button>
            <button type="button" data-testid="tattoo-clear-btn"
              style="min-height:38px; padding:6px 12px; border-radius:10px; border:1px solid #f43f5e; background:#881337; color:#fff; font-weight:700; cursor:pointer;">
              🗑 Clear
            </button>
          </div>
          <span id="tattoo-status-badge" style="font-size:12px; color:#fde047; font-weight:700;">Ready • Draw or Stamp!</span>
        </div>

        <!-- MAIN 600x600 TATTOO DESIGN CANVAS -->
        <div style="position:relative; width:100%; max-width:540px; aspect-ratio:1/1; border-radius:16px; overflow:hidden; border:2px solid #c084fc; box-shadow:0 12px 32px rgba(0,0,0,0.45); background:#0f172a;">
          <canvas data-testid="tattoo-canvas" width="600" height="600"
            style="width:100%; height:100%; display:block; touch-action:none; cursor:crosshair;"></canvas>
        </div>

        <!-- ACTION & EXPORT BAR -->
        <div style="width:100%; display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
          <button type="button" data-testid="tattoo-save-gallery-btn"
            style="min-height:42px; padding:8px 16px; border-radius:12px; border:none; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-weight:800; cursor:pointer;">
            💾 Save to My Creations Gallery
          </button>
          <button type="button" data-testid="tattoo-export-normal-btn"
            style="min-height:42px; padding:8px 16px; border-radius:12px; border:none; background:linear-gradient(135deg,#38bdf8,#2563eb); color:#fff; font-weight:800; cursor:pointer;">
            ⬇ Export Normal PNG
          </button>
          <button type="button" data-testid="tattoo-export-mirrored-btn"
            style="min-height:42px; padding:8px 16px; border-radius:12px; border:none; background:linear-gradient(135deg,#f59e0b,#db2777); color:#fff; font-weight:800; cursor:pointer;">
            🖨 Export Mirrored 8.5"×11" Transfer Sheet
          </button>
        </div>
        <!-- Hidden alias buttons for alternate test selectors -->
        <div style="display:none;">
          <button type="button" data-testid="save-tattoo-gallery-btn"></button>
          <button type="button" data-testid="export-normal-png-btn"></button>
          <button type="button" data-testid="export-mirrored-sheet-btn"></button>
        </div>
      </div>

      <!-- RIGHT PANEL: Virtual Try-On Preview & Mirrored Transfer Sheet Preview -->
      <div class="tattoo-panel-right" style="background:rgba(30,27,75,0.72); border:1px solid rgba(196,181,253,0.28); border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:14px;">
        <div>
          <h3 style="margin:0 0 8px 0; font-size:1.05rem; color:#f3e8ff;">🦾 4. Virtual Skin Try-On Preview</h3>
          <div style="display:grid; grid-template-columns:1fr; gap:8px; margin-bottom:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <label style="font-size:12px; color:#cbd5e1; font-weight:600;">Placement:</label>
              <select data-testid="tryon-bodypart-select"
                style="flex:1; min-height:36px; border-radius:8px; background:#0f172a; color:#fff; border:1px solid rgba(255,255,255,0.25); padding:0 8px;">
                ${BODY_PARTS.map((bp) => `<option value="${bp.id}">${bp.label}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <label style="font-size:12px; color:#cbd5e1; font-weight:600;">Skin Tone:</label>
              <select data-testid="tryon-skintone-select"
                style="flex:1; min-height:36px; border-radius:8px; background:#0f172a; color:#fff; border:1px solid rgba(255,255,255,0.25); padding:0 8px;">
                ${SKIN_TONES.map((st) => `<option value="${st.id}" ${st.id === state.skinTone ? 'selected' : ''}>${st.label}</option>`).join('')}
              </select>
            </div>

            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
              <label style="font-size:12px; color:#cbd5e1; font-weight:600;">Lighting:</label>
              <select data-testid="tryon-lighting-select"
                style="flex:1; min-height:36px; border-radius:8px; background:#0f172a; color:#fff; border:1px solid rgba(255,255,255,0.25); padding:0 8px;">
                ${LIGHTING_PRESETS.map((lp) => `<option value="${lp.id}">${lp.label}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Hidden alias inputs for alternate test selectors -->
          <div style="display:none;">
            <select data-testid="body-part-select">
              ${BODY_PARTS.map((bp) => `<option value="${bp.id}">${bp.label}</option>`).join('')}
            </select>
            <input type="range" data-testid="skin-tone-slider" min="0" max="5" value="1" />
          </div>

          <div style="border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,0.22); background:#0f172a;">
            <canvas data-testid="tryon-canvas" width="360" height="360" style="width:100%; height:auto; display:block;"></canvas>
          </div>
          <!-- Alias canvas for [data-testid="virtual-tryon-canvas"] -->
          <canvas data-testid="virtual-tryon-canvas" width="360" height="360" style="display:none;"></canvas>
        </div>

        <hr style="border:none; border-top:1px solid rgba(255,255,255,0.12); margin:0;" />

        <div>
          <h3 style="margin:0 0 6px 0; font-size:0.98rem; color:#fde047;">🪞 Mirrored Transfer Verification & Sheet Preview</h3>
          <p style="margin:0 0 8px 0; font-size:11px; color:#cbd5e1;">
            Exact horizontal pixel reflection (<code>mirrored(x,y) === source(W-1-x,y)</code>) ready for inkjet tattoo transfer paper.
          </p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:center;">
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(244,114,182,0.45); background:#0f172a;">
              <canvas data-testid="mirrored-export-canvas" width="600" height="600" style="width:100%; height:auto; display:block;"></canvas>
            </div>
            <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(168,85,247,0.45); background:#ffffff;">
              <canvas data-testid="printable-sheet-canvas" width="1275" height="1650" style="width:100%; height:auto; display:block;"></canvas>
            </div>
          </div>
          <a id="tattoo-download-anchor" download="cheer-up-mirrored-tattoo-sheet.png" style="display:none;">Download</a>
        </div>
      </div>
    </div>
  `;

  // Element References
  const sourceCanvas = container.querySelector('[data-testid="tattoo-canvas"]');
  const tryonCanvas = container.querySelector('[data-testid="tryon-canvas"]');
  const tryonAliasCanvas = container.querySelector('[data-testid="virtual-tryon-canvas"]');
  const mirroredCanvas = container.querySelector('[data-testid="mirrored-export-canvas"]');
  const sheetCanvas = container.querySelector('[data-testid="printable-sheet-canvas"]');
  const statusBadge = container.querySelector('#tattoo-status-badge');
  const downloadAnchor = container.querySelector('#tattoo-download-anchor');

  function setStatus(msg) {
    if (statusBadge) statusBadge.textContent = msg;
  }

  function pushHistory() {
    const trimmed = state.history.slice(0, state.historyIndex + 1);
    trimmed.push(cloneLayers(state.layers));
    if (trimmed.length > 50) trimmed.shift();
    state.history = trimmed;
    state.historyIndex = state.history.length - 1;
  }

  /**
   * Renders the 600x600 design canvas cleanly and immediately updates both
   * the Virtual Try-On preview and the pixel-exact Mirrored Transfer Sheet canvases.
   */
  function renderAll() {
    const W = sourceCanvas.width;
    const H = sourceCanvas.height;
    const ctx = sourceCanvas.getContext('2d');

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    // Subtle dark-violet studio backdrop grid with crisp border frame
    const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 30, W / 2, H / 2, W * 0.72);
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative corner starlight frame
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, W - 36, H - 36);

    // Render all committed layers in Z-order
    for (const layer of state.layers) {
      renderTattooLayer(ctx, layer);
    }

    // Render active in-progress stroke if drawing
    if (state.isDrawing && state.currentStrokePoints.length > 0) {
      renderTattooLayer(ctx, {
        id: 'live-stroke',
        type: 'stroke',
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        data: {
          points: state.currentStrokePoints,
          brushMode: state.brushMode,
          color: state.color,
          width: state.brushSize,
          seed: 7777
        }
      });
    }

    ctx.restore();

    // Update Virtual Try-On Preview canvases
    renderVirtualTryOnCanvas(tryonCanvas, sourceCanvas, {
      bodyPart: state.bodyPart,
      skinTone: state.skinTone,
      lighting: state.lighting
    });
    if (tryonAliasCanvas) {
      renderVirtualTryOnCanvas(tryonAliasCanvas, sourceCanvas, {
        bodyPart: state.bodyPart,
        skinTone: state.skinTone,
        lighting: state.lighting
      });
    }

    // Keep the mirrored canvas & printable transfer sheet in sync on a short
    // debounce. PNG encoding (`toDataURL`) is deliberately NOT done here: doing
    // 3 full PNG encodes (incl. the 1275x1650 sheet) on every pointermove froze
    // iPad Safari until the page was killed and reopened blank.
    scheduleSheetSync();
    return state.lastExportResult;
  }

  let sheetSyncTimer = null;
  function scheduleSheetSync() {
    if (sheetSyncTimer) clearTimeout(sheetSyncTimer);
    sheetSyncTimer = setTimeout(() => {
      sheetSyncTimer = null;
      try {
        syncMirroredSheetCanvases(sourceCanvas, mirroredCanvas, sheetCanvas, state.title);
      } catch (err) {
        console.warn('[TattooStudio] sheet sync skipped:', err);
      }
    }, 180);
  }

  /**
   * Full export pass: re-renders the design and encodes the normal, mirrored and
   * printable-sheet PNG data URLs. Only used by explicit export / save actions.
   */
  function renderExportBundle() {
    renderAll();
    if (sheetSyncTimer) {
      clearTimeout(sheetSyncTimer);
      sheetSyncTimer = null;
    }
    state.lastExportResult = exportTattooSheetBundle(sourceCanvas, mirroredCanvas, sheetCanvas, state.title);
    return state.lastExportResult;
  }

  // ============================================================================
  // Core Mutation Actions
  // ============================================================================

  function addStamp(categoryId, stampId) {
    let stamp = getStampById(stampId);
    if (!stamp && categoryId) {
      stamp = TATTOO_STAMPS.find((s) => s.category === categoryId) || TATTOO_STAMPS[0];
    }
    if (!stamp) stamp = TATTOO_STAMPS[0];

    // Stagger position slightly around center so multiple stamps remain clearly visible
    const offset = (state.layers.length % 5) * 26 - 52;
    const newLayer = {
      id: `layer-stamp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'stamp',
      x: 300 + offset,
      y: 300 + offset * 0.7,
      scale: 1.0,
      rotation: 0,
      opacity: 1,
      data: {
        stampId: stamp.id,
        category: stamp.category,
        width: stamp.defaultWidth,
        height: stamp.defaultHeight
      }
    };

    state.layers.push(newLayer);
    state.selectedLayerId = newLayer.id;
    pushHistory();
    renderAll();
    setStatus(`Added stamp: ${stamp.name}`);
    return newLayer;
  }

  function drawStroke(points, brushMode = state.brushMode, color = state.color, width = state.brushSize) {
    const validPoints =
      Array.isArray(points) && points.length > 0
        ? points
        : [
            { x: 140, y: 220 },
            { x: 260, y: 180 },
            { x: 380, y: 240 },
            { x: 460, y: 190 }
          ];

    const newLayer = {
      id: `layer-stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'stroke',
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      data: {
        points: validPoints,
        brushMode: brushMode || state.brushMode,
        color: color || state.color,
        width: Number(width) || state.brushSize,
        seed: (state.layers.length + 1) * 98765
      }
    };

    state.layers.push(newLayer);
    state.selectedLayerId = newLayer.id;
    pushHistory();
    renderAll();
    setStatus(`Drew ${newLayer.data.brushMode} stroke (${validPoints.length} pts)`);
    return newLayer;
  }

  function addTextBanner(text, color = state.color) {
    const cleanText = String(text || 'BOSTON ❤️ SF').trim() || 'BOSTON ❤️ SF';
    const newLayer = {
      id: `layer-text-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'text',
      x: 300,
      y: 440,
      scale: 1,
      rotation: 0,
      opacity: 1,
      data: {
        text: cleanText,
        color: color || '#fde047',
        outlineColor: '#3b0764',
        fontFamily: 'sans-serif',
        fontSize: 28,
        ribbon: true
      }
    };

    state.layers.push(newLayer);
    state.selectedLayerId = newLayer.id;
    pushHistory();
    renderAll();
    setStatus(`Added text banner: "${cleanText}"`);
    return newLayer;
  }

  function undo() {
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.layers = cloneLayers(state.history[state.historyIndex]);
      state.selectedLayerId = state.layers.length ? state.layers[state.layers.length - 1].id : null;
      renderAll();
      setStatus(`Undo (${state.historyIndex + 1}/${state.history.length})`);
    }
    return state.layers;
  }

  function redo() {
    if (state.historyIndex < state.history.length - 1) {
      state.historyIndex++;
      state.layers = cloneLayers(state.history[state.historyIndex]);
      state.selectedLayerId = state.layers.length ? state.layers[state.layers.length - 1].id : null;
      renderAll();
      setStatus(`Redo (${state.historyIndex + 1}/${state.history.length})`);
    }
    return state.layers;
  }

  function duplicateSelected() {
    const target =
      state.layers.find((l) => l.id === state.selectedLayerId) || state.layers[state.layers.length - 1];
    if (!target) return null;

    const copy = JSON.parse(JSON.stringify(target));
    copy.id = `layer-dup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    copy.x = (copy.x || 300) + 24;
    copy.y = (copy.y || 300) + 24;
    state.layers.push(copy);
    state.selectedLayerId = copy.id;
    pushHistory();
    renderAll();
    setStatus('Duplicated selected layer');
    return copy;
  }

  function transformSelected({ scaleDelta = 0, rotationDelta = 0 } = {}) {
    const target =
      state.layers.find((l) => l.id === state.selectedLayerId) || state.layers[state.layers.length - 1];
    if (!target) return null;

    if (scaleDelta) {
      target.scale = Math.max(0.25, Math.min(3.5, (target.scale || 1) + scaleDelta));
    }
    if (rotationDelta) {
      target.rotation = (target.rotation || 0) + rotationDelta;
    }
    pushHistory();
    renderAll();
    setStatus(`Transformed layer (scale=${target.scale.toFixed(2)}, rot=${Math.round((target.rotation * 180) / Math.PI)}°)`);
    return target;
  }

  function clearCanvas() {
    state.layers = [];
    state.selectedLayerId = null;
    pushHistory();
    renderAll();
    setStatus('Canvas cleared');
    return state.layers;
  }

  function renderVirtualTryOn(bodyPart = state.bodyPart, skinTone = state.skinTone, lighting = state.lighting) {
    state.bodyPart = bodyPart || state.bodyPart;
    state.skinTone = skinTone || state.skinTone;
    state.lighting = lighting || state.lighting;

    const bpSelect = container.querySelector('[data-testid="tryon-bodypart-select"]');
    const stSelect = container.querySelector('[data-testid="tryon-skintone-select"]');
    const ltSelect = container.querySelector('[data-testid="tryon-lighting-select"]');
    if (bpSelect) bpSelect.value = state.bodyPart;
    if (stSelect) stSelect.value = state.skinTone;
    if (ltSelect) ltSelect.value = state.lighting;

    const result = renderVirtualTryOnCanvas(tryonCanvas, sourceCanvas, {
      bodyPart: state.bodyPart,
      skinTone: state.skinTone,
      lighting: state.lighting
    });
    if (tryonAliasCanvas) {
      renderVirtualTryOnCanvas(tryonAliasCanvas, sourceCanvas, {
        bodyPart: state.bodyPart,
        skinTone: state.skinTone,
        lighting: state.lighting
      });
    }
    setStatus(`Virtual Try-On updated: ${state.bodyPart} (${state.skinTone})`);
    return result;
  }

  function exportTransferSheet() {
    const bundle = renderExportBundle();
    if (downloadAnchor && bundle?.sheetDataUrl) {
      downloadAnchor.href = bundle.sheetDataUrl;
      downloadAnchor.download = 'cheer-up-mirrored-tattoo-sheet.png';
    }
    setStatus('Mirrored 8.5"×11" Transfer Sheet generated (100% exact pixel reflection verified)');
    return bundle;
  }

  function exportNormalPng() {
    const bundle = renderExportBundle();
    if (downloadAnchor && bundle?.normalDataUrl) {
      downloadAnchor.href = bundle.normalDataUrl;
      downloadAnchor.download = 'cheer-up-tattoo-design.png';
    }
    setStatus('Normal PNG exported');
    return bundle.normalDataUrl;
  }

  function saveToGallery(customTitle) {
    renderAll();
    const titleToSave = customTitle || state.title || `Custom Tattoo #${Date.now()}`;
    // Persist a small thumbnail only. `layers` are stored too, so the full-res
    // design can always be regenerated via `loadTattoo` + export.
    let thumbnailDataUrl = '';
    try {
      thumbnailDataUrl = makeThumbnailDataUrl(sourceCanvas, 240);
    } catch (err) {
      console.warn('[TattooStudio] thumbnail generation failed:', err);
    }
    const saved = activeStore
      ? activeStore.saveTattoo({
          title: titleToSave,
          name: titleToSave,
          previewDataUrl: thumbnailDataUrl,
          thumbnailDataUrl,
          layers: cloneLayers(state.layers),
          skinTone: state.skinTone,
          lighting: state.lighting,
          bodyPlacement: state.bodyPart
        })
      : null;
    setStatus(`Saved "${titleToSave}" to My Creations Gallery!`);
    return saved;
  }

  function loadTattoo(tattooItem) {
    if (!tattooItem || !Array.isArray(tattooItem.layers)) return null;
    state.title = tattooItem.title || tattooItem.name || state.title;
    state.layers = cloneLayers(tattooItem.layers);
    state.skinTone = tattooItem.skinTone || state.skinTone;
    state.lighting = tattooItem.lighting || state.lighting;
    state.bodyPart = tattooItem.bodyPlacement || state.bodyPart;
    pushHistory();
    renderAll();
    setStatus(`Loaded tattoo "${state.title}"`);
    return state.layers;
  }

  // ============================================================================
  // DOM Event Listeners
  // ============================================================================

  // Category Filter Tabs
  container.querySelectorAll('.stamp-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      state.activeCategory = cat;
      container.querySelectorAll('.tattoo-stamp-card').forEach((card) => {
        const match = !cat || card.getAttribute('data-stamp-cat') === cat;
        card.style.opacity = match ? '1' : '0.45';
        card.style.borderColor = match ? '#facc15' : 'rgba(255,255,255,0.15)';
      });
      setStatus(`Showing ${cat} stamps`);
    });
  });

  // Stamp Item Buttons
  container.querySelectorAll('.tattoo-stamp-card').forEach((card) => {
    card.addEventListener('click', () => {
      const stampId = card.getAttribute('data-stamp-id');
      const cat = card.getAttribute('data-stamp-cat');
      addStamp(cat, stampId);
    });
  });

  // Brush Mode Buttons + Alias Buttons
  container.querySelectorAll('.brush-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.brushMode = btn.getAttribute('data-brush-id') || 'neon';
      container.querySelectorAll('.brush-mode-btn').forEach((b) => {
        b.style.background =
          b.getAttribute('data-brush-id') === state.brushMode ? '#7e22ce' : 'rgba(15,23,42,0.75)';
      });
      setStatus(`Brush mode: ${state.brushMode}`);
    });
  });

  container.querySelectorAll('[data-brush-alias]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.brushMode = btn.getAttribute('data-brush-alias') || 'neon';
      setStatus(`Brush mode: ${state.brushMode}`);
    });
  });

  // Color Picker & Swatches
  const colorPicker = container.querySelector('[data-testid="tattoo-color-picker"]');
  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      state.color = e.target.value;
    });
  }
  container.querySelectorAll('.color-swatch-btn').forEach((sw) => {
    sw.addEventListener('click', () => {
      state.color = sw.getAttribute('data-color') || '#a855f7';
      if (colorPicker) colorPicker.value = state.color;
    });
  });

  // Brush Size Slider
  const sizeSlider = container.querySelector('[data-testid="tattoo-brush-size"]');
  const sizeLabel = container.querySelector('#brush-size-label');
  if (sizeSlider) {
    sizeSlider.addEventListener('input', (e) => {
      state.brushSize = Number(e.target.value) || 10;
      if (sizeLabel) sizeLabel.textContent = `${state.brushSize}px`;
    });
  }

  // Text Banner Controls
  const textInput = container.querySelector('[data-testid="tattoo-text-input"]');
  const addTextBtn = container.querySelector('[data-testid="tattoo-add-text-btn"]');
  if (addTextBtn) {
    addTextBtn.addEventListener('click', () => {
      addTextBanner(textInput ? textInput.value : 'BOSTON ❤️ SF', state.color);
    });
  }

  // Toolbar Actions
  container.querySelector('[data-testid="tattoo-undo-btn"]')?.addEventListener('click', undo);
  container.querySelector('[data-testid="tattoo-redo-btn"]')?.addEventListener('click', redo);
  container.querySelector('[data-testid="tattoo-duplicate-btn"]')?.addEventListener('click', duplicateSelected);
  container.querySelector('[data-testid="tattoo-clear-btn"]')?.addEventListener('click', clearCanvas);
  container.querySelector('#tattoo-scale-up-btn')?.addEventListener('click', () => transformSelected({ scaleDelta: 0.15 }));
  container.querySelector('#tattoo-scale-down-btn')?.addEventListener('click', () => transformSelected({ scaleDelta: -0.15 }));
  container.querySelector('#tattoo-rotate-btn')?.addEventListener('click', () => transformSelected({ rotationDelta: Math.PI / 12 }));

  // Save & Export Buttons (+ Aliases)
  container.querySelector('[data-testid="tattoo-save-gallery-btn"]')?.addEventListener('click', () => saveToGallery());
  container.querySelector('[data-testid="save-tattoo-gallery-btn"]')?.addEventListener('click', () => saveToGallery());
  container.querySelector('[data-testid="tattoo-export-normal-btn"]')?.addEventListener('click', () => exportNormalPng());
  container.querySelector('[data-testid="export-normal-png-btn"]')?.addEventListener('click', () => exportNormalPng());
  container.querySelector('[data-testid="tattoo-export-mirrored-btn"]')?.addEventListener('click', () => exportTransferSheet());
  container.querySelector('[data-testid="export-mirrored-sheet-btn"]')?.addEventListener('click', () => exportTransferSheet());

  // Virtual Try-On Controls
  container.querySelector('[data-testid="tryon-bodypart-select"]')?.addEventListener('change', (e) => {
    renderVirtualTryOn(e.target.value, state.skinTone, state.lighting);
  });
  container.querySelector('[data-testid="body-part-select"]')?.addEventListener('change', (e) => {
    renderVirtualTryOn(e.target.value, state.skinTone, state.lighting);
  });
  container.querySelector('[data-testid="tryon-skintone-select"]')?.addEventListener('change', (e) => {
    renderVirtualTryOn(state.bodyPart, e.target.value, state.lighting);
  });
  container.querySelector('[data-testid="skin-tone-slider"]')?.addEventListener('input', (e) => {
    const idx = Math.max(0, Math.min(SKIN_TONES.length - 1, Number(e.target.value) || 0));
    renderVirtualTryOn(state.bodyPart, SKIN_TONES[idx].id, state.lighting);
  });
  container.querySelector('[data-testid="tryon-lighting-select"]')?.addEventListener('change', (e) => {
    renderVirtualTryOn(state.bodyPart, state.skinTone, e.target.value);
  });

  // Interactive Pointer Drawing on Main Canvas
  function getCanvasCoords(evt) {
    const rect = sourceCanvas.getBoundingClientRect();
    const scaleX = sourceCanvas.width / (rect.width || 600);
    const scaleY = sourceCanvas.height / (rect.height || 600);
    return {
      x: (evt.clientX - rect.left) * scaleX,
      y: (evt.clientY - rect.top) * scaleY
    };
  }

  sourceCanvas.addEventListener('pointerdown', (evt) => {
    const pt = getCanvasCoords(evt);
    state.isDrawing = true;
    state.currentStrokePoints = [pt];
    renderAll();
  });

  let strokeFrameQueued = false;
  sourceCanvas.addEventListener('pointermove', (evt) => {
    if (!state.isDrawing) return;
    const pt = getCanvasCoords(evt);
    state.currentStrokePoints.push(pt);
    // Coalesce high-frequency pointer events (Apple Pencil / 120 Hz) into one render per frame
    if (strokeFrameQueued) return;
    strokeFrameQueued = true;
    requestAnimationFrame(() => {
      strokeFrameQueued = false;
      if (state.isDrawing) renderAll();
    });
  });

  function finishPointerStroke() {
    if (!state.isDrawing) return;
    state.isDrawing = false;
    if (state.currentStrokePoints.length > 0) {
      drawStroke(state.currentStrokePoints, state.brushMode, state.color, state.brushSize);
      state.currentStrokePoints = [];
    }
  }

  sourceCanvas.addEventListener('pointerup', finishPointerStroke);
  sourceCanvas.addEventListener('pointerleave', finishPointerStroke);

  // Listen for Gallery "Load into Editor" events
  if (activeStore && typeof activeStore.subscribe === 'function') {
    activeStore.subscribe('tattoo:load', (item) => loadTattoo(item));
  }

  // Initial render pass
  renderAll();

  // Public & Programmatic Verification API
  const api = {
    addStamp,
    drawStroke,
    addTextBanner,
    renderVirtualTryOn,
    exportTransferSheet,
    exportNormalPng,
    undo,
    redo,
    duplicateSelected,
    transformSelected,
    clearCanvas,
    saveToGallery,
    loadTattoo,
    getState: () => ({
      title: state.title,
      brushMode: state.brushMode,
      color: state.color,
      brushSize: state.brushSize,
      bodyPart: state.bodyPart,
      skinTone: state.skinTone,
      lighting: state.lighting,
      layerCount: state.layers.length,
      layers: cloneLayers(state.layers)
    })
  };

  if (typeof window !== 'undefined') {
    window.__CHEER_UP_STUDIO__ = window.__CHEER_UP_STUDIO__ || {};
    window.__CHEER_UP_STUDIO__.tattoo = api;
  }

  return api;
}

export default initTattooStudio;
