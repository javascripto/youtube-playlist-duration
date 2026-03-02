export const PLAYLIST_CONTAINER_SELECTORS = [
  '#secondary-inner #playlist #container #items.playlist-items',
  '#secondary #playlist #container #items.playlist-items',
] as const;

export const PLAYLIST_TITLE_SELECTORS = [
  '#header-contents h3 a',
  'ytd-playlist-header-renderer h1 yt-formatted-string',
] as const;

export const TIME_DISPLAY_SELECTORS = [
  'span.style-scope.ytd-thumbnail-overlay-time-status-renderer',
] as const;
