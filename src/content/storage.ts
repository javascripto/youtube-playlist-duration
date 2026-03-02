import {
  DEFAULT_TITLE_DISPLAY_MODE,
  isTitleDisplayMode,
  TITLE_DISPLAY_MODE_KEY,
  TitleDisplayMode,
} from '../shared/title-display-mode';

type ExtensionStorageApi = {
  storage?: {
    sync?: {
      get: (key: string) => Promise<Record<string, unknown>>;
    };
    onChanged?: {
      addListener: (listener: StorageChangedListener) => void;
      removeListener: (listener: StorageChangedListener) => void;
    };
  };
};

type StorageChange = {
  oldValue?: unknown;
  newValue?: unknown;
};

type StorageChanges = Record<string, StorageChange>;
type StorageChangedListener = (changes: StorageChanges, areaName: string) => void;

type Listener = (mode: TitleDisplayMode) => void;

export async function loadTitleDisplayMode(): Promise<TitleDisplayMode> {
  const extensionApi = getExtensionApi();
  if (!extensionApi?.storage?.sync) {
    return DEFAULT_TITLE_DISPLAY_MODE;
  }

  const result = await extensionApi.storage.sync.get(TITLE_DISPLAY_MODE_KEY);
  const rawValue = result[TITLE_DISPLAY_MODE_KEY];
  if (isTitleDisplayMode(rawValue)) {
    return rawValue;
  }

  return DEFAULT_TITLE_DISPLAY_MODE;
}

export function subscribeToTitleDisplayModeChanges(listener: Listener): () => void {
  const extensionApi = getExtensionApi();
  if (!extensionApi?.storage?.onChanged) {
    return () => {};
  }

  const onChanged: StorageChangedListener = (changes, areaName) => {
    if (areaName !== 'sync') {
      return;
    }

    const changed = changes[TITLE_DISPLAY_MODE_KEY];
    if (!changed) {
      return;
    }

    if (isTitleDisplayMode(changed.newValue)) {
      listener(changed.newValue);
      return;
    }

    listener(DEFAULT_TITLE_DISPLAY_MODE);
  };

  extensionApi.storage.onChanged.addListener(onChanged);
  return () => extensionApi.storage?.onChanged?.removeListener(onChanged);
}

function getExtensionApi(): ExtensionStorageApi | undefined {
  return (globalThis as { chrome?: ExtensionStorageApi }).chrome;
}
