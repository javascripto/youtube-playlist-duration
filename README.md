# YouTube Playlist Duration

Cross-browser WebExtension (Chrome + Firefox) that calculates and displays the total duration of YouTube playlists.

## Language

- Leia a versão em português: [README.pt-BR.md](./README.pt-BR.md)

## Requirements

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Scripts

```bash
npm run build            # builds dist/chrome and dist/firefox
npm run dev              # build in watch mode
npm run icons:generate   # generates icon PNGs from src/icons/icon.svg
npm run build:options    # builds Options UI only (React/Vite)
npm run build:popup      # builds Popup UI only (React/Vite)
npm run dev:options      # Options UI dev server
npm run dev:popup        # Popup UI dev server
npm run package:chrome   # creates extension-chrome.zip
npm run package:firefox  # creates extension-firefox.zip
```

Automation scripts are written in TypeScript and executed with `tsx`.

## Project Structure

- `src/background/index.ts`: background script
- `src/content/index.ts`: content script
- `src/options-app/*`: shared settings UI (React + Vite + TypeScript)
- `src/popup-app/*`: React popup entry (reuses options UI)
- `src/icons/icon.svg`: source icon
- `.icons-dist/*`: generated PNG icons for manifests
- `src/manifest.chrome.json`: Chrome manifest
- `src/manifest.firefox.json`: Firefox manifest

## Known Limitation

- The duration total only includes videos currently loaded in the playlist DOM (practical limit around ~200 items on YouTube). Items not loaded by the UI are not included.

## Store Copy (Base)

- Short description:
  - Shows the total YouTube playlist duration directly in the playlist title.
- Full description:
  - This extension calculates the total duration of visible playlist videos and displays it in the playlist title.
  - It updates reactively as the playlist content changes.
  - Current limitation: YouTube only loads part of the playlist into the DOM (practical limit around ~200 items), so unloaded videos are not included.

## Load Locally

### Chrome

1. Open `chrome://extensions`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select `dist/chrome`.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click "Load Temporary Add-on".
3. Select `dist/firefox/manifest.json`.
