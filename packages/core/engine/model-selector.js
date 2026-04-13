// MIT License — Flora Chatbot Template
'use strict';

const MODELS = {
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-6',
  haiku: 'claude-haiku-4-5-20251001',
};

const COMPLEX_INTENTS = ['complex_diagnosis', 'multi_agent_coordination'];

function selectModel(intent, flags = {}) {
  if (flags.forceModel) return MODELS[flags.forceModel] || MODELS.sonnet;
  if (COMPLEX_INTENTS.includes(intent)) return MODELS.opus;
  return MODELS.sonnet;
}

module.exports = { selectModel, MODELS };
