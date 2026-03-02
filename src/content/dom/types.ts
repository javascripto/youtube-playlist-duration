export type PlaylistDomNotReadyReason =
  | 'playlist-container-not-found'
  | 'playlist-title-not-found'
  | 'playlist-time-labels-not-found';

export type PlaylistDomSnapshot = {
  playlistContainer: Element;
  titleElement: HTMLElement;
  durationLabels: string[];
};

export type PlaylistDomReadResult =
  | { status: 'ready'; data: PlaylistDomSnapshot }
  | { status: 'not-ready'; reason: PlaylistDomNotReadyReason };
