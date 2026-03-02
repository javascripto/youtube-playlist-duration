import { vi } from 'vitest';
import { loadTitleDisplayMode, saveTitleDisplayMode } from './storage';

describe('options-app storage', () => {
  afterEach(() => {
    // biome-ignore lint/performance/noDelete:
    delete (globalThis as { chrome?: unknown }).chrome;
  });

  test('returns default mode when extension api is unavailable', async () => {
    await expect(loadTitleDisplayMode()).resolves.toBe('prefix');
  });

  test('returns stored mode when value is valid', async () => {
    const get = vi.fn().mockResolvedValue({ titleDisplayMode: 'suffix' });
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        sync: { get },
      },
    };

    await expect(loadTitleDisplayMode()).resolves.toBe('suffix');
    expect(get).toHaveBeenCalledWith('titleDisplayMode');
  });

  test('falls back to default when stored value is invalid', async () => {
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ titleDisplayMode: 'unknown' }),
        },
      },
    };

    await expect(loadTitleDisplayMode()).resolves.toBe('prefix');
  });

  test('saveTitleDisplayMode persists value when api is available', async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        sync: { set },
      },
    };

    await saveTitleDisplayMode('suffix');
    expect(set).toHaveBeenCalledWith({ titleDisplayMode: 'suffix' });
  });

  test('saveTitleDisplayMode is noop when api is unavailable', async () => {
    await expect(saveTitleDisplayMode('prefix')).resolves.toBeUndefined();
  });
});
