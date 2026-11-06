#!/usr/bin/env python3
"""Génère les fichiers audio (ElevenLabs) pour les exercices « listen ».
Ne régénère que les fichiers manquants. Usage : python3 tools/gen_audio.py [--dry]
La clé API est injectée par le proxy de l'environnement : rien à configurer ici."""
import json, os, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICES = {  # f = voix féminine, m = voix masculine (voix premium ElevenLabs, accent britannique/neutre)
    "f": "EXAVITQu4vr4xnSDxMaL",
    "m": "JBFqnCBsd6RMkjVDRZzb",
}
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.55, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True}

def jobs():
    for mod in ("english", "business"):
        for lesson in json.load(open(f"{ROOT}/data/{mod}.json")):
            for i, ex in enumerate(lesson["ex"]):
                for j, seg in enumerate(ex.get("script", [])):
                    yield f"{lesson['id']}_{i}_{j}.mp3", seg

def tts(text, voice):
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICES[voice]}?output_format=mp3_44100_64",
        data=json.dumps({"text": text, "model_id": MODEL, "voice_settings": SETTINGS}).encode(),
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def main():
    dry = "--dry" in sys.argv
    os.makedirs(f"{ROOT}/audio", exist_ok=True)
    todo = [(n, s) for n, s in jobs() if not os.path.exists(f"{ROOT}/audio/{n}")]
    print(f"{len(todo)} fichiers à générer")
    for n, seg in todo:
        if dry: print(" -", n, seg["t"][:60]); continue
        for attempt in range(3):
            try:
                open(f"{ROOT}/audio/{n}", "wb").write(tts(seg["t"], seg["v"])); print("ok", n); break
            except urllib.error.HTTPError as e:
                print("erreur", n, e.code, e.read()[:200]); time.sleep(2 ** attempt)
            except Exception as e:
                print("erreur", n, e); time.sleep(2 ** attempt)

if __name__ == "__main__":
    main()
