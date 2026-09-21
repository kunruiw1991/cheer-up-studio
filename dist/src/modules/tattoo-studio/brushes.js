/**
 * @fileoverview Freehand Brush Shaders, Text Banner Renderer & Unified Layer Compositor
 * for Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio).
 *
 * Implements 4 genuine multi-pass procedural HTML5 2D Canvas shaders:
 *   - 'neon'     : 3-pass outer bloom + saturated core + inner white-hot filament
 *   - 'glitter'  : Shimmering ink base + deterministic PRNG 4-point star & diamond glints along arc length
 *   - 'rainbow'  : Continuous arc-length HSL spectrum progression with round joins
 *   - 'metallic' : Multi-ribbon foil shader with base shadow, metallic luster, and offset specular sheen
 */

import { getStampById, drawStarPath } from './stamps.js';

export const BRUSH_MODES = [
  { id: 'neon', label: 'Neon Glow', icon: '⚡', description: '3-pass cyber neon bloom with glowing core' },
  { id: 'glitter', label: 'Glitter Sparkle', icon: '✨', description: 'Starlight ink with 4-point diamond glints' },
  { id: 'rainbow', label: 'Rainbow Arc', icon: '🌈', description: 'Continuous full-spectrum prismatic ribbon' },
  { id: 'metallic', label: 'Metallic Foil', icon: '👑', description: 'Gold, silver & rose-gold specular foil ink' }
];

export const COLOR_SWATCHES = [
  '#a855f7', // CatNap Royal Purple
  '#f472b6', // HUNTR/X Cyber Pink
  '#22d3ee', // Zoey Sonic Cyan
  '#facc15', // Saja Boys Golden Yellow
  '#fb7185', // Rumi Crimson Rose
  '#34d399', // Hoppy Mint Emerald
  '#ea580c', // Golden Gate International Orange
  '#f8fafc'  // Starlight White
];

/**
 * Deterministic PRNG (Mulberry32) so glitter sparkles stay rock-steady across re-renders & exports.
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function tracePolyline(ctx, points) {
  if (!points || points.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.5, points[0].y + 0.5);
  }
}

/**
 * Renders a freehand stroke using one of the 4 genuine multi-pass shaders.
 */
