#!/usr/bin/env bash
# Ajoute la voix off ElevenLabs à la vidéo (non testé ici : l'API était bloquée dans la session).
# Usage : ELEVENLABS_API_KEY=xxx [VOICE_ID=...] ./add_voiceover.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${ELEVENLABS_API_KEY:?Définis ELEVENLABS_API_KEY}"
VOICE_ID="${VOICE_ID:-JBFqnCBsd6RMkjVDRZzb}"   # remplace par la voix de ton choix (Voice Library)
TEXT=$(python3 -c "import json;print(json.dumps(open('voiceover.txt').read().strip()))")
curl -fsS -X POST "https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128" \
  -H "xi-api-key: ${ELEVENLABS_API_KEY}" -H "Content-Type: application/json" \
  -d "{\"text\": ${TEXT}, \"model_id\": \"eleven_multilingual_v2\", \"voice_settings\": {\"stability\": 0.45, \"similarity_boost\": 0.8, \"style\": 0.3}}" \
  -o voiceover.mp3
# voix à 0,5 s, musique réduite (ducking) sous la voix, durée finale 10 s
ffmpeg -y -loglevel error -i aura-jet-silent.mp4 -i music.wav -i voiceover.mp3 -filter_complex \
 "[2:a]atempo=1.05,adelay=500|500,apad,atrim=0:10,asplit=2[vo][sc];[1:a][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[bg];[bg][vo]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]" \
 -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -t 10 aura-jet-voiceover.mp4
echo "OK -> aura-jet-voiceover.mp4"
