/**
 * @fileoverview CatNap Plush Wardrobe Catalog, Expressions, Presets & SVG/Canvas Renderers.
 * Provides all 4 required wardrobe categories (K-Pop Idol Jackets, Glowing Headphones,
 * Crescent Moon Pendants, Boston Winter Scarves) and expressive facial states.
 */

export const EXPRESSIONS = [
  {
    id: 'happy_smile',
    alias: 'sleepy-smile',
    label: 'Cozy Starry Smile',
    moodText: 'Feeling warm, safe, and full of starlight hugs!',
    eyeType: 'starry_open',
    mouthType: 'big_smile',
  },
  {
    id: 'sleepy_purr',
    alias: 'purr-bliss',
    label: 'Lavender Purr Bliss',
    moodText: 'Purring softly in a cloud of sweet lavender dreams...',
    eyeType: 'happy_closed',
    mouthType: 'purr_cat',
  },
  {
    id: 'starry_excited',
    alias: 'starry-joy',
    label: 'K-Pop Concert Joy',
    moodText: 'Ready to cheer for HUNTR/X & Saja Boys from Boston to SF!',
    eyeType: 'sparkle_wide',
    mouthType: 'cheer_open',
  },
  {
    id: 'giggle_wink',
    alias: 'kpop-wink',
    label: 'Idol Stage Wink',
    moodText: 'Sending a magical wink across the Golden Gate & Zakim Bridge!',
    eyeType: 'wink_star',
    mouthType: 'playful_grin',
  },
  {
    id: 'cozy_hug',
    alias: 'cozy-hug',
    label: 'Mom & Daughter Hug',
    moodText: 'Wrapped in coast-to-coast love from Bay Area to Boston!',
    eyeType: 'warm_arc',
    mouthType: 'sweet_heart',
  },
];

export const WARDROBE_CATALOG = {
  jacket: [
    {
      id: 'none',
      label: 'Classic Royal Lavender Plush',
      description: 'Soft velvet lavender fur with starry paws',
      primaryColor: '#8b5cf6',
      accentColor: '#ddd6fe',
    },
    {
      id: 'kpop_idol_jacket',
      alias: 'huntrx-gold-jacket',
      label: 'HUNTR/X Golden Stage Jacket',
      description: 'Sequined holographic gold & crimson demon-hunter idol jacket',
      primaryColor: '#f59e0b',
      accentColor: '#ec4899',
    },
    {
      id: 'saja_neon_bomber',
      alias: 'saja-neon-hoodie',
      label: 'Saja Boys "Soda Pop" Bomber',
      description: 'Fizzy pastel cyan & electric magenta varsity bomber jacket',
      primaryColor: '#06b6d4',
      accentColor: '#f43f5e',
    },
    {
      id: 'starlight_sleepover_hoodie',
      alias: 'boston-fleece',
      label: 'Boston Starlight Fleece Hoodie',
      description: 'Plush Back Bay midnight fleece with embroidered crescent clouds',
      primaryColor: '#4f46e5',
      accentColor: '#c4b5fd',
    },
  ],
  headphones: [
    {
      id: 'none',
      label: 'Natural Floppy Cat Ears',
      description: 'Cozy lavender plush cat ears',
      primaryColor: 'transparent',
      accentColor: 'transparent',
    },
    {
      id: 'glowing_neon_headphones',
      alias: 'glowing-headphones',
      label: 'Glowing Cyber-Idol Headphones',
      description: 'Neon cyan & violet LED studio headphones pulsing to the beat',
      primaryColor: '#22d3ee',
      accentColor: '#a855f7',
    },
    {
      id: 'demon_hunter_crown_headset',
      alias: 'idol-crown',
      label: 'Rumi Celestial Crown Headset',
      description: 'HUNTR/X golden star tiara with glowing crystal stage mic',
      primaryColor: '#fbbf24',
      accentColor: '#f472b6',
    },
    {
      id: 'starlight_sleep_cap',
      alias: 'winter-beanie',
      label: 'Cozy Boston Pom-Pom Beanie',
      description: 'Warm knit winter beanie with a glowing moon pom-pom',
      primaryColor: '#ec4899',
      accentColor: '#fde047',
    },
  ],
  pendant: [
    {
      id: 'crescent_moon_gold',
      alias: 'crescent-moon-gold',
      label: 'Signature Golden Crescent Moon',
      description: 'CatNap’s iconic glowing golden crescent moon charm',
      primaryColor: '#facc15',
      accentColor: '#fef08a',
    },
    {
      id: 'huntrx_crystal_pendant',
      alias: 'lavender-star',
      label: 'HUNTR/X Starlight Prism Charm',
      description: 'Holographic star crystal radiating protective demon-hunter light',
      primaryColor: '#c084fc',
      accentColor: '#38bdf8',
    },
    {
      id: 'sf_boston_heart_locket',
      alias: 'golden-gate-heart',
      label: 'SF ↔ Boston Golden Bridge Locket',
      description: 'Twin heart locket connecting Mom in Bay Area & Daughter in Boston',
      primaryColor: '#fb7185',
      accentColor: '#fbbf24',
    },
  ],
  scarf: [
    {
      id: 'none',
      label: 'No Scarf (Show Pendant Collar)',
      description: 'Classic lavender collar showing full pendant',
      primaryColor: 'transparent',
      accentColor: 'transparent',
    },
    {
      id: 'boston_crimson_knit_scarf',
      alias: 'boston-crimson-scarf',
      label: 'Boston Back Bay Crimson Scarf',
      description: 'Chunky hand-knit crimson & cream winter scarf for cozy Boston days',
      primaryColor: '#e11d48',
      accentColor: '#fef3c7',
    },
    {
      id: 'fenway_emerald_scarf',
      alias: 'lavender-cloud-scarf',
      label: 'Lavender Dream-Cloud Scarf',
      description: 'Fluffy pastel lavender & starlight silver cloud scarf',
      primaryColor: '#a78bfa',
      accentColor: '#f3e8ff',
    },
    {
      id: 'golden_gate_sunset_scarf',
      alias: 'golden-gate-scarf',
      label: 'Golden Gate Sunset Gradient Scarf',
      description: 'Warm California coral-gold sunset knit scarf from Mom',
      primaryColor: '#f97316',
      accentColor: '#fde047',
    },
  ],
};

