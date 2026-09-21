/**
 * @fileoverview Main Entry Point for Milestone M5 (R4: Bay Area ↔ Boston Connection Hub,
 * Postcard Wall, Dual-City Live Clock, Shareable PNG Card Generator & Creations Gallery).
 *
 * Exports:
 * - `initConnectionHub(container, store)`
 * - `init(container, store)`
 * - `export default initConnectionHub`
 *
 * Registers programmatic verification contract:
 * - `window.__CHEER_UP_STUDIO__.hub` (`generateShareWithMomCard()`, `getDualClocks()`, etc.)
 */

import { HubStoreAdapter } from './store-adapter.js';
import { renderProfileHeader } from './profile-header.js';
import { renderDualClockWidget, formatDualCityClocks } from './dual-clock.js';
import { renderPostcardWall } from './postcard-wall.js';
import { renderCardGenerator } from './card-generator.js';
import { renderGalleryView } from './gallery-view.js';

const STYLE_TAG_ID = 'cheerup-connection-hub-styles';

function ensureHubStyles() {
  if (document.getElementById(STYLE_TAG_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    .connection-hub-root {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 16px;
      max-width: 1280px;
      margin: 0 auto;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f8f4ff;
    }

    .hub-card {
      background: linear-gradient(145deg, rgba(38, 24, 72, 0.94), rgba(24, 18, 52, 0.96));
      border: 1px solid rgba(255, 209, 102, 0.32);
      border-radius: 20px;
      padding: 22px 24px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.32);
    }

    .hub-section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 18px;
    }

    .hub-section-title {
      margin: 0 0 6px 0;
      font-size: 1.35rem;
      color: #ffd166;
    }

    .hub-section-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #d8c8f8;
    }

    .hub-profile-top {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .hub-avatar-badge {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff758f, #7209b7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      border: 3px solid #ffd166;
      flex-shrink: 0;
    }

    .hub-route-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 209, 102, 0.16);
      color: #ffd166;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 6px;
    }

    .hub-profile-title {
      margin: 0 0 4px 0;
      font-size: 1.6rem;
      color: #ffffff;
    }

    .hub-profile-subtitle {
      margin: 0;
      font-size: 0.95rem;
      color: #d8c8f8;
    }

    .hub-profile-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
      padding: 14px 16px;
      border-radius: 14px;
      margin-bottom: 16px;
    }

    .hub-form-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .hub-label {
      font-weight: 600;
      color: #ffd166;
      font-size: 0.95rem;
    }

    .hub-label-inline {
      font-weight: 600;
      color: #e0c3fc;
      font-size: 0.9rem;
    }

    .hub-input {
      flex: 1;
      min-width: 220px;
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.28);
      background: rgba(15, 10, 35, 0.85);
      color: #ffffff;
      font-size: 0.95rem;
    }

    .hub-btn {
      cursor: pointer;
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-weight: 700;
      font-size: 0.92rem;
      transition: transform 0.12s ease, opacity 0.12s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .hub-btn:hover {
      transform: translateY(-1px);
      opacity: 0.95;
    }

    .hub-btn-sm {
      padding: 6px 12px;
      font-size: 0.84rem;
    }

    .hub-btn-primary {
      background: linear-gradient(135deg, #ff758f, #ff4d6d);
      color: #ffffff;
    }

    .hub-btn-accent {
      background: linear-gradient(135deg, #ffd166, #fca311);
      color: #1f1235;
    }

    .hub-btn-outline {
      background: rgba(255, 255, 255, 0.12);
      color: #f8f4ff;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    .hub-btn-danger {
      background: rgba(239, 71, 111, 0.25);
      color: #ffccd5;
      border: 1px solid rgba(239, 71, 111, 0.5);
    }

    .hub-avatar-picker {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .hub-avatar-option {
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.22);
      background: rgba(255, 255, 255, 0.08);
      color: #f8f4ff;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .hub-avatar-option.active {
      background: #ffd166;
      color: #1f1235;
      border-color: #ffd166;
    }

    .hub-capsule-banner {
      background: linear-gradient(135deg, rgba(114, 9, 183, 0.35), rgba(247, 37, 133, 0.25));
      border: 1px dashed rgba(255, 209, 102, 0.55);
      border-radius: 16px;
      padding: 16px;
    }

    .hub-capsule-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .hub-capsule-icon {
      font-size: 1.8rem;
    }

    .hub-capsule-title {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
      color: #ffd166;
    }

    .hub-capsule-hint {
      margin: 0;
      font-size: 0.88rem;
      color: #e0c3fc;
    }

    .hub-capsule-message-box {
      background: rgba(15, 10, 35, 0.65);
      border-radius: 12px;
      padding: 12px 16px;
    }

    .hub-capsule-quote {
      margin: 8px 0;
      font-style: italic;
      color: #ffffff;
      font-size: 0.98rem;
    }

    .hub-dual-clock-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 16px;
      align-items: center;
    }

    @media (max-width: 820px) {
      .hub-dual-clock-grid {
        grid-template-columns: 1fr;
      }
    }

    .hub-city-card {
      background: rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 18px;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .hub-city-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .hub-city-icon {
      font-size: 2rem;
    }

    .hub-city-name {
      margin: 0;
      font-size: 1.1rem;
      color: #ffffff;
    }

    .hub-city-zone {
      font-size: 0.82rem;
      color: #7bdff2;
    }

    .hub-city-time {
      font-size: 1.85rem;
      font-weight: 800;
      color: #ffd166;
      letter-spacing: 0.5px;
      margin: 6px 0;
    }

    .hub-city-date {
      font-size: 0.88rem;
      color: #d8c8f8;
      margin-bottom: 8px;
    }

    .hub-city-vibe {
      font-size: 0.9rem;
      color: #f8f4ff;
      background: rgba(255, 255, 255, 0.08);
      padding: 6px 10px;
      border-radius: 8px;
    }

    .hub-city-bridge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
    }

    .hub-bridge-heart {
      font-size: 1.8rem;
    }

    .hub-bridge-caption {
      font-size: 0.8rem;
      color: #ffd166;
      font-weight: 600;
      text-align: center;
    }

    .hub-delta-badge,
    .hub-count-badge,
    .hub-resolution-badge {
      background: rgba(123, 223, 242, 0.18);
      color: #7bdff2;
      padding: 5px 12px;
      border-radius: 999px;
      font-size: 0.84rem;
      font-weight: 700;
    }

    .hub-add-postcard-bar {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .hub-postcard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .hub-postcard-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .hub-postcard-banner {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1f1235;
      font-weight: 700;
      font-size: 0.82rem;
    }

    .hub-postcard-body {
      padding: 16px;
      flex: 1;
    }

    .hub-postcard-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #d8c8f8;
      margin-bottom: 8px;
    }

    .hub-postcard-title {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      color: #ffd166;
    }

    .hub-postcard-message {
      margin: 0 0 12px 0;
      font-size: 0.92rem;
      line-height: 1.45;
      color: #f8f4ff;
    }

    .hub-postcard-stickers {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .hub-sticker-chip {
      background: rgba(255, 255, 255, 0.12);
      padding: 3px 8px;
      border-radius: 999px;
      font-size: 0.95rem;
    }

    .hub-postcard-actions {
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.22);
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .hub-generator-controls {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 18px;
    }

    .hub-generator-btn-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .hub-hidden-download-alias {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
    }

    .hub-generator-preview-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .hub-postcard-canvas {
      max-width: 100%;
      height: auto;
      border-radius: 16px;
      border: 2px solid #ffd166;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    }

    .hub-postcard-preview-img {
      display: none;
    }

    .hub-gallery-filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    .hub-filter-btn {
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.08);
      color: #f8f4ff;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .hub-filter-btn.active {
      background: #ffd166;
      color: #1f1235;
      border-color: #ffd166;
    }

    .hub-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }

    .hub-gallery-item-card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .hub-gallery-card-thumb {
      height: 150px;
      background: rgba(15, 10, 35, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .hub-gallery-thumb-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .hub-gallery-thumb-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .hub-thumb-emoji {
      font-size: 2.5rem;
    }

    .hub-thumb-label {
      font-size: 0.85rem;
      color: #d8c8f8;
    }

    .hub-gallery-type-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(31, 18, 53, 0.88);
      color: #ffd166;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .hub-gallery-card-body {
      padding: 14px 16px;
    }

    .hub-gallery-card-title {
      margin: 0 0 6px 0;
      font-size: 1.05rem;
      color: #ffffff;
    }

    .hub-gallery-card-subtitle {
      margin: 0 0 8px 0;
      font-size: 0.85rem;
      color: #d8c8f8;
    }

    .hub-gallery-card-date {
      font-size: 0.78rem;
      color: #7bdff2;
    }

    .hub-gallery-card-actions {
      padding: 12px 16px;
      background: rgba(0, 0, 0, 0.22);
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .hub-gallery-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 36px 24px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      border: 1px dashed rgba(255, 255, 255, 0.22);
    }

    .hub-empty-icon {
      font-size: 2.6rem;
      margin-bottom: 8px;
    }

    .hub-empty-title {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      color: #ffd166;
    }

    .hub-empty-text {
      margin: 0 auto;
      max-width: 540px;
      color: #d8c8f8;
      font-size: 0.92rem;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initializes Milestone M5 Connection Hub & Gallery inside `container`.
 * @param {HTMLElement} container DOM element (`#view-connection-hub`)
 * @param {Object} [store] Global store instance (`window.CheerUpStore`)
 */
export function initConnectionHub(container, store) {
  if (!container) {
    throw new Error('initConnectionHub requires a valid container element');
  }

  ensureHubStyles();
  const adapter = new HubStoreAdapter(store);

  // Sync top-level header display with persisted profile immediately on boot
  const initialProfile = adapter.getProfile();
  const globalHeaderDisplay = document.querySelector('[data-testid="header-nickname-display"]');
  if (globalHeaderDisplay) {
    globalHeaderDisplay.textContent = initialProfile.nickname;
  }

  // Create structured sub-containers
  container.innerHTML = `
    <div class="connection-hub-root" data-testid="connection-hub-root">
      <div id="hub-slot-profile"></div>
      <div id="hub-slot-clocks"></div>
      <div id="hub-slot-postcards"></div>
      <div id="hub-slot-card-generator"></div>
      <div id="hub-slot-gallery"></div>
    </div>
  `;

  const profileSlot = container.querySelector('#hub-slot-profile');
  const clocksSlot = container.querySelector('#hub-slot-clocks');
  const postcardsSlot = container.querySelector('#hub-slot-postcards');
  const generatorSlot = container.querySelector('#hub-slot-card-generator');
  const gallerySlot = container.querySelector('#hub-slot-gallery');

  const dualClockCtrl = renderDualClockWidget(clocksSlot);
  const cardGenCtrl = renderCardGenerator(generatorSlot, adapter);
  const galleryCtrl = renderGalleryView(gallerySlot, adapter, () => {
    cardGenCtrl.generateShareWithMomCard();
  });
  const profileCtrl = renderProfileHeader(profileSlot, adapter, () => {
    cardGenCtrl.generateShareWithMomCard();
  });
  const postcardWallCtrl = renderPostcardWall(postcardsSlot, adapter, () => {
    cardGenCtrl.generateShareWithMomCard();
  });

  function refreshAll() {
    profileCtrl.render();
    postcardWallCtrl.render();
    galleryCtrl.render();
    cardGenCtrl.generateShareWithMomCard();
  }

  // Subscribe to cross-module store events and tab switches
  const unsubscribe = adapter.subscribe((event) => {
    if (
      event &&
      (event.includes('tattoo') ||
        event.includes('outfit') ||
        event.includes('remix') ||
        event.includes('score') ||
        event.includes('gallery') ||
        event.includes('profile'))
    ) {
      refreshAll();
    }
  });

  // Also refresh when user clicks the Connection Hub tab in navigation bar
  const hubNavTab = document.querySelector('[data-testid="nav-tab-hub"]');
  if (hubNavTab) {
    hubNavTab.addEventListener('click', () => {
      refreshAll();
    });
  }

  window.addEventListener('storage', () => {
    refreshAll();
  });

  // Expose canonical programmatic verification API on window.__CHEER_UP_STUDIO__.hub
  window.__CHEER_UP_STUDIO__ = window.__CHEER_UP_STUDIO__ || {};
  const hubApi = {
    generateShareWithMomCard(customOptions) {
      return cardGenCtrl.generateShareWithMomCard(customOptions);
    },
    getDualClocks(referenceTimestampMs) {
      return dualClockCtrl.getDualClocks(referenceTimestampMs);
    },
    getGalleryItems(filter) {
      return galleryCtrl.getItems(filter);
    },
    openDailyCapsule() {
      return profileCtrl.openDailyCapsule();
    },
    refresh() {
      refreshAll();
    },
    destroy() {
      dualClockCtrl.destroy();
      unsubscribe();
    },
  };
  window.__CHEER_UP_STUDIO__.hub = hubApi;

  return hubApi;
}

export function init(container, store) {
  return initConnectionHub(container, store);
}

export { formatDualCityClocks };
export default initConnectionHub;
