import {
  DEFAULT_TITLE_DISPLAY_MODE,
  isTitleDisplayMode,
  TITLE_DISPLAY_MODE_KEY,
  TitleDisplayMode,
} from '../../shared/title-display-mode';

export async function loadTitleDisplayMode(): Promise<TitleDisplayMode> {
  if (typeof chrome === 'undefined' || !chrome.storage?.sync) {
    return DEFAULT_TITLE_DISPLAY_MODE;
  }

  const result = await chrome.storage.sync.get(TITLE_DISPLAY_MODE_KEY);
  const rawValue = result[TITLE_DISPLAY_MODE_KEY];

  if (isTitleDisplayMode(rawValue)) {
    return rawValue;
  }

  return DEFAULT_TITLE_DISPLAY_MODE;
}

export async function saveTitleDisplayMode(
  mode: TitleDisplayMode,
): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.sync) {
    return;
  }

  await chrome.storage.sync.set({ [TITLE_DISPLAY_MODE_KEY]: mode });
}
