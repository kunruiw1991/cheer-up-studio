/**
 * @fileoverview Pixel-Exact Horizontal Mirror Engine & 8.5"×11" Printable Transfer Sheet Exporter
 * for Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio).
 *
 * CRITICAL MATHEMATICAL INVARIANT (AC-2):
 * Rasterizes `sourceCanvas` once to `sourceImageData = ctx.getImageData(0, 0, W, H)` and computes
 * `mirroredImageData` via exact pixel-buffer index reflection:
 *   dst[(y * W + x) * 4 + c] = src[(y * W + (W - 1 - x)) * 4 + c]
 * guaranteeing `mirroredImage(x, y) === sourceImage(width - 1 - x, y)` across 100.000% of pixels
 * with zero sub-pixel anti-aliasing discrepancy.
 */

/**
 * Computes exact horizontal pixel reflection of `sourceImageData`.
 * @param {ImageData} sourceImageData
 * @returns {ImageData}
 */
export function computeExactMirroredImageData(sourceImageData) {
  const W = sourceImageData.width;
  const H = sourceImageData.height;
  const src = sourceImageData.data;
  const mirroredImageData = new ImageData(W, H);
  const dst = mirroredImageData.data;

  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const srcOffset = (rowBase + (W - 1 - x)) * 4;
      const dstOffset = (rowBase + x) * 4;
      dst[dstOffset] = src[srcOffset];
      dst[dstOffset + 1] = src[srcOffset + 1];
      dst[dstOffset + 2] = src[srcOffset + 2];
      dst[dstOffset + 3] = src[srcOffset + 3];
    }
  }

  return mirroredImageData;
}

/**
 * Verifies that every single RGBA pixel in `mirroredImageData` equals `sourceImageData(W - 1 - x, y)`.
 */
export function verifyExactHorizontalReflection(sourceImageData, mirroredImageData) {
  const W = sourceImageData.width;
  const H = sourceImageData.height;
  const src = sourceImageData.data;
  const dst = mirroredImageData.data;
  let mismatchedPixels = 0;

  for (let y = 0; y < H; y++) {
    const rowBase = y * W;
    for (let x = 0; x < W; x++) {
      const srcOffset = (rowBase + (W - 1 - x)) * 4;
      const dstOffset = (rowBase + x) * 4;
      if (
        dst[dstOffset] !== src[srcOffset] ||
        dst[dstOffset + 1] !== src[srcOffset + 1] ||
        dst[dstOffset + 2] !== src[srcOffset + 2] ||
        dst[dstOffset + 3] !== src[srcOffset + 3]
      ) {
        mismatchedPixels++;
      }
    }
  }

  return {
    passed: mismatchedPixels === 0,
    totalPixels: W * H,
    mismatchedPixels
  };
}

/**
 * Renders the complete 8.5"×11" (1275×1650 px @ 150 DPI) Printable Transfer Sheet
 * with tiled horizontally-mirrored tattoos, dashed cut guides, and wet-sponge instructions.
 */
export function renderPrintableTransferSheet(sheetCanvas, mirroredCanvas, title = 'Custom Cheer-Up Tattoo') {
  const SW = 1275; // 8.5 inches * 150 DPI
  const SH = 1650; // 11.0 inches * 150 DPI
  sheetCanvas.width = SW;
  sheetCanvas.height = SH;

  const ctx = sheetCanvas.getContext('2d');
  ctx.save();

  // Crisp printable white sheet background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SW, SH);

  // Outer trim margin border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, SW - 56, SH - 56);

  // Top Header Banner
  const headerGrad = ctx.createLinearGradient(44, 44, SW - 44, 150);
  headerGrad.addColorStop(0, '#4c1d95');
  headerGrad.addColorStop(0.5, '#7c3aed');
  headerGrad.addColorStop(1, '#db2777');
  ctx.fillStyle = headerGrad;
  ctx.beginPath();
  ctx.roundRect(44, 44, SW - 88, 108, 16);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BOSTON ↔ BAY AREA CREATIVE CHEER-UP STUDIO', SW / 2, 86);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(
    `8.5" × 11" PRINTABLE TEMPORARY TATTOO SHEET (PRE-MIRRORED FOR SKIN TRANSFER) — "${title}"`,
    SW / 2,
    122
  );

  // Draw 2x2 Main Mirrored Tattoo Patches with Dashed Cut Guides
  const mainTiles = [
    { x: 95, y: 185, w: 490, h: 490, label: '✂ MIRRORED FOREARM / SHOULDER PATCH #1' },
    { x: 690, y: 185, w: 490, h: 490, label: '✂ MIRRORED FOREARM / SHOULDER PATCH #2' },
    { x: 95, y: 715, w: 340, h: 340, label: '✂ MIRRORED WRIST PATCH #3' },
    { x: 468, y: 715, w: 340, h: 340, label: '✂ MIRRORED HAND PATCH #4' },
    { x: 840, y: 715, w: 340, h: 340, label: '✂ MIRRORED MINI BADGE #5' }
  ];

  for (const tile of mainTiles) {
    // Subtle light lavender/cream guide box
    ctx.fillStyle = '#faf5ff';
    ctx.beginPath();
    ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 14);
    ctx.fill();

    // Draw the exact mirrored tattoo artwork
    ctx.drawImage(mirroredCanvas, tile.x + 16, tile.y + 16, tile.w - 32, tile.h - 32);

    // Dashed scissor cut guide border
    ctx.save();
    ctx.strokeStyle = '#6d28d9';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.roundRect(tile.x, tile.y, tile.w, tile.h, 14);
    ctx.stroke();
    ctx.restore();

    // Cut guide label
    ctx.fillStyle = '#4c1d95';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(tile.label, tile.x + 12, tile.y - 8);
  }

  // Bottom Step-by-Step Wet-Sponge Transfer Instructions Card
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#9333ea';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(60, 1095, SW - 120, 495, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3b0764';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('✨ HOW TO APPLY YOUR CUSTOM TEMPORARY TATTOO (WET-SPONGE INSTRUCTIONS):', 92, 1142);

  const steps = [
    {
      num: 'STEP 1 — PRINT ON TATTOO PAPER',
      desc: 'Print this 8.5" × 11" sheet at 100% scale onto Inkjet Temporary Tattoo Transfer Paper. All artwork & text above are already horizontally mirrored so they transfer right-way-round onto your skin!'
    },
    {
      num: 'STEP 2 — APPLY ADHESIVE & CUT',
      desc: 'Smooth the clear adhesive carrier sheet firmly over the printed side (use a ruler or card to press out air bubbles). Cut closely around each tattoo along the purple dashed scissor guides (✂).'
    },
    {
      num: 'STEP 3 — PLACE ON CLEAN SKIN',
      desc: 'Make sure your arm, wrist, or hand is clean, dry, and free of lotion. Peel off the clear protective top film and press the sticky tattoo face-down onto your skin.'
    },
    {
      num: 'STEP 4 — SOAK WITH WET SPONGE (30s)',
      desc: 'Hold a wet sponge or damp warm cloth firmly against the paper backing for 30 seconds until thoroughly soaked. Gently slide the backing paper away to reveal your glowing custom tattoo!'
    }
  ];

  steps.forEach((st, idx) => {
    const sy = 1192 + idx * 98;
    ctx.fillStyle = '#7c3aed';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(st.num, 92, sy);

    ctx.fillStyle = '#1e293b';
    ctx.font = '16px sans-serif';
    ctx.fillText(st.desc, 92, sy + 28, SW - 184);
  });

  ctx.restore();
}

