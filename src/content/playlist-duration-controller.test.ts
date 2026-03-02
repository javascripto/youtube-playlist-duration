// @vitest-environment jsdom
import { vi } from 'vitest';
import { getPlaylistDurationFromLabels } from '../core';
import { readPlaylistDom } from './dom';
import { createPlaylistDurationController } from './playlist-duration-controller';

vi.mock('../core', () => ({
  getPlaylistDurationFromLabels: vi.fn(),
}));

vi.mock('./dom', () => ({
  readPlaylistDom: vi.fn(),
}));

describe('createPlaylistDurationController', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('updates playlist title on start when DOM is ready', () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Original';
    const playlistContainer = document.createElement('div');

    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['10:00', '01:30'],
      },
    });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '11:30',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createPlaylistDurationController();
    controller.start();

    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith([
      '10:00',
      '01:30',
    ]);
    expect(titleElement.textContent).toBe('11:30');
  });

  test('does not update title when DOM is not ready', () => {
    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'not-ready',
      reason: 'playlist-container-not-found',
    });

    const controller = createPlaylistDurationController();
    controller.start();

    expect(getPlaylistDurationFromLabels).not.toHaveBeenCalled();
  });
});
