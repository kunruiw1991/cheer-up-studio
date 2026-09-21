/**
 * @fileoverview Interactive CatNap Companion, Web Audio Purr Synthesizer,
 * Lavender Dream-Mist Particle Engine, and Plush Outfit Customizer Controller.
 */

import {
  EXPRESSIONS,
  WARDROBE_CATALOG,
  OUTFIT_PRESETS,
  normalizeWardrobeValue,
  renderExpressionSvg,
  renderJacketSvg,
  renderHeadphonesSvg,
  renderPendantSvg,
  renderScarfSvg,
} from './wardrobe.js';

export class CatNapCompanion {
  /**
   * @param {HTMLElement} rootContainer
   * @param {object} store
   */
  constructor(rootContainer, store) {
    this.root = rootContainer;
    this.store = store || window.CheerUpStore || null;
    this.audioCtx = null;

    this.state = {
      interactionCount: 0,
      purrCount: 0,
      friendshipLevel: 45,
      expression: 'happy_smile',
      jacket: 'none',
      headphones: 'none',
      pendant: 'crescent_moon_gold',
      scarf: 'none',
      activeParticlesCount: 0,
      lastAudioFreqHz: 0,
      savedOutfitsCount: 0,
    };

    this.particles = [];
    this.animFrameId = null;
    this.lastFrameTime = performance.now();
    this.idlePhase = 0;
    this.bounceImpulse = 0;

    this._loadInitialOutfitFromStorage();
  }

