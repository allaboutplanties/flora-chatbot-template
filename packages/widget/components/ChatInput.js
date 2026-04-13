// MIT License — Flora Chatbot Template
'use strict';

function createChatInput({ onSend, onImage, onLightMeter, lang = 'en', disabled = false }) {
  const labels = {
    en: { placeholder: 'Type a message...', send: '↑', photo: '📷', light: '☀️' },
    es: { placeholder: 'Escribe un mensaje...', send: '↑', photo: '📷', light: '☀️' },
  };
  const l = labels[lang] || labels.en;

  const area = document.createElement('div');
  area.id = 'flora-input-area';

  const textarea = document.createElement('textarea');
  textarea.id          = 'flora-input';
  textarea.placeholder = l.placeholder;
  textarea.rows        = 1;
  textarea.disabled    = disabled;

  // Auto-resize
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  });

  // Send on Enter (Shift+Enter = new line)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _doSend();
    }
  });

  const imageBtn = document.createElement('button');
  imageBtn.id        = 'flora-image-btn';
  imageBtn.title     = 'Upload photo';
  imageBtn.innerHTML = l.photo;
  imageBtn.addEventListener('click', () => onImage?.());

  const sendBtn = document.createElement('button');
  sendBtn.id        = 'flora-send-btn';
  sendBtn.innerHTML = l.send;
  sendBtn.disabled  = true;
  sendBtn.addEventListener('click', _doSend);

  textarea.addEventListener('input', () => {
    sendBtn.disabled = textarea.value.trim().length === 0;
  });

  function _doSend() {
    const text = textarea.value.trim();
    if (!text || sendBtn.disabled) return;
    onSend?.(text);
    textarea.value = '';
    textarea.style.height = 'auto';
    sendBtn.disabled = true;
  }

  function setDisabled(val) {
    textarea.disabled  = val;
    sendBtn.disabled   = val || textarea.value.trim().length === 0;
    imageBtn.disabled  = val;
  }

  area.appendChild(imageBtn);
  area.appendChild(textarea);
  area.appendChild(sendBtn);

  return { element: area, setDisabled, focus: () => textarea.focus() };
}

if (typeof module !== 'undefined') module.exports = { createChatInput };
else window.FloraChatInput = { createChatInput };
