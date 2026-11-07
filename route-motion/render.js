// Rend une animation d'itinéraire image par image (déterministe), en parallèle.
//   ROUTE=tgv-marseille node render.js <dossier> [workers=3]                 -> toutes les images
//   ROUTE=tgv-marseille node render.js <dossier> 3 --only=0,2,5,12,26        -> aperçus à ces instants (s)
const { chromium } = require('playwright'); const srv = require('./server'); const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), only = (args.find(a => a.startsWith('--only=')) || '').slice(7);
const pos = args.filter(a => !a.startsWith('--')), dir = pos[0] || 'frames', WK = +(pos[1] || 3);
const ROUTE = process.env.ROUTE || 'tgv-marseille';
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, 'routes', ROUTE, 'config.json'))), FPS = CFG.fps, DUR = CFG.duration, N = Math.round(FPS * DUR);
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const s = await srv(__dirname); const port = s.address().port;
  const jobs = only ? only.split(',').map(Number).map(t => [t, `t_${t}.jpg`]) : Array.from({ length: N }, (_, i) => [i / FPS, `f_${String(i).padStart(4, '0')}.jpg`]);
  const todo = jobs.filter(([, n]) => !fs.existsSync(path.join(dir, n))); let done = jobs.length - todo.length; const t0 = Date.now();
  const per = Math.ceil(todo.length / WK);
  async function worker(k) {
    const mine = todo.slice(k * per, (k + 1) * per); if (!mine.length) return;
    const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.text().startsWith('maperr')) console.log(m.text()); });
    await p.goto(`http://127.0.0.1:${port}/index.html?route=${ROUTE}&t0=${mine[0][0]}`); await p.waitForFunction('window.ready', null, { timeout: 900000 });
    for (const [t, name] of mine) {
      const d = await p.evaluate(t => window.setFrame(t), t); fs.writeFileSync(path.join(dir, name), Buffer.from(d, 'base64')); done++;
      if (done % 10 === 0 || only) console.log(`${done}/${jobs.length}  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    await b.close();
  }
  await Promise.all(Array.from({ length: WK }, (_, k) => worker(k)));
  s.close(); console.log('FINI', ((Date.now() - t0) / 1000).toFixed(0), 's'); process.exit(0);
})();
