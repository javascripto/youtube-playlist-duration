(() => {
  if (!window.location.hostname.includes('youtube.com')) {
    return;
  }

  console.debug('[yt-playlist-duration] content script loaded');
})();
