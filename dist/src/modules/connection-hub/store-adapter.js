/**
 * @fileoverview Unified persistence & state adapter for Milestone M5 (Connection Hub & Gallery).
 * Bridges `window.CheerUpStore` (PROJECT.md § 5.1) and versioned `localStorage` keys
 * (`cheerup_v1_*` and `cheer_up_studio_v1_*`) with automatic corruption recovery.
 */

export const CANONICAL_KEYS = {
  PROFILE: 'cheerup_v1_profile',
  TATTOOS: 'cheerup_v1_saved_tattoos',
  OUTFITS: 'cheerup_v1_saved_outfits',
  REMIXES: 'cheerup_v1_saved_remixes',
  HIGH_SCORES: 'cheerup_v1_high_scores',
  UNLOCKED_STICKERS: 'cheerup_v1_stickers',
  MOM_POSTCARDS: 'cheerup_v1_mom_postcards',
};

export const ALT_KEYS = {
  PROFILE: 'cheer_up_studio_v1_profile',
  TATTOOS: 'cheer_up_studio_v1_tattoos',
  OUTFITS: 'cheer_up_studio_v1_outfits',
  REMIXES: 'cheer_up_studio_v1_remixes',
  HIGH_SCORES: 'cheer_up_studio_v1_game_records',
  UNLOCKED_STICKERS: 'cheer_up_studio_v1_unlockables',
  MOM_POSTCARDS: 'cheer_up_studio_v1_postcards',
};

export const DEFAULT_PROFILE = {
  daughterName: 'Little Star',
  nickname: 'Boston Starlight Artist',
  avatarId: 'catnap-moon',
  momCityLabel: 'San Francisco, CA (Bay Area)',
  daughterCityLabel: 'Boston, MA',
  openedCapsuleIds: [],
  lastCapsuleDate: '',
  updatedAt: Date.now(),
};

export const DEFAULT_POSTCARDS = [
  {
    id: 'pc-golden-gate',
    date: '2026-09-20',
    dateLabel: 'Sunday Sunset • Bay Area → Boston',
    fromCity: 'San Francisco, CA',
    toCity: 'Boston, MA',
    sender: 'Mom (Bay Area)',
    title: 'Golden Gate Hugs Across the Sky!',
    frontArtworkTheme: 'golden-gate-sunset',
    message:
      'Hi my sweet star! I watched the golden sunset over the Golden Gate Bridge today and sent a giant warm hug riding the clouds all the way to you in Boston. Keep shining and designing amazing tattoos!',
    stickerId: 'bay_boston_bridge_heart',
    attachedStickerIds: ['⭐', '🌉', '💜'],
    read: true,
    isPinned: true,
    isFlipped: false,
    reaction: '❤️',
    heartCount: 5,
  },
  {
    id: 'pc-catnap-dream',
    date: '2026-09-19',
    dateLabel: 'Starry Night • Lavender Dream Mail',
    fromCity: 'San Francisco, CA',
    toCity: 'Boston, MA',
    sender: 'Mom (Bay Area)',
    title: 'CatNap Lavender Moon Wishes',
    frontArtworkTheme: 'catnap-lavender-dream',
    message:
      'CatNap whispered that you are the coziest, most creative artist in Boston! Whenever you pet CatNap or jump across the starry rooftops, remember Mom is cheering for every single moon you collect!',
    stickerId: 'catnap_crescent_moon',
    attachedStickerIds: ['🌙', '🐱', '✨'],
    read: true,
    isPinned: true,
    isFlipped: false,
    reaction: '💜',
    heartCount: 7,
  },
  {
    id: 'pc-huntrx-concert',
    date: '2026-09-18',
    dateLabel: 'Concert Glow • K-Pop Demon Hunters',
    fromCity: 'San Francisco, CA',
    toCity: 'Boston, MA',
    sender: 'Mom (Bay Area)',
    title: 'HUNTR/X & Saja Boys VIP Backstage Pass!',
    frontArtworkTheme: 'huntrx-golden-stage',
    message:
      'Turn up "Golden", "Takedown", and "Soda Pop"! Rumi, Mira, Zoey, and the Saja Boys are so proud of your rhythm combos and beat pad remixes. Save your favorite track so we can jam together!',
    stickerId: 'kpop_huntrx_star',
    attachedStickerIds: ['🎤', '⚡', '🎵'],
    read: true,
    isPinned: false,
    isFlipped: false,
    reaction: '🌟',
    heartCount: 6,
  },
  {
    id: 'pc-boston-star',
    date: '2026-09-17',
    dateLabel: 'Coast-to-Coast Love • Boston & SF',
    fromCity: 'Boston, MA',
    toCity: 'San Francisco, CA',
    sender: 'Daughter (Boston)',
    title: 'Boston Public Garden Ducklings & Tea Time',
    frontArtworkTheme: 'boston-public-garden',
    message:
      'Connected by love from San Francisco to Boston across 3,000 miles—every temporary tattoo and song remix brings us closer together!',
    stickerId: 'boston_duckling_crest',
    attachedStickerIds: ['🦆', '🌸', '💝'],
    read: true,
    isPinned: true,
    isFlipped: false,
    reaction: '💖',
    heartCount: 9,
  },
];

