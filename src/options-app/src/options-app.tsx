import { SubmitEvent, useEffect, useState } from 'react';
import { TitleDisplayMode } from '../../shared/title-display-mode';
import { loadTitleDisplayMode, saveTitleDisplayMode } from './storage';

type OptionsAppProps = {
  variant?: 'options' | 'popup';
};

export function OptionsApp({ variant = 'options' }: OptionsAppProps) {
  const [mode, setMode] = useState<TitleDisplayMode>('prefix');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isPopup = variant === 'popup';

  useEffect(() => {
    let cancelled = false;

    loadTitleDisplayMode()
      .then(savedMode => {
        if (!cancelled) {
          setMode(savedMode);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatusMessage('Could not load saved options.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage('');

    try {
      await saveTitleDisplayMode(mode);
      setStatusMessage('Options saved.');
    } catch {
      setStatusMessage('Could not save options.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={`layout ${isPopup ? 'layout--popup' : ''}`}>
      <header className="header">
        <h1>{isPopup ? 'Display Mode' : 'YouTube Playlist Duration'}</h1>
        <p>Choose how the total duration is displayed in the playlist title.</p>
      </header>

      <form
        className="panel"
        onSubmit={onSubmit}
      >
        <fieldset>
          <legend>Display mode</legend>

          <label className="option">
            <input
              type="radio"
              name="display-mode"
              value="prefix"
              checked={mode === 'prefix'}
              onChange={() => {
                setStatusMessage('');
                setMode('prefix');
              }}
            />
            <span>Prefix: [01:23:45] Playlist Title</span>
          </label>

          <label className="option">
            <input
              type="radio"
              name="display-mode"
              value="suffix"
              checked={mode === 'suffix'}
              onChange={() => {
                setStatusMessage('');
                setMode('suffix');
              }}
            />
            <span>Suffix: Playlist Title [01:23:45]</span>
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        {statusMessage ? <p className="status">{statusMessage}</p> : null}
      </form>
    </main>
  );
}
