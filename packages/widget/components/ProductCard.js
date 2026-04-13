// MIT License — Flora Chatbot Template
'use strict';

function createProductCard({ name, price, imageUrl, productUrl, badge }) {
  const card = document.createElement('div');
  card.className = 'flora-product-card';

  const img = imageUrl
    ? `<img src="${_escAttr(imageUrl)}" alt="${_escAttr(name)}" loading="lazy">`
    : `<div style="height:130px;background:var(--flora-surface);display:flex;align-items:center;justify-content:center;font-size:40px;">🌿</div>`;

  const badgeHtml = badge
    ? `<span style="background:var(--flora-accent);color:white;font-size:10px;padding:2px 6px;border-radius:10px;margin-bottom:4px;display:inline-block;">${_esc(badge)}</span><br>`
    : '';

  card.innerHTML = `
    ${img}
    <div class="flora-product-info">
      ${badgeHtml}
      <div class="flora-product-name">${_esc(name)}</div>
      ${price ? `<div class="flora-product-price">${_esc(price)}</div>` : ''}
      <a class="flora-product-btn" href="${_escAttr(productUrl)}" target="_blank" rel="noopener">View product →</a>
    </div>
  `;
  return card;
}

function _esc(str) {
  return String(str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function _escAttr(str) {
  return String(str || '').replace(/"/g, '&quot;');
}

if (typeof module !== 'undefined') module.exports = { createProductCard };
else window.FloraProductCard = { createProductCard };
