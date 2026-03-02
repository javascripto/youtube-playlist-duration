import { isYouTubeHost } from './host';

describe('isYouTubeHost', () => {
  test('returns true for youtube.com and subdomains', () => {
    expect(isYouTubeHost('youtube.com')).toBe(true);
    expect(isYouTubeHost('www.youtube.com')).toBe(true);
    expect(isYouTubeHost('m.youtube.com')).toBe(true);
  });

  test('returns false for non-youtube hosts', () => {
    expect(isYouTubeHost('example.com')).toBe(false);
    expect(isYouTubeHost('notyoutube.com')).toBe(false);
  });
});
