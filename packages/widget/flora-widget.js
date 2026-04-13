/*!
 * Flora Widget — Main Bundle
 * MIT License — https://github.com/allaboutplanties/flora-chatbot-template
 *
 * Load order matters — each component registers itself on `window.*` before
 * the next one uses it. The bundle is intentionally self-contained (no module
 * bundler required) so it can be dropped into any Shopify theme as a single
 * <script> tag via embed-block.liquid.
 *
 * Configuration (set BEFORE this script loads):
 *   <script>
 *     window.FLORA_CONFIG = {
 *       n8nBase:      'https://flow.allaboutplanties.com',
 *       webhookChat:  '/webhook/flora-chat',
 *       webhookImage: '/webhook/flora-image',
 *       webhookLight: '/webhook/flora-light',
 *       botName:      'Flora',
 *       language:     'en',          // or 'es', or 'auto'
 *       avatar:       { fallback: '🌿', url: '' },
 *       maxImageMB:   2,
 *     };
 *   </script>
 */

(function (global) {
  'use strict';

  // ─── 1. Shopify Bridge ──────────────────────────────────────────────────────
  // Reads security token + honeypot injected by embed-block.liquid
  ;(function FloraShopifyBridge() {
    const ROOT_ID = 'flora-chatbot-root';
    const HP_ID   = 'flora-hp';

    function getSecurityContext() {
      const root = document.getElementById(ROOT_ID);
      if (!root) return { sessionId: _generateSessionId() };
      return {
        token:      root.dataset.floraToken     || '',
        sessionId:  root.dataset.floraSession   || _generateSessionId(),
        timestamp:  root.dataset.floraTimestamp || '',
        shop:       root.dataset.floraShop      || '',
        language:   root.dataset.floraLanguage  || 'en',
        customerId: root.dataset.floraCustomer  || '',
        honeypot:   (document.getElementById(HP_ID) || {}).value || '',
      };
    }

    function _generateSessionId() {
      return 'flora-' + Math.random().toString(36).slice(2) + '-' + Date.now();
    }

    global.FloraShopifyBridge = { getSecurityContext };
  })();

  // ─── 2. i18n ────────────────────────────────────────────────────────────────
  ;(function FloraI18n() {
    const dict = {
      en: {
        welcome: "Hi! I'm Flora 🌿 How can I help you with your plants today?",
        error: 'Oops, something went wrong. Please try again.',
        thinking: 'Let me check that for you...',
        rate_limit: "You're sending messages too fast. Please wait a moment.",
        image_sent: '📷 Image sent',
        placeholder: 'Type a message...',
        send: '↑', photo: '📷', light: '☀️',
        quick_photo: '📷 Upload photo',
        quick_light: '☀️ Measure light',
        quick_order: '📦 Track order',
        track_order_msg: 'I want to track my order',
        powered_by: 'Powered by',
      },
      es: {
        welcome: '¡Hola! Soy Flora 🌿 ¿En qué puedo ayudarte con tus plantas hoy?',
        error: 'Ups, algo salió mal. Por favor intenta de nuevo.',
        thinking: 'Déjame revisar eso...',
        rate_limit: 'Estás enviando mensajes muy rápido. Por favor espera.',
        image_sent: '📷 Imagen enviada',
        placeholder: 'Escribe un mensaje...',
        send: '↑', photo: '📷', light: '☀️',
        quick_photo: '📷 Subir foto',
        quick_light: '☀️ Medir luz',
        quick_order: '📦 Rastrear pedido',
        track_order_msg: 'Quiero rastrear mi pedido',
        powered_by: 'Impulsado por',
      },
    };

    function t(key, lang) {
      return (dict[lang] || dict.en)[key] || (dict.en)[key] || key;
    }

    function detect(text) {
      if (!text) return 'en';
      return /\b(hola|gracias|por favor|cómo|qué|quiero|necesito|ayuda|planta|pedido)\b/i.test(text) ? 'es' : 'en';
    }

    global.FloraI18n = { t, detect };
  })();

  // ─── 3. Config Loader ───────────────────────────────────────────────────────
  // Fetches flora.config.json from n8n by tenant_id (shop domain)
  ;(function FloraConfigLoader() {
    async function load() {
      const root   = document.getElementById('flora-chatbot-root');
      const tenant = root?.dataset?.floraShop || '';
      const base   = global.FLORA_CONFIG?.n8nBase || '';

      if (!tenant || !base) return null;

      try {
        const res = await fetch(`${base}/webhook/flora-config?tenant=${encodeURIComponent(tenant)}`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }

    function apply(config) {
      if (!config?.appearance) return;
      const root   = document.documentElement;
      const colors = config.appearance.colors || {};
      const map    = {
        primary:     '--flora-primary',
        secondary:   '--flora-secondary',
        accent:      '--flora-accent',
        background:  '--flora-bg',
        text:        '--flora-text',
        user_bubble: '--flora-user-bubble',
        bot_bubble:  '--flora-bot-bubble',
      };
      Object.entries(map).forEach(([key, cssVar]) => {
        if (colors[key]) root.style.setProperty(cssVar, colors[key]);
      });

      const typo = config.appearance.typography || {};
      if (typo.font_family) root.style.setProperty('--flora-font', typo.font_family);
      if (typo.font_size)   root.style.setProperty('--flora-font-size', typo.font_size);

      const borders = config.appearance.borders || {};
      if (borders.radius) root.style.setProperty('--flora-radius', borders.radius);

      const widget = config.appearance.widget || {};
      if (widget.width)  root.style.setProperty('--flora-width',  widget.width);
      if (widget.height) root.style.setProperty('--flora-height', widget.height);
    }

    function applyFAB(config, fabEl) {
      if (!fabEl || !config?.appearance?.fab) return;
      const { shape, size, label } = config.appearance.fab;
      const sizeMap = { sm: '36px', md: '48px' };
      const radiusMap = {
        circle:         '50%',
        'rounded-square': '12px',
        square:         '4px',
        pill:           '999px',
      };

      const px = sizeMap[size] || '48px';
      fabEl.style.width  = shape === 'pill' ? 'auto' : px;
      fabEl.style.height = px;
      fabEl.style.padding = shape === 'pill' ? `0 18px` : '0';
      fabEl.style.borderRadius = radiusMap[shape] || '50%';

      if (shape === 'pill' && label) {
        fabEl.innerHTML = `${config.bot?.avatar_fallback || '🌿'} <span style="margin-left:6px;font-size:14px;font-weight:600;">${label}</span>`;
      }
    }

    global.FloraConfigLoader = { load, apply, applyFAB };
  })();

  // ─── 4. Theme Engine ────────────────────────────────────────────────────────
  ;(function FloraThemeEngine() {
    function applySeasonalFromConfig(config) {
      if (!config?.seasonal?.enabled) return;

      const themes   = config.seasonal.themes || {};
      const override = config.seasonal.current_override;
      const today    = new Date();
      const mmdd     = pad(today.getMonth() + 1) + '-' + pad(today.getDate());

      let activeTheme = override || null;
      if (!activeTheme && config.seasonal.auto_switch) {
        for (const [name, t] of Object.entries(themes)) {
          if (t.enabled && inRange(mmdd, t.start, t.end)) {
            activeTheme = name;
            break;
          }
        }
      }
      if (!activeTheme) return;

      const base   = global.FLORA_CONFIG?.n8nBase || '';
      if (!base) return;

      fetch(`${base}/assets/seasons/${activeTheme}.json`)
        .then(r => r.ok ? r.json() : null)
        .then(season => {
          if (!season?.overrides) return;
          const colors = season.overrides.colors || {};
          const root   = document.documentElement;
          if (colors.primary)   root.style.setProperty('--flora-primary',   colors.primary);
          if (colors.secondary) root.style.setProperty('--flora-secondary', colors.secondary);
          if (colors.accent)    root.style.setProperty('--flora-accent',    colors.accent);

          const avatar = season.overrides.avatar || {};
          const avatarEl = document.getElementById('flora-avatar');
          if (avatarEl && avatar.fallback) avatarEl.textContent = avatar.fallback;
        })
        .catch(() => {});
    }

    function inRange(mmdd, start, end) {
      if (!start || !end) return false;
      return start <= end ? mmdd >= start && mmdd <= end : mmdd >= start || mmdd <= end;
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    global.FloraThemeEngine = { applySeasonalFromConfig };
  })();

  // ─── 5. Chat Bubble ─────────────────────────────────────────────────────────
  ;(function FloraChatBubble() {
    function createBubble(role, content) {
      const wrapper = document.createElement('div');
      wrapper.style.cssText = `display:flex;flex-direction:column;align-items:${role === 'user' ? 'flex-end' : 'flex-start'};`;

      const bubble = document.createElement('div');
      bubble.className = `flora-bubble flora-bubble-${role}`;
      bubble.innerHTML = _fmt(content);

      const time = document.createElement('div');
      time.className = 'flora-bubble-time';
      time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      wrapper.appendChild(bubble);
      wrapper.appendChild(time);
      return wrapper;
    }

    function createTypingIndicator() {
      const el = document.createElement('div');
      el.className = 'flora-bubble flora-bubble-bot flora-typing';
      el.id = 'flora-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      return el;
    }

    function _fmt(text) {
      return String(text)
        .replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br>');
    }

    global.FloraChatBubble = { createBubble, createTypingIndicator };
  })();

  // ─── 6. Image Upload ────────────────────────────────────────────────────────
  ;(function FloraImageUpload() {
    const MAX_MB = parseFloat(global.FLORA_CONFIG?.maxImageMB || '2');

    function createImageUploadTrigger(onImage) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/webp';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        try {
          const result = await _readAndCompress(file);
          onImage({ ...result, fileName: file.name });
        } catch (e) {
          console.error('[Flora] Image error:', e.message);
        }
        input.value = '';
      });

      return {
        trigger() { input.click(); },
        destroy() { input.remove(); },
      };
    }

    function _readAndCompress(file) {
      const MAX_BYTES = MAX_MB * 1024 * 1024;
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Read failed'));
        reader.onload = (e) => {
          const dataUrl  = e.target.result;
          const [header, base64] = dataUrl.split(',');
          const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
          const bytes    = (base64.length * 3) / 4;

          if (bytes <= MAX_BYTES) return resolve({ base64, mimeType });

          const img = new Image();
          img.onerror = () => reject(new Error('Load failed'));
          img.onload  = () => {
            const canvas = document.createElement('canvas');
            const ratio  = Math.sqrt(MAX_BYTES / bytes);
            canvas.width  = img.width  * ratio;
            canvas.height = img.height * ratio;
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
            resolve({ base64: compressed, mimeType: 'image/jpeg' });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    }

    global.FloraImageUpload = { createImageUploadTrigger };
  })();

  // ─── 7. Light Meter ─────────────────────────────────────────────────────────
  ;(function FloraLightMeter() {
    function createLightMeterCard({ lux, lightType, lang }) {
      const max     = 15000;
      const fillPct = Math.min((lux / max) * 100, 100).toFixed(1);
      const label   = lang === 'es' ? 'Nivel de Luz' : 'Light Level';
      const typeLabel = lang === 'es' ? 'Tipo' : 'Type';

      const card = document.createElement('div');
      card.className = 'flora-light-meter';
      card.innerHTML = `
        <div style="font-weight:600;margin-bottom:6px;">☀️ ${label}</div>
        <div class="flora-lux-value">${Number(lux).toLocaleString()} <span style="font-size:13px;font-weight:400;">lux</span></div>
        <div class="flora-lux-bar"><div class="flora-lux-fill" style="width:${fillPct}%"></div></div>
        <div class="flora-lux-label">${typeLabel}: ${lightType}</div>
      `;
      return card;
    }

    async function getLuxFromSensor() {
      if (!('AmbientLightSensor' in global)) return null;
      return new Promise((resolve) => {
        try {
          const sensor = new global.AmbientLightSensor();
          sensor.addEventListener('reading', () => { resolve(sensor.illuminance); sensor.stop(); });
          sensor.addEventListener('error', () => resolve(null));
          sensor.start();
          setTimeout(() => resolve(null), 3000);
        } catch { resolve(null); }
      });
    }

    global.FloraLightMeter = { createLightMeterCard, getLuxFromSensor };
  })();

  // ─── 8. Product Card ────────────────────────────────────────────────────────
  ;(function FloraProductCard() {
    function createProductCard({ name, price, imageUrl, productUrl, badge }) {
      function esc(s) { return String(s || '').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
      function escAttr(s) { return String(s || '').replace(/"/g, '&quot;'); }

      const card = document.createElement('div');
      card.className = 'flora-product-card';
      const img = imageUrl
        ? `<img src="${escAttr(imageUrl)}" alt="${escAttr(name)}" loading="lazy">`
        : `<div style="height:130px;background:var(--flora-surface);display:flex;align-items:center;justify-content:center;font-size:40px;">🌿</div>`;
      const badgeHtml = badge
        ? `<span style="background:var(--flora-accent);color:white;font-size:10px;padding:2px 6px;border-radius:10px;margin-bottom:4px;display:inline-block;">${esc(badge)}</span><br>`
        : '';

      card.innerHTML = `${img}<div class="flora-product-info">${badgeHtml}<div class="flora-product-name">${esc(name)}</div>${price ? `<div class="flora-product-price">${esc(price)}</div>` : ''}<a class="flora-product-btn" href="${escAttr(productUrl)}" target="_blank" rel="noopener">View product →</a></div>`;
      return card;
    }

    global.FloraProductCard = { createProductCard };
  })();

  // ─── 9. Chat Widget ─────────────────────────────────────────────────────────
  ;(function FloraChatWidgetDef() {
    class ChatWidget {
      constructor(config = {}) {
        this._cfg     = config;
        this._lang    = config.language === 'auto'
          ? (global.FloraShopifyBridge?.getSecurityContext().language || 'en')
          : (config.language || 'en');
        this._botName = config.botName || 'Flora';
        this._open    = false;
        this._busy    = false;
        this._sec     = global.FloraShopifyBridge?.getSecurityContext() || {};
        this._sid     = this._sec.sessionId;
        this._remoteConfig = null;
      }

      async mount(container = document.body) {
        this._root = document.createElement('div');
        this._root.id = 'flora-widget';
        container.appendChild(this._root);

        this._buildFAB();
        this._buildPanel();
        this._imgUploader = global.FloraImageUpload?.createImageUploadTrigger(
          (data) => this._handleImage(data)
        );

        // Load remote config and apply
        const rc = await global.FloraConfigLoader?.load();
        if (rc) {
          this._remoteConfig = rc;
          global.FloraConfigLoader.apply(rc);
          global.FloraConfigLoader.applyFAB(rc, this._fab);
          if (rc.bot?.name) { this._botName = rc.bot.name; this._updateBotName(); }
          if (rc.bot?.avatar_fallback) this._updateAvatar(rc.bot.avatar_fallback, rc.bot.avatar_url);
          if (rc.bot?.welcome_message) this._welcomeMsg = rc.bot.welcome_message[this._lang] || this._defaultWelcome();
          global.FloraThemeEngine?.applySeasonalFromConfig(rc);
        }

        this._showWelcome();
      }

      _buildFAB() {
        const fab = document.createElement('button');
        fab.id = 'flora-fab';
        fab.innerHTML = this._cfg.avatar?.fallback || '🌿';
        fab.setAttribute('aria-label', `Chat with ${this._botName}`);
        fab.addEventListener('click', () => this.toggle());
        this._root.appendChild(fab);
        this._fab = fab;
      }

      _buildPanel() {
        const panel = document.createElement('div');
        panel.id = 'flora-panel';
        panel.innerHTML = `
          <div id="flora-header">
            <div id="flora-avatar">${this._cfg.avatar?.fallback || '🌿'}</div>
            <div id="flora-header-info">
              <div id="flora-bot-name">${this._botName}</div>
              <div id="flora-status">Online · Plant Expert</div>
            </div>
            <button id="flora-close-btn" aria-label="Close">✕</button>
          </div>
          <div id="flora-messages"></div>
        `;

        // Quick actions
        const qa = document.createElement('div');
        qa.id = 'flora-quick-actions';
        const T = (k) => global.FloraI18n.t(k, this._lang);
        [
          [T('quick_photo'), () => this._imgUploader?.trigger()],
          [T('quick_light'), () => this._handleLightMeter()],
          [T('quick_order'), () => this._sendText(T('track_order_msg'))],
        ].forEach(([label, fn]) => {
          const btn = document.createElement('button');
          btn.className = 'flora-quick-btn';
          btn.textContent = label;
          btn.addEventListener('click', fn);
          qa.appendChild(btn);
        });
        panel.appendChild(qa);

        // Input row
        const inputArea = document.createElement('div');
        inputArea.id = 'flora-input-area';

        const imageBtn = document.createElement('button');
        imageBtn.id = 'flora-image-btn';
        imageBtn.innerHTML = '📷';
        imageBtn.title = 'Upload photo';
        imageBtn.addEventListener('click', () => this._imgUploader?.trigger());

        const textarea = document.createElement('textarea');
        textarea.id = 'flora-input';
        textarea.placeholder = global.FloraI18n.t('placeholder', this._lang);
        textarea.rows = 1;
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
          sendBtn.disabled = !textarea.value.trim();
        });
        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
        });

        const sendBtn = document.createElement('button');
        sendBtn.id = 'flora-send-btn';
        sendBtn.innerHTML = '↑';
        sendBtn.disabled = true;
        sendBtn.addEventListener('click', doSend);

        const doSend = () => {
          const text = textarea.value.trim();
          if (!text || this._busy) return;
          this._sendText(text);
          textarea.value = '';
          textarea.style.height = 'auto';
          sendBtn.disabled = true;
        };

        inputArea.appendChild(imageBtn);
        inputArea.appendChild(textarea);
        inputArea.appendChild(sendBtn);
        panel.appendChild(inputArea);
        this._sendBtn  = sendBtn;
        this._textarea = textarea;

        // Footer
        const footer = document.createElement('div');
        footer.id = 'flora-footer';
        const showBranding = !this._remoteConfig?.features?.white_label;
        if (showBranding) {
          footer.innerHTML = `${global.FloraI18n.t('powered_by', this._lang)} <a href="https://github.com/allaboutplanties/flora-chatbot-template" target="_blank" rel="noopener">Flora</a>`;
        }
        panel.appendChild(footer);

        panel.querySelector('#flora-close-btn').addEventListener('click', () => this.close());
        this._root.appendChild(panel);
        this._panel    = panel;
        this._messages = panel.querySelector('#flora-messages');
      }

      toggle() { this._open ? this.close() : this.open(); }
      open()   { this._open = true;  this._panel.classList.add('flora-visible');    this._fab.classList.add('flora-open');    this._textarea?.focus(); }
      close()  { this._open = false; this._panel.classList.remove('flora-visible'); this._fab.classList.remove('flora-open'); }

      _showWelcome() {
        this._appendBubble('bot', this._welcomeMsg || this._defaultWelcome());
      }

      _defaultWelcome() {
        return global.FloraI18n.t('welcome', this._lang)
          .replace('Flora', this._botName);
      }

      _updateBotName() {
        const el = document.getElementById('flora-bot-name');
        if (el) el.textContent = this._botName;
        if (this._fab) this._fab.setAttribute('aria-label', `Chat with ${this._botName}`);
      }

      _updateAvatar(fallback, url) {
        const el = document.getElementById('flora-avatar');
        if (!el) return;
        if (url) {
          el.innerHTML = `<img src="${url}" alt="${this._botName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        } else {
          el.textContent = fallback;
        }
        if (this._fab && !url) this._fab.innerHTML = fallback;
      }

      async _sendText(text) {
        if (this._busy) return;
        this._appendBubble('user', text);
        this._setBusy(true);
        try {
          const res  = await this._post(this._cfg.webhookChat || '/webhook/flora-chat', { sessionId: this._sid, message: text, language: this._lang });
          this._appendBubble('bot', res.reply || global.FloraI18n.t('error', this._lang));
        } catch { this._appendBubble('bot', global.FloraI18n.t('error', this._lang)); }
        finally  { this._setBusy(false); }
      }

      async _handleImage({ base64, mimeType }) {
        if (this._busy) return;
        this._appendBubble('user', global.FloraI18n.t('image_sent', this._lang));
        this._setBusy(true);
        try {
          const res = await this._post(this._cfg.webhookImage || '/webhook/flora-image', { sessionId: this._sid, image: { base64, mimeType }, language: this._lang });
          this._appendBubble('bot', res.reply || global.FloraI18n.t('error', this._lang));
        } catch { this._appendBubble('bot', global.FloraI18n.t('error', this._lang)); }
        finally  { this._setBusy(false); }
      }

      async _handleLightMeter() {
        const lux = await global.FloraLightMeter?.getLuxFromSensor();
        if (lux != null) {
          this._appendBubble('user', `☀️ ${lux} lux`);
          await this._sendLightRequest(lux);
        } else {
          this._appendBubble('bot', this._lang === 'es'
            ? 'No pude leer el sensor. Toma una foto del espacio y te digo el nivel de luz.'
            : "Couldn't read the sensor. Take a photo of the space and I'll estimate the light level.");
          this._imgUploader?.trigger();
        }
      }

      async _sendLightRequest(lux) {
        this._setBusy(true);
        try {
          const res = await this._post(this._cfg.webhookLight || '/webhook/flora-light', { sessionId: this._sid, lux, language: this._lang });
          if (res.lux != null && global.FloraLightMeter) {
            this._appendElement(global.FloraLightMeter.createLightMeterCard({ lux: res.lux, lightType: res.light_type, lang: this._lang }));
          }
          this._appendBubble('bot', res.reply || global.FloraI18n.t('error', this._lang));
        } catch { this._appendBubble('bot', global.FloraI18n.t('error', this._lang)); }
        finally  { this._setBusy(false); }
      }

      async _post(path, body) {
        const url = (this._cfg.n8nBase || '') + path;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type':     'application/json',
            'X-Flora-Token':    this._sec.token    || '',
            'X-Flora-Honeypot': this._sec.honeypot || '',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }

      _appendBubble(role, content) {
        this._removeTyping();
        this._messages.appendChild(global.FloraChatBubble.createBubble(role, content));
        this._scrollBottom();
      }

      _appendElement(el) {
        this._removeTyping();
        const w = document.createElement('div');
        w.style.alignSelf = 'flex-start';
        w.appendChild(el);
        this._messages.appendChild(w);
        this._scrollBottom();
      }

      _setBusy(val) {
        this._busy = val;
        if (this._sendBtn)  this._sendBtn.disabled  = val;
        if (this._textarea) this._textarea.disabled = val;
        if (val) {
          this._messages.appendChild(global.FloraChatBubble.createTypingIndicator());
          this._scrollBottom();
        } else {
          this._removeTyping();
        }
      }

      _removeTyping()   { this._messages.querySelector('#flora-typing')?.remove(); }
      _scrollBottom()   { this._messages.scrollTop = this._messages.scrollHeight; }
    }

    global.FloraChatWidget = ChatWidget;
  })();

  // ─── 10. Boot ───────────────────────────────────────────────────────────────
  function boot() {
    const config = global.FLORA_CONFIG || {};
    const widget = new global.FloraChatWidget(config);
    widget.mount(document.body);
    global._floraWidget = widget;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
