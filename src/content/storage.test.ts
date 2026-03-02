import { vi } from 'vitest';
import {
  loadTitleDisplayMode,
  subscribeToTitleDisplayModeChanges,
} from './storage';

type ChangedListener = (
  changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
  areaName: string,
) => void;

describe('content storage helpers', () => {
  afterEach(() => {
    // biome-ignore lint/performance/noDelete:
    delete (globalThis as { chrome?: unknown }).chrome;
  });

  test('loadTitleDisplayMode returns default when chrome api is unavailable', async () => {
    await expect(loadTitleDisplayMode()).resolves.toBe('prefix');
  });

  test('loadTitleDisplayMode returns stored mode when valid', async () => {
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ titleDisplayMode: 'suffix' }),
        },
      },
    };

    await expect(loadTitleDisplayMode()).resolves.toBe('suffix');
  });

  test('loadTitleDisplayMode falls back to default for invalid value', async () => {
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        sync: {
          get: vi.fn().mockResolvedValue({ titleDisplayMode: 'invalid' }),
        },
      },
    };

    await expect(loadTitleDisplayMode()).resolves.toBe('prefix');
  });

  test('subscribeToTitleDisplayModeChanges returns noop unsubscribe when onChanged is unavailable', () => {
    (globalThis as { chrome?: unknown }).chrome = {
      storage: {},
    };

    const unsubscribe = subscribeToTitleDisplayModeChanges(vi.fn());
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });

  test('subscribeToTitleDisplayModeChanges handles valid and invalid changes', () => {
    let registeredListener: ChangedListener | null = null;
    const addListener = vi.fn((listener: ChangedListener) => {
      registeredListener = listener;
    });
    const removeListener = vi.fn();
    const onModeChange = vi.fn();

    (globalThis as { chrome?: unknown }).chrome = {
      storage: {
        onChanged: {
          addListener,
          removeListener,
        },
      },
    };

    const unsubscribe = subscribeToTitleDisplayModeChanges(onModeChange);

    expect(addListener).toHaveBeenCalledTimes(1);
    if (!registeredListener) {
      throw new Error('Listener not registered');
    }
    const listener = registeredListener as ChangedListener;
    listener({ titleDisplayMode: { newValue: 'suffix' } }, 'sync');
    listener({ titleDisplayMode: { newValue: 'invalid' } }, 'sync');
    listener({ anotherKey: { newValue: 'suffix' } }, 'sync');
    listener({ titleDisplayMode: { newValue: 'suffix' } }, 'local');

    expect(onModeChange).toHaveBeenCalledTimes(2);
    expect(onModeChange).toHaveBeenNthCalledWith(1, 'suffix');
    expect(onModeChange).toHaveBeenNthCalledWith(2, 'prefix');

    unsubscribe();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
