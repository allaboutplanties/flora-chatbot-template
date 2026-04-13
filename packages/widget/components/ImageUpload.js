// MIT License — Flora Chatbot Template
'use strict';

const MAX_MB = parseFloat(window?.FLORA_CONFIG?.maxImageMB || '2');

function createImageUploadTrigger(onImage) {
  const input = document.createElement('input');
  input.type   = 'file';
  input.accept = 'image/jpeg,image/png,image/webp';
  input.style.display = 'none';

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const { base64, mimeType } = await _readAndCompress(file);
      onImage({ base64, mimeType, fileName: file.name });
    } catch (err) {
      console.error('[Flora] Image upload error:', err.message);
    }
    input.value = '';
  });

  document.body.appendChild(input);

  return {
    trigger() { input.click(); },
    destroy() { input.remove(); },
  };
}

async function _readAndCompress(file) {
  const MAX_BYTES = MAX_MB * 1024 * 1024;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const original = e.target.result; // data:image/jpeg;base64,...
      const [header, base64] = original.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';

      const bytes = (base64.length * 3) / 4;
      if (bytes <= MAX_BYTES) {
        return resolve({ base64, mimeType });
      }
      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio  = Math.sqrt(MAX_BYTES / bytes);
        canvas.width  = img.width  * ratio;
        canvas.height = img.height * ratio;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
        resolve({ base64: compressed, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = original;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

if (typeof module !== 'undefined') module.exports = { createImageUploadTrigger };
else window.FloraImageUpload = { createImageUploadTrigger };
