// @vitest-environment jsdom
import { vi } from 'vitest';

let triggerSyncNow: (() => void) | null = null;
const mocks = vi.hoisted(() => ({
  readPlaylistDom: vi.fn(),
  getPlaylistDurationFromLabels: vi.fn(),
  subscribeToChanges: vi.fn(),
  loadTitleDisplayMode: vi.fn(),
}));

vi.mock('./utils/debounce', () => ({
  debounce: (fn: () => void) => {
    triggerSyncNow = fn;
    const debounced = (() => {
      fn();
    }) as (() => void) & { cancel: () => void };
    debounced.cancel = vi.fn();
    return debounced;
  },
}));

vi.mock('./dom', () => ({
  readPlaylistDom: mocks.readPlaylistDom,
}));

vi.mock('../core', () => ({
  getPlaylistDurationFromLabels: mocks.getPlaylistDurationFromLabels,
}));

vi.mock('./storage', () => ({
  subscribeToTitleDisplayModeChanges: mocks.subscribeToChanges,
  loadTitleDisplayMode: mocks.loadTitleDisplayMode,
}));

import { createPlaylistDurationController } from './playlist-duration-controller';

describe('playlist-duration-controller sync guard', () => {
  beforeEach(() => {
    triggerSyncNow = null;
    mocks.readPlaylistDom.mockReset();
    mocks.getPlaylistDurationFromLabels.mockReset();
    mocks.subscribeToChanges.mockReset();
    mocks.loadTitleDisplayMode.mockReset();
    mocks.subscribeToChanges.mockReturnValue(() => {});
    mocks.loadTitleDisplayMode.mockResolvedValue('prefix');
  });

  test('returns early when sync runs after controller has stopped', () => {
    const titleElement = document.createElement('a');
    const playlistContainer = document.createElement('div');

    mocks.readPlaylistDom.mockReturnValue({
      status: 'ready',
      data: {
        playlistContainer,
        titleElement,
        durationLabels: ['10:00'],
      },
    });
    mocks.getPlaylistDurationFromLabels.mockReturnValue({
      toTimeString: () => '10:00',
    });

    const controller = createPlaylistDurationController();
    controller.start();
    controller.stop();

    mocks.readPlaylistDom.mockClear();
    if (!triggerSyncNow) {
      throw new Error('sync function was not captured');
    }

    triggerSyncNow();

    expect(mocks.readPlaylistDom).not.toHaveBeenCalled();
  });
});
