# Original Script, Action Plan, and Backlog

## Original Script (Reference)

```javascript
(async () => {
	const MILLISECONDS_IN_ONE_SECOND = 1000;
	const MILLISECONDS_IN_ONE_MINUTE = MILLISECONDS_IN_ONE_SECOND * 60;
	const MILLISECONDS_IN_ONE_HOUR = MILLISECONDS_IN_ONE_MINUTE * 60;
	const MILLISECONDS_IN_ONE_DAY = MILLISECONDS_IN_ONE_HOUR * 24;
	const MILLISECONDS_IN_ONE_WEEK = MILLISECONDS_IN_ONE_DAY * 7;
	const SECONDS_IN_ONE_MINUTE = 60;
	const SECONDS_IN_ONE_HOUR = SECONDS_IN_ONE_MINUTE * SECONDS_IN_ONE_MINUTE;
	class Duration {
		constructor({
			minutes = 0,
			hours = 0,
			seconds = 0,
			milliseconds = 0,
		} = {}) {
			this._milliseconds = 0;
			this._milliseconds += hours * MILLISECONDS_IN_ONE_HOUR;
			this._milliseconds += minutes * MILLISECONDS_IN_ONE_MINUTE;
			this._milliseconds += seconds * MILLISECONDS_IN_ONE_SECOND;
			this._milliseconds += milliseconds;
		}
		static fromTimeString(timeString) {
			const TIME_SEPARATOR = ':';
			const ERROR = new Error(`${timeString} could not be parsed`);
			const timeParts = timeString.split(TIME_SEPARATOR).map(Number);
			if (timeParts.some(Number.isNaN)) {
				throw ERROR;
			}
			let [hours, minutes, seconds] = [0,0,0];
			switch (timeParts.length) {
				case 1:
					[seconds] = timeParts;
					return new Duration({
						seconds
					});
				case 2:
					[minutes, seconds] = timeParts;
					return new Duration({
						minutes,
						seconds
					});
				case 3:
					[hours, minutes, seconds] = timeParts;
					return new Duration({
						hours,
						minutes,
						seconds
					});
				default:
					throw ERROR;
			}
		}
		get inMilliseconds() {
			return this._milliseconds;
		}
		get inSeconds() {
			return this._milliseconds / MILLISECONDS_IN_ONE_SECOND;
		}
		get inMinutes() {
			return this._milliseconds / MILLISECONDS_IN_ONE_MINUTE;
		}
		get inHours() {
			return this._milliseconds / MILLISECONDS_IN_ONE_HOUR;
		}
		get inDays() {
			return this._milliseconds / MILLISECONDS_IN_ONE_DAY;
		}
		get inWeeks() {
			return this._milliseconds / MILLISECONDS_IN_ONE_WEEK;
		}
		toTimeString() {
			const {
				_padZero,
				_restOfDivision
			} = this;
			const totalSeconds = Math.abs(this.inSeconds);
			if (totalSeconds < SECONDS_IN_ONE_MINUTE) {
				return `00:${_padZero(totalSeconds)}`;
			}
			if (totalSeconds < SECONDS_IN_ONE_HOUR) {
				const minutes = _padZero(totalSeconds / SECONDS_IN_ONE_MINUTE);
				const seconds = _padZero(_restOfDivision(totalSeconds, SECONDS_IN_ONE_MINUTE));
				return `${minutes}:${seconds}`;
			}
			const hours = _padZero(totalSeconds / SECONDS_IN_ONE_HOUR);
			const minutes = _padZero(_restOfDivision(totalSeconds, SECONDS_IN_ONE_HOUR) / SECONDS_IN_ONE_MINUTE);
			const seconds = _padZero(_restOfDivision(totalSeconds, SECONDS_IN_ONE_MINUTE));
			return `${hours}:${minutes}:${seconds}`;
		}
		_padZero(number = 0) {
			if (number < 10) {
				return `0${parseInt(String(number))}`;
			}
			return `${parseInt(String(number))}`;
		}
		_restOfDivision(dividend, divider) {
			const quotient = parseInt(String(dividend / divider));
			return dividend - quotient * divider;
		}
	}

	function getPlaylistDuration(timeDisplayElementList) {
		const sum = (x, y) => x + y;
		const isNotPremiereOrLive = (text) => text !== 'ESTREIA' && text !== 'AO VIVO' && text !== 'EM BREVE';
		const getTrimmedInnerText = (element) => element.innerText.trim();
		const playListDurationInSeconds = timeDisplayElementList.map(getTrimmedInnerText).filter(isNotPremiereOrLive).map(Duration.fromTimeString).map((duration) => duration.inSeconds).reduce(sum, 0);
		return new Duration({
			seconds: playListDurationInSeconds
		});
	}

	function main() {
		const PLAYLIST_CONTAINER_SELECTOR = '#secondary-inner #playlist #container #items.playlist-items';
		const TIME_DISPLAY_SPAN_SELECTOR = 'span.style-scope.ytd-thumbnail-overlay-time-status-renderer';
		const $playlistContainer = document.querySelector(PLAYLIST_CONTAINER_SELECTOR);
		if (!$playlistContainer) {
			throw new Error('Playlist container element not found!');
		}
		const $playListNameElement = document.querySelector('#header-contents h3 a');
		if (!$playListNameElement) {
			throw new Error('Playlist name element not found!');
		}
		const $timeDisplaySpanNodeList = $playlistContainer.querySelectorAll(TIME_DISPLAY_SPAN_SELECTOR);
		if (!$timeDisplaySpanNodeList.length) {
			throw new Error('Playlist time span elements not found!');
		}
		const timeDisplaySpanArray = Array.from($timeDisplaySpanNodeList);
		const playListDurationTime = getPlaylistDuration(timeDisplaySpanArray).toTimeString();
		$playListNameElement.innerText = playListDurationTime;
		// biome-ignore lint/suspicious/noConsoleLog: Logging playlist duration
		console.log(playListDurationTime);
	}
	// biome-ignore lint/suspicious/noConsoleLog: Logging script status
	console.log('Aguardando...')
	await new Promise(resolve => setTimeout(resolve, 5000));
	// biome-ignore lint/suspicious/noConsoleLog: Logging script status
	console.log('Calculando')
	main();
	const interval = setInterval(() => {
		try {
			main();
		} catch (error) {
			clearInterval(interval);
			console.error(error);
		}
	}, 2000);
})();

;(() => {
	// transcrição

})();
```

