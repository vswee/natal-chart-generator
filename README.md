# Natal Chart Browser by Flat18

Browser-based natal chart calculator with a polished, mobile-friendly UI. It uses Swiss Ephemeris for chart calculations, supports relationship comparison, and generates share/export assets entirely in the browser.

## Live Demo

- [natal-chart.flat18.app](https://natal-chart.flat18.app/)

## Features

- Birth form with address lookup, manual coordinates, and time zone override
- Natal chart calculation in the browser
- Simplified chart, placements, aspects, interpretation panels, and daily horoscope rail
- Relationship compare and composite chart tools
- Share image, GIF, reel, and PDF export
- Local profile storage for saved birth data and recent share media
- Lazy-loaded ephemeris engine so the landing page stays lighter until the user submits birth data

## How It Works

- Chart calculations run client-side after the user submits birth data.
- Swiss Ephemeris is loaded on demand through `swisseph-wasm`.
- Geocoding uses Nominatim / OpenStreetMap when a birthplace or address needs coordinates.
- Most app state stays on the device in local storage.

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview the Production Build

```bash
npm run preview
```

## Deployment

The production site is deployed with Cloudflare Pages from the `vswee/natal-chart-generator` GitHub repository.

- Cloudflare Pages project: `natal-chart-generator`
- Production branch: `master`
- Build command: `npm run build`
- Build output directory: `dist`
- Production domain: [natal-chart.flat18.app](https://natal-chart.flat18.app/)

Cloudflare Pages automatically builds and deploys commits pushed to `master`:

```bash
git push origin master
```

For a manual direct upload, build locally and deploy the output directory with Wrangler:

```bash
npm run build
npx wrangler pages deploy dist --project-name natal-chart-generator --branch master
```

Wrangler must be authenticated to the Cloudflare account with Pages write access. It can use a saved `wrangler login` session or the `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` environment variables. Keep API tokens out of the repository. Check the deployment in Cloudflare Pages or list recent deployments with:

```bash
npx wrangler pages deployment list --project-name natal-chart-generator
```

## Tech Stack

- Vue 3
- Vite
- Swiss Ephemeris via `swisseph-wasm`
- `html2canvas`
- `jspdf`
- `@tabler/icons-vue`

## Privacy Notes

- Birth data can be saved locally in the browser if you use the profile feature.
- The only third-party lookup in the core flow is address geocoding.
- Chart calculations do not require a backend.

## Social Assets

- The OG image, square social image, favicon set, and manifest are generated from the raster source art in `public/social/_sources/`.
- The generator script lives at `scripts/generate-social-assets.py` and composes the final PNG and ICO assets from those raster inputs.
- Run it with `python3 scripts/generate-social-assets.py` in a Python environment that has Pillow installed.

## Repository Status

This is a public repository that tracks the production app. If you find a bug, open an issue or send a pull request.

## License

Licensed under [GPL-3.0-or-later](./LICENSE).

Swiss Ephemeris is dual-licensed (GPL/commercial). This project uses the GPL route through `swisseph-wasm`.
