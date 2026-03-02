// @vitest-environment jsdom

import { applyDurationToTitle, formatTitleWithDuration } from './title-display';

describe('formatTitleWithDuration', () => {
  test('formats title as prefix by default', () => {
    expect(formatTitleWithDuration('Minha Playlist', '11:30')).toBe(
      '[11:30] Minha Playlist',
    );
  });

  test('formats title as suffix', () => {
    expect(formatTitleWithDuration('Minha Playlist', '11:30', 'suffix')).toBe(
      'Minha Playlist [11:30]',
    );
  });
});

describe('applyDurationToTitle', () => {
  test('preserves original title and updates rendered text', () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Minha Playlist';

    applyDurationToTitle(titleElement, '11:30');

    expect(titleElement.textContent).toBe('[11:30] Minha Playlist');
    expect(titleElement.getAttribute('data-ytpd-original-title')).toBe(
      'Minha Playlist',
    );
  });

  test('does not stack duration on subsequent updates', () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Minha Playlist';

    applyDurationToTitle(titleElement, '11:30');
    applyDurationToTitle(titleElement, '12:00');

    expect(titleElement.textContent).toBe('[12:00] Minha Playlist');
  });

  test('adopts externally changed title as new original', () => {
    const titleElement = document.createElement('a');
    titleElement.textContent = 'Minha Playlist';

    applyDurationToTitle(titleElement, '11:30');
    titleElement.textContent = 'Playlist Renomeada';
    applyDurationToTitle(titleElement, '12:00');

    expect(titleElement.textContent).toBe('[12:00] Playlist Renomeada');
    expect(titleElement.getAttribute('data-ytpd-original-title')).toBe(
      'Playlist Renomeada',
    );
  });
});
