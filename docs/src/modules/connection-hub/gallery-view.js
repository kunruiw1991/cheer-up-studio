/**
 * @fileoverview Unified "My Creations Gallery" View (R4.5).
 * Displays, filters, reloads into studios, and deletes creations across:
 * - R1: Custom Tattoos (`tattoos`)
 * - R2: CatNap Plush Outfits (`outfits`)
 * - R3: K-Pop Demon Hunters Song Remixes (`remixes`)
 *
 * Exposes canonical `data-testid` selectors:
 * - `[data-testid="gallery-grid"]`
 * - `[data-testid="gallery-filter-all"]`
 * - `[data-testid="gallery-filter-tattoos"]`
 * - `[data-testid="gallery-filter-outfits"]`
 * - `[data-testid="gallery-filter-remixes"]`
 * - `[data-testid="gallery-item-card"]`
 * - `[data-testid="gallery-load-item-btn"]`
 * - `[data-testid="gallery-delete-item-btn"]`
 */

const FILTER_TABS = [
  { id: 'all', testId: 'gallery-filter-all', label: '🌟 All Creations' },
  { id: 'tattoos', testId: 'gallery-filter-tattoos', label: '🎨 Tattoos' },
  { id: 'outfits', testId: 'gallery-filter-outfits', label: '🐱 CatNap Outfits' },
  { id: 'remixes', testId: 'gallery-filter-remixes', label: '🎤 K-Pop Remixes' },
];

const TYPE_ICONS = {
  tattoos: '🎨✨',
  outfits: '🐱🌙',
  remixes: '🎤⚡',
};

const TARGET_TAB_SELECTORS = {
  tattoos: '[data-testid="nav-tab-tattoo"]',
  outfits: '[data-testid="nav-tab-catnap"]',
  remixes: '[data-testid="nav-tab-kpop"]',
};

export function renderGalleryView(container, adapter, onUpdate) {
  let activeFilter = 'all';

  function render() {
    const items = adapter.getGalleryItems(activeFilter);
    const allCount = adapter.getGalleryItems('all').length;

    container.innerHTML = `
      <section class="hub-card hub-gallery-section" aria-label="My Creations Gallery">
        <div class="hub-section-header">
          <div>
            <h3 class="hub-section-title">
              🖼️ My Creations Gallery (Persistent Across Reloads)
            </h3>
            <p class="hub-section-subtitle">
              All your custom Temporary Tattoos, CatNap Plush Outfits, and K-Pop Demon Hunters Remixes saved safely in local storage.
            </p>
          </div>
          <span class="hub-count-badge" data-testid="gallery-total-count">
            ${allCount} Saved Creation${allCount === 1 ? '' : 's'}
          </span>
        </div>

        <div class="hub-gallery-filter-bar" role="tablist" aria-label="Gallery Category Filters">
          ${FILTER_TABS.map(
            (tab) => `
            <button
              type="button"
              role="tab"
              aria-selected="${activeFilter === tab.id ? 'true' : 'false'}"
              class="hub-filter-btn ${activeFilter === tab.id ? 'active' : ''}"
              data-testid="${tab.testId}"
              data-filter-id="${tab.id}"
            >
              ${tab.label}
            </button>
          `
          ).join('')}
        </div>

        <div class="hub-gallery-grid" data-testid="gallery-grid">
          ${
            items.length === 0
              ? `
              <div class="hub-gallery-empty" data-testid="gallery-empty-state">
                <div class="hub-empty-icon">🌈✨</div>
                <h4 class="hub-empty-title">No creations in this category yet!</h4>
                <p class="hub-empty-text">
                  Visit the Tattoo Studio, CatNap Playground, or K-Pop Stage and click <strong>Save to Gallery</strong>—your creations will appear right here and stay safe even after reloading the page!
                </p>
              </div>
            `
              : items
                  .map(
                    (item) => `
                  <article
                    class="hub-gallery-item-card"
                    data-testid="gallery-item-card"
                    data-item-id="${escapeAttr(item.id)}"
                    data-item-type="${escapeAttr(item.type)}"
                  >
                    <div class="hub-gallery-card-thumb">
                      ${
                        item.previewDataUrl
                          ? `<img src="${escapeAttrUrl(item.previewDataUrl)}" alt="${escapeHtml(item.title)}" class="hub-gallery-thumb-img" />`
                          : `<div class="hub-gallery-thumb-placeholder">
                              <span class="hub-thumb-emoji">${TYPE_ICONS[item.type] || '✨'}</span>
                              <span class="hub-thumb-label">${escapeHtml(item.categoryLabel)}</span>
                            </div>`
                      }
                      <span class="hub-gallery-type-badge">${escapeHtml(item.categoryLabel)}</span>
                    </div>

                    <div class="hub-gallery-card-body">
                      <h4 class="hub-gallery-card-title">${escapeHtml(item.title)}</h4>
                      <p class="hub-gallery-card-subtitle">${escapeHtml(item.subtitle)}</p>
                      <span class="hub-gallery-card-date">
                        Saved ${formatTimestamp(item.createdAt)}
                      </span>
                    </div>

                    <div class="hub-gallery-card-actions">
                      <button
                        type="button"
                        class="hub-btn hub-btn-sm hub-btn-primary"
                        data-testid="gallery-load-item-btn"
                        data-action="load"
                        data-id="${escapeAttr(item.id)}"
                        data-type="${escapeAttr(item.type)}"
                      >
                        🎨 Load in Studio
                      </button>

                      <button
                        type="button"
                        class="hub-btn hub-btn-sm hub-btn-danger"
                        data-testid="gallery-delete-item-btn"
                        data-action="delete"
                        data-id="${escapeAttr(item.id)}"
                        data-type="${escapeAttr(item.type)}"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </article>
                `
                  )
                  .join('')
          }
        </div>
      </section>
    `;

    // Wire filter buttons
    container.querySelectorAll('.hub-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-filter-id') || 'all';
        render();
      });
    });

    // Wire load and delete actions
    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const type = btn.getAttribute('data-type');

        if (action === 'delete') {
          adapter.deleteGalleryItem(id, type);
          render();
          if (typeof onUpdate === 'function') onUpdate();
          return;
        }

        if (action === 'load') {
          const match = adapter
            .getGalleryItems('all')
            .find((it) => it.id === id);
          if (match) {
            adapter.notify('gallery:load', {
              id: match.id,
              type: match.type,
              item: match.raw,
            });
            // Switch to corresponding studio tab if present in DOM
            const tabSelector = TARGET_TAB_SELECTORS[match.type];
            const tabEl = tabSelector ? document.querySelector(tabSelector) : null;
            if (tabEl instanceof HTMLElement) {
              tabEl.click();
            }
          }
        }
      });
    });
  }

  render();

  return {
    render,
    setFilter(filterId) {
      activeFilter = filterId || 'all';
      render();
    },
    getItems(filterId) {
      return adapter.getGalleryItems(filterId || activeFilter);
    },
  };
}

function formatTimestamp(ts) {
  try {
    return new Date(Number(ts) || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (_err) {
    return 'Today';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function escapeAttrUrl(url) {
  const s = String(url || '');
  if (s.startsWith('data:image/')) return s;
  return escapeHtml(s);
}
