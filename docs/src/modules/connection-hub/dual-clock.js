/**
 * @fileoverview Live Dual-City Clock & Weather-Vibe Widget (R4.2).
 * Displays San Francisco (`America/Los_Angeles` PST/PDT) and Boston (`America/New_York` EST/EDT)
 * side by side with exact 3-hour delta, date rollover awareness, and cozy weather vibes.
 */

const SF_TZ = 'America/Los_Angeles';
const BOSTON_TZ = 'America/New_York';

function getHour24(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hourPart = parts.find((p) => p.type === 'hour');
  return hourPart ? parseInt(hourPart.value, 10) : 12;
}

function getShortZoneName(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  return tzPart ? tzPart.value : timeZone;
}

function getCityVibe(city, hour24) {
  if (city === 'sf') {
    if (hour24 >= 5 && hour24 < 11) {
      return {
        label: '🌅 Morning Golden Gate Mist & Warm Coffee',
        phase: 'morning',
        icon: '🌁☀️',
      };
    }
    if (hour24 >= 11 && hour24 < 17) {
      return {
        label: '☀️ Sunny Bay Breeze over San Francisco',
        phase: 'afternoon',
        icon: '⛵🌉',
      };
    }
    if (hour24 >= 17 && hour24 < 20) {
      return {
        label: '🌇 Golden Hour Glow over Pacific Ocean',
        phase: 'golden-hour',
        icon: '🌇✨',
      };
    }
    return {
      label: '🌙 Starry Bay Lights & CatNap Dream Clouds',
      phase: 'night',
      icon: '🌃🌙',
    };
  }

  // Boston vibes
  if (hour24 >= 5 && hour24 < 11) {
    return {
      label: '🦆 Morning Stroll in Boston Public Garden',
      phase: 'morning',
      icon: '🦆🌸',
    };
  }
  if (hour24 >= 11 && hour24 < 17) {
    return {
      label: '🏛️ Bright Afternoon by Charles River Esplanade',
      phase: 'afternoon',
      icon: '⛵🏛️',
    };
  }
  if (hour24 >= 17 && hour24 < 20) {
    return {
      label: '🌆 Cozy Boston Brownstone Lantern Glow',
      phase: 'golden-hour',
      icon: '🏮💜',
    };
  }
  return {
    label: '✨ Starlight Rooftop Dreams over Boston',
    phase: 'night',
    icon: '🌠🐱',
  };
}

/**
 * Pure deterministic dual-city formatter using standard `Intl.DateTimeFormat`.
 * @param {number} [referenceTimestampMs] Optional epoch ms override for testing
 */
export function formatDualCityClocks(referenceTimestampMs) {
  const now =
    typeof referenceTimestampMs === 'number' && !Number.isNaN(referenceTimestampMs)
      ? new Date(referenceTimestampMs)
      : new Date();

  const sfTimeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: SF_TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(now);

  const bostonTimeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON_TZ,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(now);

  const sfDateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: SF_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const bostonDateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: BOSTON_TZ,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(now);

  const sfTzShort = getShortZoneName(now, SF_TZ);
  const bostonTzShort = getShortZoneName(now, BOSTON_TZ);
  const sfHour24 = getHour24(now, SF_TZ);
  const bostonHour24 = getHour24(now, BOSTON_TZ);

  const sfVibe = getCityVibe('sf', sfHour24);
  const bostonVibe = getCityVibe('boston', bostonHour24);

  return {
    sf: {
      timeStr: sfTimeStr,
      tz: SF_TZ,
      tzShort: sfTzShort,
      dateStr: sfDateStr,
      vibe: sfVibe.label,
      phase: sfVibe.phase,
      icon: sfVibe.icon,
      hour24: sfHour24,
    },
    boston: {
      timeStr: bostonTimeStr,
      tz: BOSTON_TZ,
      tzShort: bostonTzShort,
      dateStr: bostonDateStr,
      vibe: bostonVibe.label,
      phase: bostonVibe.phase,
      icon: bostonVibe.icon,
      hour24: bostonHour24,
    },
    deltaHours: 3,
    isDifferentDay: sfDateStr !== bostonDateStr,
  };
}

/**
 * Mounts and updates the Live Dual-City Clock & Weather-Vibe widget.
 */
