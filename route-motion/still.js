// Cartes fixes de vérification du parcours. Usage : node still.js <config.json> <dossier_sortie>
const { chromium } = require('playwright'); const srv = require('./server'); const fs = require('fs'), path = require('path');
const [cfgFile, outDir] = process.argv.slice(2); const spec = JSON.parse(fs.readFileSync(cfgFile));
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const s = await srv(__dirname); const port = s.address().port;
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.text().startsWith('maperr')) console.log(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/index.html?route=${spec.route}&t0=0`); await p.waitForFunction('window.ready', null, { timeout: 600000 });
  for (const v of spec.views) { const d = await p.evaluate(v => window.still(v), v); fs.writeFileSync(path.join(outDir, v.file), Buffer.from(d, 'base64')); console.log('ok', v.file); }
  await b.close(); s.close(); process.exit(0);
})();
