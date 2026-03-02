import { vi } from 'vitest';

type InstalledListener = () => void;
type MessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response: unknown) => void,
) => void;

describe('background script', () => {
  let installedListener: InstalledListener | null = null;
  let messageListener: MessageListener | null = null;

  beforeEach(async () => {
    installedListener = null;
    messageListener = null;
    vi.resetModules();

    (globalThis as { chrome?: unknown }).chrome = {
      runtime: {
        onInstalled: {
          addListener: vi.fn((listener: InstalledListener) => {
            installedListener = listener;
          }),
        },
        onMessage: {
          addListener: vi.fn((listener: MessageListener) => {
            messageListener = listener;
          }),
        },
      },
    };

    // @ts-ignore
    await import('./index');
  });

  afterEach(() => {
    // biome-ignore lint/performance/noDelete:
    delete (globalThis as { chrome?: unknown }).chrome;
    vi.restoreAllMocks();
  });

  test('registers runtime listeners on module load', () => {
    expect(typeof installedListener).toBe('function');
    expect(typeof messageListener).toBe('function');
  });

  test('logs when onInstalled listener is triggered', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    if (!installedListener) {
      throw new Error('installed listener not registered');
    }

    installedListener();

    expect(logSpy).toHaveBeenCalledWith(
      'YouTube Playlist Duration extension installed',
    );
  });

  test('responds to PING messages', () => {
    if (!messageListener) {
      throw new Error('message listener not registered');
    }

    const sendResponse = vi.fn();
    messageListener({ type: 'PING' }, null, sendResponse);

    expect(sendResponse).toHaveBeenCalledWith({
      ok: true,
      source: 'background',
    });
  });

  test('ignores non-PING messages', () => {
    if (!messageListener) {
      throw new Error('message listener not registered');
    }

    const sendResponse = vi.fn();
    messageListener({ type: 'OTHER' }, null, sendResponse);

    expect(sendResponse).not.toHaveBeenCalled();
  });
});
