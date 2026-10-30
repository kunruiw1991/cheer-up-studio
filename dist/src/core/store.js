/**
 * Boston ↔ Bay Area Creative Cheer-Up Studio
 * Global Versioned State Store, Persistence Engine & Pub/Sub Event Bus
 *
 * Implements PROJECT.md § 5.1 STORAGE_KEYS with automatic JSON serialization,
 * schema validation, warm default pre-populated data, CRUD helpers across all
 * four studio modules (R1..R4), and a synchronous pub/sub event bus.
 */

export const STORAGE_KEYS = {
  PROFILE: 'cheerup_v1_profile',             // { nickname: string, avatarId: string, updatedAt: number }
  TATTOOS: 'cheerup_v1_saved_tattoos',       // Array<{ id, title, createdAt, previewDataUrl, layers, skinTone, lighting }>
  OUTFITS: 'cheerup_v1_saved_outfits',       // Array<{ id, title, createdAt, jacket, headphones, pendant, scarf, expression }>
  REMIXES: 'cheerup_v1_saved_remixes',       // Array<{ id, title, createdAt, bpm, activeLoops: number[], events: Array<{t, pad, action}> }>
  HIGH_SCORES: 'cheerup_v1_high_scores',     // { rooftopDash: number, rhythmGolden: number, rhythmTakedown: number, rhythmSodaPop: number }
  UNLOCKED_STICKERS: 'cheerup_v1_stickers',  // Array<string> (stamp IDs unlocked via Rooftop Dash or Postcard Wall)
  MOM_POSTCARDS: 'cheerup_v1_mom_postcards', // Array<{ id, date, fromCity, toCity, title, message, stickerId, read: boolean, reaction: string }>
};

export const DEFAULT_PROFILE = Object.freeze({
  nickname: 'Boston Starlight Artist',
  daughterName: 'Little Star',
  avatarId: 'catnap-moon',
  momCityLabel: 'San Francisco, CA (Bay Area)',
  daughterCityLabel: 'Boston, MA',
  updatedAt: 1726885800000,
});

export const DEFAULT_HIGH_SCORES = Object.freeze({
  rooftopDash: 280,
  rhythmGolden: 1450,
  rhythmTakedown: 1120,
  rhythmSodaPop: 1380,
});

export const DEFAULT_UNLOCKED_STICKERS = Object.freeze([
  'catnap_crescent_pendant',
  'lavender_dream_cloud',
  'huntrx_rumi_emblem',
  'saja_boys_golden_crest',
  'golden_gate_to_boston_bridge',
  'mom_heart_daughter_crest',
  'boston_superstar_crest',
]);

