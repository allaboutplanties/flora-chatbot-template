// MIT License — Flora Chatbot Template
'use strict';

const DEFAULT_SEASONS_URL = '/assets/seasons/';

class ThemeEngine {
  constructor(config = {}) {
    this._base   = config.colors || {};
    this._season = null;
    this._schedule = config.schedule || [];
  }

  load(scheduleConfig) {
    this._schedule = scheduleConfig?.schedule || [];
    this._detectSeason();
    this._apply();
  }

  _detectSeason() {
    const today = new Date();
    const mmdd  = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

    for (const entry of this._schedule) {
      if (this._inRange(mmdd, entry.start, entry.end)) {
        this._season = entry.theme;
        return;
      }
    }
    this._season = 'default';
  }

  _inRange(mmdd, start, end) {
    if (!start || !end) return false;
    if (start <= end) return mmdd >= start && mmdd <= end;
    // Wraps year (e.g. Dec–Jan)
    return mmdd >= start || mmdd <= end;
  }

  async _apply() {
    try {
      const res    = await fetch(`${DEFAULT_SEASONS_URL}${this._season}.json`);
      const theme  = await res.json();
      this._applyColors(theme.overrides?.colors || {});
      this._applyAvatar(theme.overrides?.avatar || {});
    } catch {
      // Silently fall back to CSS variables default
    }
  }

  _applyColors(colors) {
    const root = document.documentElement;
    if (colors.primary)   root.style.setProperty('--flora-primary',   colors.primary);
    if (colors.secondary) root.style.setProperty('--flora-secondary', colors.secondary);
    if (colors.accent)    root.style.setProperty('--flora-accent',    colors.accent);
  }

  _applyAvatar({ url, fallback } = {}) {
    const avatarEl = document.getElementById('flora-avatar');
    if (!avatarEl) return;
    if (url) {
      avatarEl.innerHTML = `<img src="${url}" alt="Flora" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else if (fallback) {
      avatarEl.textContent = fallback;
    }
  }

  getWelcomeMessage(langMessages, lang = 'en') {
    return langMessages?.[lang] || langMessages?.en || '';
  }
}

if (typeof module !== 'undefined') module.exports = ThemeEngine;
else window.FloraThemeEngine = ThemeEngine;
