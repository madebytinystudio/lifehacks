// script.js

let quotes = [];
let currentQuote = null;

// Загружаем JSON с цитатами
fetch('quotes.json')
  .then(res => res.json())
  .then(data => {
    quotes = data;
    showRandomQuote();
  });

function showRandomQuote() {
  if (quotes.length === 0) return;
  const random = Math.floor(Math.random() * quotes.length);
  currentQuote = quotes[random];
  document.getElementById('quote').textContent = currentQuote.text;
  if (typeof window.drawStoryPreview === 'function') {
    window.drawStoryPreview();
  }
}

document.getElementById('btn-next').addEventListener('click', showRandomQuote);

document.getElementById('btn-share').addEventListener('click', async () => {
  if (!currentQuote) return;

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // фон белый
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#111111';

  // текст
  const fontSize = 54;
  const lineHeight = 1.4;
  const padding = 56;
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const words = currentQuote.text.split(' ');
  let line = '';
  let y = padding;
  const maxWidth = canvas.width - padding * 2;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line, padding, y);
      line = words[n] + ' ';
      y += fontSize * lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, padding, y);

  if (navigator.canShare && navigator.canShare({ files: [] })) {
    canvas.toBlob(async blob => {
      const file = new File([blob], 'quote.png', { type: 'image/png' });
      try {
        await navigator.share({
          files: [file],
          title: 'Цитата',
          text: currentQuote.text
        });
      } catch (err) {
        console.error('Share canceled or failed', err);
      }
    });
  } else if (navigator.share) {
    try {
      await navigator.share({
        title: 'Цитата',
        text: currentQuote.text
      });
    } catch (err) {
      console.error('Share canceled or failed', err);
    }
  } else {
    const link = document.createElement('a');
    link.download = 'quote.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
});

// Первичная отрисовка предпросмотра
if (typeof window.drawStoryPreview === 'function') {
  window.drawStoryPreview();
}