import {
  DEFAULT_TITLE_DISPLAY_MODE,
  TITLE_DISPLAY_MODE_KEY,
  isTitleDisplayMode,
} from './title-display-mode';

describe('title-display-mode shared module', () => {
  test('exposes stable storage key', () => {
    expect(TITLE_DISPLAY_MODE_KEY).toBeDefined();
  });

  test('exposes default display mode', () => {
    expect(DEFAULT_TITLE_DISPLAY_MODE).toBeDefined();
  });

  test('validates allowed display modes', () => {
    expect(isTitleDisplayMode('prefix')).toBe(true);
    expect(isTitleDisplayMode('suffix')).toBe(true);
  });

  test('rejects invalid display modes', () => {
    expect(isTitleDisplayMode('')).toBe(false);
    expect(isTitleDisplayMode('PREFIX')).toBe(false);
    expect(isTitleDisplayMode('middle')).toBe(false);
    expect(isTitleDisplayMode(null)).toBe(false);
    expect(isTitleDisplayMode(undefined)).toBe(false);
  });
});