export const DEFAULT_HIGH_SCORES = {
  rooftopDash: 0,
  rhythmGolden: 0,
  rhythmTakedown: 0,
  rhythmSodaPop: 0,
  catnapDashHighScore: 0,
  catnapDashBestMoons: 0,
  rhythmStageScores: {
    golden: { highScore: 0, maxCombo: 0, grade: '-' },
    takedown: { highScore: 0, maxCombo: 0, grade: '-' },
    soda_pop: { highScore: 0, maxCombo: 0, grade: '-' },
  },
};

export const DAILY_CAPSULE_MESSAGES = [
  {
    id: 'capsule-golden-bridge',
    title: 'Golden Gate Starlight Sticker Unlocked!',
    message:
      'Mom says: "You are braver than a K-Pop Demon Hunter, cozier than CatNap, and brighter than all the stars over Boston Harbor!"',
    rewardStickerId: 'bay_boston_golden_heart',
    badgeEmoji: '🌉💖✨',
  },
  {
    id: 'capsule-catnap-purr',
    title: 'CatNap Lavender Dream Crest Unlocked!',
    message:
      'Mom says: "Sending you a giant hug from the Bay Area today! Here is a special shimmering moon sticker for your next temporary tattoo sheet."',
    rewardStickerId: 'catnap_starlight_paw',
    badgeEmoji: '🌙🐾💜',
  },
  {
    id: 'capsule-huntrx-encore',
    title: 'HUNTR/X "Golden" Encore Badge Unlocked!',
    message:
      'Mom says: "Even when I am 3 hours behind in San Francisco, my heart is right there cheering in the front row for you in Boston!"',
    rewardStickerId: 'huntrx_golden_crown',
    badgeEmoji: '👑🎤⚡',
  },
];

/**
 * Safe JSON reader that recovers from corrupted localStorage entries without throwing.
 * @param {string} key
 * @param {*} fallback
 */
export function safeReadStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== typeof fallback) {
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        window.localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
    }
    return parsed;
  } catch (_err) {
    try {
      window.localStorage.setItem(key, JSON.stringify(fallback));
    } catch (_ignore) {
      // Ignore quota errors
    }
    return fallback;
  }
}

/**
 * Safe JSON writer across both primary and alternate keys.
 * @param {string} primaryKey
 * @param {string} altKey
 * @param {*} value
 */
export function safeWriteStorage(primaryKey, altKey, value) {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(primaryKey, serialized);
    if (altKey) {
      window.localStorage.setItem(altKey, serialized);
    }
  } catch (_err) {
    // Ignore storage quota exceptions
  }
}

/**
 * Deduplicates an array of objects by `id`.
 * @param {Array<Object>} listA
 * @param {Array<Object>} listB
 * @returns {Array<Object>}
 */
