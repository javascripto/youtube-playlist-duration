# YouTube Playlist Duration

Extensão WebExtension compatível com Chrome e Firefox que calcula e exibe a duração total de playlists do YouTube.

## Idioma

- Read the English version: [README.md](./README.md)

## Requisitos

- Node.js 20+
- npm

## Instalação

```bash
npm install
```

## Scripts

```bash
npm run build            # gera dist/chrome e dist/firefox
npm run dev              # build em watch mode
npm run icons:generate   # gera PNGs de ícone a partir de src/icons/icon.svg
npm run build:options    # gera somente a UI de Opções (React/Vite)
npm run build:popup      # gera somente a UI do Popup (React/Vite)
npm run dev:options      # servidor de desenvolvimento da UI de Opções
npm run dev:popup        # servidor de desenvolvimento da UI do Popup
npm run package:chrome   # gera extension-chrome.zip
npm run package:firefox  # gera extension-firefox.zip
```

Os scripts de automação são escritos em TypeScript e executados com `tsx`.

## Estrutura do Projeto

- `src/background/index.ts`: script de background
- `src/content/index.ts`: content script
- `src/options-app/*`: UI compartilhada de configurações (React + Vite + TypeScript)
- `src/popup-app/*`: entrada React do popup (reusa UI de opções)
- `src/icons/icon.svg`: ícone fonte
- `.icons-dist/*`: PNGs de ícone gerados para os manifests
- `src/manifest.chrome.json`: manifest do Chrome
- `src/manifest.firefox.json`: manifest do Firefox

## Limitação Conhecida

- O total considera somente os vídeos atualmente carregados no DOM da playlist (limite prático de ~200 itens no YouTube). Itens não carregados pela interface não entram no cálculo.

## Texto-base para Loja

- Descrição curta:
  - Exibe a duração total da playlist do YouTube diretamente no título.
- Descrição completa:
  - Esta extensão calcula a duração total dos vídeos visíveis da playlist e exibe o resultado no título da playlist.
  - A atualização é reativa conforme a playlist muda.
  - Limitação atual: o YouTube carrega apenas parte da playlist no DOM (limite prático de ~200 itens), então vídeos não carregados não entram no cálculo.

## Carregar Localmente

### Chrome

1. Acesse `chrome://extensions`.
2. Ative o "Modo do desenvolvedor".
3. Clique em "Carregar sem compactação" e selecione `dist/chrome`.

### Firefox

1. Acesse `about:debugging#/runtime/this-firefox`.
2. Clique em "Load Temporary Add-on".
3. Selecione `dist/firefox/manifest.json`.
