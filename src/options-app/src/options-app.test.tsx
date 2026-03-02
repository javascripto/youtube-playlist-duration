// @vitest-environment jsdom
import { act } from 'react';
import type { ReactElement } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { vi } from 'vitest';
import { OptionsApp } from './options-app';
import { loadTitleDisplayMode, saveTitleDisplayMode } from './storage';

vi.mock('./storage', () => ({
  loadTitleDisplayMode: vi.fn().mockResolvedValue('prefix'),
  saveTitleDisplayMode: vi.fn().mockResolvedValue(undefined),
}));

describe('OptionsApp', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
    vi.mocked(loadTitleDisplayMode).mockResolvedValue('prefix');
    vi.mocked(saveTitleDisplayMode).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  test('loads saved mode and marks suffix radio when stored as suffix', async () => {
    vi.mocked(loadTitleDisplayMode).mockResolvedValue('suffix');

    await render(<OptionsApp />);

    const suffixRadio = queryInput('suffix');
    expect(suffixRadio.checked).toBe(true);
  });

  test('saves selected mode and shows success message', async () => {
    await render(<OptionsApp />);

    const suffixRadio = queryInput('suffix');
    suffixRadio.click();

    const form = container.querySelector('form');
    if (!form) {
      throw new Error('form not found');
    }

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(saveTitleDisplayMode).toHaveBeenCalledWith('suffix');
    expect(container.textContent).toContain('Options saved.');
  });

  test('shows load error message when load fails', async () => {
    vi.mocked(loadTitleDisplayMode).mockRejectedValue(new Error('load failed'));

    await render(<OptionsApp />);

    expect(container.textContent).toContain('Could not load saved options.');
  });

  test('shows save error message when save fails', async () => {
    vi.mocked(saveTitleDisplayMode).mockRejectedValue(new Error('save failed'));

    await render(<OptionsApp />);

    const form = container.querySelector('form');
    if (!form) {
      throw new Error('form not found');
    }

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Could not save options.');
  });

  test('renders popup variant title and class', async () => {
    await render(<OptionsApp variant="popup" />);

    const main = container.querySelector('main');
    if (!main) {
      throw new Error('main not found');
    }

    expect(main.className).toContain('layout--popup');
    expect(container.textContent).toContain('Display Mode');
  });

  test('switching back to prefix clears status message', async () => {
    vi.mocked(loadTitleDisplayMode).mockResolvedValue('suffix');
    vi.mocked(saveTitleDisplayMode).mockRejectedValue(new Error('save failed'));

    await render(<OptionsApp />);

    const form = container.querySelector('form');
    if (!form) {
      throw new Error('form not found');
    }

    await act(async () => {
      form.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Could not save options.');

    const prefixRadio = queryInput('prefix');
    await act(async () => {
      prefixRadio.click();
      await Promise.resolve();
    });

    expect(prefixRadio.checked).toBe(true);
    expect(container.textContent).not.toContain('Could not save options.');
  });

  async function render(element: ReactElement): Promise<void> {
    await act(async () => {
      root.render(element);
      await Promise.resolve();
    });
  }

  function queryInput(value: 'prefix' | 'suffix'): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>(
      `input[name=\"display-mode\"][value=\"${value}\"]`,
    );
    if (!input) {
      throw new Error(`input ${value} not found`);
    }

    return input;
  }
});