## Action Plan

1. [x] Extract the duration core into an independent module (no DOM dependency).
2. [x] Add unit tests for parsing, summing, and formatting.
3. [x] Create a YouTube DOM adapter to:
   - collect playlist duration labels
   - find the playlist title element
4. [x] Replace polling (`setInterval`) with `MutationObserver` + debounce.
5. [x] Handle YouTube SPA navigation (URL/internal event changes).
6. [x] Preserve original title and apply duration in configurable mode (prefix/suffix).
7. [x] Integrate extension preferences with `storage`.
8. [ ] Validate behavior in Chrome and Firefox.

## Technical Progress

1. [x] Duration core split into modules (`constants`, `math`, `labels`, `playlist-duration`, `index`).
2. [x] `tsconfig.test.json` created to separate test typing from extension typing.
3. [x] DOM adapter implemented with typed `ready/not-ready` result (no `throw`).
4. [x] Initial core integration into content script to update title with total duration.
5. [x] Reactive updates implemented with `MutationObserver` + debounce + SPA triggers.
6. [x] Content script refactored into smaller modules (`host`, `controller`, `utils`).
7. [x] Tests added for DOM adapter and initial controller flow.
8. [x] Controller tests expanded for DOM mutations and events (`yt-navigate-finish`, `popstate`).
9. [x] Original title preservation implemented with prefix/suffix rendering strategy.
10. [x] `stop()` added to controller for observer/listener/debounce cleanup.
11. [x] Options page started with React + Vite + TypeScript and mode persistence in `chrome.storage.sync`.
12. [x] Controller connected to `storage.sync` to apply `prefix/suffix` at runtime and react to changes.
13. [x] Popup migrated to React + Vite reusing the same settings component.
14. [x] Icon pipeline migrated to automatic generation via `@resvg/resvg-js` from `src/icons/icon.svg`.

## Mapped Requirements and Limitations

1. Duration calculation only considers videos currently loaded by YouTube into the playlist DOM.
2. Current practical limit: about ~200 loaded/listed videos; items not loaded are not included in the total.
3. Public extension description must explicitly mention this limitation.

## Backlog

### MVP v1

1. [x] `Duration` module isolated from DOM.
   - Acceptance: supports `ss`, `mm:ss`, `hh:mm:ss`.
2. [x] Resilient parser to ignore non-time items (live/premiere/upcoming).
   - Acceptance: invalid items do not break calculation.
3. [x] DOM reading for playlist and title.
   - Acceptance: if DOM is not ready, no fatal error is thrown.
4. [x] Title update with total duration.
   - Acceptance: playlist title displays total duration.
5. [x] Reactive update using `MutationObserver` + debounce.
   - Acceptance: recalculation occurs on real playlist changes.
6. [x] Unit tests for core logic.
   - Acceptance: test suite green for parse/sum/format.

### v1.1

1. Preserve/restore original playlist title.
   - Acceptance: no permanent loss of original title.
2. Re-initialize on SPA navigation.
   - Acceptance: works after switching video/playlist without reload.
3. Selector fallback strategy.
   - Acceptance: graceful degradation when layout changes.
4. Debug mode.
   - Acceptance: detailed logs only when debug is enabled.

### v1.2

1. Preferences in popup/options (prefix/suffix, format, filters).
   - Acceptance: persisted with `storage`.
2. Improve locale/language strategy for special labels.
   - Acceptance: primary rule by time pattern + fallback known terms.
3. Cross-browser validation and packaging.
   - Acceptance: `dist/chrome` and `dist/firefox` load without errors.
4. [x] Create extension visual identity and icons (16, 32, 48, 96, 128, 256/512).
   - Acceptance: icons exported, versioned, and referenced in manifest.

## Definition of Done (DoD)

1. Build with no typing errors.
2. No unhandled runtime exceptions in normal usage.
3. Acceptance criteria manually verified in Chrome and Firefox.
