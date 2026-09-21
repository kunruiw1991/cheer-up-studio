/**
 * @fileoverview "CatNap's Starlight Rooftop Dash" Arcade Mini-Game Engine.
 * Features dual-city parallax scenery (Boston Starry Brownstones ↔ SF Golden Gate Bridge),
 * deterministic fixed-timestep physics (dt = 1/60s), single/double jump + glide,
 * collectibles (crescent moons, musical notes, tattoo sticker capsules),
 * obstacle collision detection, unlockable Tattoo Studio stickers, and high-score persistence.
 */

import { drawCatNapRunnerSprite } from './wardrobe.js';

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 340;
const GROUND_Y = 276;
const GRAVITY = 1350;
const SINGLE_JUMP_VY = -520;
const DOUBLE_JUMP_VY = -460;
const FIXED_DT = 1 / 60;

export class RooftopDashGame {
  /**
   * @param {HTMLElement} rootContainer
   * @param {object} store
   * @param {() => object} getOutfitFn
   */
  constructor(rootContainer, store, getOutfitFn) {
    this.root = rootContainer;
    this.store = store || window.CheerUpStore || null;
    this.getOutfit = getOutfitFn || (() => ({}));
    this.audioCtx = null;

    this.state = 'idle'; // 'idle' | 'running' | 'gameover'
    this.score = 0;
    this.highScore = 0;
    this.distance = 0;
    this.speed = 250; // px/s
    this.frameCount = 0;
    this.biome = 'boston'; // alternates 'boston' | 'san_francisco' every 500m

    this.moonsCollected = 0;
    this.notesCollected = 0;
    this.unlockedStickers = [];

    this.player = {
      x: 92,
      y: GROUND_Y - 56,
      width: 52,
      height: 56,
      vy: 0,
      jumpsRemaining: 2,
      isGliding: false,
      animPhase: 0,
    };

    this.collectibles = [];
    this.obstacles = [];
    this.fxParticles = [];
    this.stars = this._generateStarfield(65);
    this.spawnTimer = 0;
    this.spawnIndex = 0;

    this.rafId = null;
    this.lastRafTimestamp = 0;

    this._loadPersistedScoresAndStickers();
  }

