/**
 * @fileoverview Vector Stamp Library for Milestone M2 (R1: Temporary Tattoo Designer & Printable Transfer Sheet Studio).
 * Provides 19 scalable vector stamps across the 3 required collections:
 *   1. 'catnap'     — CatNap & Smiling Critters (CatNap crescent pendant, lavender dream clouds, starry night paws, DogDay, CraftyCorn, Hoppy Hopscotch)
 *   2. 'kpop'       — K-Pop Demon Hunters (HUNTR/X Rumi, Mira, Zoey emblems, magical lightstick blade, Saja Boys Golden, Takedown, Soda Pop crests)
 *   3. 'bay_boston' — Bay Area ↔ Boston Connection (Golden Gate + Boston Zakim skyline, Duckling bridge, Mom ❤️ Daughter, Boston Superstar Crest)
 * Plus unlockable reward stamps from CatNap's Starlight Rooftop Dash.
 */

export const STAMP_CATEGORIES = [
  {
    id: 'catnap',
    label: 'CatNap & Critters',
    icon: '🌙',
    description: 'Cozy purple CatNap, crescent moon pendants, lavender dream clouds & Smiling Critters'
  },
  {
    id: 'kpop',
    label: 'K-Pop Demon Hunters',
    icon: '⚡',
    description: 'HUNTR/X (Rumi, Mira, Zoey) emblems, magical lightsticks & Saja Boys neon crests'
  },
  {
    id: 'bay_boston',
    label: 'Bay Area ↔ Boston',
    icon: '🌉',
    description: 'Golden Gate to Boston skyline, Public Garden ducklings, Mom ❤️ Daughter & Boston Star crests'
  }
];

/**
 * Helper to draw an N-pointed star centered at (cx, cy).
 */
export function drawStarPath(ctx, cx, cy, spikes, outerRadius, innerRadius, rotationOffset = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotationOffset + (i * Math.PI) / spikes;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/**
 * Helper to draw a classic heart path centered at (cx, cy).
 */
export function drawHeartPath(ctx, cx, cy, size) {
  const s = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.85);
  ctx.bezierCurveTo(cx - s * 1.2, cy + s * 0.15, cx - s * 1.15, cy - s * 0.85, cx, cy - s * 0.35);
  ctx.bezierCurveTo(cx + s * 1.15, cy - s * 0.85, cx + s * 1.2, cy + s * 0.15, cx, cy + s * 0.85);
  ctx.closePath();
}