export function renderBrushStroke(ctx, strokeData) {
  const { points = [], brushMode = 'neon', color = '#a855f7', width = 10, seed = 1337 } = strokeData;
  if (!points || points.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const mode = String(brushMode || 'neon').toLowerCase();

  if (mode.includes('neon')) {
    // Pass 1: Wide outer neon bloom
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 2.1;
    ctx.globalAlpha = 0.32;
    ctx.shadowColor = color;
    ctx.shadowBlur = width * 2.2;
    tracePolyline(ctx, points);
    ctx.stroke();
    ctx.restore();

    // Pass 2: Mid saturated neon tube
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.92;
    tracePolyline(ctx, points);
    ctx.stroke();
    ctx.restore();

    // Pass 3: White-hot filament core
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1.5, width * 0.35);
    ctx.globalAlpha = 0.95;
    tracePolyline(ctx, points);
    ctx.stroke();
    ctx.restore();
  } else if (mode.includes('glitter')) {
    // Base translucent velvet stroke
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.72;
    tracePolyline(ctx, points);
    ctx.stroke();
    ctx.restore();

    // Deterministic star & diamond sparkles along arc length
    const rng = mulberry32(seed || 4242);
    const sparkleColors = ['#ffffff', '#fef08a', '#f5d0fe', '#bae6fd', color];
    let distAccum = 0;
    const stepSpacing = Math.max(6, width * 0.75);

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (i > 0) {
        const prev = points[i - 1];
        distAccum += Math.hypot(p.x - prev.x, p.y - prev.y);
      }
      if (i === 0 || distAccum >= stepSpacing) {
        distAccum = 0;
        const jitterX = (rng() - 0.5) * width * 0.95;
        const jitterY = (rng() - 0.5) * width * 0.95;
        const radius = Math.max(3, width * (0.35 + rng() * 0.45));
        const col = sparkleColors[Math.floor(rng() * sparkleColors.length)];
        ctx.fillStyle = col;
        drawStarPath(ctx, p.x + jitterX, p.y + jitterY, 4, radius, radius * 0.35, rng() * Math.PI);
        ctx.fill();
      }
    }
  } else if (mode.includes('rainbow')) {
    let cumulativeDist = 0;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      const hue = (cumulativeDist * 1.15) % 360;
      cumulativeDist += segLen;

      ctx.strokeStyle = `hsl(${hue.toFixed(1)}, 95%, 60%)`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    if (points.length === 1) {
      ctx.fillStyle = 'hsl(300, 95%, 60%)';
      ctx.beginPath();
      ctx.arc(points[0].x, points[0].y, width * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // 'metallic' — Multi-ribbon metallic foil shader
    // Ribbon 1: Deep metallic shadow edge
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = width * 1.18;
    tracePolyline(ctx, points);
    ctx.stroke();

    // Ribbon 2: Primary metallic body (gold/rose/silver tinted by color)
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 0.92;
    tracePolyline(ctx, points);
    ctx.stroke();

    // Ribbon 3: Offset high-sheen specular foil highlight
    ctx.save();
    ctx.translate(-width * 0.14, -width * 0.14);
    ctx.strokeStyle = '#fef9c3';
    ctx.lineWidth = Math.max(1.5, width * 0.32);
    ctx.globalAlpha = 0.9;
    tracePolyline(ctx, points);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renders a customizable text banner layer with decorative ribbon scroll & outline.
 */
export function renderTextBanner(ctx, textData) {
  const {
    text = 'BOSTON ❤️ BAY AREA',
    color = '#fde047',
    outlineColor = '#3b0764',
    fontFamily = 'sans-serif',
    fontSize = 28,
    ribbon = true
  } = textData;

  ctx.save();
  ctx.font = `900 ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const metrics = ctx.measureText(text);
  const padX = 28;
  const padY = 14;
  const boxW = Math.max(120, metrics.width + padX * 2);
  const boxH = fontSize + padY * 2;

  if (ribbon) {
    // Ribbon tails
    ctx.fillStyle = '#4c1d95';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-boxW / 2 - 18, -boxH / 2 + 8);
    ctx.lineTo(-boxW / 2 + 6, -boxH / 2 + 8);
    ctx.lineTo(-boxW / 2 + 6, boxH / 2 + 10);
    ctx.lineTo(-boxW / 2 - 18, boxH / 2 + 10);
    ctx.lineTo(-boxW / 2 - 9, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(boxW / 2 + 18, -boxH / 2 + 8);
    ctx.lineTo(boxW / 2 - 6, -boxH / 2 + 8);
    ctx.lineTo(boxW / 2 - 6, boxH / 2 + 10);
    ctx.lineTo(boxW / 2 + 18, boxH / 2 + 10);
    ctx.lineTo(boxW / 2 + 9, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Main banner plate
    const grad = ctx.createLinearGradient(-boxW / 2, -boxH / 2, boxW / 2, boxH / 2);
    grad.addColorStop(0, '#581c87');
    grad.addColorStop(0.5, '#7e22ce');
    grad.addColorStop(1, '#3b0764');
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();
  }

  // Crisp outlined tattoo lettering
  ctx.lineWidth = 5;
  ctx.strokeStyle = outlineColor;
  ctx.strokeText(text, 0, 1);
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

/**
 * Renders any TattooLayer ('stamp' | 'stroke' | 'text') onto ctx with full affine transforms.
 */
export function renderTattooLayer(ctx, layer) {
  if (!layer) return;
  ctx.save();
  ctx.globalAlpha = typeof layer.opacity === 'number' ? layer.opacity : 1;

  if (layer.type === 'stroke') {
    // Stroke points are stored in canvas space; apply optional layer offset/scale/rotation around layer center
    ctx.translate(layer.x || 0, layer.y || 0);
    ctx.rotate(layer.rotation || 0);
    ctx.scale((layer.scale || 1) * (layer.flipX ? -1 : 1), layer.scale || 1);
    ctx.translate(-(layer.x || 0), -(layer.y || 0));
    renderBrushStroke(ctx, layer.data || {});
  } else if (layer.type === 'stamp') {
    const stampDef = getStampById(layer.data?.stampId);
    const w = layer.data?.width || stampDef?.defaultWidth || 150;
    const h = layer.data?.height || stampDef?.defaultHeight || 150;
    ctx.translate(layer.x || 300, layer.y || 300);
    ctx.rotate(layer.rotation || 0);
    ctx.scale((layer.scale || 1) * (layer.flipX ? -1 : 1), layer.scale || 1);
    ctx.translate(-w / 2, -h / 2);
    if (stampDef && typeof stampDef.render === 'function') {
      stampDef.render(ctx, w, h, layer.data?.palette);
    }
  } else if (layer.type === 'text') {
    ctx.translate(layer.x || 300, layer.y || 300);
    ctx.rotate(layer.rotation || 0);
    ctx.scale((layer.scale || 1) * (layer.flipX ? -1 : 1), layer.scale || 1);
    renderTextBanner(ctx, layer.data || {});
  }

  ctx.restore();
}