  _generateStarfield(count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (i * 137.5) % CANVAS_WIDTH,
        y: 15 + ((i * 73) % 155),
        r: 1 + (i % 3) * 0.85,
        twinkleOffset: i * 0.7,
      });
    }
    return arr;
  }

  _loadPersistedScoresAndStickers() {
    try {
      // Load high score from canonical & survey keys
      const hsRaw = localStorage.getItem('cheerup_v1_high_scores');
      if (hsRaw) {
        const parsed = JSON.parse(hsRaw);
        if (parsed && typeof parsed.rooftopDash === 'number') {
          this.highScore = Math.max(this.highScore, parsed.rooftopDash);
        }
      }
      const surveyHsRaw = localStorage.getItem('cheer_up_studio_v1_game_records');
      if (surveyHsRaw) {
        const parsed = JSON.parse(surveyHsRaw);
        if (parsed && typeof parsed.catnapDashHighScore === 'number') {
          this.highScore = Math.max(this.highScore, parsed.catnapDashHighScore);
        }
      }

      // Load unlocked stickers
      const stRaw = localStorage.getItem('cheerup_v1_stickers') || localStorage.getItem('cheer_up_studio_v1_unlockables');
      if (stRaw) {
        const parsed = JSON.parse(stRaw);
        if (Array.isArray(parsed)) {
          this.unlockedStickers = Array.from(new Set(parsed));
        }
      }
    } catch (_err) {
      // Ignore malformed storage
    }
  }

  _persistHighScoreAndStickers() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    try {
      // 1. Canonical PROJECT.md key: 'cheerup_v1_high_scores'
      const rawHs = localStorage.getItem('cheerup_v1_high_scores');
      const hsObj = rawHs ? JSON.parse(rawHs) : {};
      hsObj.rooftopDash = Math.max(hsObj.rooftopDash || 0, this.highScore);
      localStorage.setItem('cheerup_v1_high_scores', JSON.stringify(hsObj));

      // 2. Survey key: 'cheer_up_studio_v1_game_records'
      const rawSurveyHs = localStorage.getItem('cheer_up_studio_v1_game_records');
      const surveyObj = rawSurveyHs ? JSON.parse(rawSurveyHs) : {};
      surveyObj.catnapDashHighScore = Math.max(surveyObj.catnapDashHighScore || 0, this.highScore);
      surveyObj.catnapDashBestMoons = Math.max(surveyObj.catnapDashBestMoons || 0, this.moonsCollected);
      localStorage.setItem('cheer_up_studio_v1_game_records', JSON.stringify(surveyObj));

      // 3. Unlocked stickers keys
      localStorage.setItem('cheerup_v1_stickers', JSON.stringify(this.unlockedStickers));
      localStorage.setItem('cheer_up_studio_v1_unlockables', JSON.stringify(this.unlockedStickers));

      // 4. Notify store & EventBus
      const activeStore = this.store || window.CheerUpStore;
      if (activeStore) {
        if (typeof activeStore.updateHighScore === 'function') {
          activeStore.updateHighScore('rooftopDash', this.highScore);
        }
        if (typeof activeStore.emit === 'function') {
          activeStore.emit('highscore:updated', { game: 'rooftopDash', highScore: this.highScore });
        }
      }
    } catch (_err) {
      // Safe fallback
    }
  }

  _unlockStickerReward(stickerId) {
    if (!this.unlockedStickers.includes(stickerId)) {
      this.unlockedStickers.push(stickerId);
      this._persistHighScoreAndStickers();

      const activeStore = this.store || window.CheerUpStore;
      if (activeStore) {
        if (typeof activeStore.unlockSticker === 'function') {
          activeStore.unlockSticker(stickerId);
        }
        if (typeof activeStore.emit === 'function') {
          activeStore.emit('sticker:unlocked', stickerId);
        }
      }
      window.dispatchEvent(new CustomEvent('cheerup:sticker-unlocked', { detail: { stickerId } }));
    }
  }

  _playPickupChime(freqHz = 660) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqHz, now);
      osc.frequency.exponentialRampToValueAtTime(freqHz * 1.25, now + 0.14);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.11, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch (_err) {
      // Ignore audio errors
    }
  }

  _seedInitialRunEntities() {
    this.collectibles = [
      { id: 'init_moon_1', type: 'moon', x: 210, y: GROUND_Y - 40, r: 14, collected: false },
      { id: 'init_note_1', type: 'note', x: 310, y: GROUND_Y - 44, r: 14, collected: false },
      { id: 'init_sticker_1', type: 'sticker', x: 420, y: GROUND_Y - 46, r: 16, collected: false },
      { id: 'init_moon_2', type: 'moon', x: 540, y: GROUND_Y - 92, r: 14, collected: false },
    ];
    this.obstacles = [
      {
        id: 'init_chimney_1',
        type: 'chimney',
        x: 680,
        y: GROUND_Y - 44,
        width: 34,
        height: 44,
      },
    ];
    this.spawnTimer = 1.1;
    this.spawnIndex = 0;
  }

  /**
   * Starts a fresh run from 'idle' or 'gameover' into 'running'.
   */
  start() {
    this.state = 'running';
    this.score = 0;
    this.distance = 0;
    this.speed = 250;
    this.frameCount = 0;
    this.moonsCollected = 0;
    this.notesCollected = 0;
    this.biome = 'boston';

    this.player.y = GROUND_Y - this.player.height;
    this.player.vy = 0;
    this.player.jumpsRemaining = 2;
    this.player.isGliding = false;
    this.player.animPhase = 0;

    this.fxParticles = [];
    this._seedInitialRunEntities();
    this._syncHudDom();
    this.render();
    return this.getState();
  }

  /**
   * Cleanly restarts the mini-game from 'gameover' (or any state) back to 'running'.
   */
  restart() {
    return this.start();
  }

  /**
   * Applies a single or double jump impulse to CatNap.
   */
  jump() {
    if (this.state === 'idle' || this.state === 'gameover') {
      this.start();
    }
    if (this.player.jumpsRemaining > 0) {
      const isFirstJump = this.player.jumpsRemaining === 2;
      this.player.vy = isFirstJump ? SINGLE_JUMP_VY : DOUBLE_JUMP_VY;
      this.player.jumpsRemaining -= 1;
      this._spawnJumpMist(this.player.x + 20, this.player.y + this.player.height);
      this._playPickupChime(isFirstJump ? 523.25 : 659.25);
    }
    this.render();
    return this.getState();
  }

  _spawnJumpMist(x, y) {
    for (let i = 0; i < 8; i++) {
      this.fxParticles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 10,
        vx: -60 - Math.random() * 60,
        vy: (Math.random() - 0.5) * 45,
        r: 6 + Math.random() * 8,
        alpha: 0.9,
        color: i % 2 === 0 ? '#c4b5fd' : '#fde047',
      });
    }
  }

  /**
   * Deterministically triggers the GAME_OVER state, updates high score, and persists to store.
   */
  triggerGameOver() {
    this.state = 'gameover';
    this._persistHighScoreAndStickers();
    this._syncHudDom();
    this.render();
    return this.getState();
  }

  /**
   * Advances physics, collectibles, obstacles, and score by a single fixed timestep (dt = 1/60s).
   */
  _stepSingleFrame(dt = FIXED_DT) {
    if (this.state !== 'running') {
      return;
    }

    this.frameCount += 1;
    this.player.animPhase += dt * 1.5;

    // Gradually increase speed and distance
    this.speed = Math.min(440, 250 + this.distance * 0.08);
    const dx = this.speed * dt;
    this.distance += dx * 0.1; // meters

    // Alternate biome every 500m between Boston Brownstones & San Francisco Golden Gate
    this.biome = Math.floor(this.distance / 500) % 2 === 0 ? 'boston' : 'san_francisco';

    // Survival distance score tick (+1 every 6 frames)
    if (this.frameCount % 6 === 0) {
      this.score += 1;
    }

    // Player vertical physics
    const effectiveGravity = this.player.isGliding && this.player.vy > 0 ? GRAVITY * 0.45 : GRAVITY;
    this.player.vy += effectiveGravity * dt;
    this.player.y += this.player.vy * dt;

    const floorY = GROUND_Y - this.player.height;
    if (this.player.y >= floorY) {
      this.player.y = floorY;
      this.player.vy = 0;
      this.player.jumpsRemaining = 2;
    }

    // Spawn new collectibles & obstacles deterministically
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 1.25;
      this.spawnIndex += 1;
      const spawnX = CANVAS_WIDTH + 40;

      // Spawn collectible arc
      const cType = this.spawnIndex % 4 === 0 ? 'sticker' : this.spawnIndex % 2 === 0 ? 'note' : 'moon';
      this.collectibles.push({
        id: `c_${this.frameCount}_${this.spawnIndex}`,
        type: cType,
        x: spawnX,
        y: GROUND_Y - (this.spawnIndex % 2 === 0 ? 95 : 42),
        r: 15,
        collected: false,
      });

      // Spawn obstacle every 2nd wave
      if (this.spawnIndex % 2 === 1) {
        this.obstacles.push({
          id: `obs_${this.frameCount}_${this.spawnIndex}`,
          type: this.biome === 'boston' ? 'chimney' : 'tower_pylon',
          x: spawnX + 145,
          y: GROUND_Y - 44,
          width: 34,
          height: 44,
        });
      }
    }

    // Update collectibles & check collection
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const c = this.collectibles[i];
      c.x -= dx;

      if (!c.collected) {
        const pxCenter = this.player.x + this.player.width * 0.5;
        const pyCenter = this.player.y + this.player.height * 0.5;
        const distSq = (pxCenter - c.x) ** 2 + (pyCenter - c.y) ** 2;
        const pickupRadius = c.r + 28;
        if (distSq <= pickupRadius * pickupRadius) {
          c.collected = true;
          if (c.type === 'moon') {
            this.score += 10;
            this.moonsCollected += 1;
            this._playPickupChime(659.25);
            if (this.moonsCollected >= 5) {
              this._unlockStickerReward('starlight_rooftop_champion');
            }
          } else if (c.type === 'note') {
            this.score += 25;
            this.notesCollected += 1;
            this._playPickupChime(783.99);
          } else if (c.type === 'sticker') {
            this.score += 50;
            this._playPickupChime(987.77);
            this._unlockStickerReward('starlight_rooftop_champion');
            if (this.score >= 100) {
              this._unlockStickerReward('coast_to_coast_superstar');
            }
          }
          this._spawnJumpMist(c.x, c.y);
        }
      }

      if (c.collected || c.x < -40) {
        this.collectibles.splice(i, 1);
      }
    }

    // Check high-score threshold sticker unlock
    if (this.score >= 120) {
      this._unlockStickerReward('coast_to_coast_superstar');
    }

    // Update obstacles & check forgiving AABB collision
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.x -= dx;

      const pad = 8;
      const overlapX =
        this.player.x + pad < obs.x + obs.width - pad &&
        this.player.x + this.player.width - pad > obs.x + pad;
      const overlapY =
        this.player.y + pad < obs.y + obs.height &&
        this.player.y + this.player.height - pad > obs.y + pad;

      if (overlapX && overlapY) {
        this.triggerGameOver();
        return;
      }

      if (obs.x + obs.width < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    // Update FX particles
    for (let i = this.fxParticles.length - 1; i >= 0; i--) {
      const p = this.fxParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt * 1.8;
      if (p.alpha <= 0) {
        this.fxParticles.splice(i, 1);
      }
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  /**
   * Deterministically advances the game simulation by `frameCount` frames (default 60).
   */
  stepFrames(frameCount = 60) {
    const count = Math.max(1, Number(frameCount) || 1);
    for (let i = 0; i < count; i++) {
      this._stepSingleFrame(FIXED_DT);
      if (this.state === 'gameover') {
        break;
      }
    }
    this._persistHighScoreAndStickers();
    this._syncHudDom();
    this.render();
    return this.getState();
  }

  getState() {
    return {
      state: this.state,
      status: this.state,
      score: this.score,
      highScore: this.highScore,
      distance: Math.round(this.distance * 10) / 10,
      moonsCollected: this.moonsCollected,
      notesCollected: this.notesCollected,
      stickersUnlocked: [...this.unlockedStickers],
      unlockedStickers: [...this.unlockedStickers],
      playerY: Math.round(this.player.y * 10) / 10,
      playerVy: Math.round(this.player.vy * 10) / 10,
      biome: this.biome,
    };
  }

  _syncHudDom() {
    const setAll = (selectors, text) => {
      selectors.forEach((sel) => {
        const el = this.root.querySelector(sel);
        if (el) el.textContent = text;
      });
    };

    setAll(['[data-testid="rooftop-dash-score"]', '[data-testid="dash-score-value"]'], String(this.score));
    setAll(['[data-testid="rooftop-dash-highscore"]', '[data-testid="dash-highscore-value"]'], String(this.highScore));
    setAll(['[data-testid="rooftop-dash-state"]', '[data-testid="dash-game-state"]'], this.state);

    const biomeBadge = this.root.querySelector('[data-testid="rooftop-dash-biome"]');
    if (biomeBadge) {
      biomeBadge.textContent =
        this.biome === 'boston'
          ? 'Boston Starry Brownstones & Zakim Bridge'
          : 'San Francisco Golden Gate & Painted Ladies';
    }

    const stickersBadge = this.root.querySelector('[data-testid="rooftop-dash-stickers-count"]');
    if (stickersBadge) {
      stickersBadge.textContent = `${this.unlockedStickers.length} / 2 Tattoo Stickers Unlocked`;
    }
  }

  /**
   * Renders the full dual-city parallax rooftop scene, player sprite, collectibles, obstacles, and overlays.
   */
  render() {
    const canvas = this.root.querySelector('[data-testid="rooftop-dash-canvas"]');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1. Twilight Starry Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    if (this.biome === 'boston') {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.55, '#311042');
      skyGrad.addColorStop(1, '#4c1d95');
    } else {
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.55, '#4c1d95');
      skyGrad.addColorStop(1, '#9d174d');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Twinkling Constellations & Crescent Moon
    ctx.fillStyle = '#fef08a';
    for (const s of this.stars) {
      const alpha = 0.45 + 0.5 * Math.sin(this.player.animPhase * 2 + s.twinkleOffset);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glowing Crescent Moon in Upper Right
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(655, 58, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.biome === 'boston' ? '#0f172a' : '#1e1b4b';
    ctx.beginPath();
    ctx.arc(667, 50, 23, 0, Math.PI * 2);
    ctx.fill();

    // 3. Dual-City Parallax Skyline Layer
    const parallaxOffset = (this.distance * 14) % 380;
    if (this.biome === 'boston') {
      // Boston Zakim Bridge Cables & Victorian Brownstones
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.35)';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 2; i++) {
        const towerX = i * 380 - parallaxOffset + 190;
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(towerX - 10, 125, 20, 151);
        for (let c = -4; c <= 4; c++) {
          ctx.beginPath();
          ctx.moveTo(towerX, 132);
          ctx.lineTo(towerX + c * 32, 276);
          ctx.stroke();
        }
      }
    } else {
      // San Francisco Golden Gate Suspension Towers
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.55)';
      ctx.lineWidth = 3;
      for (let i = -1; i <= 2; i++) {
        const towerX = i * 380 - parallaxOffset + 200;
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(towerX - 12, 110, 24, 166);
        ctx.fillRect(towerX - 18, 145, 36, 8);
        ctx.fillRect(towerX - 18, 195, 36, 8);
        ctx.beginPath();
        ctx.moveTo(towerX - 180, 215);
        ctx.quadraticCurveTo(towerX, 115, towerX + 180, 215);
        ctx.stroke();
      }
    }

    // 4. Rooftop Foreground Platform
    const roofGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    roofGrad.addColorStop(0, '#5b21b6');
    roofGrad.addColorStop(1, '#2e1065');
    ctx.fillStyle = roofGrad;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Rooftop Neon Trim Line
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // 5. Collectibles (Moons, Musical Notes, Tattoo Sticker Capsules)
    for (const c of this.collectibles) {
      if (c.collected) continue;
      ctx.save();
      ctx.translate(c.x, c.y);
      if (c.type === 'moon') {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☾', 0, 1);
      } else if (c.type === 'note') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, c.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♫', 0, 1);
      } else {
        // Tattoo Sticker Capsule
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(0, 0, c.r + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
      }
      ctx.restore();
    }

    // 6. Obstacles (Chimney Puffs / Pylons)
    for (const obs of this.obstacles) {
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 7. FX Particles
    for (const p of this.fxParticles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Animated CatNap Runner Sprite wearing custom outfit
    drawCatNapRunnerSprite(
      ctx,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.animPhase,
      this.getOutfit()
    );

    // 9. State Overlays (Idle / Game Over)
    if (this.state === 'idle') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CatNap’s Starlight Rooftop Dash ✨', CANVAS_WIDTH / 2, 145);
      ctx.fillStyle = '#e9d5ff';
      ctx.font = '15px sans-serif';
      ctx.fillText('Press Start, Space, or Jump to leap across Boston & SF rooftops!', CANVAS_WIDTH / 2, 180);
    } else if (this.state === 'gameover') {
      ctx.fillStyle = 'rgba(30, 27, 75, 0.76)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Cozy Lavender Cloud Landing! 🌙', CANVAS_WIDTH / 2, 135);
      ctx.fillStyle = '#ffffff';
      ctx.font = '17px sans-serif';
      ctx.fillText(`Run Score: ${this.score}  |  Best Score: ${this.highScore}`, CANVAS_WIDTH / 2, 172);
      ctx.fillStyle = '#f472b6';
      ctx.font = '15px sans-serif';
      ctx.fillText('Click Restart Dash to leap again & earn Tattoo Studio stickers!', CANVAS_WIDTH / 2, 206);
    }
  }

  _startRenderLoop() {
    const tick = (timestamp) => {
      if (!this.lastRafTimestamp) {
        this.lastRafTimestamp = timestamp;
      }
      const elapsedSec = Math.min(0.05, (timestamp - this.lastRafTimestamp) / 1000);
      this.lastRafTimestamp = timestamp;

      if (this.state === 'running' && elapsedSec > 0) {
        this._stepSingleFrame(elapsedSec);
        this._syncHudDom();
        this.render();
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  mount() {
    this._syncHudDom();
    this.render();
    this._startRenderLoop();
  }
}
