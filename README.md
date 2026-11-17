# Itqān · Website (itqan.at)

Statische Seite für GitHub Pages. Wird aus `werkzeuge/website/` im Projekt erzeugt, nicht von Hand bearbeitet.

- Bauen: `PYTHONIOENCODING=utf-8 python werkzeuge/website/bauen.py` (mit `--freigabe` bricht es ab, solange Impressum oder Datenschutz noch Platzhalter enthalten).
- Texte: `werkzeuge/website/texte.py` (Deutsch, Englisch), Rechtstexte: `rechtstexte.py`, Angaben des Betreibers: `angaben.json`.
- Gestaltung und Bewegung: `werkzeuge/website/vorlage/site.css` und `site.js`.
- Bilder: Aufnahmen der App mit `werkzeuge/website/aufnahme.mjs` (Ordner `_roh`, nicht veröffentlicht), `bauen.py` wandelt sie in WebP.
- Veröffentlichung: Inhalt dieses Ordners (ohne `_roh`) in ein GitHub-Repository, Pages aus dem Hauptzweig, `CNAME` enthält `itqan.at`.
