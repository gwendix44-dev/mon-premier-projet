# JetForm

Application personnelle pour apprendre le métier de **courtier en jet privé** (charter broker), en visant Le Bourget (FBO puis charter sales).
Format : leçons courtes façon Duolingo, schémas, quiz, exercices écrits, audio anglais, révision espacée. Fonctionne sur téléphone, hors connexion.

## Lancer en local
```
python3 -m http.server 8123
```
puis ouvrir http://localhost:8123 (sur téléphone : « Ajouter à l'écran d'accueil »).

## Contenu actuel
| Module | Leçons |
|---|---|
| 1. Business et économie | 7 |
| 2. Prix et coûts d'un vol | 5 (taux horaire, temps bloc, devis, frais, coût de possession) |
| 3. Immatriculation et propriété | 3 |
| 4. Maintenance et navigabilité | 3 |
| 5. Aéroports d'affaires | 6 (méthode, Le Bourget, Nice/Cannes, Farnborough, Teterboro, comparatif) |
| 6. English Lab | 8 (TOEIC, téléphone, voyage, audio ElevenLabs) |
| À venir | Jets et flotte, Opérations, Vente et hospitalité, Entretien FBO |

Toutes les leçons sont ouvertes (pas de verrouillage).

## Structure
- `data/modules.json` : la carte des modules.
- `data/*.json` : les leçons (cartes-cours + exercices). Types : `mcq`, `tf`, `match`, `order`, `write`, `num` (calcul), `listen`. Cartes : texte, tableau, liste, encadré, schéma.
- `assets/svg/` : schémas.
- `audio/` : fichiers générés par `python3 tools/gen_audio.py` (ne génère que ce qui manque).
- `docs/SOURCES.md` : règles de fiabilité et sources.
- Langue : 4 niveaux d'interface (FR → 100 % EN) dans Réglages. Le contenu bilingue se complète leçon par leçon (`{"fr": …, "en": …}`).
