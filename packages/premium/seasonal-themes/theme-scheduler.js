// PREMIUM LICENSE — Flora Chatbot Template
// Seasonal Theme Scheduler
// Auto-activates and deactivates themes based on date ranges.
// Works with the flora.config.json seasonal section and ThemeEngine.
'use strict';

class FloraThemeScheduler {
  constructor({ n8nBase, tenantId, checkIntervalMs = 3600000 } = {}) {
    this._base     = n8nBase;
    this._tenant   = tenantId;
    this._interval = checkIntervalMs; // default: check every hour
    this._timer    = null;
    this._current  = null;
  }

  // Start automatic scheduling
  start() {
    this._check();
    this._timer = setInterval(() => this._check(), this._interval);
    return this;
  }

  stop() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
  }

  // Force a specific theme regardless of date
  async forceTheme(themeId) {
    await this._saveOverride(themeId);
    await this._applyTheme(themeId);
  }

  // Clear manual override — go back to auto
  async clearOverride() {
    await this._saveOverride(null);
    await this._check();
  }

  // Get current active theme name (or null if default)
  getActive() {
    return this._current;
  }

  // Preview a theme without saving it (useful for admin panel)
  async preview(themeId) {
    const season = await this._fetchSeason(themeId);
    if (!season) return;
    this._applyColors(season.overrides?.colors || {});
    this._applyAvatar(season.overrides?.avatar || {});
    return season;
  }

  // Restore from preview back to current active
  async restoreFromPreview() {
    if (this._current) {
      await this._applyTheme(this._current);
    } else {
      this._resetToDefault();
    }
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  async _check() {
    try {
      const config = await this._fetchConfig();
      if (!config?.seasonal?.enabled) return;

      const override = config.seasonal.current_override;
      if (override) {
        if (this._current !== override) await this._applyTheme(override);
        return;
      }

      if (!config.seasonal.auto_switch) return;

      const active = this._detectActive(config.seasonal.themes || {});
      if (active !== this._current) {
        if (active) {
          await this._applyTheme(active);
        } else {
          this._resetToDefault();
          this._current = null;
        }
      }
    } catch (e) {
      console.warn('[Flora Scheduler] Check failed:', e.message);
    }
  }

  _detectActive(themes) {
    const today = new Date();
    const mmdd  = _pad(today.getMonth() + 1) + '-' + _pad(today.getDate());

    for (const [name, t] of Object.entries(themes)) {
      if (t.enabled && _inRange(mmdd, t.start, t.end)) return name;
    }
    return null;
  }

  async _applyTheme(themeId) {
    const season = await this._fetchSeason(themeId);
    if (!season) return;
    this._applyColors(season.overrides?.colors || {});
    this._applyAvatar(season.overrides?.avatar || {});
    this._applyWelcome(season.overrides?.messages || {});
    this._current = themeId;
    this._dispatch('flora:theme-changed', { theme: themeId, season });
  }

  async _fetchConfig() {
    if (!this._base || !this._tenant) return null;
    const res = await fetch(`${this._base}/webhook/flora-config?tenant=${encodeURIComponent(this._tenant)}`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? res.json() : null;
  }

  async _fetchSeason(themeId) {
    const res = await fetch(`${this._base}/assets/seasons/${themeId}.json`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok ? res.json() : null;
  }

  async _saveOverride(themeId) {
    if (!this._base) return;
    const config = await this._fetchConfig();
    if (!config) return;
    config.seasonal.current_override = themeId;
    await fetch(`${this._base}/webhook/flora-config-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenant_id: this._tenant, config }),
    });
  }

  _applyColors(colors) {
    const root = document.documentElement;
    const map  = { primary: '--flora-primary', secondary: '--flora-secondary', accent: '--flora-accent' };
    Object.entries(map).forEach(([key, cssVar]) => {
      if (colors[key]) root.style.setProperty(cssVar, colors[key]);
    });
  }

  _applyAvatar({ url, fallback } = {}) {
    const avatarEl = document.getElementById('flora-avatar');
    const fabEl    = document.getElementById('flora-fab');
    if (!avatarEl) return;
    if (url) {
      avatarEl.innerHTML = `<img src="${url}" alt="Flora" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else if (fallback) {
      avatarEl.textContent = fallback;
      if (fabEl && !fabEl.querySelector('img')) fabEl.textContent = fallback;
    }
  }

  _applyWelcome(messages) {
    // Only affects future sessions — current chat is not reset
    if (typeof window !== 'undefined' && window._floraWidget) {
      const lang = window._floraWidget._lang || 'en';
      window._floraWidget._welcomeMsg = messages?.welcome?.[lang] || null;
    }
  }

  _resetToDefault() {
    // Remove all inline CSS var overrides — variables.css defaults take over
    const root = document.documentElement;
    ['--flora-primary', '--flora-secondary', '--flora-accent'].forEach(v => {
      root.style.removeProperty(v);
    });
  }

  _dispatch(event, detail) {
    document.dispatchEvent(new CustomEvent(event, { detail, bubbles: true }));
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function _pad(n) { return String(n).padStart(2, '0'); }

function _inRange(mmdd, start, end) {
  if (!start || !end) return false;
  return start <= end ? mmdd >= start && mmdd <= end : mmdd >= start || mmdd <= end;
}

// ─── Export ────────────────────────────────────────────────────────────────────
if (typeof module !== 'undefined') module.exports = FloraThemeScheduler;
else window.FloraThemeScheduler = FloraThemeScheduler;
