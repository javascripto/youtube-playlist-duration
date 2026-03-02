chrome.runtime.onInstalled.addListener(() => {
  // biome-ignore lint/suspicious/noConsoleLog: Logging installation status
  console.log('YouTube Playlist Duration extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ ok: true, source: 'background' });
  }
});