export const OUTFIT_PRESETS = [
  {
    id: 'preset_classic_catnap',
    title: 'Classic Cozy CatNap',
    expression: 'happy_smile',
    jacket: 'none',
    headphones: 'none',
    pendant: 'crescent_moon_gold',
    scarf: 'none',
  },
  {
    id: 'preset_huntrx_idol',
    title: 'HUNTR/X "Golden" Concert Star',
    expression: 'starry_excited',
    jacket: 'kpop_idol_jacket',
    headphones: 'demon_hunter_crown_headset',
    pendant: 'huntrx_crystal_pendant',
    scarf: 'none',
  },
  {
    id: 'preset_saja_soda_pop',
    title: 'Saja Boys "Soda Pop" DJ',
    expression: 'giggle_wink',
    jacket: 'saja_neon_bomber',
    headphones: 'glowing_neon_headphones',
    pendant: 'crescent_moon_gold',
    scarf: 'fenway_emerald_scarf',
  },
  {
    id: 'preset_boston_snow_day',
    title: 'Boston Common Winter Hug',
    expression: 'cozy_hug',
    jacket: 'starlight_sleepover_hoodie',
    headphones: 'starlight_sleep_cap',
    pendant: 'sf_boston_heart_locket',
    scarf: 'boston_crimson_knit_scarf',
  },
];

/**
 * Normalizes a slot value so both canonical IDs and survey aliases resolve cleanly.
 */
export function normalizeWardrobeValue(slot, value) {
  if (!value) return '';
  if (slot === 'expression') {
    const found = EXPRESSIONS.find((e) => e.id === value || e.alias === value);
    return found ? found.id : EXPRESSIONS[0].id;
  }
  const items = WARDROBE_CATALOG[slot];
  if (!items) return String(value);
  const found = items.find((item) => item.id === value || item.alias === value);
  return found ? found.id : items[0].id;
}

/**
 * Generates the SVG markup for CatNap's facial expression inside the 400x420 viewBox.
 */
