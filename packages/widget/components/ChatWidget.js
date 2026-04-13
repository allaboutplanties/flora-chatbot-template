// MIT License — Flora Chatbot Template
'use strict';

class ChatWidget {
  constructor(config = {}) {
    this._config  = config;
    this._lang    = config.language || 'en';
    this._botName = config.botName  || 'Flora';
    this._open    = false;
    this._busy    = false;

    this._security  = window.FloraShopifyBridge?.getSecurityContext() || {};
    this._sessionId = this._security.sessionId || this._generateSessionId();

    this._imageUploader = null;
    this._panel         = null;
    this._messages      = null;
    this._inputCtrl     = null;
  }

  mount(container = document.body) {
    this._root = document.createElement('div');
    this._root.id = 'flora-widget';
    container.appendChild(this._root);

    this._buildFAB();
    this._buildPanel();
    this._setupImageUploader();

    if (window.FloraThemeEngine) {
      const theme = new window.FloraThemeEngine(this._config);
      theme.load(this._config.schedule);
    }

    this._showWelcome();
  }

  _buildFAB() {
    const fab = document.createElement('button');
    fab.id        = 'flora-fab';
    fab.innerHTML = this._config.avatar?.fallback || '🌿';
    fab.setAttribute('aria-label', `Chat with ${this._botName}`);
    fab.addEventListener('click', () => this.toggle());
    this._root.appendChild(fab);
    this._fab = fab;
  }

  _buildPanel() {
    const panel = document.createElement('div');
    panel.id = 'flora-panel';

    // Header
    panel.innerHTML = `
      <div id="flora-header">
        <div id="flora-avatar">${this._config.avatar?.fallback || '🌿'}</div>
        <div id="flora-header-info">
          <div id="flora-bot-name">${this._botName}</div>
          <div id="flora-status">Online · Plant Expert</div>
        </div>
        <button id="flora-close-btn" aria-label="Close chat">✕</button>
      </div>
      <div id="flora-messages"></div>
    `;

    // Quick actions
    const qa = this._buildQuickActions();
    panel.appendChild(qa);

    // Input
    const inputCtrl = window.FloraChatInput?.createChatInput({
      lang:    this._lang,
      onSend:  (text)  => this._handleText(text),
      onImage: ()      => this._imageUploader?.trigger(),
    }) || { element: document.createElement('div'), setDisabled() {}, focus() {} };

    panel.appendChild(inputCtrl.element);
    this._inputCtrl = inputCtrl;

    // Footer
    const footer = document.createElement('div');
    footer.id = 'flora-footer';
    footer.innerHTML = 'Powered by <a href="https://github.com/allaboutplanties/flora-chatbot-template" target="_blank">Flora</a>';
    panel.appendChild(footer);

    panel.querySelector('#flora-close-btn').addEventListener('click', () => this.close());

    this._root.appendChild(panel);
    this._panel    = panel;
    this._messages = panel.querySelector('#flora-messages');
  }

  _buildQuickActions() {
    const labels = {
      en: ['📷 Upload photo', '☀️ Measure light', '📦 Track order'],
      es: ['📷 Subir foto',   '☀️ Medir luz',     '📦 Rastrear pedido'],
    };
    const btns = labels[this._lang] || labels.en;

    const div = document.createElement('div');
    div.id = 'flora-quick-actions';

    const actions = [
      () => this._imageUploader?.trigger(),
      () => this._handleLightMeter(),
      () => this._handleText(this._lang === 'es' ? 'Quiero rastrear mi pedido' : 'I want to track my order'),
    ];

    btns.forEach((label, i) => {
      const btn = document.createElement('button');
      btn.className   = 'flora-quick-btn';
      btn.textContent = label;
      btn.addEventListener('click', actions[i]);
      div.appendChild(btn);
    });

    return div;
  }

  _setupImageUploader() {
    if (!window.FloraImageUpload) return;
    this._imageUploader = window.FloraImageUpload.createImageUploadTrigger(
      ({ base64, mimeType, fileName }) => this._handleImage({ base64, mimeType, fileName })
    );
  }

  toggle() { this._open ? this.close() : this.open(); }

  open() {
    this._open = true;
    this._panel.classList.add('flora-visible');
    this._fab.classList.add('flora-open');
    this._inputCtrl?.focus();
  }

  close() {
    this._open = false;
    this._panel.classList.remove('flora-visible');
    this._fab.classList.remove('flora-open');
  }

  _showWelcome() {
    const messages = {
      en: `Hi! I'm ${this._botName} 🌿 How can I help you with your plants today?`,
      es: `¡Hola! Soy ${this._botName} 🌿 ¿En qué puedo ayudarte con tus plantas hoy?`,
    };
    this._appendBubble('bot', messages[this._lang] || messages.en);
  }