function mergeListsById(listA, listB) {
  const map = new Map();
  const safeA = Array.isArray(listA) ? listA : [];
  const safeB = Array.isArray(listB) ? listB : [];
  for (const item of [...safeA, ...safeB]) {
    if (item && typeof item === 'object') {
      const id = item.id || `item_${Math.random().toString(36).slice(2, 9)}`;
      map.set(id, { ...item, id });
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export class HubStoreAdapter {
  /**
   * @param {Object} [externalStore] Optional global store (`window.CheerUpStore`)
   */
  constructor(externalStore) {
    this.store = externalStore || window.CheerUpStore || null;
    this.listeners = new Set();
  }

  /**
   * Subscribe to hub or global store state updates.
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    let unsubExternal = null;
    if (this.store && typeof this.store.subscribe === 'function') {
      unsubExternal = this.store.subscribe((event, payload) => {
        callback(event, payload);
      });
    }
    return () => {
      this.listeners.delete(callback);
      if (typeof unsubExternal === 'function') {
        unsubExternal();
      }
    };
  }

  notify(event, payload) {
    for (const cb of this.listeners) {
      try {
        cb(event, payload);
      } catch (_err) {
        // Prevent listener errors from breaking UI
      }
    }
    if (this.store && typeof this.store.emit === 'function') {
      try {
        this.store.emit(event, payload);
      } catch (_err) {
        // Ignore
      }
    }
    try {
      window.dispatchEvent(new CustomEvent(`cheerup:${event}`, { detail: payload }));
    } catch (_err) {
      // Ignore
    }
  }

  /**
   * Read active user profile with fallback defaults.
   */
  getProfile() {
    let storeProfile = null;
    if (this.store && typeof this.store.get === 'function') {
      try {
        storeProfile = this.store.get('profile') || this.store.get(CANONICAL_KEYS.PROFILE);
      } catch (_err) {
        storeProfile = null;
      }
    }
    const primary = safeReadStorage(CANONICAL_KEYS.PROFILE, null);
    const alt = safeReadStorage(ALT_KEYS.PROFILE, null);
    const merged = {
      ...DEFAULT_PROFILE,
      ...(alt && typeof alt === 'object' ? alt : {}),
      ...(primary && typeof primary === 'object' ? primary : {}),
      ...(storeProfile && typeof storeProfile === 'object' ? storeProfile : {}),
    };
    if (!merged.nickname || typeof merged.nickname !== 'string') {
      merged.nickname = DEFAULT_PROFILE.nickname;
    }
    if (!merged.daughterName || typeof merged.daughterName !== 'string') {
      merged.daughterName = merged.nickname;
    }
    return merged;
  }

  /**
   * Save updated profile fields and update global header display if present.
   * @param {Partial<typeof DEFAULT_PROFILE>} updates
   */
  updateProfile(updates) {
    const current = this.getProfile();
    const cleanUpdates = { ...updates };
    if (typeof cleanUpdates.nickname === 'string') {
      cleanUpdates.nickname = cleanUpdates.nickname.trim().slice(0, 50) || DEFAULT_PROFILE.nickname;
    }
    if (typeof cleanUpdates.daughterName === 'string') {
      cleanUpdates.daughterName = cleanUpdates.daughterName.trim().slice(0, 50) || cleanUpdates.nickname || DEFAULT_PROFILE.daughterName;
    }
    const next = {
      ...current,
      ...cleanUpdates,
      updatedAt: Date.now(),
    };
    safeWriteStorage(CANONICAL_KEYS.PROFILE, ALT_KEYS.PROFILE, next);
    if (this.store && typeof this.store.set === 'function') {
      try {
        this.store.set('profile', next);
      } catch (_err) {
        // Ignore
      }
    }
    // Also update top navigation bar nickname display if mounted in DOM
    const headerDisplay = document.querySelector('[data-testid="header-nickname-display"]');
    if (headerDisplay) {
      headerDisplay.textContent = next.nickname;
    }
    this.notify('profile:updated', next);
    return next;
  }

  /**
   * Get Mom's Postcard Wall items.
   */
  getPostcards() {
    const primary = safeReadStorage(CANONICAL_KEYS.MOM_POSTCARDS, null);
    const alt = safeReadStorage(ALT_KEYS.MOM_POSTCARDS, null);
    const list = Array.isArray(primary)
      ? primary
      : Array.isArray(alt)
      ? alt
      : null;
    if (!list || list.length === 0) {
      safeWriteStorage(CANONICAL_KEYS.MOM_POSTCARDS, ALT_KEYS.MOM_POSTCARDS, DEFAULT_POSTCARDS);
      return DEFAULT_POSTCARDS.map((p) => ({ ...p, attachedStickerIds: [...(p.attachedStickerIds || [])] }));
    }
    return list;
  }

  /**
   * Save updated postcards array.
   * @param {Array<Object>} postcards
   */
  savePostcards(postcards) {
    safeWriteStorage(CANONICAL_KEYS.MOM_POSTCARDS, ALT_KEYS.MOM_POSTCARDS, postcards);
    if (this.store && typeof this.store.set === 'function') {
      try {
        this.store.set('momPostcards', postcards);
      } catch (_err) {
        // Ignore
      }
    }
    this.notify('postcards:updated', postcards);
    return postcards;
  }

  /**
   * Unlock a sticker ID and persist to store.
   * @param {string} stickerId
   */
  unlockSticker(stickerId) {
    const primary = safeReadStorage(CANONICAL_KEYS.UNLOCKED_STICKERS, []);
    const alt = safeReadStorage(ALT_KEYS.UNLOCKED_STICKERS, []);
    const set = new Set([...(Array.isArray(primary) ? primary : []), ...(Array.isArray(alt) ? alt : [])]);
    set.add(stickerId);
    const next = Array.from(set);
    safeWriteStorage(CANONICAL_KEYS.UNLOCKED_STICKERS, ALT_KEYS.UNLOCKED_STICKERS, next);
    if (this.store && typeof this.store.set === 'function') {
      try {
        this.store.set('unlockedStickers', next);
      } catch (_err) {
        // Ignore
      }
    }
    this.notify('stickers:unlocked', { stickerId, unlockedStickers: next });
    return next;
  }

  /**
   * Read saved Tattoos from both canonical and alternate storage keys.
   */
  getSavedTattoos() {
    const p = safeReadStorage(CANONICAL_KEYS.TATTOOS, []);
    const a = safeReadStorage(ALT_KEYS.TATTOOS, []);
    return mergeListsById(p, a);
  }

  /**
   * Read saved CatNap Outfits from both canonical and alternate storage keys.
   */
  getSavedOutfits() {
    const p = safeReadStorage(CANONICAL_KEYS.OUTFITS, []);
    const a = safeReadStorage(ALT_KEYS.OUTFITS, []);
    return mergeListsById(p, a);
  }

  /**
   * Read saved Song Remixes from both canonical and alternate storage keys.
   */
  getSavedRemixes() {
    const p = safeReadStorage(CANONICAL_KEYS.REMIXES, []);
    const a = safeReadStorage(ALT_KEYS.REMIXES, []);
    return mergeListsById(p, a);
  }

  /**
   * Get all unified Gallery items normalized with `{ id, type, title, createdAt, previewDataUrl, raw }`.
   * @param {'all'|'tattoos'|'outfits'|'remixes'} [filter='all']
   */
  getGalleryItems(filter = 'all') {
    const tattoos = this.getSavedTattoos().map((item) => ({
      id: item.id,
      type: 'tattoos',
      categoryLabel: 'Tattoo Design',
      title: item.title || item.name || 'Custom Tattoo Creation',
      createdAt: item.createdAt || Date.now(),
      previewDataUrl: item.previewDataUrl || item.thumbnailDataUrl || null,
      subtitle: `Skin tone: ${item.skinTone || item.skinTonePreset || 'natural'} • Stamps & Brushes`,
      raw: item,
    }));

    const outfits = this.getSavedOutfits().map((item) => ({
      id: item.id,
      type: 'outfits',
      categoryLabel: 'CatNap Outfit',
      title: item.title || item.name || 'Cozy CatNap Plush Style',
      createdAt: item.createdAt || Date.now(),
      previewDataUrl: item.previewDataUrl || item.thumbnailDataUrl || null,
      subtitle: `Jacket: ${item.jacket || item.jacketId || 'idol'} • Scarf: ${item.scarf || item.scarfId || 'boston'}`,
      raw: item,
    }));

    const remixes = this.getSavedRemixes().map((item) => ({
      id: item.id,
      type: 'remixes',
      categoryLabel: 'K-Pop Remix',
      title: item.title || item.name || 'Demon Hunters Beat Remix',
      createdAt: item.createdAt || Date.now(),
      previewDataUrl: item.previewDataUrl || null,
      subtitle: `${item.bpm || 128} BPM • ${(item.activeLoops || item.activeLoopIds || []).length} active stems`,
      raw: item,
    }));

    const all = [...tattoos, ...outfits, ...remixes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (filter === 'tattoos') return tattoos;
    if (filter === 'outfits') return outfits;
    if (filter === 'remixes') return remixes;
    return all;
  }

  /**
   * Delete a creation item from storage by id & type.
   * @param {string} id
   * @param {'tattoos'|'outfits'|'remixes'} [type]
   */
  deleteGalleryItem(id, type) {
    if (!type || type === 'tattoos') {
      const nextTattoos = this.getSavedTattoos().filter((t) => t.id !== id);
      safeWriteStorage(CANONICAL_KEYS.TATTOOS, ALT_KEYS.TATTOOS, nextTattoos);
    }
    if (!type || type === 'outfits') {
      const nextOutfits = this.getSavedOutfits().filter((o) => o.id !== id);
      safeWriteStorage(CANONICAL_KEYS.OUTFITS, ALT_KEYS.OUTFITS, nextOutfits);
    }
    if (!type || type === 'remixes') {
      const nextRemixes = this.getSavedRemixes().filter((r) => r.id !== id);
      safeWriteStorage(CANONICAL_KEYS.REMIXES, ALT_KEYS.REMIXES, nextRemixes);
    }
    this.notify('gallery:deleted', { id, type });
  }

  /**
   * Read combined high scores from R2 (CatNap Rooftop Dash) and R3 (K-Pop Stage).
   */
  getHighScores() {
    const primary = safeReadStorage(CANONICAL_KEYS.HIGH_SCORES, null);
    const alt = safeReadStorage(ALT_KEYS.HIGH_SCORES, null);
    const merged = {
      ...DEFAULT_HIGH_SCORES,
      ...(alt && typeof alt === 'object' ? alt : {}),
      ...(primary && typeof primary === 'object' ? primary : {}),
    };

    const rooftopDash = Math.max(
      Number(merged.rooftopDash) || 0,
      Number(merged.catnapDashHighScore) || 0
    );
    const golden = Math.max(
      Number(merged.rhythmGolden) || 0,
      Number(merged.rhythmStageScores?.golden?.highScore) || 0
    );
    const takedown = Math.max(
      Number(merged.rhythmTakedown) || 0,
      Number(merged.rhythmStageScores?.takedown?.highScore) || 0
    );
    const sodaPop = Math.max(
      Number(merged.rhythmSodaPop) || 0,
      Number(merged.rhythmStageScores?.soda_pop?.highScore) || 0
    );

    return {
      rooftopDash,
      rhythmGolden: golden,
      rhythmTakedown: takedown,
      rhythmSodaPop: sodaPop,
      bestKpopScore: Math.max(golden, takedown, sodaPop),
      moonsCollected: Number(merged.catnapDashBestMoons) || 0,
    };
  }
}
