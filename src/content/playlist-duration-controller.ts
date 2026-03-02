import { getPlaylistDurationFromLabels } from '../core';
import { readPlaylistDom } from './dom';
import { applyDurationToTitle } from './title-display';
import { debounce } from './utils/debounce';

type PlaylistDurationController = {
  start: () => void;
};

export function createPlaylistDurationController(): PlaylistDurationController {
  let playlistObserver: MutationObserver | null = null;
  let observedPlaylistContainer: Element | null = null;

  const syncNow = () => {
    const domResult = readPlaylistDom();
    if (domResult.status !== 'ready') {
      return;
    }

    const playlistDuration = getPlaylistDurationFromLabels(
      domResult.data.durationLabels,
    ).toTimeString();

    applyDurationToTitle(domResult.data.titleElement, playlistDuration, 'prefix');

    if (observedPlaylistContainer === domResult.data.playlistContainer) {
      return;
    }

    observedPlaylistContainer = domResult.data.playlistContainer;
    playlistObserver?.disconnect();
    playlistObserver = new MutationObserver(() => {
      debouncedSync();
    });
    playlistObserver.observe(observedPlaylistContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  };

  const debouncedSync = debounce(syncNow, 150);

  const domObserver = new MutationObserver(() => {
    debouncedSync();
  });

  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('yt-navigate-finish', () => {
    debouncedSync();
  });

  window.addEventListener('popstate', () => {
    debouncedSync();
  });

  return {
    start: () => syncNow(),
  };
}