export function renderExpressionSvg(expressionId, blink = false) {
  const expr = EXPRESSIONS.find((e) => e.id === expressionId || e.alias === expressionId) || EXPRESSIONS[0];

  let eyesMarkup = '';
  if (blink || expr.eyeType === 'happy_closed') {
    eyesMarkup = `
      <path d="M 142 156 Q 160 138 178 156" fill="none" stroke="#1e1b4b" stroke-width="5.5" stroke-linecap="round" />
      <path d="M 222 156 Q 240 138 258 156" fill="none" stroke="#1e1b4b" stroke-width="5.5" stroke-linecap="round" />
      <circle cx="136" cy="168" r="10" fill="#f472b6" opacity="0.45" />
      <circle cx="264" cy="168" r="10" fill="#f472b6" opacity="0.45" />
    `;
  } else if (expr.eyeType === 'wink_star') {
    eyesMarkup = `
      <!-- Left Winking Eye -->
      <path d="M 140 155 Q 160 138 180 155" fill="none" stroke="#1e1b4b" stroke-width="6" stroke-linecap="round" />
      <polygon points="130,145 133,152 140,152 134,157 136,164 130,159 124,164 126,157 120,152 127,152" fill="#facc15" />
      <!-- Right Starry Open Eye -->
      <ellipse cx="240" cy="152" rx="21" ry="24" fill="#1e1b4b" />
      <circle cx="233" cy="144" r="7.5" fill="#ffffff" />
      <circle cx="247" cy="160" r="4" fill="#c084fc" />
      <polygon points="242,150 244,155 249,155 245,158 246,163 242,160 238,163 239,158 235,155 240,155" fill="#fde047" />
      <circle cx="136" cy="170" r="11" fill="#f472b6" opacity="0.5" />
      <circle cx="264" cy="170" r="11" fill="#f472b6" opacity="0.5" />
    `;
  } else if (expr.eyeType === 'warm_arc') {
    eyesMarkup = `
      <path d="M 140 158 C 148 138, 172 138, 180 158" fill="none" stroke="#1e1b4b" stroke-width="6" stroke-linecap="round" />
      <path d="M 220 158 C 228 138, 252 138, 260 158" fill="none" stroke="#1e1b4b" stroke-width="6" stroke-linecap="round" />
      <circle cx="134" cy="168" r="12" fill="#fb7185" opacity="0.55" />
      <circle cx="266" cy="168" r="12" fill="#fb7185" opacity="0.55" />
    `;
  } else {
    // starry_open / sparkle_wide
    const rY = expr.eyeType === 'sparkle_wide' ? 26 : 23;
    eyesMarkup = `
      <ellipse cx="160" cy="152" rx="21" ry="${rY}" fill="#1e1b4b" />
      <ellipse cx="240" cy="152" rx="21" ry="${rY}" fill="#1e1b4b" />
      <circle cx="153" cy="143" r="8" fill="#ffffff" />
      <circle cx="233" cy="143" r="8" fill="#ffffff" />
      <circle cx="167" cy="161" r="4.2" fill="#e879f9" />
      <circle cx="247" cy="161" r="4.2" fill="#e879f9" />
      <polygon points="160,148 162,153 167,153 163,156 164,161 160,158 156,161 157,156 153,153 158,153" fill="#fde047" />
      <polygon points="240,148 242,153 247,153 243,156 244,161 240,158 236,161 237,156 233,153 238,153" fill="#fde047" />
      <circle cx="134" cy="170" r="11" fill="#f472b6" opacity="0.45" />
      <circle cx="266" cy="170" r="11" fill="#f472b6" opacity="0.45" />
    `;
  }

  let mouthMarkup = '';
  if (expr.mouthType === 'purr_cat') {
    mouthMarkup = `
      <path d="M 182 178 Q 191 187 200 176 Q 209 187 218 178" fill="none" stroke="#1e1b4b" stroke-width="4.5" stroke-linecap="round" />
    `;
  } else if (expr.mouthType === 'cheer_open') {
    mouthMarkup = `
      <path d="M 175 175 Q 200 208 225 175 Z" fill="#311042" stroke="#1e1b4b" stroke-width="4.5" stroke-linejoin="round" />
      <path d="M 186 190 Q 200 182 214 190 Q 200 201 186 190 Z" fill="#fb7185" />
    `;
  } else if (expr.mouthType === 'sweet_heart') {
    mouthMarkup = `
      <path d="M 180 176 Q 200 198 220 176" fill="none" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round" />
      <path d="M 200 189 C 196 183, 189 185, 193 192 L 200 198 L 207 192 C 211 185, 204 183, 200 189 Z" fill="#fb7185" />
    `;
  } else {
    // big_smile / playful_grin
    mouthMarkup = `
      <path d="M 174 175 Q 200 202 226 175" fill="none" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round" />
      <path d="M 183 180 Q 200 195 217 180" fill="#fb7185" opacity="0.7" />
    `;
  }

  return `
    <g class="catnap-face-layer" data-expression="${expr.id}">
      <!-- Cute Plush Nose -->
      <ellipse cx="200" cy="166" rx="8" ry="6" fill="#4c1d95" />
      <ellipse cx="198" cy="164" rx="3" ry="1.8" fill="#ddd6fe" />
      ${eyesMarkup}
      ${mouthMarkup}
    </g>
  `;
}

