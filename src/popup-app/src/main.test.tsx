// @vitest-environment jsdom
import { vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createRoot: vi.fn(),
  render: vi.fn(),
}));

vi.mock('react-dom/client', () => ({
  createRoot: mocks.createRoot,
}));

describe('popup-app main bootstrap', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.resetModules();
    vi.clearAllMocks();
    mocks.createRoot.mockReturnValue({ render: mocks.render });
  });

  test('creates root and renders popup app when root element exists', async () => {
    await import('./main');

    expect(mocks.createRoot).toHaveBeenCalledTimes(1);
    expect(mocks.render).toHaveBeenCalledTimes(1);
  });

  test('throws when root element is missing', async () => {
    document.body.innerHTML = '';

    await expect(import('./main')).rejects.toThrow(/Root element not found/);
  });
});
