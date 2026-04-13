// MIT License — Flora Chatbot Template
'use strict';

function createLightMeterCard({ lux, lightType, lang = 'en' }) {
  const card = document.createElement('div');
  card.className = 'flora-light-meter';

  const maxLux    = 15000;
  const fillPct   = Math.min((lux / maxLux) * 100, 100).toFixed(1);

  const labels = {
    en: { title: 'Light Level', unit: 'lux', type: 'Type' },
    es: { title: 'Nivel de Luz', unit: 'lux', type: 'Tipo' },
  };
  const l = labels[lang] || labels.en;

  card.innerHTML = `
    <div style="font-weight:600;margin-bottom:6px;">☀️ ${l.title}</div>
    <div class="flora-lux-value">${Number(lux).toLocaleString()} <span style="font-size:13px;font-weight:400;">${l.unit}</span></div>
    <div class="flora-lux-bar"><div class="flora-lux-fill" style="width:${fillPct}%"></div></div>
    <div class="flora-lux-label">${l.type}: ${lightType}</div>
  `;
  return card;
}

async function getLuxFromSensor() {
  if (!('AmbientLightSensor' in window)) return null;
  return new Promise((resolve) => {
    try {
      const sensor = new AmbientLightSensor();
      sensor.addEventListener('reading', () => {
        resolve(sensor.illuminance);
        sensor.stop();
      });
      sensor.addEventListener('error', () => resolve(null));
      sensor.start();
      setTimeout(() => resolve(null), 3000);
    } catch {
      resolve(null);
    }
  });
}

if (typeof module !== 'undefined') module.exports = { createLightMeterCard, getLuxFromSensor };
else window.FloraLightMeter = { createLightMeterCard, getLuxFromSensor };
