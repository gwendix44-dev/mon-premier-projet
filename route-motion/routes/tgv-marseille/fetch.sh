#!/usr/bin/env bash
# Télécharge la géométrie de la relation OSM 3265872 (TGV 510 Paris – Aix-en-Provence – Marseille), en essayant deux miroirs Overpass.
cd "$(dirname "$0")"
printf "[out:json][timeout:120];\nrelation(3265872);\nout geom;\n" > q_rel.txt
for try in 1 2 3 4; do for h in overpass.kumi.systems overpass.private.coffee; do
  code=$(curl -sS -m 150 -A "route-video/1.0" --data-urlencode "data@q_rel.txt" "https://$h/api/interpreter" -o rel.json -w "%{http_code}" 2>/dev/null)
  echo "$h try$try -> $code $(stat -c%s rel.json 2>/dev/null) B"
  if [ "$code" = 200 ] && grep -q '"members"' rel.json; then echo FIN_OK; exit 0; fi; sleep 3
done; done; echo FIN_ECHEC
