/**
 * @fileoverview Anatomical Virtual Try-On Preview Engine for Milestone M2 (R1).
 * Composites the live custom tattoo design onto a shaded 2.5D anatomical
 * Arm (Forearm), Wrist, or Hand with adjustable skin tones and studio lighting.
 */

export const BODY_PARTS = [
  { id: 'arm', label: 'Inner Forearm (Arm)' },
  { id: 'wrist', label: 'Inner Wrist & Bracelet' },
  { id: 'hand', label: 'Back of Hand' }
];

export const SKIN_TONES = [
  { id: 'tone_1', label: 'Warm Ivory', hex: '#fce3d4', shadow: '#d5a894', highlight: '#fff5ef' },
  { id: 'tone_2', label: 'Golden Peach', hex: '#f5cba7', shadow: '#c7956d', highlight: '#fdebd0' },
  { id: 'tone_3', label: 'Honey Tan', hex: '#e0ac69', shadow: '#ad7a3b', highlight: '#f5cba7' },
  { id: 'tone_4', label: 'Rich Caramel', hex: '#c68642', shadow: '#8e581d', highlight: '#e5b278' },
  { id: 'tone_5', label: 'Warm Bronze', hex: '#8d5524', shadow: '#5c3310', highlight: '#b87d4b' },
  { id: 'tone_6', label: 'Deep Espresso', hex: '#5c3317', shadow: '#361a08', highlight: '#8a5634' }
];

export const LIGHTING_PRESETS = [
  { id: 'daylight', label: 'Boston Daylight', bgTop: '#1e293b', bgBot: '#0f172a', rimLeft: 'rgba(255,255,255,0.28)', rimRight: 'rgba(148,163,184,0.18)' },
  { id: 'golden_hour', label: 'SF Golden Hour Sunset', bgTop: '#451a03', bgBot: '#1c1917', rimLeft: 'rgba(251,146,60,0.42)', rimRight: 'rgba(253,224,71,0.28)' },
  { id: 'kpop_stage', label: 'K-Pop Concert Neon', bgTop: '#3b0764', bgBot: '#090d16', rimLeft: 'rgba(244,114,182,0.48)', rimRight: 'rgba(34,211,238,0.45)' }
];

function drawLimbPath(ctx, bodyPart, W, H) {
  ctx.beginPath();
  if (bodyPart === 'wrist') {
    // Slender wrist widening gently toward palm & forearm
    ctx.moveTo(W * 0.28, H * 0.02);
    ctx.bezierCurveTo(W * 0.31, H * 0.35, W * 0.33, H * 0.68, W * 0.25, H * 0.98);
    ctx.lineTo(W * 0.75, H * 0.98);
    ctx.bezierCurveTo(W * 0.67, H * 0.68, W * 0.69, H * 0.35, W * 0.72, H * 0.02);
    ctx.closePath();
  } else if (bodyPart === 'hand') {
    // Back of hand with gentle fingers silhouette at top
    ctx.moveTo(W * 0.30, H * 0.98);
    ctx.lineTo(W * 0.22, H * 0.58);
    ctx.quadraticCurveTo(W * 0.15, H * 0.44, W * 0.22, H * 0.36);
    ctx.lineTo(W * 0.30, H * 0.48);
    ctx.lineTo(W * 0.33, H * 0.14);
    ctx.quadraticCurveTo(W * 0.37, H * 0.08, W * 0.41, H * 0.14);
    ctx.lineTo(W * 0.43, H * 0.42);
    ctx.lineTo(W * 0.47, H * 0.08);
    ctx.quadraticCurveTo(W * 0.51, H * 0.03, W * 0.55, H * 0.08);
    ctx.lineTo(W * 0.56, H * 0.42);
    ctx.lineTo(W * 0.61, H * 0.14);
    ctx.quadraticCurveTo(W * 0.65, H * 0.09, W * 0.68, H * 0.16);
    ctx.lineTo(W * 0.67, H * 0.46);
    ctx.lineTo(W * 0.74, H * 0.24);
    ctx.quadraticCurveTo(W * 0.78, H * 0.20, W * 0.79, H * 0.28);
    ctx.lineTo(W * 0.74, H * 0.66);
    ctx.lineTo(W * 0.70, H * 0.98);
    ctx.closePath();
  } else {
    // 'arm' — Inner Forearm tapering gracefully
    ctx.moveTo(W * 0.31, H * 0.02);
    ctx.bezierCurveTo(W * 0.24, H * 0.35, W * 0.22, H * 0.70, W * 0.27, H * 0.98);
    ctx.lineTo(W * 0.73, H * 0.98);
    ctx.bezierCurveTo(W * 0.78, H * 0.70, W * 0.76, H * 0.35, W * 0.69, H * 0.02);
    ctx.closePath();
  }
}

