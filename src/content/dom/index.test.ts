import * as dom from './index';

describe('content/dom index re-exports', () => {
  test('re-exports DOM adapter functions', () => {
    expect(typeof dom.findPlaylistContainer).toBe('function');
    expect(typeof dom.findPlaylistTitleElement).toBe('function');
    expect(typeof dom.getPlaylistDurationLabels).toBe('function');
    expect(typeof dom.readPlaylistDom).toBe('function');
  });
});