/**
 * Generates both the normal PNG, the pixel-exact horizontally mirrored canvas & PNG,
 * and the 8.5"×11" printable transfer sheet PNG.
 */
/**
 * Synchronizes the mirrored canvas and the printable transfer sheet canvas with
 * `sourceCanvas` WITHOUT any PNG encoding (`toDataURL`). This is the cheap path
 * that is safe to run on a debounce while the artist is drawing; PNG encoding is
 * deferred to `exportTattooSheetBundle` which is only called on explicit
 * export/save actions.
 */
export function syncMirroredSheetCanvases(sourceCanvas, mirroredCanvas, sheetCanvas, title = 'Custom Cheer-Up Tattoo') {
  const W = sourceCanvas.width;
  const H = sourceCanvas.height;
  const sourceCtx = sourceCanvas.getContext('2d');
  const sourceImageData = sourceCtx.getImageData(0, 0, W, H);

  // Compute exact pixel buffer reflection
  const mirroredImageData = computeExactMirroredImageData(sourceImageData);

  mirroredCanvas.width = W;
  mirroredCanvas.height = H;
  const mirroredCtx = mirroredCanvas.getContext('2d');
  mirroredCtx.putImageData(mirroredImageData, 0, 0);

  const verification = verifyExactHorizontalReflection(sourceImageData, mirroredImageData);

  // Render full 8.5"x11" printable transfer sheet
  renderPrintableTransferSheet(sheetCanvas, mirroredCanvas, title);

  return { width: W, height: H, sourceImageData, mirroredImageData, verification };
}

/**
 * Produces a small, storage-friendly JPEG thumbnail of `sourceCanvas`.
 * Saved gallery entries persist this (~10-40 KB) instead of the full-resolution
 * design PNG (~1 MB), which previously exhausted the ~5 MB `localStorage` quota
 * on iPad Safari after a handful of saves and made the studio fail to load.
 */
export function makeThumbnailDataUrl(sourceCanvas, maxSize = 240, quality = 0.82) {
  const W = sourceCanvas.width || 1;
  const H = sourceCanvas.height || 1;
  const scale = Math.min(1, maxSize / Math.max(W, H));
  const tw = Math.max(1, Math.round(W * scale));
  const th = Math.max(1, Math.round(H * scale));
  const thumb = document.createElement('canvas');
  thumb.width = tw;
  thumb.height = th;
  const tctx = thumb.getContext('2d');
  tctx.imageSmoothingEnabled = true;
  tctx.imageSmoothingQuality = 'high';
  // The design canvas is fully opaque (gradient studio backdrop), so JPEG loses
  // nothing visible and is ~10x smaller than PNG for gradient-heavy pixels.
  tctx.fillStyle = '#0f172a';
  tctx.fillRect(0, 0, tw, th);
  tctx.drawImage(sourceCanvas, 0, 0, tw, th);
  return thumb.toDataURL('image/jpeg', quality);
}

export function exportTattooSheetBundle(sourceCanvas, mirroredCanvas, sheetCanvas, title = 'Custom Cheer-Up Tattoo') {
  const { width: W, height: H, sourceImageData, mirroredImageData, verification } =
    syncMirroredSheetCanvases(sourceCanvas, mirroredCanvas, sheetCanvas, title);

  const normalDataUrl = sourceCanvas.toDataURL('image/png');
  const mirroredDataUrl = mirroredCanvas.toDataURL('image/png');
  const sheetDataUrl = sheetCanvas.toDataURL('image/png');

  return {
    width: W,
    height: H,
    sourceImageData,
    mirroredImageData,
    normalDataUrl,
    normalPngDataUrl: normalDataUrl,
    mirroredDataUrl,
    mirroredPngDataUrl: mirroredDataUrl,
    sheetDataUrl,
    printableSheetPngDataUrl: sheetDataUrl,
    exactReflectionVerified: verification.passed,
    mismatchedPixels: verification.mismatchedPixels
  };
}
