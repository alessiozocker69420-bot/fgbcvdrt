# AERO X1 – Premium Flight Concept

Interaktives Online-Werbeplakat mit deinem eigenen STL-Modell (Three.js). Das Modell dreht sich automatisch um 360°, lässt sich mit der Maus drehen und zoomen, und die Drehung kann pausiert werden.

## Dateien

```
aero-x1-premium/
├── index.html
├── style.css
├── script.js
├── models/
│   └── AERO-X1.stl   <- deine Datei (exakt dieser Name)
└── README.md
```

## Lokal testen

**Windows am einfachsten:** Doppelklick auf `START.bat` (benötigt Python). Die Seite öffnet sich automatisch unter `http://localhost:8000`.

Browser blockieren Module und Dateizugriffe über `file://`. Starte deshalb einen lokalen Server im Projektordner:

- **Python:** `python -m http.server 8000` und dann `http://localhost:8000` öffnen
- **VS Code:** Erweiterung „Live Server“ → Rechtsklick auf `index.html` → „Open with Live Server“

Alternativ: Seite öffnen und die STL über „STL-Datei laden“ auswählen (oder per Drag-and-drop).

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf github.com anlegen (z. B. `aero-x1-premium`, öffentlich).
2. Alle Dateien inkl. Ordner `models/` hochladen („Add file“ → „Upload files“) und committen.
3. `Settings` → `Pages` → Branch `main`, Ordner `/ (root)` → `Save`.
4. Nach 1–2 Minuten erreichbar unter `https://DEIN-NAME.github.io/aero-x1-premium/`.

## Tipps

- Dateiname ist auf GitHub Pages groß-/kleinschreibungsabhängig: `AERO-X1.stl`.
- Liegt das Modell schief, hilft der Button „Ausrichtung ändern“.
- Dateien über ca. 25 MB bitte nicht im Browser hochladen, sondern vorher in deinem 3D-Programm vereinfachen.
- Die Seite nennt bewusst keine Leistungswerte, da AERO X1 ein Konzeptprojekt ist.
