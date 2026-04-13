// MIT License — Flora Chatbot Template
// Fullscreen modal mode — opens as a centered overlay
'use strict';

(function FloraFullscreenModal() {
  function init() {
    const config = window.FLORA_CONFIG || {};

    const style = document.createElement('style');
    style.textContent = `
      #flora-widget { position: fixed; inset: 0; bottom: unset; right: unset; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); z-index: 999999; pointer-events: none; }
      #flora-widget.flora-backdrop-active { pointer-events: all; }
      #flora-fab { display: none !important; }
      #flora-panel {
        position: relative !important;
        bottom: unset !important;
        right: unset !important;
        width: 480px !important;
        height: 680px !important;
        max-width: 95vw !important;
        max-height: 90vh !important;
        border-radius: 20px !important;
      }
    `;
    document.head.appendChild(style);

    const widget = new window.FloraChatWidget(config);
    widget.mount(document.body);

    const _origOpen  = widget.open.bind(widget);
    const _origClose = widget.close.bind(widget);

    widget.open = function() {
      widget._root.classList.add('flora-backdrop-active');
      _origOpen();
    };
    widget.close = function() {
      widget._root.classList.remove('flora-backdrop-active');
      _origClose();
    };

    // Close on backdrop click
    widget._root.addEventListener('click', (e) => {
      if (e.target === widget._root) widget.close();
    });

    // Expose global open trigger
    window.floraOpen  = () => widget.open();
    window.floraClose = () => widget.close();
    window._floraWidget = widget;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
