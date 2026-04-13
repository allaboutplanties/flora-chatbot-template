// MIT License — Flora Chatbot Template
'use strict';

const en = require('./en.json');
const es = require('./es.json');

const SUPPORTED = { en, es };

function detectLanguage(text) {
  if (!text) return 'en';
  const spanishPattern = /\b(hola|gracias|por favor|cómo|cuándo|qué|quiero|necesito|ayuda|planta|pedido|orden)\b/i;
  return spanishPattern.test(text) ? 'es' : 'en';
}

function t(key, lang = 'en') {
  const dict = SUPPORTED[lang] || SUPPORTED.en;
  return dict[key] || SUPPORTED.en[key] || key;
}

module.exports = { t, detectLanguage, SUPPORTED };
