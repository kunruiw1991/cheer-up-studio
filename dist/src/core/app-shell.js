/**
 * Boston ↔ Bay Area Creative Cheer-Up Studio
 * Main Application Shell, Navigation Router & Global Verification API Registry
 */

import CheerUpStore, { STORAGE_KEYS } from './store.js';
import {
  getAudioContext,
  ensureAudioUnlocked,
  playSynthChime,
  sharedAudioTransport,
} from './audio-context.js';

// Ensure global store & programmatic verification registries exist immediately
if (typeof window !== 'undefined') {
  window.CheerUpStore = CheerUpStore;
  window.__CHEER_UP_STUDIO__ = window.__CHEER_UP_STUDIO__ || {};
  window.__CHEER_UP_STUDIO__.store = CheerUpStore;
  window.__CHEER_UP_STUDIO__.audioTransport = sharedAudioTransport;
  window.__CHEER_UP_STUDIO__.tattoo = window.__CHEER_UP_STUDIO__.tattoo || {};
  window.__CHEER_UP_STUDIO__.catnap = window.__CHEER_UP_STUDIO__.catnap || {};
  window.__CHEER_UP_STUDIO__.catnapGame = window.__CHEER_UP_STUDIO__.catnapGame || {};
  window.__CHEER_UP_STUDIO__.hub = window.__CHEER_UP_STUDIO__.hub || {};
  window.__CHEER_UP_R3_TEST_API__ = window.__CHEER_UP_R3_TEST_API__ || {};
}

const MODULE_DESCRIPTORS = [
  {
    tab: 'tattoo',
    viewId: 'view-tattoo-studio',
    modulePath: '../modules/tattoo-studio/index.js',
    bundleKey: 'src/modules/tattoo-studio/index.js',
    exportNames: ['initTattooStudio', 'init', 'default'],
    title: 'Temporary Tattoo Designer & Printable Sheet Studio',
  },
  {
    tab: 'catnap',
    viewId: 'view-catnap-playground',
    modulePath: '../modules/catnap-playground/index.js',
    bundleKey: 'src/modules/catnap-playground/index.js',
    exportNames: ['initCatNapPlayground', 'init', 'default'],
    title: 'CatNap Cozy Playground & Starlight Rooftop Dash',
  },
  {
    tab: 'kpop',
    viewId: 'view-kpop-stage',
    modulePath: '../modules/kpop-stage/index.js',
    bundleKey: 'src/modules/kpop-stage/index.js',
    exportNames: ['initKpopStage', 'init', 'default'],
    title: 'K-Pop Demon Hunters Rhythm & Remix Stage',
  },
  {
    tab: 'hub',
    viewId: 'view-connection-hub',
    modulePath: '../modules/connection-hub/index.js',
    bundleKey: 'src/modules/connection-hub/index.js',
    exportNames: ['initConnectionHub', 'init', 'default'],
    title: 'Bay Area ↔ Boston Connection Hub & Creations Gallery',
  },
];

let _activeTab = 'tattoo';
const _mountedModules = new Map();

/**
 * Formats live local clock strings for San Francisco and Boston.
 */
export function formatHeaderClocks(now = new Date()) {
  try {
    const sfStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);
    const bostonStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);
    return { sfStr, bostonStr };
  } catch {
    return { sfStr: '12:00 PM', bostonStr: '3:00 PM' };
  }
}

/**
 * Updates the header profile nickname & dual-city clock badges.
 */
export function updateHeaderUI() {
  const nicknameEl = document.querySelector('[data-testid="header-nickname-display"]');
  if (nicknameEl) {
    const profile = CheerUpStore.getProfile();
    const display = profile.nickname || profile.daughterName || 'Boston Starlight Artist';
    nicknameEl.textContent = display;
  }

  const { sfStr, bostonStr } = formatHeaderClocks(new Date());
  const sfClockEl = document.getElementById('header-clock-sf');
  const bostonClockEl = document.getElementById('header-clock-boston');
  if (sfClockEl) sfClockEl.textContent = sfStr;
  if (bostonClockEl) bostonClockEl.textContent = bostonStr;
}

/**
 * Resolves a module either from the inline bundle registry (`window.__CHEER_UP_MODULES__`)
 * or via standard ES dynamic `import(modulePath)`.
 */
