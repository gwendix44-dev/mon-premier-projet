#!/usr/bin/env bash
cd "$(dirname "$0")"
for try in 1 2 3; do for h in overpass.private.coffee overpass.kumi.systems; do
  code=$(curl -sS -m 150 -A "route-video/1.0" --data-urlencode "data@q_stops.txt" "https://$h/api/interpreter" -o stops.json -w "%{http_code}" 2>/dev/null)
  echo "$h try$try -> $code $(stat -c%s stops.json 2>/dev/null) B"
  if [ "$code" = 200 ] && grep -q '"elements"' stops.json; then echo FIN_OK; exit 0; fi; sleep 3
done; done; echo FIN_ECHEC