export const DEFAULT_MOM_POSTCARDS = Object.freeze([
  {
    id: 'postcard-sf-golden-gate',
    date: '2026-09-18',
    fromCity: 'San Francisco, CA (Bay Area)',
    toCity: 'Boston, MA',
    title: 'Golden Gate Sunset Hugs Across the Sky!',
    message:
      'My dearest superstar in Boston! Even when Mom is working near the Golden Gate Bridge in the Bay Area, every evening sunset reminds me of your bright smile. Sending you the biggest hug across the sky tonight!',
    stickerId: 'golden_gate_to_boston_bridge',
    frontArtworkTheme: 'golden-gate-sunset',
    read: true,
    reaction: '❤️',
    attachedStickerIds: ['golden_gate_to_boston_bridge'],
    heartCount: 5,
  },
  {
    id: 'postcard-catnap-lavender',
    date: '2026-09-19',
    fromCity: 'San Francisco, CA (Bay Area)',
    toCity: 'Boston, MA',
    title: 'CatNap & Smiling Critters Dream Cloud Delivery',
    message:
      'CatNap whispered that the bravest, most creative tattoo artist lives right in Boston! I packed a fluffy lavender starlight cloud in this postcard so you have the coziest evening ever.',
    stickerId: 'catnap_crescent_pendant',
    frontArtworkTheme: 'catnap-lavender-dream',
    read: true,
    reaction: '🌙',
    attachedStickerIds: ['catnap_crescent_pendant'],
    heartCount: 7,
  },
  {
    id: 'postcard-kpop-huntrx',
    date: '2026-09-20',
    fromCity: 'San Francisco, CA (Bay Area)',
    toCity: 'Boston, MA',
    title: 'HUNTR/X & Saja Boys Front-Row VIP Pass!',
    message:
      'Turn up "Golden", "Takedown", and "Soda Pop"! Mom built this K-Pop Demon Hunters rhythm stage just for you so we can rock out to the same beats from California to Massachusetts!',
    stickerId: 'huntrx_rumi_emblem',
    frontArtworkTheme: 'huntrx-golden-stage',
    read: false,
    reaction: '✨',
    attachedStickerIds: ['huntrx_rumi_emblem'],
    heartCount: 9,
  },
  {
    id: 'postcard-boston-ducklings',
    date: '2026-09-21',
    fromCity: 'San Francisco, CA (Bay Area)',
    toCity: 'Boston, MA',
    title: 'Coast-to-Coast Love: Mom & You Forever',
    message:
      'Say hi to the Boston Public Garden ducklings for Mom! Design your favorite temporary tattoos in the studio, try them on, and send me a creation card anytime—I love seeing everything you make!',
    stickerId: 'boston_duckling_bridge_badge',
    frontArtworkTheme: 'boston-public-garden',
    read: false,
    reaction: '🦆',
    attachedStickerIds: ['boston_duckling_bridge_badge'],
    heartCount: 12,
  },
]);