  _loadInitialOutfitFromStorage() {
    try {
      const raw = localStorage.getItem('cheerup_v1_saved_outfits') || localStorage.getItem('cheer_up_studio_v1_outfits');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          this.state.savedOutfitsCount = list.length;
          const latest = list[0];
          if (latest.expression) this.state.expression = normalizeWardrobeValue('expression', latest.expression);
          if (latest.jacket || latest.jacketId) this.state.jacket = normalizeWardrobeValue('jacket', latest.jacket || latest.jacketId);
          if (latest.headphones || latest.headwearId) {
            this.state.headphones = normalizeWardrobeValue('headphones', latest.headphones || latest.headwearId);
          }
          if (latest.pendant || latest.pendantId) {
            this.state.pendant = normalizeWardrobeValue('pendant', latest.pendant || latest.pendantId);
          }
          if (latest.scarf || latest.scarfId) {
            this.state.scarf = normalizeWardrobeValue('scarf', latest.scarf || latest.scarfId);
          }
        }
      }
    } catch (_err) {
      // Safe fallback to default state
    }
  }

  /**
   * Synthesizes a warm, soothing cat purr and pentatonic starlight chime via Web Audio API.
   */
  playCozyPurr() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        this.state.lastAudioFreqHz = 220;
        return;
      }
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;

      // 1. Warm Purr Rumble (Low-pass filtered triangle wave modulated by 26 Hz LFO)
      const carrier = this.audioCtx.createOscillator();
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();
      const purrGain = this.audioCtx.createGain();

      carrier.type = 'triangle';
      carrier.frequency.setValueAtTime(108, now);
      carrier.frequency.exponentialRampToValueAtTime(142, now + 0.55);

      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(26, now);
      lfoGain.gain.setValueAtTime(35, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);

      purrGain.gain.setValueAtTime(0.001, now);
      purrGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
      purrGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      lfo.connect(lfoGain);
      lfoGain.connect(carrier.frequency);
      carrier.connect(filter);
      filter.connect(purrGain);
      purrGain.connect(this.audioCtx.destination);

      carrier.start(now);
      lfo.start(now);
      carrier.stop(now + 0.66);
      lfo.stop(now + 0.66);

      // 2. Sparkling Pentatonic Starlight Chime
      const chimeNotes = [587.33, 739.99, 880.0, 1174.66];
      const chosenFreq = chimeNotes[this.state.purrCount % chimeNotes.length];
      this.state.lastAudioFreqHz = chosenFreq;

      const chimeOsc = this.audioCtx.createOscillator();
      const chimeGain = this.audioCtx.createGain();
      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(chosenFreq, now + 0.05);
      chimeGain.gain.setValueAtTime(0.001, now + 0.05);
      chimeGain.gain.linearRampToValueAtTime(0.14, now + 0.09);
      chimeGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.55);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.audioCtx.destination);
      chimeOsc.start(now + 0.05);
      chimeOsc.stop(now + 0.56);
    } catch (_err) {
      this.state.lastAudioFreqHz = 587.33;
    }
  }

  /**
   * Spawns lavender dream-mist clouds, crescent moons, and floating hearts around CatNap.
   */
  spawnDreamMistBurst(count = 16, centerX = 200, centerY = 175) {
    const types = ['mist', 'moon', 'heart', 'star'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.2 + Math.random() * 2.8;
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * 50,
        y: centerY + (Math.random() - 0.5) * 45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.35,
        radius: 9 + Math.random() * 15,
        alpha: 0.95,
        decay: 0.011 + Math.random() * 0.009,
        swayOffset: Math.random() * Math.PI * 2,
        type: types[i % types.length],
        color:
          i % 3 === 0
            ? 'rgba(196, 181, 253, 0.85)'
            : i % 3 === 1
              ? 'rgba(244, 114, 182, 0.85)'
              : 'rgba(253, 224, 71, 0.9)',
      });
    }
    this.state.activeParticlesCount = this.particles.length;
  }

  /**
   * Programmatic and UI trigger for petting / interacting with CatNap.
   */
  triggerCompanionInteraction() {
    this.state.interactionCount += 1;
    this.state.purrCount += 1;
    this.state.friendshipLevel = Math.min(100, this.state.friendshipLevel + 7);
    this.bounceImpulse = 14;

    this.playCozyPurr();
    this.spawnDreamMistBurst(18, 200, 170);
    this._syncTelemetryDom();
    this._renderSvgCharacter();

    return this.getState();
  }

  /**
   * Sets an outfit category or expression slot, updates the live character, and persists state.
   */
  setOutfit(slot, value) {
    if (!slot) return this.getState();
    if (Object.prototype.hasOwnProperty.call(this.state, slot)) {
      this.state[slot] = value || 'none';
    }
    this.spawnDreamMistBurst(10, 200, 210);
    this._syncControlsDom();
    this._syncTelemetryDom();
    this._renderSvgCharacter();

    if (this.onOutfitChanged) {
      this.onOutfitChanged(this.getState());
    }
    return this.getState();
  }

  /**
   * Applies a full curated outfit preset.
   */
  applyPreset(presetId) {
    const preset = OUTFIT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return this.getState();
    this.state.expression = preset.expression;
    this.state.jacket = preset.jacket;
    this.state.headphones = preset.headphones;
    this.state.pendant = preset.pendant;
    this.state.scarf = preset.scarf;
    this.spawnDreamMistBurst(16, 200, 190);
    this._syncControlsDom();
    this._syncTelemetryDom();
    this._renderSvgCharacter();
    if (this.onOutfitChanged) {
      this.onOutfitChanged(this.getState());
    }
    return this.getState();
  }

  /**
   * Saves the current custom CatNap outfit to CheerUpStore & localStorage gallery keys.
   */
  saveOutfitToGallery(customTitle) {
    const titleInput = this.root.querySelector('[data-testid="catnap-outfit-title-input"]');
    const title =
      (customTitle && String(customTitle).trim()) ||
      (titleInput && titleInput.value.trim()) ||
      `Starlight CatNap Look #${this.state.savedOutfitsCount + 1}`;

    const createdAt = Date.now();
    const id = `outfit_${createdAt}_${Math.random().toString(36).slice(2, 7)}`;

    const outfitRecord = {
      id,
      title,
      name: title,
      createdAt,
      expression: this.state.expression,
      jacket: this.state.jacket,
      jacketId: this.state.jacket,
      headphones: this.state.headphones,
      headwearId: this.state.headphones,
      pendant: this.state.pendant,
      pendantId: this.state.pendant,
      scarf: this.state.scarf,
      scarfId: this.state.scarf,
      furTint: '#8b5cf6',
      dreamMistColor: '#c4b5fd',
    };

    try {
      // 1. Write to canonical PROJECT.md key ('cheerup_v1_saved_outfits')
      const rawCanonical = localStorage.getItem('cheerup_v1_saved_outfits');
      const listCanonical = rawCanonical ? JSON.parse(rawCanonical) : [];
      const updatedCanonical = [outfitRecord, ...(Array.isArray(listCanonical) ? listCanonical : [])];
      localStorage.setItem('cheerup_v1_saved_outfits', JSON.stringify(updatedCanonical));

      // 2. Also write to survey_3 key ('cheer_up_studio_v1_outfits') for full cross-compatibility
      const rawSurvey = localStorage.getItem('cheer_up_studio_v1_outfits');
      const listSurvey = rawSurvey ? JSON.parse(rawSurvey) : [];
      const updatedSurvey = [outfitRecord, ...(Array.isArray(listSurvey) ? listSurvey : [])];
      localStorage.setItem('cheer_up_studio_v1_outfits', JSON.stringify(updatedSurvey));

      this.state.savedOutfitsCount = updatedCanonical.length;

      // 3. Notify CheerUpStore if present
      const activeStore = this.store || window.CheerUpStore;
      if (activeStore) {
        if (typeof activeStore.saveOutfit === 'function') {
          activeStore.saveOutfit(outfitRecord);
        } else if (typeof activeStore.addOutfit === 'function') {
          activeStore.addOutfit(outfitRecord);
        }
        if (typeof activeStore.emit === 'function') {
          activeStore.emit('outfit:saved', outfitRecord);
        }
      }

      window.dispatchEvent(new CustomEvent('cheerup:outfit-saved', { detail: outfitRecord }));
    } catch (_err) {
      // Fallback if storage quota is restricted
    }

    const statusBadge = this.root.querySelector('[data-testid="catnap-save-status"]');
    if (statusBadge) {
      statusBadge.textContent = `Saved "${title}" to My Creations Gallery! ✨`;
    }
    this.spawnDreamMistBurst(22, 200, 175);
    return outfitRecord;
  }

  getState() {
    return {
      ...this.state,
      activeParticlesCount: this.particles.length,
    };
  }

  _syncTelemetryDom() {
    const purrCounter = this.root.querySelector('[data-testid="catnap-purr-counter"]');
    if (purrCounter) {
      purrCounter.textContent = String(this.state.purrCount);
    }

    const exprObj = EXPRESSIONS.find((e) => e.id === this.state.expression) || EXPRESSIONS[0];
    const moodStatus = this.root.querySelector('[data-testid="catnap-mood-status"]');
    if (moodStatus) {
      moodStatus.textContent = `${exprObj.label} — ${exprObj.moodText}`;
    }

    const heartBar = this.root.querySelector('[data-testid="catnap-friendship-fill"]');
    if (heartBar) {
      heartBar.style.width = `${this.state.friendshipLevel}%`;
    }
  }

  _syncControlsDom() {
    const syncSelect = (selector, val) => {
      const el = this.root.querySelector(selector);
      if (el && el.value !== val) {
        el.value = val;
      }
    };
    syncSelect('[data-testid="catnap-expression-select"]', this.state.expression);
    syncSelect('[data-testid="catnap-outfit-jacket"]', this.state.jacket);
    syncSelect('[data-testid="outfit-jacket-select"]', this.state.jacket);
    syncSelect('[data-testid="catnap-outfit-headphones"]', this.state.headphones);
    syncSelect('[data-testid="outfit-headwear-select"]', this.state.headphones);
    syncSelect('[data-testid="catnap-outfit-pendant"]', this.state.pendant);
    syncSelect('[data-testid="outfit-pendant-select"]', this.state.pendant);
    syncSelect('[data-testid="catnap-outfit-scarf"]', this.state.scarf);
    syncSelect('[data-testid="outfit-scarf-select"]', this.state.scarf);
  }

  _renderSvgCharacter() {
    const svgEl = this.root.querySelector('[data-testid="catnap-companion-svg"]');
    if (!svgEl) return;

    const bobY = Math.sin(this.idlePhase * 2.2) * 4 - this.bounceImpulse;
    const tailWag = Math.sin(this.idlePhase * 3.4) * 14;

    svgEl.innerHTML = `
      <defs>
        <radialGradient id="lavenderAuraGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#c084fc" stop-opacity="0.48" />
          <stop offset="65%" stop-color="#8b5cf6" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#4c1d95" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="plushFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#6d28d9" />
        </linearGradient>
        <linearGradient id="huntrxGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fde047" />
          <stop offset="50%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
      </defs>

      <!-- Starlight Dream Aura -->
      <circle cx="200" cy="210" r="168" fill="url(#lavenderAuraGrad)" />

      <!-- Cozy Plush Floor Cushion -->
      <ellipse cx="200" cy="364" rx="116" ry="26" fill="#4c1d95" opacity="0.55" />
      <ellipse cx="200" cy="358" rx="102" ry="20" fill="#7c3aed" opacity="0.45" />

      <g transform="translate(0, ${bobY.toFixed(1)})">
        <!-- Wagging Plush Tail -->
        <path
          d="M 118 310 C 62 ${310 + tailWag}, 46 ${250 + tailWag}, 78 ${224 + tailWag * 0.6}"
          fill="none"
          stroke="url(#plushFurGrad)"
          stroke-width="24"
          stroke-linecap="round"
        />

        <!-- Plush Legs & Starry Paws -->
        <ellipse cx="152" cy="340" rx="28" ry="20" fill="#6d28d9" stroke="#4c1d95" stroke-width="3.5" />
        <ellipse cx="248" cy="340" rx="28" ry="20" fill="#6d28d9" stroke="#4c1d95" stroke-width="3.5" />
        <circle cx="152" cy="342" r="8" fill="#ddd6fe" />
        <circle cx="248" cy="342" r="8" fill="#ddd6fe" />

        <!-- Plush Torso -->
        <path
          d="M 124 222 C 110 265, 114 334, 200 334 C 286 334, 290 265, 276 222 Z"
          fill="url(#plushFurGrad)"
          stroke="#4c1d95"
          stroke-width="4"
        />
        <!-- Soft Lavender Belly Patch -->
        <ellipse cx="200" cy="284" rx="50" ry="42" fill="#ddd6fe" opacity="0.88" />

        <!-- Customizable Jacket Layer -->
        ${renderJacketSvg(this.state.jacket)}

        <!-- Plush Arms -->
        <path d="M 122 232 C 88 256, 92 296, 120 302" fill="url(#plushFurGrad)" stroke="#4c1d95" stroke-width="4" stroke-linecap="round" />
        <path d="M 278 232 C 312 256, 308 296, 280 302" fill="url(#plushFurGrad)" stroke="#4c1d95" stroke-width="4" stroke-linecap="round" />

        <!-- Customizable Pendant Layer -->
        ${renderPendantSvg(this.state.pendant)}

        <!-- Customizable Boston Winter Scarf Layer -->
        ${renderScarfSvg(this.state.scarf)}

        <!-- Floppy Cat Ears -->
        <path d="M 134 118 L 106 56 L 172 94 Z" fill="url(#plushFurGrad)" stroke="#4c1d95" stroke-width="4" stroke-linejoin="round" />
        <path d="M 132 108 L 116 70 L 160 94 Z" fill="#f472b6" opacity="0.7" />
        <path d="M 266 118 L 294 56 L 228 94 Z" fill="url(#plushFurGrad)" stroke="#4c1d95" stroke-width="4" stroke-linejoin="round" />
        <path d="M 268 108 L 284 70 L 240 94 Z" fill="#f472b6" opacity="0.7" />

        <!-- Plush Cat Head -->
        <ellipse cx="200" cy="154" rx="92" ry="74" fill="url(#plushFurGrad)" stroke="#4c1d95" stroke-width="4" />

        <!-- Facial Expression Layer -->
        ${renderExpressionSvg(this.state.expression)}

        <!-- Customizable Headphones / Headgear Layer -->
        ${renderHeadphonesSvg(this.state.headphones)}
      </g>
    `;
  }

  _startAnimationLoop() {
    const canvas = this.root.querySelector('[data-testid="catnap-companion-canvas"]');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const step = (now) => {
      const dt = Math.min(0.05, (now - this.lastFrameTime) / 1000);
      this.lastFrameTime = now;
      this.idlePhase += dt;
      if (this.bounceImpulse > 0.1) {
        this.bounceImpulse *= 0.86;
      } else {
        this.bounceImpulse = 0;
      }

      // Ambient gentle dream-mist puff
      if (Math.random() < 0.14 && this.particles.length < 45) {
        this.spawnDreamMistBurst(1, 140 + Math.random() * 120, 190 + Math.random() * 60);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx + Math.sin(this.idlePhase * 3 + p.swayOffset) * 0.45;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.02) {
          this.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        if (p.type === 'moon') {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'heart') {
          ctx.fillStyle = '#f472b6';
          ctx.font = `${Math.round(p.radius * 1.1)}px sans-serif`;
          ctx.fillText('♥', p.x, p.y);
        } else if (p.type === 'star') {
          ctx.fillStyle = '#fef08a';
          ctx.font = `${Math.round(p.radius * 1.05)}px sans-serif`;
          ctx.fillText('✦', p.x, p.y);
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.radius);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'rgba(196, 181, 253, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      this.state.activeParticlesCount = this.particles.length;
      this.animFrameId = requestAnimationFrame(step);
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  mount() {
    this._renderSvgCharacter();
    this._syncControlsDom();
    this._syncTelemetryDom();
    this.spawnDreamMistBurst(14, 200, 180);
    this._startAnimationLoop();
  }
}
