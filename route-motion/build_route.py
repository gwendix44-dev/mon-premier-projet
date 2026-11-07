"""Construit routes/<id>/route.geojson à partir de rel.json (relation OSM, `out geom`).
Usage : python3 build_route.py routes/<id>"""
import json, math, sys
R = 6371.0088
def hav(a, b):
    p1, p2 = math.radians(a[1]), math.radians(b[1]); dl = math.radians(b[0] - a[0]); dp = p2 - p1
    h = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))
d = sys.argv[1]
rel = json.load(open(f'{d}/rel.json'))['elements'][0]
segs = [[(p['lon'], p['lat']) for p in m['geometry']] for m in rel['members'] if m['type'] == 'way' and m.get('geometry') and m['role'] not in ('platform', 'stop', 'platform_entry_only', 'platform_exit_only')]
line = list(segs[0]); gaps = []
for i, s in enumerate(segs[1:], 1):
    if hav(line[-1], s[-1]) < hav(line[-1], s[0]): s = s[::-1]
    g = hav(line[-1], s[0])
    if g > 0.3: gaps.append((i, round(g, 2)))
    line.extend(s if g > 0.003 else s[1:])
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
simp = dp(line, 0.004); dist = [0.0]
for i in range(1, len(simp)): dist.append(dist[-1] + hav(simp[i - 1], simp[i]))
json.dump({'type': 'FeatureCollection', 'features': [{'type': 'Feature', 'properties': {'name': rel['tags'].get('name'), 'km': round(dist[-1], 1)}, 'geometry': {'type': 'LineString', 'coordinates': [[round(x, 6), round(y, 6)] for x, y in simp]}}]}, open(f'{d}/route.geojson', 'w'))
print(rel['tags'].get('name'), '| points', len(line), '->', len(simp), '| km', round(dist[-1], 1), '| lacunes >300 m:', gaps[:8], '| début', simp[0], '| fin', simp[-1])