  async _handleText(text) {
    if (this._busy) return;
    this._appendBubble('user', text);
    this._setBusy(true);

    try {
      const res = await fetch(
        (window.FLORA_CONFIG?.n8nBase || '') + (window.FLORA_CONFIG?.webhookChat || '/webhook/flora-chat'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Flora-Token':    this._security.token    || '',
            'X-Flora-Honeypot': this._security.honeypot || '',
          },
          body: JSON.stringify({
            sessionId: this._sessionId,
            message:   text,
            language:  this._lang,
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const data = await res.json();
      this._appendBubble('bot', data.reply || this._errorMsg());
    } catch {
      this._appendBubble('bot', this._errorMsg());
    } finally {
      this._setBusy(false);
    }
  }

  async _handleImage({ base64, mimeType }) {
    if (this._busy) return;
    this._appendBubble('user', this._lang === 'es' ? '📷 Imagen enviada' : '📷 Image sent');
    this._setBusy(true);

    try {
      const res = await fetch(
        (window.FLORA_CONFIG?.n8nBase || '') + (window.FLORA_CONFIG?.webhookImage || '/webhook/flora-image'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Flora-Token':    this._security.token    || '',
            'X-Flora-Honeypot': this._security.honeypot || '',
          },
          body: JSON.stringify({
            sessionId: this._sessionId,
            image:     { base64, mimeType },
            language:  this._lang,
          }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const data = await res.json();
      this._appendBubble('bot', data.reply || this._errorMsg());
    } catch {
      this._appendBubble('bot', this._errorMsg());
    } finally {
      this._setBusy(false);
    }
  }

  async _handleLightMeter() {
    const lux = await window.FloraLightMeter?.getLuxFromSensor();
    if (lux !== null && lux !== undefined) {
      this._appendBubble('user', `☀️ ${lux} lux`);
      await this._handleLightRequest(lux);
    } else {
      // Fallback: ask user to take a photo
      const msg = this._lang === 'es'
        ? 'No pude acceder al sensor de luz. Toma una foto del espacio y te digo el nivel de luz.'
        : "I couldn't access the light sensor. Take a photo of the space and I'll estimate the light level.";
      this._appendBubble('bot', msg);
      this._imageUploader?.trigger();
    }
  }

  async _handleLightRequest(lux) {
    this._setBusy(true);
    try {
      const res = await fetch(
        (window.FLORA_CONFIG?.n8nBase || '') + (window.FLORA_CONFIG?.webhookLight || '/webhook/flora-light'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Flora-Token':    this._security.token    || '',
            'X-Flora-Honeypot': this._security.honeypot || '',
          },
          body: JSON.stringify({ sessionId: this._sessionId, lux, language: this._lang }),
          signal: AbortSignal.timeout(30000),
        }
      );
      const data = await res.json();
      if (data.lux && window.FloraLightMeter) {
        this._appendElement(window.FloraLightMeter.createLightMeterCard({ lux: data.lux, lightType: data.light_type, lang: this._lang }));
      }
      this._appendBubble('bot', data.reply || this._errorMsg());
    } catch {
      this._appendBubble('bot', this._errorMsg());
    } finally {
      this._setBusy(false);
    }
  }

  _appendBubble(role, content) {
    this._removeTyping();
    if (window.FloraChatBubble) {
      this._messages.appendChild(window.FloraChatBubble.createBubble(role, content));
    } else {
      const p = document.createElement('p');
      p.textContent = content;
      this._messages.appendChild(p);
    }
    this._scrollBottom();
  }

  _appendElement(el) {
    this._removeTyping();
    const wrapper = document.createElement('div');
    wrapper.style.alignSelf = 'flex-start';
    wrapper.appendChild(el);
    this._messages.appendChild(wrapper);
    this._scrollBottom();
  }

  _setBusy(val) {
    this._busy = val;
    this._inputCtrl?.setDisabled(val);
    if (val) {
      const typing = window.FloraChatBubble?.createTypingIndicator() || document.createElement('div');
      this._messages.appendChild(typing);
      this._scrollBottom();
    } else {
      this._removeTyping();
    }
  }

  _removeTyping() {
    this._messages.querySelector('#flora-typing')?.remove();
  }

  _scrollBottom() {
    this._messages.scrollTop = this._messages.scrollHeight;
  }

  _errorMsg() {
    return this._lang === 'es'
      ? 'Ups, algo salió mal. Por favor intenta de nuevo.'
      : 'Oops, something went wrong. Please try again.';
  }

  _generateSessionId() {
    return 'flora-' + Math.random().toString(36).slice(2) + '-' + Date.now();
  }
}

if (typeof module !== 'undefined') module.exports = ChatWidget;
else window.FloraChatWidget = ChatWidget;
