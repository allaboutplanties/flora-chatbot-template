// MIT License — Flora Chatbot Template
// Side panel mode — widget docked to the right edge of the screen
'use strict';

(function FloraSidePanel() {
  function init() {
    const config = window.FLORA_CONFIG || {};

    // Override positioning for side panel mode
    const style = document.createElement('style');
    style.textContent = `
      #flora-widget { bottom: 0 !important; right: 0 !important; }
      #flora-fab    { display: none !important; }
      #flora-panel  {
        position: fixed !important;
        bottom: 0 !important;
        right: 0 !important;
        top: 0 !important;
        height: 100vh !important;
        width: 380px !important;
        border-radius: 0 !important;
        transform: translateX(100%) !important;
        opacity: 1 !important;
        pointer-events: all !important;
        transition: transform 0.3s ease !important;
      }
      #flora-panel.flora-visible {
        transform: translateX(0) !important;
      }
    `;
    document.head.appendChild(style);

    const widget = new window.FloraChatWidget(config);
    widget.mount(document.body);

    // Add a trigger button in a different location
    const trigger = document.createElement('button');
    trigger.id = 'flora-side-trigger';
    trigger.innerHTML = '🌿 Chat';
    trigger.style.cssText = 'position:fixed;bottom:50%;right:0;transform:rotate(-90deg) translateY(-50%);transform-origin:right center;background:#2D5A27;color:white;border:none;padding:8px 16px;border-radius:8px 8px 0 0;cursor:pointer;font-size:14px;z-index:999998;';
    trigger.addEventListener('click', () => widget.toggle());
    document.body.appendChild(trigger);

    window._floraWidget = widget;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
