export const TITLE_DISPLAY_MODE_KEY = 'titleDisplayMode';

export type TitleDisplayMode = 'prefix' | 'suffix';

export const DEFAULT_TITLE_DISPLAY_MODE: TitleDisplayMode = 'prefix';

export function isTitleDisplayMode(value: unknown): value is TitleDisplayMode {
  return value === 'prefix' || value === 'suffix';
}
