# Natal Chart App

Minimal Vue 3 + Vite scaffold in vanilla JavaScript and custom CSS.

## Included
- Browser-based address lookup
- Clean form UI
- Placeholder natal chart calculation layer
- Reusable interpretation blocks
- Summary gauges
- Placements and aspect views

## Run
```bash
npm install
npm run dev
```

## Important
The astrology engine now uses Swiss Ephemeris via `swisseph-wasm`, including:
- UTC conversion (time zone inferred from coordinates)
- planetary positions
- ascendant and MC
- house systems
- retrograde state
- aspects based on calculated longitudes

## Licensing (GPL Open Source Route)
This project follows the free open-source route:
- Licensed under **GPL-3.0-or-later**
- The entire project must remain GPL compatible and open source
- No additional Swiss Ephemeris commercial licensing fees are required

Swiss Ephemeris itself is dual-licensed (GPL/commercial). This setup aligns with the GPL option.
