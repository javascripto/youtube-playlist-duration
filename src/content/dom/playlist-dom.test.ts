// @vitest-environment jsdom

import {
  getPlaylistDurationLabels,
  readPlaylistDom,
} from './playlist-dom';

describe('readPlaylistDom', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('returns not-ready when playlist container is missing', () => {
    document.body.innerHTML = '<div id="header-contents"><h3><a>Playlist</a></h3></div>';

    expect(readPlaylistDom()).toEqual({
      status: 'not-ready',
      reason: 'playlist-container-not-found',
    });
  });

  test('returns not-ready when title element is missing', () => {
    document.body.innerHTML = [
      '<div id="secondary-inner">',
      '  <div id="playlist">',
      '    <div id="container">',
      '      <div id="items" class="playlist-items"></div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    expect(readPlaylistDom()).toEqual({
      status: 'not-ready',
      reason: 'playlist-title-not-found',
    });
  });

  test('returns not-ready when duration labels are missing', () => {
    document.body.innerHTML = [
      '<div id="header-contents"><h3><a>Playlist</a></h3></div>',
      '<div id="secondary-inner">',
      '  <div id="playlist">',
      '    <div id="container">',
      '      <div id="items" class="playlist-items"></div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    expect(readPlaylistDom()).toEqual({
      status: 'not-ready',
      reason: 'playlist-time-labels-not-found',
    });
  });

  test('returns ready with duration labels when DOM matches primary selectors', () => {
    document.body.innerHTML = [
      '<div id="header-contents"><h3><a>Playlist</a></h3></div>',
      '<div id="secondary-inner">',
      '  <div id="playlist">',
      '    <div id="container">',
      '      <div id="items" class="playlist-items">',
      '        <span class="style-scope ytd-thumbnail-overlay-time-status-renderer"> 10:00 </span>',
      '        <span class="style-scope ytd-thumbnail-overlay-time-status-renderer">01:30</span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    const result = readPlaylistDom();

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }

    expect(result.data.durationLabels).toEqual(['10:00', '01:30']);
  });

  test('supports fallback selectors for container and title', () => {
    document.body.innerHTML = [
      '<ytd-playlist-header-renderer><h1><yt-formatted-string>My Playlist</yt-formatted-string></h1></ytd-playlist-header-renderer>',
      '<div id="secondary">',
      '  <div id="playlist">',
      '    <div id="container">',
      '      <div id="items" class="playlist-items">',
      '        <span class="style-scope ytd-thumbnail-overlay-time-status-renderer">02:00</span>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('');

    const result = readPlaylistDom();

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }

    expect(result.data.durationLabels).toEqual(['02:00']);
    expect(result.data.titleElement.textContent).toBe('My Playlist');
  });
});

describe('getPlaylistDurationLabels', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('extracts and trims labels from playlist container', () => {
    document.body.innerHTML = [
      '<div id="root">',
      '  <span class="style-scope ytd-thumbnail-overlay-time-status-renderer"> 03:10 </span>',
      '  <span class="style-scope ytd-thumbnail-overlay-time-status-renderer">00:45</span>',
      '  <span class="style-scope ytd-thumbnail-overlay-time-status-renderer"> </span>',
      '</div>',
    ].join('');

    const container = document.querySelector('#root');
    if (!container) {
      throw new Error('container not found');
    }

    expect(getPlaylistDurationLabels(container)).toEqual(['03:10', '00:45']);
  });
});
