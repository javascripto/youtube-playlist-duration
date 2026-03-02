// @vitest-environment jsdom
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  isYouTubeHost: vi.fn(),
  createPlaylistDurationController: vi.fn(),
  start: vi.fn(),
}));

vi.mock('./host', () => ({
  isYouTubeHost: mocks.isYouTubeHost,
}));

vi.mock('./playlist-duration-controller', () => ({
  createPlaylistDurationController: mocks.createPlaylistDurationController,
}));

describe('content/index bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.createPlaylistDurationController.mockReturnValue({
      start: mocks.start,
      stop: vi.fn(),
    });
  });

  test('does not start controller when host is not youtube', async () => {
    mocks.isYouTubeHost.mockReturnValue(false);

    await import('./index');

    expect(mocks.createPlaylistDurationController).not.toHaveBeenCalled();
    expect(mocks.start).not.toHaveBeenCalled();
  });

  test('starts controller when host is youtube', async () => {
    mocks.isYouTubeHost.mockReturnValue(true);

    await import('./index');

    expect(mocks.createPlaylistDurationController).toHaveBeenCalledTimes(1);
    expect(mocks.start).toHaveBeenCalledTimes(1);
  });
});