export const TATTOO_STAMPS = [
  // ============================================================================
  // COLLECTION 1: CatNap & Smiling Critters ('catnap')
  // ============================================================================
  {
    id: 'catnap_crescent_pendant',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'CatNap & Crescent Moon',
    defaultWidth: 150,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#7c3aed', '#facc15', '#c4b5fd', '#1e1b4b'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="54" fill="#2e1065" stroke="#c4b5fd" stroke-width="3"/>
      <polygon points="28,44 22,16 46,32" fill="#7c3aed" stroke="#e9d5ff" stroke-width="2"/>
      <polygon points="92,44 98,16 74,32" fill="#7c3aed" stroke="#e9d5ff" stroke-width="2"/>
      <ellipse cx="60" cy="54" rx="34" ry="28" fill="#7c3aed" stroke="#e9d5ff" stroke-width="2.5"/>
      <path d="M40 58 Q60 76 80 58 Q60 66 40 58 Z" fill="#1e1b4b"/>
      <circle cx="47" cy="46" r="5.5" fill="#1e1b4b"/>
      <circle cx="73" cy="46" r="5.5" fill="#1e1b4b"/>
      <circle cx="49" cy="44" r="2" fill="#fef08a"/>
      <circle cx="75" cy="44" r="2" fill="#fef08a"/>
      <path d="M52 82 A14 14 0 1 0 72 98 A10 10 0 1 1 52 82 Z" fill="#facc15" stroke="#fef08a" stroke-width="1.5"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Lavender night aura medallion
      const grad = ctx.createRadialGradient(60, 56, 12, 60, 60, 56);
      grad.addColorStop(0, '#5b21b6');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(60, 60, 54, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#c4b5fd';
      ctx.stroke();

      // Cat ears
      ctx.fillStyle = '#7c3aed';
      ctx.strokeStyle = '#f3e8ff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(28, 45);
      ctx.lineTo(22, 15);
      ctx.lineTo(47, 32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(92, 45);
      ctx.lineTo(98, 15);
      ctx.lineTo(73, 32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.ellipse(60, 54, 34, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cozy wide smile
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.moveTo(39, 56);
      ctx.quadraticCurveTo(60, 77, 81, 56);
      ctx.quadraticCurveTo(60, 65, 39, 56);
      ctx.closePath();
      ctx.fill();

      // Eyes with starlight pupils
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(47, 45, 6, 0, Math.PI * 2);
      ctx.arc(73, 45, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      drawStarPath(ctx, 47, 45, 4, 3.5, 1.4);
      ctx.fill();
      drawStarPath(ctx, 73, 45, 4, 3.5, 1.4);
      ctx.fill();

      // Collar & Golden Crescent Moon Pendant
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.arc(60, 74, 22, 0.25 * Math.PI, 0.75 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#fef9c3';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(60, 94, 13, 0.2 * Math.PI, 1.65 * Math.PI, false);
      ctx.arc(65, 91, 10, 1.6 * Math.PI, 0.25 * Math.PI, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: 'lavender_dream_cloud',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'Lavender Dream Cloud',
    defaultWidth: 150,
    defaultHeight: 130,
    unlockable: false,
    defaultColors: ['#c084fc', '#e9d5ff', '#fde047', '#3b0764'],
    svgMarkup: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 70 A18 18 0 0 1 38 38 A24 24 0 0 1 82 36 A18 18 0 0 1 94 70 Z" fill="#c084fc" stroke="#f3e8ff" stroke-width="3"/>
      <text x="58" y="30" fill="#fde047" font-size="14" font-weight="bold" font-family="sans-serif">Zzz</text>
      <circle cx="34" cy="82" r="4" fill="#fde047"/>
      <circle cx="84" cy="80" r="3.5" fill="#fde047"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w / 120, h / 100);
      ctx.save();
      ctx.scale(s, s);
      const grad = ctx.createLinearGradient(20, 25, 95, 75);
      grad.addColorStop(0, '#e9d5ff');
      grad.addColorStop(0.55, '#c084fc');
      grad.addColorStop(1, '#9333ea');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.arc(36, 58, 17, Math.PI * 0.5, Math.PI * 1.45);
      ctx.arc(58, 44, 22, Math.PI * 1.05, Math.PI * 1.92);
      ctx.arc(82, 56, 17, Math.PI * 1.45, Math.PI * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sleeping cozy eyes on cloud
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(48, 56, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(70, 56, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();

      // Shimmering Zzz & stars
      ctx.fillStyle = '#fde047';
      drawStarPath(ctx, 26, 30, 4, 7, 2.8);
      ctx.fill();
      drawStarPath(ctx, 94, 32, 4, 6, 2.4);
      ctx.fill();
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('Zzz', 52, 24);
      ctx.restore();
    }
  },
  {
    id: 'starry_night_paw',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'Starry Night Paw',
    defaultWidth: 140,
    defaultHeight: 140,
    unlockable: false,
    defaultColors: ['#6d28d9', '#f472b6', '#fde047', '#f5f3ff'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="#4c1d95" stroke="#ddd6fe" stroke-width="3"/>
      <ellipse cx="60" cy="74" rx="22" ry="18" fill="#f472b6"/>
      <circle cx="34" cy="48" r="9" fill="#f472b6"/>
      <circle cx="51" cy="36" r="9" fill="#f472b6"/>
      <circle cx="69" cy="36" r="9" fill="#f472b6"/>
      <circle cx="86" cy="48" r="9" fill="#f472b6"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#4c1d95';
      ctx.strokeStyle = '#ddd6fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Main pad + 4 toe beans
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#fdf2f8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(60, 75, 23, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const beans = [
        [34, 48],
        [51, 36],
        [69, 36],
        [86, 48]
      ];
      for (const [bx, by] of beans) {
        ctx.beginPath();
        ctx.arc(bx, by, 9.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        drawStarPath(ctx, bx, by, 4, 4.5, 1.8);
        ctx.fill();
        ctx.fillStyle = '#f472b6';
      }

      ctx.fillStyle = '#fde047';
      drawStarPath(ctx, 60, 75, 5, 9.5, 4);
      ctx.fill();
      ctx.restore();
    }
  },
  {
    id: 'dogday_sun_emblem',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'DogDay Sun Medallion',
    defaultWidth: 145,
    defaultHeight: 145,
    unlockable: false,
    defaultColors: ['#f97316', '#facc15', '#fffbeb', '#7c2d12'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="46" fill="#f97316" stroke="#fde047" stroke-width="4"/>
      <circle cx="60" cy="60" r="32" fill="#facc15"/>
      <path d="M44 64 Q60 78 76 64" stroke="#7c2d12" stroke-width="4" fill="none"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Sunburst rays
      ctx.fillStyle = '#f97316';
      drawStarPath(ctx, 60, 60, 12, 54, 41);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Warm sunny face
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(60, 60, 34, 0, Math.PI * 2);
      ctx.fill();

      // Floppy puppy ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(29, 60, 9, 20, 0.25, 0, Math.PI * 2);
      ctx.ellipse(91, 60, 9, 20, -0.25, 0, Math.PI * 2);
      ctx.fill();

      // Eyes & joyful smile
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.arc(49, 53, 4.5, 0, Math.PI * 2);
      ctx.arc(71, 53, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(60, 60, 15, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: 'craftycorn_rainbow_star',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'CraftyCorn Rainbow Star',
    defaultWidth: 155,
    defaultHeight: 135,
    unlockable: false,
    defaultColors: ['#ec4899', '#facc15', '#38bdf8', '#a855f7'],
    svgMarkup: `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 78 A44 44 0 0 1 94 44" stroke="#ec4899" stroke-width="8" fill="none"/>
      <path d="M26 78 A36 36 0 0 1 92 52" stroke="#facc15" stroke-width="8" fill="none"/>
      <path d="M34 78 A28 28 0 0 1 90 60" stroke="#38bdf8" stroke-width="8" fill="none"/>
      <polygon points="94,28 100,42 114,44 102,54 106,68 94,60 82,68 86,54 74,44 88,42" fill="#fde047"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w / 120, h / 100);
      ctx.save();
      ctx.scale(s, s);
      const bands = ['#ec4899', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#a855f7'];
      ctx.lineCap = 'round';
      bands.forEach((col, idx) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.arc(62, 82, 50 - idx * 6.2, Math.PI * 1.05, Math.PI * 1.78);
        ctx.stroke();
      });

      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      drawStarPath(ctx, 94, 42, 5, 20, 8.5);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: 'hoppy_hopscotch_lightning',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'Hoppy Lightning Bolt',
    defaultWidth: 140,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#10b981', '#fde047', '#ecfdf5', '#065f46'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#10b981" stroke="#a7f3d0" stroke-width="3"/>
      <polygon points="68,16 34,64 58,64 48,104 86,54 62,54" fill="#fde047" stroke="#065f46" stroke-width="2.5"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.strokeStyle = '#065f46';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(68, 16);
      ctx.lineTo(34, 64);
      ctx.lineTo(58, 64);
      ctx.lineTo(48, 104);
      ctx.lineTo(86, 54);
      ctx.lineTo(62, 54);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  },

  // ============================================================================
  // COLLECTION 2: K-Pop Demon Hunters ('kpop')
  // ============================================================================
  {
    id: 'huntrx_rumi_emblem',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'HUNTR/X Rumi Star Blade',
    defaultWidth: 155,
    defaultHeight: 155,
    unlockable: false,
    defaultColors: ['#e11d48', '#facc15', '#fff1f2', '#4c0519'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="#4c0519" stroke="#fb7185" stroke-width="3"/>
      <polygon points="60,10 72,48 110,60 72,72 60,110 48,72 10,60 48,48" fill="#e11d48" stroke="#facc15" stroke-width="3"/>
      <circle cx="60" cy="60" r="12" fill="#facc15"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Crimson celestial demon-hunter seal
      ctx.fillStyle = '#4c0519';
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Outer rune ring
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(60, 60, 43, 0, Math.PI * 2);
      ctx.stroke();

      // Winged 4-point star blade
      ctx.fillStyle = '#e11d48';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.8;
      drawStarPath(ctx, 60, 60, 4, 48, 16);
      ctx.fill();
      ctx.stroke();

      // Inner golden core & RUMI badge
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(60, 60, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4c0519';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('RUMI', 60, 60);
      ctx.restore();
    }
  },
  {
    id: 'huntrx_mira_emblem',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'HUNTR/X Mira Cyber Shield',
    defaultWidth: 150,
    defaultHeight: 155,
    unlockable: false,
    defaultColors: ['#9333ea', '#22d3ee', '#f5d0fe', '#1e1b4b'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <polygon points="60,12 104,34 90,94 60,112 30,94 16,34" fill="#3b0764" stroke="#22d3ee" stroke-width="3"/>
      <polygon points="60,26 88,42 78,84 60,98 42,84 32,42" fill="#9333ea" stroke="#f5d0fe" stroke-width="2"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Hexagonal cyber demon-hunter shield
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(60, 12);
      ctx.lineTo(104, 34);
      ctx.lineTo(90, 94);
      ctx.lineTo(60, 112);
      ctx.lineTo(30, 94);
      ctx.lineTo(16, 34);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner twin crescent daggers
      ctx.fillStyle = '#a855f7';
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(60, 24);
      ctx.lineTo(86, 60);
      ctx.lineTo(60, 96);
      ctx.lineTo(34, 60);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#22d3ee';
      drawStarPath(ctx, 60, 60, 6, 16, 7);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MIRA', 60, 60);
      ctx.restore();
    }
  },
  {
    id: 'huntrx_zoey_emblem',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'HUNTR/X Zoey Sonic Star',
    defaultWidth: 150,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#06b6d4', '#f472b6', '#fef08a', '#083344'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#083344" stroke="#22d3ee" stroke-width="3"/>
      <polygon points="60,16 74,46 106,48 80,68 88,100 60,82 32,100 40,68 14,48 46,46" fill="#06b6d4" stroke="#f472b6" stroke-width="3"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#083344';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Sonic wave rings
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(60, 60, 39, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#06b6d4';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      drawStarPath(ctx, 60, 60, 5, 42, 18);
      ctx.fill();
      ctx.stroke();

      // Heart center sigil
      ctx.fillStyle = '#f472b6';
      drawHeartPath(ctx, 60, 60, 22);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ZOEY', 60, 60);
      ctx.restore();
    }
  },
  {
    id: 'demon_hunter_lightstick_blade',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'Demon-Hunter Lightstick Wand',
    defaultWidth: 145,
    defaultHeight: 165,
    unlockable: false,
    defaultColors: ['#ec4899', '#38bdf8', '#fde047', '#1e1b4b'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="53" y="54" width="14" height="54" rx="5" fill="#1e1b4b" stroke="#f472b6" stroke-width="2.5"/>
      <circle cx="60" cy="38" r="26" fill="#ec4899" stroke="#38bdf8" stroke-width="3"/>
      <polygon points="60,16 67,32 84,34 70,45 74,60 60,51 46,60 50,45 36,34 53,32" fill="#fde047"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Handle with crystal grip
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(53, 55, 14, 52, 5);
      ctx.fill();
      ctx.stroke();

      // Winged guard
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(30, 56);
      ctx.lineTo(90, 56);
      ctx.lineTo(74, 66);
      ctx.lineTo(46, 66);
      ctx.closePath();
      ctx.fill();

      // Glowing concert globe
      const grad = ctx.createRadialGradient(60, 36, 4, 60, 36, 26);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.55, '#ec4899');
      grad.addColorStop(1, '#7e22ce');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 36, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner star blade
      ctx.fillStyle = '#ffffff';
      drawStarPath(ctx, 60, 36, 5, 16, 7);
      ctx.fill();
      ctx.restore();
    }
  },
  {
    id: 'saja_boys_golden_crest',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'Saja Boys "Golden" Solar Crown',
    defaultWidth: 155,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#f59e0b', '#fef08a', '#b45309', '#1c1917'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#1c1917" stroke="#f59e0b" stroke-width="3.5"/>
      <polygon points="24,78 32,38 50,56 60,28 70,56 88,38 96,78" fill="#facc15" stroke="#fef08a" stroke-width="2.5"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#1c1917';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden solar crown
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(24, 78);
      ctx.lineTo(31, 38);
      ctx.lineTo(48, 56);
      ctx.lineTo(60, 24);
      ctx.lineTo(72, 56);
      ctx.lineTo(89, 38);
      ctx.lineTo(96, 78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GOLDEN', 60, 95);
      ctx.restore();
    }
  },
  {
    id: 'saja_boys_takedown_sigil',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'Saja Boys "Takedown" Claw Sigil',
    defaultWidth: 155,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#ef4444', '#38bdf8', '#f8fafc', '#0f172a'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#0f172a" stroke="#ef4444" stroke-width="3.5"/>
      <path d="M26 28 L52 94 M50 22 L72 96 M74 26 L94 90" stroke="#38bdf8" stroke-width="7" stroke-linecap="round"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3 high-voltage neon tiger-claw slashes
      ctx.lineCap = 'round';
      const slashes = [
        [28, 30, 48, 88],
        [50, 24, 68, 92],
        [72, 28, 90, 86]
      ];
      for (const [x1, y1, x2, y2] of slashes) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 8.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TAKEDOWN', 60, 102);
      ctx.restore();
    }
  },
  {
    id: 'saja_boys_soda_pop_neon',
    category: 'kpop',
    collection: 'kpop_demon_hunters',
    name: 'Saja Boys "Soda Pop" Neon Fizz',
    defaultWidth: 150,
    defaultHeight: 155,
    unlockable: false,
    defaultColors: ['#f472b6', '#22d3ee', '#fde047', '#3b0764'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#3b0764" stroke="#22d3ee" stroke-width="3"/>
      <rect x="42" y="44" width="36" height="48" rx="8" fill="#f472b6" stroke="#fde047" stroke-width="2.5"/>
      <circle cx="48" cy="30" r="5" fill="#22d3ee"/>
      <circle cx="68" cy="24" r="6" fill="#fde047"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#3b0764';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Straw
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(64, 46);
      ctx.lineTo(76, 20);
      ctx.stroke();

      // Fizzy neon soda cup
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(42, 44, 36, 48, 8);
      ctx.fill();
      ctx.stroke();

      // Effervescent bubbles
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(46, 30, 5, 0, Math.PI * 2);
      ctx.arc(60, 22, 6, 0, Math.PI * 2);
      ctx.arc(82, 34, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SODA POP', 60, 72);
      ctx.restore();
    }
  },

  // ============================================================================
  // COLLECTION 3: Bay Area ↔ Boston Connection ('bay_boston')
  // ============================================================================
  {
    id: 'golden_gate_to_boston_bridge',
    category: 'bay_boston',
    collection: 'bay_boston_connection',
    name: 'Golden Gate ↔ Boston Skyline Badge',
    defaultWidth: 165,
    defaultHeight: 165,
    unlockable: false,
    defaultColors: ['#ea580c', '#38bdf8', '#fde047', '#1e3a8a'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="52" fill="#1e3a8a" stroke="#fde047" stroke-width="3"/>
      <path d="M12 78 L108 78" stroke="#38bdf8" stroke-width="6"/>
      <rect x="30" y="34" width="8" height="44" fill="#ea580c"/>
      <polygon points="84,34 70,78 98,78" fill="#e2e8f0"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      // Twilight coast-to-coast sky circle
      const grad = ctx.createLinearGradient(15, 15, 105, 105);
      grad.addColorStop(0, '#1e3a8a');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Bay & Charles River waves
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(14, 80);
      ctx.lineTo(106, 80);
      ctx.stroke();

      // Left half: SF Golden Gate Tower (International Orange)
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(30, 32, 8, 48);
      ctx.fillRect(26, 44, 16, 4);
      ctx.fillRect(26, 60, 16, 4);
      ctx.strokeStyle = '#fb923c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(14, 68);
      ctx.quadraticCurveTo(22, 52, 34, 34);
      ctx.quadraticCurveTo(46, 56, 58, 70);
      ctx.stroke();

      // Right half: Boston Zakim Cable-Stayed Bridge Tower
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(84, 32);
      ctx.lineTo(74, 80);
      ctx.lineTo(80, 80);
      ctx.lineTo(84, 48);
      ctx.lineTo(88, 80);
      ctx.lineTo(94, 80);
      ctx.closePath();
      ctx.fill();

      // Connecting heart in the sky
      ctx.fillStyle = '#f43f5e';
      drawHeartPath(ctx, 60, 34, 16);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SF ↔ BOSTON', 60, 96);
      ctx.restore();
    }
  },
  {
    id: 'boston_duckling_bridge_badge',
    category: 'bay_boston',
    collection: 'bay_boston_connection',
    name: 'Boston Public Garden Ducklings',
    defaultWidth: 155,
    defaultHeight: 145,
    unlockable: false,
    defaultColors: ['#facc15', '#38bdf8', '#f43f5e', '#0f766e'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#0f766e" stroke="#99f6e4" stroke-width="3"/>
      <circle cx="42" cy="66" r="14" fill="#facc15"/>
      <circle cx="34" cy="50" r="9" fill="#facc15"/>
      <circle cx="66" cy="70" r="8" fill="#fde047"/>
      <circle cx="84" cy="70" r="8" fill="#fde047"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#99f6e4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mama Duck
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(40, 68, 15, 11, 0, 0, Math.PI * 2);
      ctx.arc(32, 52, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(22, 53, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2 Following Ducklings
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(66, 70, 8, 0, Math.PI * 2);
      ctx.arc(84, 70, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // Floating Heart Balloon
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(66, 62);
      ctx.lineTo(74, 38);
      ctx.stroke();
      ctx.fillStyle = '#f43f5e';
      drawHeartPath(ctx, 74, 32, 18);
      ctx.fill();
      ctx.restore();
    }
  },
  {
    id: 'mom_heart_daughter_crest',
    category: 'bay_boston',
    collection: 'bay_boston_connection',
    name: 'Mom ❤️ Daughter Coast-to-Coast Crest',
    defaultWidth: 165,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#f43f5e', '#ec4899', '#fde047', '#fff1f2'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#881337" stroke="#fda4af" stroke-width="3"/>
      <path d="M60 88 C30 68 24 40 45 34 C54 31 60 40 60 40 C60 40 66 31 75 34 C96 40 90 68 60 88 Z" fill="#f43f5e" stroke="#fde047" stroke-width="2.5"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#881337';
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Twin intertwined hearts
      ctx.fillStyle = '#f43f5e';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      drawHeartPath(ctx, 50, 56, 46);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ec4899';
      drawHeartPath(ctx, 72, 60, 38);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MOM ❤️ DAUGHTER', 60, 96);
      ctx.restore();
    }
  },
  {
    id: 'boston_superstar_crest',
    category: 'bay_boston',
    collection: 'bay_boston_connection',
    name: 'Boston Superstar Crest',
    defaultWidth: 165,
    defaultHeight: 150,
    unlockable: false,
    defaultColors: ['#7c3aed', '#f472b6', '#fde047', '#fdf4ff'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#4a044e" stroke="#f5d0fe" stroke-width="3"/>
      <path d="M36 52 H80 V68 A18 18 0 0 1 62 86 H54 A18 18 0 0 1 36 68 Z" fill="#f472b6" stroke="#fde047" stroke-width="2.5"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#4a044e';
      ctx.strokeStyle = '#f5d0fe';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Cozy warm teacup
      ctx.fillStyle = '#f472b6';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(36, 52);
      ctx.lineTo(78, 52);
      ctx.lineTo(74, 74);
      ctx.quadraticCurveTo(57, 84, 40, 74);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cup handle
      ctx.beginPath();
      ctx.arc(78, 62, 8, -0.5 * Math.PI, 0.5 * Math.PI);
      ctx.stroke();

      // Heart steam
      ctx.fillStyle = '#fde047';
      drawHeartPath(ctx, 57, 34, 18);
      ctx.fill();

      ctx.fillStyle = '#fdf4ff';
      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BOSTON SUPERSTAR ★', 60, 96);
      ctx.restore();
    }
  },

  // ============================================================================
  // UNLOCKABLE BONUS STAMPS (Earned via R2 CatNap Rooftop Dash / Postcards)
  // ============================================================================
  {
    id: 'starlight_rooftop_champion',
    category: 'catnap',
    collection: 'catnap_critters',
    name: 'Starlight Rooftop Champion Trophy',
    defaultWidth: 155,
    defaultHeight: 155,
    unlockable: true,
    defaultColors: ['#facc15', '#a855f7', '#fef08a', '#1e1b4b'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#1e1b4b" stroke="#facc15" stroke-width="3.5"/>
      <polygon points="60,16 73,44 104,48 80,68 86,98 60,82 34,98 40,68 16,48 47,44" fill="#facc15"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      drawStarPath(ctx, 60, 56, 5, 40, 17);
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      drawStarPath(ctx, 60, 56, 5, 22, 9);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROOFTOP CHAMP', 60, 98);
      ctx.restore();
    }
  },
  {
    id: 'coast_to_coast_superstar',
    category: 'bay_boston',
    collection: 'bay_boston_connection',
    name: 'Coast-to-Coast Superstar Wings',
    defaultWidth: 160,
    defaultHeight: 150,
    unlockable: true,
    defaultColors: ['#38bdf8', '#f472b6', '#fde047', '#0f172a'],
    svgMarkup: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
      <polygon points="60,22 72,48 100,52 78,70 84,98 60,84 36,98 42,70 20,52 48,48" fill="#38bdf8"/>
    </svg>`,
    render(ctx, w, h) {
      const s = Math.min(w, h) / 120;
      ctx.save();
      ctx.scale(s, s);
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      drawStarPath(ctx, 60, 58, 5, 38, 16);
      ctx.fill();
      ctx.fillStyle = '#f472b6';
      drawHeartPath(ctx, 60, 58, 22);
      ctx.fill();
      ctx.restore();
    }
  }
];

export function getStampById(stampId) {
  return TATTOO_STAMPS.find((s) => s.id === stampId) || null;
}

export function getStampsByCategory(categoryId, unlockedIds = []) {
  const unlockedSet = new Set(unlockedIds || []);
  return TATTOO_STAMPS.filter((s) => {
    const matchCategory = !categoryId || categoryId === 'all' || s.category === categoryId;
    return matchCategory;
  }).map((stamp) => ({
    ...stamp,
    isLocked: Boolean(stamp.unlockable && !unlockedSet.has(stamp.id))
  }));
}
