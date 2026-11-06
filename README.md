# JetForm

Application personnelle pour apprendre le métier de **courtier en jet privé** (charter broker), en visant Le Bourget (FBO puis charter sales).
Format : leçons courtes façon Duolingo, schémas, quiz, exercices écrits, audio anglais, révision espacée. Fonctionne sur téléphone, hors connexion.

## Lancer en local
```
python3 -m http.server 8123
```
puis ouvrir http://localhost:8123 (sur téléphone : « Ajouter à l'écran d'accueil »).

## Contenu actuel (V1)
| Module | État |
|---|---|
| 3. Business et économie | 7 leçons |
| 5. English Lab (TOEIC, métier, voyage) | 8 leçons, audio ElevenLabs |
| 1, 2, 4, 6 | à venir (Jets, Opérations, Vente, Entretien FBO) |

## Structure
- `data/modules.json` : la carte des modules.
- `data/*.json` : les leçons (cartes-cours + exercices). Types : `mcq`, `tf`, `match`, `order`, `write`, `listen`.
- `assets/svg/` : schémas.
- `audio/` : fichiers générés par `python3 tools/gen_audio.py` (ne génère que ce qui manque).
- `docs/SOURCES.md` : règles de fiabilité et sources.
- Langue : 4 niveaux d'interface (FR → 100 % EN) dans Réglages. Le contenu bilingue se complète leçon par leçon (`{"fr": …, "en": …}`).
