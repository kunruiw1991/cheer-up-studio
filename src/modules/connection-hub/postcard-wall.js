/**
 * @fileoverview "Letters & Stickers from Mom (Bay Area → Boston)" Postcard Wall (R4.3).
 * Exposes canonical `data-testid` selectors:
 * - `[data-testid="mom-postcard-wall"]`
 * - `[data-testid="postcard-wall-list"]`
 * - `[data-testid="mom-postcard-item-<id>"]`
 * - `[data-testid="mom-postcard-flip-btn-<id>"]`
 * - `[data-testid="mom-postcard-add-sticker-btn-<id>"]`
 * - `[data-testid="mom-postcard-heart-btn-<id>"]`
 * - `[data-testid="add-custom-postcard-input"]`
 * - `[data-testid="add-custom-postcard-btn"]`
 */

const BONUS_STICKERS = ['💖', '🌙', '🌟', '🐱', '🌉', '🦆', '🎤', '🎀', '💜', '🌈'];

const THEME_ILLUSTRATIONS = {
  'golden-gate-sunset': {
    bgGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    badge: '🌉 Golden Gate Bridge • San Francisco',
  },
  'catnap-lavender-dream': {
    bgGradient: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)',
    badge: '🐱🌙 CatNap Lavender Dream • Smiling Critters',
  },
  'huntrx-golden-stage': {
    bgGradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
    badge: '🎤⚡ HUNTR/X & Saja Boys Concert Stage',
  },
  'boston-public-garden': {
    bgGradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
    badge: '🦆🌸 Boston Public Garden • Mom & Me',
  },
};

