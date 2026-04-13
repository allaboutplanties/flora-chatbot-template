// MIT License — Flora Chatbot Template
// Reads security tokens from DOM (injected by embed-block.liquid)
'use strict';

(function FloraShopifyBridge() {
  const ROOT_ID = 'flora-chatbot-root';
  const HP_ID   = 'flora-hp';

  function getSecurityContext() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return {};

    return {
      token:     root.dataset.floraToken     || '',
      sessionId: root.dataset.floraSession   || _generateFallbackSession(),
      timestamp: root.dataset.floraTimestamp || '',
      shop:      root.dataset.floraShop      || '',
      language:  root.dataset.floraLanguage  || 'en',
      customerId:root.dataset.floraCustomer  || '',
      honeypot:  (document.getElementById(HP_ID) || {}).value || '',
    };
  }

  function _generateFallbackSession() {
    return 'flora-' + Math.random().toString(36).slice(2) + '-' + Date.now();
  }

  // Expose globally so flora-engine.js can read it
  window.FloraShopifyBridge = { getSecurityContext };
})();
