/**
 * @fileoverview Personalized Profile Header & Daily Cheer-Up Capsule (R4.1).
 * Exposes canonical `data-testid` selectors:
 * - `[data-testid="profile-nickname-input"]`
 * - `[data-testid="profile-name-input"]`
 * - `[data-testid="profile-save-btn"]`
 * - `[data-testid="profile-display-name"]`
 * - `[data-testid="daily-capsule-open-btn"]`
 * - `[data-testid="daily-capsule-message"]`
 */

import { DAILY_CAPSULE_MESSAGES } from './store-adapter.js';

const AVATAR_OPTIONS = [
  { id: 'catnap-moon', label: 'CatNap Crescent Moon', emoji: '🐱🌙' },
  { id: 'rumi-star', label: 'HUNTR/X Golden Star', emoji: '🎤⚡' },
  { id: 'saja-soda', label: 'Saja Boys Soda Pop', emoji: '🥤✨' },
  { id: 'boston-duckling', label: 'Boston Swan & Duckling', emoji: '🦆🌸' },
];

export function renderProfileHeader(container, adapter, onUpdate) {
  let capsuleIndex = 0;

  function render() {
    const profile = adapter.getProfile();
    const activeAvatar =
      AVATAR_OPTIONS.find((a) => a.id === profile.avatarId) || AVATAR_OPTIONS[0];
    const capsule = DAILY_CAPSULE_MESSAGES[capsuleIndex % DAILY_CAPSULE_MESSAGES.length];
    const isCapsuleOpened =
      Array.isArray(profile.openedCapsuleIds) && profile.openedCapsuleIds.includes(capsule.id);

    container.innerHTML = `
      <section class="hub-card hub-profile-card" aria-label="Personalized Profile & Daily Cheer-Up Capsule">
        <div class="hub-profile-top">
          <div class="hub-avatar-badge" title="${activeAvatar.label}">
            <span class="hub-avatar-emoji">${activeAvatar.emoji}</span>
          </div>
          <div class="hub-profile-greeting">
            <div class="hub-route-pill">
              <span>🌉 San Francisco (Mom)</span>
              <span class="hub-route-arrow">↔</span>
              <span>🏛️ Boston (Daughter)</span>
            </div>
            <h2 class="hub-profile-title">
              Welcome back, <span data-testid="profile-display-name">${escapeHtml(profile.nickname)}</span>!
            </h2>
            <p class="hub-profile-subtitle">
              Sending creative magic across 3,000 miles between Boston &amp; the Bay Area ✨
            </p>
          </div>
        </div>

        <div class="hub-profile-controls">
          <div class="hub-form-row">
            <label class="hub-label" for="hub-nickname-input">
              Creative Artist Nickname:
            </label>
            <input
              id="hub-nickname-input"
              type="text"
              class="hub-input"
              data-testid="profile-nickname-input"
              maxlength="50"
              value="${escapeHtml(profile.nickname)}"
              placeholder="Enter your studio nickname..."
            />
            <input
              type="hidden"
              data-testid="profile-name-input"
              value="${escapeHtml(profile.daughterName || profile.nickname)}"
            />
            <button
              type="button"
              class="hub-btn hub-btn-primary"
              data-testid="profile-save-btn"
            >
              💾 Save Profile
            </button>
          </div>

          <div class="hub-avatar-picker" role="group" aria-label="Choose Profile Emblem">
            <span class="hub-label-inline">Studio Emblem:</span>
            ${AVATAR_OPTIONS.map(
              (av) => `
              <button
                type="button"
                class="hub-avatar-option ${av.id === activeAvatar.id ? 'active' : ''}"
                data-avatar-id="${av.id}"
                title="${av.label}"
              >
                ${av.emoji} ${av.label.split(' ')[0]}
              </button>
            `
            ).join('')}
          </div>
        </div>

        <div class="hub-capsule-banner">
          <div class="hub-capsule-header">
            <span class="hub-capsule-icon">🎁💌</span>
            <div>
              <h3 class="hub-capsule-title">Daily Cheer-Up Capsule from Mom (Bay Area)</h3>
              <p class="hub-capsule-hint">Open today's capsule for a warm hug note &amp; exclusive tattoo sticker reward!</p>
            </div>
            <button
              type="button"
              class="hub-btn hub-btn-accent"
              data-testid="daily-capsule-open-btn"
            >
              ${isCapsuleOpened ? '✨ Open Next Capsule' : '🎀 Open Mom\'s Capsule'}
            </button>
          </div>

          <div
            class="hub-capsule-message-box ${isCapsuleOpened ? 'opened' : ''}"
            data-testid="daily-capsule-message"
          >
            ${
              isCapsuleOpened
                ? `
                <div class="hub-capsule-reward-title">
                  ${capsule.badgeEmoji} <strong>${escapeHtml(capsule.title)}</strong>
                </div>
                <p class="hub-capsule-quote">${escapeHtml(capsule.message)}</p>
                <span class="hub-capsule-sticker-tag">
                  Unlocked Stamp ID: <code>${capsule.rewardStickerId}</code> (Ready in Tattoo Studio!)
                </span>
              `
                : `
                <p class="hub-capsule-placeholder">
                  Tap <strong>"Open Mom's Capsule"</strong> above to reveal your Bay Area → Boston surprise message!
                </p>
              `
            }
          </div>
        </div>
      </section>
    `;

    // Wire nickname input sync
    const nickInput = container.querySelector('[data-testid="profile-nickname-input"]');
    const nameInput = container.querySelector('[data-testid="profile-name-input"]');
    if (nickInput && nameInput) {
      nickInput.addEventListener('input', () => {
        nameInput.value = nickInput.value;
      });
    }

    // Wire Save Profile button
    const saveBtn = container.querySelector('[data-testid="profile-save-btn"]');
    if (saveBtn && nickInput) {
      saveBtn.addEventListener('click', () => {
        const rawVal = nickInput.value.trim();
        const nextNickname = rawVal.length > 0 ? rawVal.slice(0, 50) : 'Boston Starlight Artist';
        adapter.updateProfile({
          nickname: nextNickname,
          daughterName: nextNickname,
        });
        render();
        if (typeof onUpdate === 'function') onUpdate();
      });
    }

    // Wire avatar selection buttons
    container.querySelectorAll('.hub-avatar-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        const avatarId = btn.getAttribute('data-avatar-id');
        adapter.updateProfile({ avatarId });
        render();
        if (typeof onUpdate === 'function') onUpdate();
      });
    });

    // Wire Daily Cheer-Up Capsule open button
    const capsuleBtn = container.querySelector('[data-testid="daily-capsule-open-btn"]');
    if (capsuleBtn) {
      capsuleBtn.addEventListener('click', () => {
        openCapsuleAction();
      });
    }
  }

  function openCapsuleAction() {
    const profile = adapter.getProfile();
    const capsule = DAILY_CAPSULE_MESSAGES[capsuleIndex % DAILY_CAPSULE_MESSAGES.length];
    const openedSet = new Set(Array.isArray(profile.openedCapsuleIds) ? profile.openedCapsuleIds : []);
    if (openedSet.has(capsule.id)) {
      capsuleIndex = (capsuleIndex + 1) % DAILY_CAPSULE_MESSAGES.length;
    }
    const targetCapsule = DAILY_CAPSULE_MESSAGES[capsuleIndex % DAILY_CAPSULE_MESSAGES.length];
    openedSet.add(targetCapsule.id);

    adapter.unlockSticker(targetCapsule.rewardStickerId);
    adapter.updateProfile({
      openedCapsuleIds: Array.from(openedSet),
      lastCapsuleDate: new Date().toISOString().slice(0, 10),
    });
    render();
    if (typeof onUpdate === 'function') onUpdate();
    return targetCapsule;
  }

  render();

  return {
    render,
    openDailyCapsule: openCapsuleAction,
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