/**
 * Renders the Virtual Try-On preview onto targetCanvas from sourceTattooCanvas.
 */
export function renderVirtualTryOnCanvas(targetCanvas, sourceTattooCanvas, options = {}) {
  if (!targetCanvas || !sourceTattooCanvas) return null;

  const bodyPart = options.bodyPart || 'arm';
  const rawSkinToneId = options.skinTone || 'tone_2';
  const skinToneAliasMap = {
    light: 'tone_1',
    medium: 'tone_2',
    'warm-tan': 'tone_3',
    deep: 'tone_6',
  };
  const skinToneId = skinToneAliasMap[rawSkinToneId] || rawSkinToneId;
  const lightingId = options.lighting || 'daylight';

  const tone = SKIN_TONES.find((t) => t.id === skinToneId || t.hex === skinToneId) || SKIN_TONES[1];
  const light = LIGHTING_PRESETS.find((l) => l.id === lightingId) || LIGHTING_PRESETS[0];

  const W = targetCanvas.width || 360;
  const H = targetCanvas.height || 360;
  const ctx = targetCanvas.getContext('2d');

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  // 1. Ambient Studio Backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, light.bgTop);
  bgGrad.addColorStop(1, light.bgBot);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle decorative glow behind limb
  const aura = ctx.createRadialGradient(W * 0.5, H * 0.52, W * 0.06, W * 0.5, H * 0.52, W * 0.48);
  aura.addColorStop(0, light.rimLeft);
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, W, H);

  // 2. Limb Silhouette & Cylindrical Skin Shading
  ctx.save();
  drawLimbPath(ctx, bodyPart, W, H);
  ctx.clip();

  const skinGrad = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  skinGrad.addColorStop(0, tone.shadow);
  skinGrad.addColorStop(0.28, tone.hex);
  skinGrad.addColorStop(0.52, tone.highlight);
  skinGrad.addColorStop(0.76, tone.hex);
  skinGrad.addColorStop(1, tone.shadow);
  ctx.fillStyle = skinGrad;
  ctx.fillRect(0, 0, W, H);

  // Wrist charm bracelet detail when wrist is selected
  if (bodyPart === 'wrist') {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W * 0.26, H * 0.22);
    ctx.quadraticCurveTo(W * 0.50, H * 0.26, W * 0.74, H * 0.22);
    ctx.stroke();
  }

  // 3. Composite Live Tattoo Design onto Skin Surface
  const patchSize = bodyPart === 'hand' ? W * 0.40 : W * 0.46;
  const patchX = (W - patchSize) * 0.5;
  const patchY = bodyPart === 'hand' ? H * 0.50 : H * 0.34;

  // Pass A: Natural ink-in-skin adhesion
  ctx.save();
  ctx.globalAlpha = 0.90;
  ctx.drawImage(sourceTattooCanvas, patchX, patchY, patchSize, patchSize);
  ctx.restore();

  // Pass B: Cylindrical lighting specular sheen & rim light across skin + tattoo
  const sheen = ctx.createLinearGradient(W * 0.2, 0, W * 0.8, 0);
  sheen.addColorStop(0, light.rimLeft);
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.10)');
  sheen.addColorStop(1, light.rimRight);
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();

  // Limb crisp outline
  ctx.save();
  drawLimbPath(ctx, bodyPart, W, H);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // Label pill at bottom of preview
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.beginPath();
  ctx.roundRect(12, H - 34, W - 24, 24, 12);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Virtual Try-On: ${bodyPart.toUpperCase()} • ${tone.label} • ${light.label}`, W / 2, H - 22);

  ctx.restore();

  // Compute non-transparent pixel count for automated verification
  const imgData = ctx.getImageData(0, 0, W, H);
  let nonTransparentPixels = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] > 0) nonTransparentPixels++;
  }

  return {
    bodyPart,
    skinTone: tone.id,
    lighting: light.id,
    width: W,
    height: H,
    nonTransparentPixels
  };
}
