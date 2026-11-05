// Rend la vidéo image par image (deterministe) puis assemble avec ffmpeg.
// Usage: node render.js [dossier_frames] [fps]   (fps = 30 par défaut)
// Option: node render.js frames 30 0.5,2.2,4,6,8,9.5   -> ne rend que ces instants (aperçus PNG)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = process.argv[2] || 'frames', fps = +(process.argv[3] || 30), only = process.argv[4];
  fs.mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(__dirname, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  const grab = t => page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, t);
  if (only) {
    for (const t of only.split(',').map(Number)) fs.writeFileSync(path.join(dir, `t_${t}.png`), Buffer.from(await grab(t), 'base64'));
  } else {
    const n = fps * 10;
    for (let i = 0; i < n; i++) {
      fs.writeFileSync(path.join(dir, `f_${String(i).padStart(4, '0')}.png`), Buffer.from(await grab(i / fps), 'base64'));
      if (i % 30 === 0) console.log('frame', i, '/', n);
    }
  }
  await browser.close();
})();
