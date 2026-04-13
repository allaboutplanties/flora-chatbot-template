// MIT License — Flora Chatbot Template
'use strict';

function createBubble(role, content, timestamp) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = role === 'user' ? 'flex-end' : 'flex-start';

  const bubble = document.createElement('div');
  bubble.className = `flora-bubble flora-bubble-${role}`;
  bubble.innerHTML = _formatContent(content);

  const time = document.createElement('div');
  time.className = 'flora-bubble-time';
  time.textContent = _formatTime(timestamp || new Date());

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);
  return wrapper;
}

function createTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.className = 'flora-bubble flora-bubble-bot flora-typing';
  wrapper.id = 'flora-typing';
  wrapper.innerHTML = '<span></span><span></span><span></span>';
  return wrapper;
}

function _formatContent(text) {
  // Basic markdown: **bold**, *italic*, links, line breaks
  return String(text)
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n/g, '<br>');
}

function _formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

if (typeof module !== 'undefined') module.exports = { createBubble, createTypingIndicator };
else window.FloraChatBubble = { createBubble, createTypingIndicator };
