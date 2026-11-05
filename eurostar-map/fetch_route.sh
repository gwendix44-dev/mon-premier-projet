#!/usr/bin/env bash
# Télécharge la géométrie de la relation OSM "Eurostar : Paris → London" (essaie plusieurs miroirs Overpass).
cd "$(dirname "$0")"
for id in 11781286 11781287 11781288; do
  [ -s rel_$id.json ] && grep -q '"members"' rel_$id.json && continue
  printf "[out:json][timeout:120];\nrelation(%s);\nout geom;\n" $id > q_$id.txt
  for try in 1 2 3; do for h in overpass.kumi.systems overpass.private.coffee; do
    code=$(curl -sS -m 150 -A "eurostar-video/1.0" --data-urlencode "data@q_$id.txt" "https://$h/api/interpreter" -o rel_$id.json -w "%{http_code}" 2>/dev/null)
    echo "$id $h try$try -> $code $(stat -c%s rel_$id.json 2>/dev/null) B"
    if [ "$code" = 200 ] && grep -q '"members"' rel_$id.json; then break 2; fi
    sleep 3
  done; done
done
echo FIN