async function loadStudioModule(descriptor) {
  if (
    typeof window !== 'undefined' &&
    window.__CHEER_UP_MODULES__ &&
    window.__CHEER_UP_MODULES__[descriptor.bundleKey]
  ) {
    return window.__CHEER_UP_MODULES__[descriptor.bundleKey];
  }
  return import(descriptor.modulePath);
}

/**
 * Mounts a single studio workspace module into its DOM section container.
 */
async function mountModuleDescriptor(descriptor) {
  const container = document.getElementById(descriptor.viewId);
  if (!container) {
    return null;
  }

  try {
    const mod = await loadStudioModule(descriptor);
    let initFn = null;
    for (const exportName of descriptor.exportNames) {
      if (mod && typeof mod[exportName] === 'function') {
        initFn = mod[exportName];
        break;
      }
    }

    if (initFn) {
      const api = await initFn(container, CheerUpStore, {
        audioContext: getAudioContext(),
        audioTransport: sharedAudioTransport,
        ensureAudioUnlocked,
      });
      _mountedModules.set(descriptor.tab, { descriptor, mod, api });
      return api;
    }
  } catch (err) {
    // Graceful non-error placeholder when running before a peer worker finishes writing its module
    if (!container.innerHTML.trim()) {
      container.innerHTML = `
        <div class="module-placeholder-card" data-testid="placeholder-${descriptor.tab}">
          <h2>✨ ${descriptor.title}</h2>
          <p>Ready for creative exploration across San Francisco &amp; Boston!</p>
        </div>
      `;
    }
  }
  return null;
}

/**
 * Switches active navigation tab and workspace container.
 */
export function switchTab(tabName) {
  const validDescriptor = MODULE_DESCRIPTORS.find((d) => d.tab === tabName);
  if (!validDescriptor) {
    return _activeTab;
  }

  _activeTab = tabName;

  const tabButtons = document.querySelectorAll('.nav-tab[data-tab]');
  tabButtons.forEach((btn) => {
    const isMatch = btn.getAttribute('data-tab') === tabName;
    btn.classList.toggle('active', isMatch);
    btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
  });

  const viewSections = document.querySelectorAll('.studio-view[data-view]');
  viewSections.forEach((section) => {
    const isMatch = section.getAttribute('data-view') === tabName;
    section.classList.toggle('active', isMatch);
  });

  CheerUpStore.emit('navigation:changed', {
    tab: tabName,
    viewId: validDescriptor.viewId,
  });

  return _activeTab;
}

/**
 * Bootstraps the application shell, navigation listeners, store subscribers, and all 4 modules.
 */
export async function bootstrapAppShell() {
  updateHeaderUI();

  // Bind navigation tab click handlers
  const tabButtons = document.querySelectorAll('.nav-tab[data-tab]');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      ensureAudioUnlocked();
      playSynthChime({ frequency: 587.33, duration: 0.09, gain: 0.08 });
      switchTab(targetTab);
    });
  });

  // Reactively update header whenever profile or state changes
  CheerUpStore.subscribe('profile:updated', () => updateHeaderUI());
  CheerUpStore.subscribe('state:changed', (payload) => {
    if (!payload || payload.key === STORAGE_KEYS.PROFILE) {
      updateHeaderUI();
    }
  });

  // Start header live clock ticker
  setInterval(updateHeaderUI, 1000);

  // Expose shell navigation helpers on global studio registry immediately
  window.__CHEER_UP_STUDIO__.switchTab = switchTab;
  window.__CHEER_UP_STUDIO__.getActiveTab = () => _activeTab;
  window.__CHEER_UP_STUDIO__.remountModules = () =>
    Promise.all(MODULE_DESCRIPTORS.map((desc) => mountModuleDescriptor(desc)));

  // Mount all 4 studio modules in parallel
  await Promise.all(MODULE_DESCRIPTORS.map((desc) => mountModuleDescriptor(desc)));

  CheerUpStore.emit('app:ready', { activeTab: _activeTab });
  return window.__CHEER_UP_STUDIO__;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      bootstrapAppShell();
    });
  } else {
    bootstrapAppShell();
  }
}

export default bootstrapAppShell;
