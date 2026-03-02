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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
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
    expect(titleElement.textContent).toBe('[11:30] Original');
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

  test('recalculates on document mutations via MutationObserver + debounce', async () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Original';
    const playlistContainer = document.createElement('div');
    document.body.appendChild(playlistContainer);

    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['10:00'],
      },
    });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '10:00',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createPlaylistDurationController();
    controller.start();

    vi.clearAllMocks();
    document.body.appendChild(document.createElement('div'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith(['10:00']);
  });

  test('recalculates when playlist container mutates', async () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Original';
    const playlistContainer = document.createElement('div');
    document.body.appendChild(playlistContainer);

    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['01:30'],
      },
    });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '01:30',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createPlaylistDurationController();
    controller.start();

    vi.clearAllMocks();
    playlistContainer.appendChild(document.createElement('span'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith(['01:30']);
  });

  test('recalculates on yt-navigate-finish event', async () => {
    const titleElement = document.createElement('a');
    const playlistContainer = document.createElement('div');

    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['03:00'],
      },
    });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '03:00',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createPlaylistDurationController();
    controller.start();

    vi.clearAllMocks();
    window.dispatchEvent(new Event('yt-navigate-finish'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith(['03:00']);
  });

  test('recalculates on popstate event', async () => {
    const titleElement = document.createElement('a');
    const playlistContainer = document.createElement('div');

    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['05:00'],
      },
    });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '05:00',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createPlaylistDurationController();
    controller.start();

    vi.clearAllMocks();
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith(['05:00']);
  });
});

async function flushDebouncedUpdate(): Promise<void> {
  await Promise.resolve();
  await vi.advanceTimersByTimeAsync(200);
  await Promise.resolve();
}
