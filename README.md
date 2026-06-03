# Adeptus Titanicus — Weapon Card Generator

A static, no-build web app for generating customisable Adeptus Titanicus weapon
cards. Runs entirely in the browser — no server, no account, works offline.

> Fan-made tool. Upload only artwork you have the rights to use. The app ships
> with original placeholder artwork; any image you add stays on your device.

## Run it locally

No build step or Node required. Serve the folder with any static server:

```sh
python3 -m http.server 8766
# then open http://localhost:8766
```

(Opening `index.html` directly via `file://` won't work because ES modules
require `http(s)://`.)

## How it works

- **Data-driven cards.** `src/data/weapons.js` holds the default weapon dataset
  plus the field schema. User edits/additions layer on top via `src/state.js`
  (localStorage) and never mutate the defaults.
- **Per-state artwork.** Every weapon has an *active* (blue) and *disabled*
  (red) side. The Artwork panel lets you upload one image per side; uploads are
  stored locally in **IndexedDB** (`src/art.js`) and resolve in the order
  *your upload → bundled fallback SVG* (`art/card-blue.svg`, `art/card-red.svg`).
  Nothing is ever uploaded to a server, so the distributed app contains no
  third-party artwork.
- **Rendering.** `src/cards.js` builds the card markup; backgrounds are driven
  by CSS variables (`--art-active` / `--art-disabled`) so swapping art never
  touches the card layout.

## Project layout

```
index.html          app shell + artwork panel
src/styles.css      all styles (card design + UI)
src/main.js         wiring: render, titan filter, artwork upload
src/data/weapons.js default weapon data + schema
src/state.js        user edits (localStorage)
src/art.js          per-state artwork: IndexedDB + fallback resolver
src/cards.js        card renderers + print-imposition helpers
art/                original fallback SVG backgrounds
```

## Roadmap

- [ ] Data editor (add/edit/remove weapons) — port from the v6 prototype.
- [ ] Client-side **PDF export** (SVG cards → vector PDF, embedded font,
      45×65 mm trim, 4×4 imposition with double-sided mirroring, crop marks).
- [ ] Import/export a card set as JSON (shareable).
- [ ] Additional card types beyond weapons.
