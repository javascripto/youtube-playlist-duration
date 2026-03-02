import { isYouTubeHost } from './host';
import { createPlaylistDurationController } from './playlist-duration-controller';

function main(): void {
  if (!isYouTubeHost(window.location.hostname)) {
    return;
  }

  const controller = createPlaylistDurationController();
  controller.start();
}

(() => {
  main();
})();
