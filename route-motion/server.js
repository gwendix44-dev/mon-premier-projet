// Serveur local : fichiers statiques + proxy de tuiles AVEC CACHE disque (chaque tuile n'est téléchargée qu'une fois,
// les rendus parallèles et les relances partagent le cache). Les téléchargements passent par curl (respecte le proxy de la session).
const http = require('http'), fs = require('fs'), path = require('path'), { execFile, execFileSync } = require('child_process');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.geojson': 'application/json', '.png': 'image/png', '.pbf': 'application/x-protobuf' };
const CACHE = path.join(__dirname, 'cache'); fs.mkdirSync(CACHE, { recursive: true });
const UA = 'eurostar-route-video/1.0 (personal project)';

function omtBase() { // URL versionnée des tuiles OpenFreeMap (lue dans le TileJSON)
  const f = path.join(CACHE, 'omt.tilejson');
  if (!fs.existsSync(f)) execFileSync('curl', ['-sS', '-m', '30', '-A', UA, '-o', f, 'https://tiles.openfreemap.org/planet']);
  return JSON.parse(fs.readFileSync(f)).tiles[0].replace('{z}/{x}/{y}.pbf', '');
}
let OMT; const UP = {
  sat: (z, a, b) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${a}/${b}`,   // z/y/x
  dem: (z, a, b) => `https://elevation-tiles-prod.s3.amazonaws.com/terrarium/${z}/${a}/${b}.png`,                         // z/x/y
  omt: (z, a, b) => `${OMT}${z}/${a}/${b}.pbf`,
};
let running = 0; const queue = [];
function pump() { while (running < 16 && queue.length) { running++; queue.shift()(() => { running--; pump(); }); } }
function fetchTile(url, file) {
  return new Promise(res => { queue.push(done => {
    const tmp = file + '.' + process.pid + '.tmp';
    execFile('curl', ['-sS', '-m', '40', '-A', UA, '-f', '-o', tmp, url], err => {
      if (err) { try { fs.unlinkSync(tmp); } catch (e) { } done(); return res(false); }
      fs.renameSync(tmp, file); if (file.includes('dem_')) { try { flattenSea(file); } catch (e) { } } done(); res(true);
    });
  }); pump(); });
}
const { PNG } = require('pngjs');
function flattenSea(file) { // Terrarium : e = R*256 + G + B/256 - 32768 ; on remplace e<0 par 0
  const png = PNG.sync.read(fs.readFileSync(file)); const d = png.data;
  for (let i = 0; i < d.length; i += 4) { const e = d[i] * 256 + d[i + 1] + d[i + 2] / 256 - 32768; if (e < 0) { d[i] = 128; d[i + 1] = 0; d[i + 2] = 0; } }
  fs.writeFileSync(file, PNG.sync.write(png));
}
const inflight = new Map();
module.exports = (root, port = 0) => new Promise(res => {
  OMT = omtBase();
  const s = http.createServer(async (q, r) => {
    const url = decodeURIComponent(q.url.split('?')[0]);
    const m = url.match(/^\/t\/(sat|dem|omt)\/(\d+)\/(\d+)\/(\d+)/);
    if (m) {
      const [, kind, z, a, b] = m, ext = kind === 'dem' ? '.png' : kind === 'omt' ? '.pbf' : '.jpg';
      const file = path.join(CACHE, `${kind}_${z}_${a}_${b}${ext}`);
      if (!fs.existsSync(file)) {
        if (!inflight.has(file)) inflight.set(file, fetchTile(UP[kind](z, a, b), file).finally(() => inflight.delete(file)));
        const ok = await inflight.get(file); if (!ok) { r.writeHead(404, { 'Access-Control-Allow-Origin': '*' }); return r.end(); }
      }
      const buf = fs.readFileSync(file), h = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'max-age=3600' };
      if (kind === 'omt') { h['Content-Type'] = 'application/x-protobuf'; if (buf[0] === 0x1f && buf[1] === 0x8b) h['Content-Encoding'] = 'gzip'; }
      else h['Content-Type'] = kind === 'dem' ? 'image/png' : 'image/jpeg';
      r.writeHead(200, h); return r.end(buf);
    }
    const p = path.join(root, url);
    fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(d); } });
  }).listen(port, '127.0.0.1', () => res(s));
});
