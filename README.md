# Merkazim parents’ committees network

Russian/Hebrew website helping parents navigate Israel’s education system.

**Live review site:** https://merkazim-parents-feedback.kilyail.chatgpt.site/ru

## Run locally

Requires Node.js 22 or newer. No dependency installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173/ru. Edit files and refresh the browser.

```sh
npm run check
npm run build
```

`build` generates `dist/` with direct-entry pages for Russian and Hebrew routes. The output expects hosting at the domain root. `dev` is a local preview server, not a production server.

## Project layout

- `site/app.js` — routing, main pages, forms, RU/HE interface
- `site/features.js` — ecosystem map, coordinators, local chat and petition banner
- `site/directories.js` — glossary search and service directory
- `site/data/` — routes, petition, six ecosystem structures, coordinators, 85 services and a 44-page glossary search index
- `site/assets/` — website fonts, original PDFs and glossary page images
- `Content/*.html` — approved source material for ten parent guidance routes
- `scripts/preview.mjs` — local preview server
- `scripts/build.mjs` — portable static build
- `scripts/import_content.py` — optional Python 3 source import
- `DIRECTORY_SOURCES.md` — source URLs and OCR limitations
- `CONTRIBUTING.md` — collaboration workflow

Run `python3 scripts/import_content.py` to reimport the route sources while preserving the current petition. An optional `--petition /path/to/document.docx` imports an approved petition document. Routine website edits do not require importing again.

Original client briefs, design packages, internal planning and the separate `feedback-site/` publishing checkout stay local and are excluded from this public repository.

## Current behavior

Includes ten guidance routes, petition, feedback, city coordinators, education system map, searchable glossary with original PDF download, and searchable service directory. Glossary search indexes OCR text and displays the original page; some spellings may be missed by recognition.

The interface supports RU/HE and RTL. Detailed guidance and source documents remain in Russian where full Hebrew translations are not ready.

**Forms do not send or store data.** The signature counter is a labeled demonstration. Chat matches existing materials locally and does not call a generative AI service. The review site intentionally disables indexing.

Before a full launch: connect the hosting/backend, implement validated form storage and email notifications, real signature counting and duplicate prevention, complete translations, approve the privacy notice, and review contact information.

## Publishing and collaboration

The current live website uses Sites. Pushing to this GitHub repository does not automatically update it. `dist/` can be deployed to suitable static hosting; the eventual custom domain is `parents.svoimgolosom.co.il`.

Contributors can fork and submit pull requests. Direct write access requires the repository owner to add them as collaborators. See [CONTRIBUTING.md](CONTRIBUTING.md).

This repository has no open-source license. Supplied content, fonts and documents retain their respective rights.