export function renderPostcardWall(container, adapter, onUpdate) {
  function render() {
    const postcards = adapter.getPostcards();

    container.innerHTML = `
      <section
        class="hub-card hub-postcard-wall-section"
        data-testid="mom-postcard-wall"
        aria-label="Letters & Stickers from Mom Postcard Wall"
      >
        <div class="hub-section-header">
          <div>
            <h3 class="hub-section-title">
              💌 Letters &amp; Stickers from Mom (Bay Area → Boston)
            </h3>
            <p class="hub-section-subtitle">
              Heartfelt postcards from Mom in San Francisco to Daughter in Boston. Flip postcards, send hearts, and stamp stickers!
            </p>
          </div>
          <span class="hub-count-badge">${postcards.length} Family Postcards</span>
        </div>

        <!-- Add a Reply / Family Note Bar -->
        <div class="hub-add-postcard-bar">
          <input
            type="text"
            class="hub-input"
            data-testid="add-custom-postcard-input"
            maxlength="240"
            placeholder="Write a sweet reply note to Mom to pin on the wall..."
          />
          <button
            type="button"
            class="hub-btn hub-btn-primary"
            data-testid="add-custom-postcard-btn"
          >
            📌 Pin Note to Wall
          </button>
        </div>

        <!-- Postcard Wall Grid -->
        <div class="hub-postcard-grid" data-testid="postcard-wall-list">
          ${postcards
            .map((pc) => {
              const theme =
                THEME_ILLUSTRATIONS[pc.frontArtworkTheme] ||
                THEME_ILLUSTRATIONS['golden-gate-sunset'];
              const stickers = Array.isArray(pc.attachedStickerIds)
                ? pc.attachedStickerIds
                : ['💖'];
              const isFlipped = Boolean(pc.isFlipped);

              return `
                <article
                  class="hub-postcard-card ${isFlipped ? 'flipped' : ''}"
                  data-testid="mom-postcard-item-${escapeAttr(pc.id)}"
                  data-postcard-id="${escapeAttr(pc.id)}"
                >
                  <div
                    class="hub-postcard-banner"
                    style="background: ${theme.bgGradient};"
                  >
                    <span class="hub-postcard-theme-tag">${theme.badge}</span>
                    <span class="hub-postcard-stamp">AIR MAIL ✈️ SF ↔ BOS</span>
                  </div>

                  <div class="hub-postcard-body">
                    <div class="hub-postcard-meta">
                      <span class="hub-postcard-sender">
                        From: <strong>${escapeHtml(pc.sender || pc.fromCity || 'Mom (Bay Area)')}</strong>
                      </span>
                      <span class="hub-postcard-date">${escapeHtml(pc.dateLabel || pc.date || '')}</span>
                    </div>

                    <h4 class="hub-postcard-title">${escapeHtml(pc.title)}</h4>

                    ${
                      isFlipped
                        ? `
                        <div class="hub-postcard-back-view">
                          <p class="hub-postcard-back-label">🎨 Sticker &amp; Stamp Collection Side</p>
                          <p class="hub-postcard-back-detail">
                            Route: ${escapeHtml(pc.fromCity || 'San Francisco')} → ${escapeHtml(pc.toCity || 'Boston')}
                            • Special Reward Stamp: <code>${escapeHtml(pc.stickerId || 'bay_boston_bridge_heart')}</code>
                          </p>
                        </div>
                      `
                        : `
                        <p class="hub-postcard-message">${escapeHtml(pc.message || pc.messageBody || '')}</p>
                      `
                    }

                    <div class="hub-postcard-stickers" aria-label="Attached Stickers">
                      ${stickers
                        .map(
                          (st, idx) =>
                            `<span class="hub-sticker-chip" title="Sticker #${idx + 1}">${escapeHtml(st)}</span>`
                        )
                        .join('')}
                    </div>
                  </div>

                  <div class="hub-postcard-actions">
                    <button
                      type="button"
                      class="hub-btn hub-btn-sm hub-btn-heart"
                      data-testid="mom-postcard-heart-btn-${escapeAttr(pc.id)}"
                      data-action="heart"
                      data-id="${escapeAttr(pc.id)}"
                    >
                      ❤️ ${Number(pc.heartCount || 1)} Hearts
                    </button>

                    <button
                      type="button"
                      class="hub-btn hub-btn-sm hub-btn-sticker"
                      data-testid="mom-postcard-add-sticker-btn-${escapeAttr(pc.id)}"
                      data-action="sticker"
                      data-id="${escapeAttr(pc.id)}"
                    >
                      ✨ Stamp Sticker
                    </button>

                    <button
                      type="button"
                      class="hub-btn hub-btn-sm hub-btn-outline"
                      data-testid="mom-postcard-flip-btn-${escapeAttr(pc.id)}"
                      data-action="flip"
                      data-id="${escapeAttr(pc.id)}"
                    >
                      🔄 Flip Card
                    </button>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      </section>
    `;

    // Wire Add Custom Note button
    const addInput = container.querySelector('[data-testid="add-custom-postcard-input"]');
    const addBtn = container.querySelector('[data-testid="add-custom-postcard-btn"]');
    if (addBtn && addInput) {
      addBtn.addEventListener('click', () => {
        const text = addInput.value.trim();
        if (!text) return;
        const list = adapter.getPostcards();
        const profile = adapter.getProfile();
        const newCard = {
          id: `pc-custom-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          dateLabel: 'Pinned Today • Boston ↔ Bay Area',
          fromCity: 'Boston, MA',
          toCity: 'San Francisco, CA',
          sender: `${profile.nickname} (Boston)`,
          title: 'Sweet Family Note from Boston!',
          frontArtworkTheme: 'boston-public-garden',
          message: text,
          stickerId: 'boston_family_reply_star',
          attachedStickerIds: ['💌', '🌟'],
          read: true,
          isPinned: true,
          isFlipped: false,
          reaction: '💖',
          heartCount: 1,
        };
        adapter.savePostcards([newCard, ...list]);
        adapter.unlockSticker('boston_family_reply_star');
        render();
        if (typeof onUpdate === 'function') onUpdate();
      });
    }

    // Wire Heart, Stamp Sticker, and Flip buttons
    container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const list = adapter.getPostcards();
        const nextList = list.map((pc) => {
          if (pc.id !== id) return pc;
          if (action === 'heart') {
            return { ...pc, heartCount: (Number(pc.heartCount) || 0) + 1 };
          }
          if (action === 'sticker') {
            const currentStickers = Array.isArray(pc.attachedStickerIds)
              ? [...pc.attachedStickerIds]
              : [];
            const nextEmoji =
              BONUS_STICKERS[currentStickers.length % BONUS_STICKERS.length];
            currentStickers.push(nextEmoji);
            if (pc.stickerId) {
              adapter.unlockSticker(pc.stickerId);
            }
            return { ...pc, attachedStickerIds: currentStickers };
          }
          if (action === 'flip') {
            return { ...pc, isFlipped: !pc.isFlipped };
          }
          return pc;
        });
        adapter.savePostcards(nextList);
        render();
        if (typeof onUpdate === 'function') onUpdate();
      });
    });
  }

  render();

  return {
    render,
  };
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
