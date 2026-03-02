// @vitest-environment jsdom
import { vi } from 'vitest';
import { getPlaylistDurationFromLabels } from '../core';
import { readPlaylistDom } from './dom';
import { createPlaylistDurationController } from './playlist-duration-controller';
import {
  loadTitleDisplayMode,
  subscribeToTitleDisplayModeChanges,
} from './storage';

vi.mock('../core', () => ({
  getPlaylistDurationFromLabels: vi.fn(),
}));

vi.mock('./dom', () => ({
  readPlaylistDom: vi.fn(),
}));

vi.mock('./storage', () => ({
  loadTitleDisplayMode: vi.fn().mockResolvedValue('prefix'),
  subscribeToTitleDisplayModeChanges: vi.fn().mockReturnValue(() => {}),
}));

describe('createPlaylistDurationController', () => {
  const controllers: ReturnType<typeof createPlaylistDurationController>[] = [];
  let storageChangeListener: ((mode: 'prefix' | 'suffix') => void) | null =
    null;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
    storageChangeListener = null;
    vi.mocked(loadTitleDisplayMode).mockResolvedValue('prefix');
    vi.mocked(subscribeToTitleDisplayModeChanges).mockImplementation(
      listener => {
        storageChangeListener = listener as (mode: 'prefix' | 'suffix') => void;
        return () => {};
      },
    );
  });

  afterEach(() => {
    for (const controller of controllers) {
      controller.stop();
    }
    controllers.length = 0;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  function createController() {
    const controller = createPlaylistDurationController();
    controllers.push(controller);
    return controller;
  }

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

    const controller = createController();
    controller.start();

    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith([
      '10:00',
      '01:30',
    ]);
    expect(titleElement.textContent).toBe('[11:30] Original');
  });

  test('uses saved suffix mode from storage', async () => {
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

    vi.mocked(loadTitleDisplayMode).mockResolvedValue('suffix');

    const controller = createController();
    controller.start();
    await flushDebouncedUpdate();

    expect(titleElement.textContent).toBe('Original [11:30]');
  });

  test('does not update title when DOM is not ready', () => {
    vi.mocked(readPlaylistDom).mockReturnValue({
      status: 'not-ready',
      reason: 'playlist-container-not-found',
    });

    const controller = createController();
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

    const controller = createController();
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

    const controller = createController();
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

    const controller = createController();
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

    const controller = createController();
    controller.start();

    vi.clearAllMocks();
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).toHaveBeenCalledWith(['05:00']);
  });

  test('stops reacting to events and mutations after stop()', async () => {
    const titleElement = document.createElement('a');
    const playlistContainer = document.createElement('div');
    document.body.appendChild(playlistContainer);

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

    const controller = createController();
    controller.start();
    controller.stop();

    vi.clearAllMocks();
    window.dispatchEvent(new Event('yt-navigate-finish'));
    window.dispatchEvent(new PopStateEvent('popstate'));
    document.body.appendChild(document.createElement('div'));
    playlistContainer.appendChild(document.createElement('span'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).not.toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).not.toHaveBeenCalled();
  });

  test('subscribes to storage changes and unsubscribes on stop()', () => {
    const unsubscribe = vi.fn();
    vi.mocked(subscribeToTitleDisplayModeChanges).mockReturnValue(unsubscribe);

    const controller = createController();
    controller.start();
    controller.stop();

    expect(subscribeToTitleDisplayModeChanges).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  test('does not register listeners twice when start is called twice', () => {
    const controller = createController();
    controller.start();
    controller.start();

    expect(subscribeToTitleDisplayModeChanges).toHaveBeenCalledTimes(1);
  });

  test('re-renders title when display mode changes from storage', async () => {
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

    const controller = createController();
    controller.start();
    await flushDebouncedUpdate();

    expect(titleElement.textContent).toBe('[11:30] Original');
    if (!storageChangeListener) {
      throw new Error('storage listener not registered');
    }

    storageChangeListener('suffix');
    await flushDebouncedUpdate();

    expect(titleElement.textContent).toBe('Original [11:30]');
  });

  test('ignores async loaded mode after stop', async () => {
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

    let resolveMode: ((mode: 'prefix' | 'suffix') => void) | null = null;
    vi.mocked(loadTitleDisplayMode).mockImplementation(
      () =>
        new Promise<'prefix' | 'suffix'>(resolve => {
          resolveMode = resolve;
        }),
    );

    const controller = createController();
    controller.start();
    controller.stop();

    vi.clearAllMocks();
    if (!resolveMode) {
      throw new Error('loadTitleDisplayMode resolver not set');
    }
    const resolve = resolveMode as (mode: 'prefix' | 'suffix') => void;
    resolve('suffix');
    await flushDebouncedUpdate();

    expect(readPlaylistDom).not.toHaveBeenCalled();
    expect(getPlaylistDurationFromLabels).not.toHaveBeenCalled();
  });

  test('rebinds playlist observer when playlist container instance changes', async () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Original';
    const firstContainer = document.createElement('div');
    const secondContainer = document.createElement('div');

    vi.mocked(readPlaylistDom)
      .mockReturnValueOnce({
        status: 'ready',
        data: {
          playlistContainer: firstContainer,
          titleElement,
          durationLabels: ['10:00'],
        },
      })
      .mockReturnValue({
        status: 'ready',
        data: {
          playlistContainer: secondContainer,
          titleElement,
          durationLabels: ['10:00'],
        },
      });

    vi.mocked(getPlaylistDurationFromLabels).mockReturnValue({
      toTimeString: () => '10:00',
    } as ReturnType<typeof getPlaylistDurationFromLabels>);

    const controller = createController();
    controller.start();

    firstContainer.appendChild(document.createElement('span'));
    await flushDebouncedUpdate();

    expect(readPlaylistDom).toHaveBeenCalled();
  });
});

async function flushDebouncedUpdate(): Promise<void> {
  await Promise.resolve();
  await vi.advanceTimersByTimeAsync(200);
  await Promise.resolve();
}
