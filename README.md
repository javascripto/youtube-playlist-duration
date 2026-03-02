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
npm run build:options   # gera somente a UI de opções (React/Vite)
npm run build:popup     # gera somente a UI do popup (React/Vite)
npm run dev:options     # servidor de desenvolvimento da UI de opções
npm run dev:popup       # servidor de desenvolvimento da UI do popup
npm run package:chrome  # gera extension-chrome.zip
npm run package:firefox # gera extension-firefox.zip
```

Os scripts de automação são escritos em TypeScript e executados via `tsx`.

## Estrutura

- `src/background/index.ts`: service worker
- `src/content/index.ts`: content script
- `src/options-app/*`: UI compartilhada de configurações (React + Vite + TypeScript)
- `src/popup-app/*`: entrada React do popup (reusa UI de opções)
- `src/manifest.chrome.json`: manifest para Chrome
- `src/manifest.firefox.json`: manifest para Firefox

## Limitações conhecidas

- O cálculo considera no máximo os vídeos atualmente carregados na lista da playlist (limite prático de ~200 itens no YouTube). Acima disso, os itens não carregados pela interface não entram na soma.

## Texto-base para loja

- Descrição curta:
  - Exibe a duração total da playlist do YouTube diretamente no título.
- Descrição completa:
  - Esta extensão calcula a duração total dos vídeos visíveis na playlist e exibe o resultado no título da própria playlist.
  - A atualização é reativa: quando a lista muda, o total é recalculado automaticamente.
  - Limitação atual: o YouTube carrega apenas parte da lista no DOM (limite prático de ~200 itens). Vídeos não carregados não entram no cálculo.

## Carregar localmente

### Chrome

1. Acesse `chrome://extensions`.
2. Ative "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione `dist/chrome`.

### Firefox

1. Acesse `about:debugging#/runtime/this-firefox`.
2. Clique em "Load Temporary Add-on".
3. Selecione o arquivo `dist/firefox/manifest.json`.