function cloneDeep(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

// Gallery sizing guards (iPad Safari localStorage quota is ~5 MB total).
export const MAX_SAVED_TATTOOS = 40;
export const MAX_PREVIEW_DATA_URL_CHARS = 160 * 1024;

export class CheerUpStoreEngine {
  constructor() {
    this.STORAGE_KEYS = STORAGE_KEYS;
    this._listeners = new Map();
    this._memoryFallback = new Map();
    this._ensureInitialized();
  }

  /**
   * Ensure all canonical keys have valid initial state in localStorage.
   */
  _ensureInitialized() {
    if (!this._readRaw(STORAGE_KEYS.PROFILE)) {
      this._writeRaw(STORAGE_KEYS.PROFILE, cloneDeep(DEFAULT_PROFILE));
    }
    if (!Array.isArray(this._readRaw(STORAGE_KEYS.TATTOOS))) {
      this._writeRaw(STORAGE_KEYS.TATTOOS, []);
    }
    if (!Array.isArray(this._readRaw(STORAGE_KEYS.OUTFITS))) {
      this._writeRaw(STORAGE_KEYS.OUTFITS, []);
    }
    if (!Array.isArray(this._readRaw(STORAGE_KEYS.REMIXES))) {
      this._writeRaw(STORAGE_KEYS.REMIXES, []);
    }
    if (!this._readRaw(STORAGE_KEYS.HIGH_SCORES)) {
      this._writeRaw(STORAGE_KEYS.HIGH_SCORES, cloneDeep(DEFAULT_HIGH_SCORES));
    }
    if (!Array.isArray(this._readRaw(STORAGE_KEYS.UNLOCKED_STICKERS))) {
      this._writeRaw(STORAGE_KEYS.UNLOCKED_STICKERS, cloneDeep(DEFAULT_UNLOCKED_STICKERS));
    }
    if (!Array.isArray(this._readRaw(STORAGE_KEYS.MOM_POSTCARDS))) {
      this._writeRaw(STORAGE_KEYS.MOM_POSTCARDS, cloneDeep(DEFAULT_MOM_POSTCARDS));
    }
  }

  _readRaw(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw !== null && raw !== undefined) {
          return JSON.parse(raw);
        }
      }
    } catch {
      // Fall back to in-memory store if localStorage is blocked or corrupted
    }
    return this._memoryFallback.has(key) ? cloneDeep(this._memoryFallback.get(key)) : null;
  }

  _writeRaw(key, value) {
    const serialized = JSON.stringify(value);
    this._memoryFallback.set(key, JSON.parse(serialized));
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
    } catch (err) {
      // Quota / security error. For list-valued keys (newest first), evict the
      // oldest entries until the write fits so the studio keeps working instead
      // of silently dropping every save once iPad Safari's ~5 MB quota is full.
      if (Array.isArray(value) && value.length > 1) {
        const trimmed = value.slice(0, Math.max(1, Math.floor(value.length * 0.75)));
        console.warn(`[CheerUpStore] storage full for ${key}; evicting ${value.length - trimmed.length} oldest item(s)`);
        return this._writeRaw(key, trimmed);
      }
      console.warn('[CheerUpStore] storage write failed for', key, err);
    }
    return value;
  }

  /**
   * One-time repair for gallery entries saved by earlier builds that persisted a
   * full 600x600 PNG (~1 MB each) as `previewDataUrl`. Re-encodes them as small
   * thumbnails so the whole gallery fits comfortably inside the storage quota.
   */
  migrateOversizedPreviews({ maxChars = MAX_PREVIEW_DATA_URL_CHARS, thumbSize = 240 } = {}) {
    if (typeof document === 'undefined' || typeof Image === 'undefined') return Promise.resolve(0);
    const list = this.getTattoos();
    const oversized = list.filter(
      (t) => typeof t.previewDataUrl === 'string' && t.previewDataUrl.length > maxChars
    );
    if (oversized.length === 0) return Promise.resolve(0);

    const shrink = (dataUrl) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const scale = Math.min(1, thumbSize / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
            c.height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));
            const cctx = c.getContext('2d');
            cctx.fillStyle = '#0f172a';
            cctx.fillRect(0, 0, c.width, c.height);
            cctx.drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL('image/jpeg', 0.82));
          } catch {
            resolve('');
          }
        };
        img.onerror = () => resolve('');
        img.src = dataUrl;
      });

    return Promise.all(
      oversized.map(async (t) => {
        const small = await shrink(t.previewDataUrl);
        t.previewDataUrl = small;
        t.thumbnailDataUrl = small;
      })
    ).then(() => {
      this._writeRaw(STORAGE_KEYS.TATTOOS, list);
      this.emit('tattoos:updated', list);
      this.emit('state:changed', { key: STORAGE_KEYS.TATTOOS, value: list });
      console.info(`[CheerUpStore] shrank ${oversized.length} oversized gallery preview(s)`);
      return oversized.length;
    });
  }

  /**
   * Generic key getter with fallback default.
   */
  get(key, fallback = null) {
    const value = this._readRaw(key);
    if (value === null || value === undefined) {
      return cloneDeep(fallback);
    }
    return value;
  }

  /**
   * Generic key setter with event emission.
   */
  set(key, value) {
    this._writeRaw(key, value);
    this.emit(`storage:${key}`, value);
    this.emit('state:changed', { key, value });
    return value;
  }

  /**
   * Subscribe to store events. Returns an unsubscribe function.
   */
  subscribe(eventName, callback) {
    if (typeof eventName === 'function' && callback === undefined) {
      callback = eventName;
      eventName = '*';
    }
    if (typeof callback !== 'function') {
      return () => {};
    }
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, new Set());
    }
    this._listeners.get(eventName).add(callback);
    return () => this.unsubscribe(eventName, callback);
  }

  on(eventName, callback) {
    return this.subscribe(eventName, callback);
  }

  unsubscribe(eventName, callback) {
    const set = this._listeners.get(eventName);
    if (set) {
      set.delete(callback);
    }
  }

  off(eventName, callback) {
    return this.unsubscribe(eventName, callback);
  }

  /**
   * Synchronously emit an event to all registered subscribers.
   */
  emit(eventName, payload = {}) {
    const direct = this._listeners.get(eventName);
    if (direct) {
      for (const fn of Array.from(direct)) {
        try {
          fn(payload, eventName);
        } catch (err) {
          // Prevent a faulty listener from breaking other subscribers
          console.warn('[CheerUpStore] subscriber error on', eventName, err);
        }
      }
    }
    const wildcard = this._listeners.get('*');
    if (wildcard) {
      for (const fn of Array.from(wildcard)) {
        try {
          fn(payload, eventName);
        } catch (err) {
          console.warn('[CheerUpStore] wildcard subscriber error on', eventName, err);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Profile Helpers
  // ---------------------------------------------------------------------------
  getProfile() {
    const profile = this._readRaw(STORAGE_KEYS.PROFILE);
    if (!profile || typeof profile !== 'object') {
      return cloneDeep(DEFAULT_PROFILE);
    }
    return { ...cloneDeep(DEFAULT_PROFILE), ...profile };
  }

  updateProfile(patch = {}) {
    const current = this.getProfile();
    const updated = {
      ...current,
      ...patch,
      updatedAt: Date.now(),
    };
    this._writeRaw(STORAGE_KEYS.PROFILE, updated);
    this.emit('profile:updated', updated);
    this.emit('state:changed', { key: STORAGE_KEYS.PROFILE, value: updated });
    return updated;
  }

  setProfile(profile) {
    return this.updateProfile(profile);
  }

  // ---------------------------------------------------------------------------
  // Saved Tattoos (R1)
  // ---------------------------------------------------------------------------
  getTattoos() {
    const list = this._readRaw(STORAGE_KEYS.TATTOOS);
    return Array.isArray(list) ? list : [];
  }

  getSavedTattoos() {
    return this.getTattoos();
  }

  saveTattoo(tattoo = {}) {
    const list = this.getTattoos();
    const entry = {
      id: tattoo.id || `tattoo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: tattoo.title || tattoo.name || `Custom Tattoo #${list.length + 1}`,
      createdAt: tattoo.createdAt || Date.now(),
      previewDataUrl: tattoo.previewDataUrl || tattoo.thumbnailDataUrl || '',
      layers: Array.isArray(tattoo.layers) ? tattoo.layers : [],
      skinTone: tattoo.skinTone || tattoo.skinTonePreset || 'warm-peach',
      lighting: tattoo.lighting || 'daylight',
      ...tattoo,
    };
    const idx = list.findIndex((item) => item.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    if (list.length > MAX_SAVED_TATTOOS) {
      list.length = MAX_SAVED_TATTOOS;
    }
    this._writeRaw(STORAGE_KEYS.TATTOOS, list);
    this.emit('tattoos:updated', list);
    this.emit('gallery:updated', { type: 'tattoo', item: entry, list });
    this.emit('state:changed', { key: STORAGE_KEYS.TATTOOS, value: list });
    return entry;
  }

  addTattoo(tattoo) {
    return this.saveTattoo(tattoo);
  }

  deleteTattoo(id) {
    const list = this.getTattoos().filter((item) => item.id !== id);
    this._writeRaw(STORAGE_KEYS.TATTOOS, list);
    this.emit('tattoos:updated', list);
    this.emit('gallery:updated', { type: 'tattoo', deletedId: id, list });
    this.emit('state:changed', { key: STORAGE_KEYS.TATTOOS, value: list });
    return list;
  }

  removeTattoo(id) {
    return this.deleteTattoo(id);
  }

  // ---------------------------------------------------------------------------
  // Saved CatNap Outfits (R2)
  // ---------------------------------------------------------------------------
  getOutfits() {
    const list = this._readRaw(STORAGE_KEYS.OUTFITS);
    return Array.isArray(list) ? list : [];
  }

  getSavedOutfits() {
    return this.getOutfits();
  }

  saveOutfit(outfit = {}) {
    const list = this.getOutfits();
    const entry = {
      id: outfit.id || `outfit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: outfit.title || outfit.name || `CatNap Look #${list.length + 1}`,
      createdAt: outfit.createdAt || Date.now(),
      jacket: outfit.jacket || outfit.jacketId || 'none',
      headphones: outfit.headphones || outfit.headwearId || 'none',
      pendant: outfit.pendant || outfit.pendantId || 'crescent_moon_gold',
      scarf: outfit.scarf || outfit.scarfId || 'none',
      expression: outfit.expression || 'happy_smile',
      ...outfit,
    };
    const idx = list.findIndex((item) => item.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    this._writeRaw(STORAGE_KEYS.OUTFITS, list);
    this.emit('outfits:updated', list);
    this.emit('gallery:updated', { type: 'outfit', item: entry, list });
    this.emit('state:changed', { key: STORAGE_KEYS.OUTFITS, value: list });
    return entry;
  }

  addOutfit(outfit) {
    return this.saveOutfit(outfit);
  }

  deleteOutfit(id) {
    const list = this.getOutfits().filter((item) => item.id !== id);
    this._writeRaw(STORAGE_KEYS.OUTFITS, list);
    this.emit('outfits:updated', list);
    this.emit('gallery:updated', { type: 'outfit', deletedId: id, list });
    this.emit('state:changed', { key: STORAGE_KEYS.OUTFITS, value: list });
    return list;
  }

  removeOutfit(id) {
    return this.deleteOutfit(id);
  }

  // ---------------------------------------------------------------------------
  // Saved K-Pop Song Remixes (R3)
  // ---------------------------------------------------------------------------
  getRemixes() {
    const list = this._readRaw(STORAGE_KEYS.REMIXES);
    return Array.isArray(list) ? list : [];
  }

  getSavedRemixes() {
    return this.getRemixes();
  }

  saveRemix(remix = {}) {
    const list = this.getRemixes();
    const entry = {
      id: remix.id || `remix-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: remix.title || remix.name || `Demon Hunters Remix #${list.length + 1}`,
      createdAt: remix.createdAt || Date.now(),
      bpm: Number(remix.bpm) || 128,
      activeLoops: Array.isArray(remix.activeLoops) ? remix.activeLoops : [],
      events: Array.isArray(remix.events) ? remix.events : [],
      ...remix,
    };
    const idx = list.findIndex((item) => item.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    this._writeRaw(STORAGE_KEYS.REMIXES, list);
    this.emit('remixes:updated', list);
    this.emit('gallery:updated', { type: 'remix', item: entry, list });
    this.emit('state:changed', { key: STORAGE_KEYS.REMIXES, value: list });
    return entry;
  }

  addRemix(remix) {
    return this.saveRemix(remix);
  }

  deleteRemix(id) {
    const list = this.getRemixes().filter((item) => item.id !== id);
    this._writeRaw(STORAGE_KEYS.REMIXES, list);
    this.emit('remixes:updated', list);
    this.emit('gallery:updated', { type: 'remix', deletedId: id, list });
    this.emit('state:changed', { key: STORAGE_KEYS.REMIXES, value: list });
    return list;
  }

  removeRemix(id) {
    return this.deleteRemix(id);
  }

  // ---------------------------------------------------------------------------
  // High Scores (R2 & R3)
  // ---------------------------------------------------------------------------
  getHighScores() {
    const scores = this._readRaw(STORAGE_KEYS.HIGH_SCORES);
    if (!scores || typeof scores !== 'object') {
      return cloneDeep(DEFAULT_HIGH_SCORES);
    }
    return { ...cloneDeep(DEFAULT_HIGH_SCORES), ...scores };
  }

  updateHighScore(key, score) {
    const current = this.getHighScores();
    const numeric = Number(score) || 0;
    const prev = Number(current[key]) || 0;
    if (numeric > prev) {
      current[key] = numeric;
      this._writeRaw(STORAGE_KEYS.HIGH_SCORES, current);
      this.emit('highscores:updated', current);
      this.emit('state:changed', { key: STORAGE_KEYS.HIGH_SCORES, value: current });
    }
    return current;
  }

  setHighScore(key, score) {
    return this.updateHighScore(key, score);
  }

  // ---------------------------------------------------------------------------
  // Unlocked Stickers (R1 / R2 / R4)
  // ---------------------------------------------------------------------------
  getUnlockedStickers() {
    const stickers = this._readRaw(STORAGE_KEYS.UNLOCKED_STICKERS);
    return Array.isArray(stickers) ? stickers : cloneDeep(DEFAULT_UNLOCKED_STICKERS);
  }

  isStickerUnlocked(stickerId) {
    return this.getUnlockedStickers().includes(stickerId);
  }

  unlockSticker(stickerId) {
    if (!stickerId) {
      return this.getUnlockedStickers();
    }
    const list = this.getUnlockedStickers();
    if (!list.includes(stickerId)) {
      list.push(stickerId);
      this._writeRaw(STORAGE_KEYS.UNLOCKED_STICKERS, list);
      this.emit('sticker:unlocked', { stickerId, stickers: list });
      this.emit('stickers:updated', list);
      this.emit('state:changed', { key: STORAGE_KEYS.UNLOCKED_STICKERS, value: list });
    }
    return list;
  }

  // ---------------------------------------------------------------------------
  // Mom's Postcard Wall (R4)
  // ---------------------------------------------------------------------------
  getPostcards() {
    const cards = this._readRaw(STORAGE_KEYS.MOM_POSTCARDS);
    if (!Array.isArray(cards) || cards.length === 0) {
      return cloneDeep(DEFAULT_MOM_POSTCARDS);
    }
    return cards;
  }

  getMomPostcards() {
    return this.getPostcards();
  }

  savePostcard(postcard = {}) {
    const list = this.getPostcards();
    const entry = {
      id: postcard.id || `postcard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: postcard.date || new Date().toISOString().slice(0, 10),
      fromCity: postcard.fromCity || 'Boston, MA',
      toCity: postcard.toCity || 'San Francisco, CA (Bay Area)',
      title: postcard.title || 'Love Across the Miles',
      message: postcard.message || postcard.messageBody || '',
      stickerId: postcard.stickerId || 'mom_heart_daughter_crest',
      read: Boolean(postcard.read),
      reaction: postcard.reaction || '❤️',
      ...postcard,
    };
    const idx = list.findIndex((item) => item.id === entry.id);
    if (idx >= 0) {
      list[idx] = entry;
    } else {
      list.unshift(entry);
    }
    this._writeRaw(STORAGE_KEYS.MOM_POSTCARDS, list);
    this.emit('postcards:updated', list);
    this.emit('state:changed', { key: STORAGE_KEYS.MOM_POSTCARDS, value: list });
    return entry;
  }

  addPostcard(postcard) {
    return this.savePostcard(postcard);
  }

  updatePostcard(id, patch = {}) {
    const list = this.getPostcards();
    const idx = list.findIndex((item) => item.id === id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...patch };
      this._writeRaw(STORAGE_KEYS.MOM_POSTCARDS, list);
      this.emit('postcards:updated', list);
      this.emit('state:changed', { key: STORAGE_KEYS.MOM_POSTCARDS, value: list });
      return list[idx];
    }
    return null;
  }

  markPostcardRead(id, reaction = null) {
    const patch = { read: true };
    if (reaction !== null) {
      patch.reaction = reaction;
    }
    return this.updatePostcard(id, patch);
  }
}

export const CheerUpStore = new CheerUpStoreEngine();

if (typeof window !== 'undefined') {
  window.CheerUpStore = CheerUpStore;
}

export function createStore() {
  return new CheerUpStoreEngine();
}

export default CheerUpStore;