/**
 * Generates SVG markup for CatNap's Jacket layer.
 */
export function renderJacketSvg(jacketId) {
  const id = normalizeWardrobeValue('jacket', jacketId);
  if (id === 'kpop_idol_jacket') {
    return `
      <g class="catnap-jacket-layer" data-jacket="kpop_idol_jacket">
        <path d="M 122 225 L 106 326 L 168 332 L 178 232 Z" fill="url(#huntrxGoldGrad)" stroke="#f59e0b" stroke-width="3" />
        <path d="M 278 225 L 294 326 L 232 332 L 222 232 Z" fill="url(#huntrxGoldGrad)" stroke="#f59e0b" stroke-width="3" />
        <!-- Idol Shoulder Epaulets & Star Badges -->
        <polygon points="108,232 138,220 142,240 105,246" fill="#ec4899" stroke="#fde047" stroke-width="2" />
        <polygon points="292,232 262,220 258,240 295,246" fill="#ec4899" stroke="#fde047" stroke-width="2" />
        <polygon points="145,270 149,278 158,278 151,283 153,291 145,286 137,291 139,283 132,278 141,278" fill="#fef08a" />
        <polygon points="255,270 259,278 268,278 261,283 263,291 255,286 247,291 249,283 242,278 251,278" fill="#fef08a" />
      </g>
    `;
  }
  if (id === 'saja_neon_bomber') {
    return `
      <g class="catnap-jacket-layer" data-jacket="saja_neon_bomber">
        <path d="M 120 226 L 104 328 L 172 332 L 180 232 Z" fill="#06b6d4" stroke="#22d3ee" stroke-width="3" />
        <path d="M 280 226 L 296 328 L 228 332 L 220 232 Z" fill="#f43f5e" stroke="#fb7185" stroke-width="3" />
        <!-- Fizzy Soda Bubbles & Neon Stripes -->
        <circle cx="142" cy="268" r="7" fill="#ffffff" opacity="0.85" />
        <circle cx="156" cy="292" r="5" fill="#fde047" opacity="0.9" />
        <circle cx="258" cy="272" r="7" fill="#22d3ee" opacity="0.9" />
        <circle cx="244" cy="296" r="5" fill="#ffffff" opacity="0.85" />
      </g>
    `;
  }
  if (id === 'starlight_sleepover_hoodie') {
    return `
      <g class="catnap-jacket-layer" data-jacket="starlight_sleepover_hoodie">
        <path d="M 118 225 Q 200 245 282 225 L 294 332 Q 200 342 106 332 Z" fill="#4f46e5" stroke="#818cf8" stroke-width="3" opacity="0.92" />
        <!-- Front Kangaroo Pocket & Stars -->
        <path d="M 155 285 Q 200 275 245 285 L 252 322 Q 200 328 148 322 Z" fill="#3730a3" stroke="#a5b4fc" stroke-width="2" />
        <circle cx="145" cy="258" r="3.5" fill="#fde047" />
        <circle cx="255" cy="258" r="3.5" fill="#fde047" />
      </g>
    `;
  }
  return `<g class="catnap-jacket-layer" data-jacket="none"></g>`;
}

/**
 * Generates SVG markup for CatNap's Headphones / Headgear layer.
 */
