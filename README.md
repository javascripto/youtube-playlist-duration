# YouTube Playlist Duration (Base)

Base inicial para extensão WebExtension compatível com Chrome e Firefox.

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
npm install
```

## Scripts

```bash
npm run build           # gera dist/chrome e dist/firefox
npm run dev             # build em watch mode
npm run package:chrome  # gera extension-chrome.zip
npm run package:firefox # gera extension-firefox.zip
```

Os scripts de automação são escritos em TypeScript e executados via `tsx`.

## Estrutura

- `src/background/index.ts`: service worker
- `src/content/index.ts`: content script
- `src/popup/*`: UI do popup
- `src/options/index.html`: página de opções
- `src/manifest.chrome.json`: manifest para Chrome
- `src/manifest.firefox.json`: manifest para Firefox

## Carregar localmente

### Chrome

1. Acesse `chrome://extensions`.
2. Ative "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione `dist/chrome`.

### Firefox

1. Acesse `about:debugging#/runtime/this-firefox`.
2. Clique em "Load Temporary Add-on".
3. Selecione o arquivo `dist/firefox/manifest.json`.
