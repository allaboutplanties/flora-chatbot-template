// MIT License — Flora Chatbot Template
// Entry point for floating button mode — the default widget mode
'use strict';

(function FloraFloatingButton() {
  function init() {
    const config = window.FLORA_CONFIG || {};
    const widget = new window.FloraChatWidget(config);
    widget.mount(document.body);
    window._floraWidget = widget;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
