"""Construit routes/<id>/route.geojson à partir de rel.json (relation OSM, `out geom`).
La relation contient souvent plusieurs variantes dans le désordre : on construit un graphe de toutes les voies
et on prend le plus court chemin entre la gare de départ (config.start.ll) et la gare d'arrivée (config.end.ll).
Usage : python3 build_route.py routes/<id>"""
import json, math, sys, heapq
R = 6371.0088
def hav(a, b):
    p1, p2 = math.radians(a[1]), math.radians(b[1]); dl = math.radians(b[0] - a[0]); dp = p2 - p1
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))
d = sys.argv[1]
cfg = json.load(open(f'{d}/config.json')); rel = json.load(open(f'{d}/rel.json'))['elements'][0]
key = lambda p: (round(p[0], 5), round(p[1], 5))
adj = {}; pos = {}
for m in rel['members']:
    if m['type'] != 'way' or not m.get('geometry') or m['role'] in ('platform', 'stop', 'platform_entry_only', 'platform_exit_only'): continue
    pts = [(p['lon'], p['lat']) for p in m['geometry']]
    for a, b in zip(pts, pts[1:]):
        ka, kb = key(a), key(b)
        if ka == kb: continue
        pos[ka] = a; pos[kb] = b; w = hav(a, b)
        adj.setdefault(ka, []).append((kb, w, m['ref'])); adj.setdefault(kb, []).append((ka, w, m['ref']))
nodes = list(adj)
near = lambda ll: min(nodes, key=lambda k: hav(pos[k], ll))
S, E = near(cfg['start']['ll']), near(cfg['end']['ll'])
print('départ', pos[S], 'à', round(hav(pos[S], cfg['start']['ll']), 2), 'km de la gare | arrivée', pos[E], 'à', round(hav(pos[E], cfg['end']['ll']), 2), 'km')
dist = {S: 0.0}; prev = {}; pq = [(0.0, S)]
while pq:
    dd, u = heapq.heappop(pq)
    if u == E: break
    if dd > dist.get(u, 1e18): continue
    for v, w, wid in adj[u]:
        nd = dd + w
        if nd < dist.get(v, 1e18): dist[v] = nd; prev[v] = (u, wid); heapq.heappush(pq, (nd, v))
if E not in dist: sys.exit('aucun chemin entre les deux gares : le graphe est déconnecté')
path = [E]; wids = []
while path[-1] != S: u, wid = prev[path[-1]]; wids.append(wid); path.append(u)
path.reverse(); wids.reverse(); line = [pos[k] for k in path]
# tronçons (way id) dans l'ordre du trajet, avec kilomètres de début / fin
segs = []; acc = 0.0
for i, wid in enumerate(wids):
    w = hav(pos[path[i]], pos[path[i + 1]])
    if segs and segs[-1]['way'] == wid: segs[-1]['km1'] = round(acc + w, 2)
    else: segs.append({'way': wid, 'km0': round(acc, 2), 'km1': round(acc + w, 2), 'p0': list(pos[path[i]])})
    acc += w
json.dump(segs, open(f'{d}/route_ways.json', 'w'))
def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]; best, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x0, y0 = pts[i]; dx, dy = x2 - x1, y2 - y1
        t = max(0, min(1, ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy or 1e-18)))
        dd = math.hypot((x0 - (x1 + t * dx)) * math.cos(math.radians(y0)), y0 - (y1 + t * dy)) * 111.2
        if dd > best: best, idx = dd, i
    if best > eps: return dp(pts[:idx + 1], eps)[:-1] + dp(pts[idx:], eps)
    return [pts[0], pts[-1]]
sys.setrecursionlimit(30000)
simp = dp(line, 0.004); cum = [0.0]
for i in range(1, len(simp)): cum.append(cum[-1] + hav(simp[i - 1], simp[i]))
json.dump({'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'name': rel['tags'].get('name'), 'km': round(cum[-1], 1)}, 'geometry': {'type': 'LineString', 'coordinates': [[round(x, 6), round(y, 6)] for x, y in simp]}}]}, open(f'{d}/route.geojson', 'w'))
print(rel['tags'].get('name'), '| chemin', len(line), 'pts ->', len(simp), '| km', round(cum[-1], 1))
for c in cfg.get('pass', []):
    k = min(range(len(simp)), key=lambda i: hav(simp[i], c['ll'])); print(f"  {c['name']:16s} à {hav(simp[k], c['ll']):5.1f} km du tracé (km {cum[k]:6.1f})")