export function renderHeadphonesSvg(headphonesId) {
  const id = normalizeWardrobeValue('headphones', headphonesId);
  if (id === 'glowing_neon_headphones') {
    return `
      <g class="catnap-headphones-layer" data-headphones="glowing_neon_headphones">
        <path d="M 104 148 C 100 68, 300 68, 296 148" fill="none" stroke="#22d3ee" stroke-width="10" stroke-linecap="round" />
        <path d="M 108 148 C 105 76, 295 76, 292 148" fill="none" stroke="#a855f7" stroke-width="4" stroke-linecap="round" />
        <rect x="88" y="128" width="26" height="50" rx="12" fill="#0f172a" stroke="#22d3ee" stroke-width="4" />
        <rect x="286" y="128" width="26" height="50" rx="12" fill="#0f172a" stroke="#22d3ee" stroke-width="4" />
        <circle cx="101" cy="153" r="6" fill="#f472b6" />
        <circle cx="299" cy="153" r="6" fill="#f472b6" />
      </g>
    `;
  }
  if (id === 'demon_hunter_crown_headset') {
    return `
      <g class="catnap-headphones-layer" data-headphones="demon_hunter_crown_headset">
        <polygon points="150,94 172,62 200,82 228,62 250,94" fill="#fbbf24" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round" />
        <polygon points="200,52 206,68 222,68 209,77 214,92 200,83 186,92 191,77 178,68 194,68" fill="#ec4899" stroke="#fef08a" stroke-width="2" />
        <!-- Glowing Idol Stage Microphone -->
        <path d="M 282 158 Q 268 188 228 186" fill="none" stroke="#fbbf24" stroke-width="4.5" stroke-linecap="round" />
        <circle cx="224" cy="186" r="7" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
      </g>
    `;
  }
  if (id === 'starlight_sleep_cap') {
    return `
      <g class="catnap-headphones-layer" data-headphones="starlight_sleep_cap">
        <path d="M 122 104 Q 200 45 278 104 Z" fill="#ec4899" stroke="#fbcfe8" stroke-width="3" />
        <rect x="118" y="96" width="164" height="18" rx="9" fill="#fdf2f8" />
        <circle cx="200" cy="56" r="16" fill="#fde047" stroke="#fef08a" stroke-width="3" />
      </g>
    `;
  }
  return `<g class="catnap-headphones-layer" data-headphones="none"></g>`;
}

/**
 * Generates SVG markup for CatNap's Crescent Moon Pendant / Charm layer.
 */
export function renderPendantSvg(pendantId) {
  const id = normalizeWardrobeValue('pendant', pendantId);
  if (id === 'huntrx_crystal_pendant') {
    return `
      <g class="catnap-pendant-layer" data-pendant="huntrx_crystal_pendant">
        <path d="M 140 218 Q 200 234 260 218" fill="none" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
        <polygon points="200,226 222,258 200,292 178,258" fill="#c084fc" stroke="#fef08a" stroke-width="3.5" />
        <polygon points="200,236 212,258 200,280 188,258" fill="#38bdf8" opacity="0.85" />
      </g>
    `;
  }
  if (id === 'sf_boston_heart_locket') {
    return `
      <g class="catnap-pendant-layer" data-pendant="sf_boston_heart_locket">
        <path d="M 140 218 Q 200 234 260 218" fill="none" stroke="#fbbf24" stroke-width="6" stroke-linecap="round" />
        <path d="M 200 242 C 188 226, 166 236, 174 256 L 200 284 L 226 256 C 234 236, 212 226, 200 242 Z" fill="#fb7185" stroke="#fde047" stroke-width="3.5" />
        <text x="200" y="262" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold" font-family="sans-serif">SF↔BOS</text>
      </g>
    `;
  }
  // Default: crescent_moon_gold
  return `
    <g class="catnap-pendant-layer" data-pendant="crescent_moon_gold">
      <path d="M 140 218 Q 200 234 260 218" fill="none" stroke="#f59e0b" stroke-width="6.5" stroke-linecap="round" />
      <path d="M 212 232 A 26 26 0 1 1 182 276 A 20 20 0 1 0 212 232 Z" fill="#facc15" stroke="#fef08a" stroke-width="3" />
      <polygon points="216,254 219,261 226,261 220,265 222,272 216,268 210,272 212,265 206,261 213,261" fill="#fef08a" />
    </g>
  `;
}

/**
 * Generates SVG markup for CatNap's Boston Winter Scarf layer.
 */
