// MIT License — Flora Chatbot Template
'use strict';

const { selectModel } = require('./model-selector');
const { addMessage, getHistory } = require('./session-manager');
const { detectLanguage, t } = require('../i18n/i18n-manager');

const WEBHOOK_BASE = process.env.N8N_BASE_URL || '';
const WEBHOOK_CHAT  = process.env.N8N_WEBHOOK_CHAT  || '/webhook/flora-chat';
const WEBHOOK_IMAGE = process.env.N8N_WEBHOOK_IMAGE || '/webhook/flora-image';
const WEBHOOK_LIGHT = process.env.N8N_WEBHOOK_LIGHT || '/webhook/flora-light';

const MAX_MESSAGE_LENGTH = parseInt(process.env.FLORA_MAX_MESSAGE_LENGTH || '1000', 10);
const MAX_IMAGE_SIZE_MB   = parseFloat(process.env.FLORA_MAX_IMAGE_SIZE_MB || '2');
const DEBOUNCE_MS         = 2000;

let _lastSentAt = 0;

// ─── Public API ───────────────────────────────────────────────────────────────

async function sendMessage({ sessionId, message, tenantId = 'default', token, honeypot }) {
  _guardDebounce();
  _guardLength(message);

  const lang     = detectLanguage(message);
  const history  = getHistory(sessionId);
  const model    = selectModel('chat');

  addMessage(sessionId, 'user', message, { language: lang });

  const response = await _post(WEBHOOK_BASE + WEBHOOK_CHAT, {
    sessionId,
    tenantId,
    message,
    history,
    model,
    language: lang,
  }, { token, honeypot });

  const reply = response?.reply || t('error', lang);
  addMessage(sessionId, 'assistant', reply, { language: lang, agent_used: response?.agent_used });
  return { reply, language: lang, agent_used: response?.agent_used };
}

async function sendImage({ sessionId, base64, mimeType = 'image/jpeg', tenantId = 'default', token, honeypot }) {
  _guardImageSize(base64);

  const lang    = detectLanguage('');
  const model   = selectModel('vision');

  const response = await _post(WEBHOOK_BASE + WEBHOOK_IMAGE, {
    sessionId,
    tenantId,
    image: { base64, mimeType },
    model,
    language: lang,
  }, { token, honeypot });

  const reply = response?.reply || t('error', lang);
  addMessage(sessionId, 'assistant', reply, { language: lang, agent_used: 'vision_agent' });
  return { reply, language: lang, identification: response?.identification };
}

async function sendLightReading({ sessionId, lux, base64, tenantId = 'default', token, honeypot }) {
  const lang    = detectLanguage('');
  const model   = selectModel('light');

  const payload = { sessionId, tenantId, model, language: lang };
  if (lux !== undefined) payload.lux = lux;
  if (base64) payload.image = { base64, mimeType: 'image/jpeg' };

  const response = await _post(WEBHOOK_BASE + WEBHOOK_LIGHT, payload, { token, honeypot });

  const reply = response?.reply || t('error', lang);
  addMessage(sessionId, 'assistant', reply, { language: lang, agent_used: 'light_agent' });
  return { reply, language: lang, recommendations: response?.recommendations };
}

// ─── Internals ────────────────────────────────────────────────────────────────

async function _post(url, body, { token, honeypot } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token)    headers['X-Flora-Token']    = token;
  if (honeypot !== undefined) headers['X-Flora-Honeypot'] = honeypot;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const err = new Error(`Flora webhook error: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function _guardDebounce() {
  const now = Date.now();
  if (now - _lastSentAt < DEBOUNCE_MS) {
    throw Object.assign(new Error('rate_limit'), { code: 'DEBOUNCE' });
  }
  _lastSentAt = now;
}

function _guardLength(message) {
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    throw Object.assign(new Error('Message too long'), { code: 'TOO_LONG' });
  }
}

function _guardImageSize(base64) {
  const bytes = (base64.length * 3) / 4;
  const mb    = bytes / (1024 * 1024);
  if (mb > MAX_IMAGE_SIZE_MB) {
    throw Object.assign(new Error('Image too large'), { code: 'IMAGE_TOO_LARGE' });
  }
}

module.exports = { sendMessage, sendImage, sendLightReading };
