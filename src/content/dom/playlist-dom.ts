import {
  PLAYLIST_CONTAINER_SELECTORS,
  PLAYLIST_TITLE_SELECTORS,
  TIME_DISPLAY_SELECTORS,
} from './selectors';
import type { PlaylistDomReadResult } from './types';

export function findPlaylistContainer(root: ParentNode = document): Element | null {
  return queryFirst(root, PLAYLIST_CONTAINER_SELECTORS);
}

export function findPlaylistTitleElement(
  root: ParentNode = document,
): HTMLElement | null {
  const element = queryFirst(root, PLAYLIST_TITLE_SELECTORS);
  if (!element || !(element instanceof HTMLElement)) {
    return null;
  }

  return element;
}

export function getPlaylistDurationLabels(
  playlistContainer: ParentNode,
): string[] {
  return TIME_DISPLAY_SELECTORS.flatMap(selector =>
    Array.from(playlistContainer.querySelectorAll(selector)),
  )
    .map(element => element.textContent?.trim() ?? '')
    .filter(Boolean);
}

export function readPlaylistDom(root: ParentNode = document): PlaylistDomReadResult {
  const playlistContainer = findPlaylistContainer(root);
  if (!playlistContainer) {
    return { status: 'not-ready', reason: 'playlist-container-not-found' };
  }

  const titleElement = findPlaylistTitleElement(root);
  if (!titleElement) {
    return { status: 'not-ready', reason: 'playlist-title-not-found' };
  }

  const durationLabels = getPlaylistDurationLabels(playlistContainer);
  if (durationLabels.length === 0) {
    return { status: 'not-ready', reason: 'playlist-time-labels-not-found' };
  }

  return {
    status: 'ready',
    data: {
      playlistContainer,
      titleElement,
      durationLabels,
    },
  };
}

function queryFirst(
  root: ParentNode,
  selectors: readonly string[],
): Element | null {
  for (const selector of selectors) {
    const element = root.querySelector(selector);
    if (element) {
      return element;
    }
  }

  return null;
}