export function renderScarfSvg(scarfId) {
  const id = normalizeWardrobeValue('scarf', scarfId);
  if (id === 'boston_crimson_knit_scarf') {
    return `
      <g class="catnap-scarf-layer" data-scarf="boston_crimson_knit_scarf">
        <rect x="126" y="206" width="148" height="32" rx="16" fill="#e11d48" stroke="#fef3c7" stroke-width="3" />
        <line x1="155" y1="206" x2="155" y2="238" stroke="#fef3c7" stroke-width="5" />
        <line x1="195" y1="206" x2="195" y2="238" stroke="#fef3c7" stroke-width="5" />
        <line x1="235" y1="206" x2="235" y2="238" stroke="#fef3c7" stroke-width="5" />
        <path d="M 232 232 L 252 296 L 222 296 L 212 234 Z" fill="#e11d48" stroke="#fef3c7" stroke-width="2.5" />
      </g>
    `;
  }
  if (id === 'fenway_emerald_scarf') {
    return `
      <g class="catnap-scarf-layer" data-scarf="fenway_emerald_scarf">
        <rect x="126" y="206" width="148" height="32" rx="16" fill="#a78bfa" stroke="#f3e8ff" stroke-width="3" />
        <circle cx="158" cy="222" r="5" fill="#fef08a" />
        <circle cx="200" cy="222" r="5" fill="#fef08a" />
        <circle cx="242" cy="222" r="5" fill="#fef08a" />
        <path d="M 232 232 L 252 296 L 222 296 L 212 234 Z" fill="#a78bfa" stroke="#f3e8ff" stroke-width="2.5" />
      </g>
    `;
  }
  if (id === 'golden_gate_sunset_scarf') {
    return `
      <g class="catnap-scarf-layer" data-scarf="golden_gate_sunset_scarf">
        <rect x="126" y="206" width="148" height="32" rx="16" fill="#f97316" stroke="#fde047" stroke-width="3" />
        <path d="M 232 232 L 252 296 L 222 296 L 212 234 Z" fill="#fb923c" stroke="#fde047" stroke-width="2.5" />
      </g>
    `;
  }
  return `<g class="catnap-scarf-layer" data-scarf="none"></g>`;
}

/**
 * Draws the animated CatNap character sprite onto a 2D Canvas for the Rooftop Dash mini-game,
 * reflecting the player's equipped wardrobe items (jacket, headphones, pendant, scarf).
 */
export function drawCatNapRunnerSprite(ctx, x, y, width, height, animPhase, outfit = {}) {
  ctx.save();
  ctx.translate(x, y);

  const legSwing = Math.sin(animPhase * 8) * 7;
  const tailWag = Math.sin(animPhase * 5) * 10;

  // Plush Tail
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(8, height - 18);
  ctx.quadraticCurveTo(-12, height - 28 + tailWag, -6, height - 42 + tailWag * 0.5);
  ctx.stroke();

  // Legs
  ctx.fillStyle = '#6d28d9';
  ctx.beginPath();
  ctx.roundRect(14 + legSwing, height - 14, 11, 14, 5);
  ctx.roundRect(width - 24 - legSwing, height - 14, 11, 14, 5);
  ctx.fill();

  // Body (Royal Lavender Plush or Jacket)
  const jacketId = normalizeWardrobeValue('jacket', outfit.jacket);
  if (jacketId === 'kpop_idol_jacket') {
    ctx.fillStyle = '#f59e0b';
  } else if (jacketId === 'saja_neon_bomber') {
    ctx.fillStyle = '#06b6d4';
  } else if (jacketId === 'starlight_sleepover_hoodie') {
    ctx.fillStyle = '#4f46e5';
  } else {
    ctx.fillStyle = '#8b5cf6';
  }
  ctx.beginPath();
  ctx.roundRect(10, height - 36, width - 16, 26, 12);
  ctx.fill();

  // Head
  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.arc(width * 0.56, height - 42, 18, 0, Math.PI * 2);
  ctx.fill();

  // Floppy Cat Ears
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(width * 0.4, height - 54);
  ctx.lineTo(width * 0.34, height - 68);
  ctx.lineTo(width * 0.5, height - 58);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(width * 0.62, height - 58);
  ctx.lineTo(width * 0.72, height - 68);
  ctx.lineTo(width * 0.74, height - 52);
  ctx.fill();

  // Starry Eyes & Happy Smile
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.arc(width * 0.52, height - 44, 3.5, 0, Math.PI * 2);
  ctx.arc(width * 0.66, height - 44, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(width * 0.51, height - 45, 1.3, 0, Math.PI * 2);
  ctx.arc(width * 0.65, height - 45, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Crescent Moon Pendant
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(width * 0.56, height - 25, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Optional Scarf
  const scarfId = normalizeWardrobeValue('scarf', outfit.scarf);
  if (scarfId !== 'none') {
    ctx.fillStyle = scarfId === 'boston_crimson_knit_scarf' ? '#e11d48' : '#a78bfa';
    ctx.fillRect(12, height - 34, width - 20, 6);
  }

  ctx.restore();
}
