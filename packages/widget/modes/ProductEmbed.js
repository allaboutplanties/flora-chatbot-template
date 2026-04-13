// MIT License — Flora Chatbot Template
// Product embed mode — initializes mini-chat panels on product pages
// Works alongside product-section.liquid
'use strict';

(function FloraProductEmbed() {
  function init() {
    // This mode is initialized by product-section.liquid inline script.
    // This file provides shared utilities for the embed.
    console.log('[Flora] Product embed mode loaded.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
