import { getPlaylistDurationFromLabels } from '../core';
import { readPlaylistDom } from './dom';
import {
  loadTitleDisplayMode,
  subscribeToTitleDisplayModeChanges,
} from './storage';
import { applyDurationToTitle } from './title-display';
import { debounce } from './utils/debounce';
import { DEFAULT_TITLE_DISPLAY_MODE, TitleDisplayMode } from '../shared/title-display-mode';

type PlaylistDurationController = {
  start: () => void;
  stop: () => void;
};

export function createPlaylistDurationController(): PlaylistDurationController {
  let domObserver: MutationObserver | null = null;
  let playlistObserver: MutationObserver | null = null;
  let observedPlaylistContainer: Element | null = null;
  let isStarted = false;
  let titleDisplayMode: TitleDisplayMode = DEFAULT_TITLE_DISPLAY_MODE;
  let unsubscribeFromStorage: (() => void) | null = null;

  const syncNow = () => {
    if (!isStarted) {
      return;
    }

    const domResult = readPlaylistDom();
    if (domResult.status !== 'ready') {
      return;
    }

    const playlistDuration = getPlaylistDurationFromLabels(
      domResult.data.durationLabels,
    ).toTimeString();

    applyDurationToTitle(
      domResult.data.titleElement,
      playlistDuration,
      titleDisplayMode,
    );

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

  const onYouTubeNavigateFinish = () => {
    debouncedSync();
  };

  const onPopState = () => {
    debouncedSync();
  };

  const start = () => {
    if (isStarted) {
      return;
    }

    isStarted = true;
    domObserver = new MutationObserver(() => {
      debouncedSync();
    });
    domObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('yt-navigate-finish', onYouTubeNavigateFinish);
    window.addEventListener('popstate', onPopState);
    unsubscribeFromStorage = subscribeToTitleDisplayModeChanges(mode => {
      titleDisplayMode = mode;
      debouncedSync();
    });
    void loadTitleDisplayMode().then(mode => {
      if (!isStarted) {
        return;
      }

      titleDisplayMode = mode;
      debouncedSync();
    });
    syncNow();
  };

  const stop = () => {
    if (!isStarted) {
      return;
    }

    isStarted = false;
    debouncedSync.cancel();

    domObserver?.disconnect();
    domObserver = null;
    playlistObserver?.disconnect();
    playlistObserver = null;
    observedPlaylistContainer = null;
    unsubscribeFromStorage?.();
    unsubscribeFromStorage = null;

    window.removeEventListener('yt-navigate-finish', onYouTubeNavigateFinish);
    window.removeEventListener('popstate', onPopState);
  };

  return {
    start,
    stop,
  };
}