export function renderDualClockWidget(container) {
  let overrideTimestampMs = null;
  let timerId = null;

  function renderStructure() {
    container.innerHTML = `
      <section class="hub-card hub-dual-clock-card" aria-label="Live Dual-City Clock & Weather-Vibe Widget">
        <div class="hub-section-header">
          <div>
            <h3 class="hub-section-title">🌎 Live Bay Area ↔ Boston Connection Clock</h3>
            <p class="hub-section-subtitle">
              Real-time skies &amp; heartbeats connecting Mom in San Francisco and Daughter in Boston
            </p>
          </div>
          <span class="hub-delta-badge" data-testid="clock-delta-badge">
            Boston is +3h ahead of San Francisco
          </span>
        </div>

        <div class="hub-dual-clock-grid">
          <!-- San Francisco Card -->
          <div class="hub-city-card hub-city-sf">
            <div class="hub-city-header">
              <span class="hub-city-icon">🌉</span>
              <div>
                <h4 class="hub-city-name">San Francisco, CA (Mom)</h4>
                <span class="hub-city-zone" data-testid="clock-sf-zone">
                  America/Los_Angeles (PST/PDT)
                </span>
              </div>
            </div>
            <div class="hub-city-time" data-testid="clock-sf-time">--:--:--</div>
            <div class="hub-city-date" data-testid="clock-sf-date"></div>
            <div class="hub-city-vibe" data-testid="clock-sf-vibe"></div>
          </div>

          <!-- Connecting Bridge Pulse -->
          <div class="hub-city-bridge" aria-hidden="true">
            <div class="hub-bridge-line">
              <span class="hub-bridge-heart">💝</span>
            </div>
            <span class="hub-bridge-caption">3,000 Miles • Same Sky</span>
          </div>

          <!-- Boston Card -->
          <div class="hub-city-card hub-city-boston">
            <div class="hub-city-header">
              <span class="hub-city-icon">🦆</span>
              <div>
                <h4 class="hub-city-name">Boston, MA (Daughter)</h4>
                <span class="hub-city-zone" data-testid="clock-boston-zone">
                  America/New_York (EST/EDT)
                </span>
              </div>
            </div>
            <div class="hub-city-time" data-testid="clock-boston-time">--:--:--</div>
            <div class="hub-city-date" data-testid="clock-boston-date"></div>
            <div class="hub-city-vibe" data-testid="clock-boston-vibe"></div>
          </div>
        </div>
      </section>
    `;
  }

  function updateClockDom(tsOverride) {
    const effectiveTs =
      typeof tsOverride === 'number' ? tsOverride : overrideTimestampMs;
    const state = formatDualCityClocks(effectiveTs);

    const sfTimeEl = container.querySelector('[data-testid="clock-sf-time"]');
    const sfZoneEl = container.querySelector('[data-testid="clock-sf-zone"]');
    const sfDateEl = container.querySelector('[data-testid="clock-sf-date"]');
    const sfVibeEl = container.querySelector('[data-testid="clock-sf-vibe"]');

    const bosTimeEl = container.querySelector('[data-testid="clock-boston-time"]');
    const bosZoneEl = container.querySelector('[data-testid="clock-boston-zone"]');
    const bosDateEl = container.querySelector('[data-testid="clock-boston-date"]');
    const bosVibeEl = container.querySelector('[data-testid="clock-boston-vibe"]');

    if (sfTimeEl) sfTimeEl.textContent = state.sf.timeStr;
    if (sfZoneEl) sfZoneEl.textContent = `${state.sf.tz} (${state.sf.tzShort})`;
    if (sfDateEl) sfDateEl.textContent = state.sf.dateStr;
    if (sfVibeEl) sfVibeEl.textContent = state.sf.vibe;

    if (bosTimeEl) bosTimeEl.textContent = state.boston.timeStr;
    if (bosZoneEl) bosZoneEl.textContent = `${state.boston.tz} (${state.boston.tzShort})`;
    if (bosDateEl) bosDateEl.textContent = state.boston.dateStr;
    if (bosVibeEl) bosVibeEl.textContent = state.boston.vibe;

    return state;
  }

  renderStructure();
  updateClockDom();

  timerId = window.setInterval(() => {
    if (overrideTimestampMs === null) {
      updateClockDom();
    }
  }, 1000);

  return {
    getDualClocks(referenceTimestampMs) {
      if (typeof referenceTimestampMs === 'number') {
        overrideTimestampMs = referenceTimestampMs;
        return updateClockDom(referenceTimestampMs);
      }
      return updateClockDom();
    },
    destroy() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    },
  };
}
