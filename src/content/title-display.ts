export type TitleDisplayMode = 'prefix' | 'suffix';

const ORIGINAL_TITLE_ATTRIBUTE = 'data-ytpd-original-title';
const LAST_RENDERED_TITLE_ATTRIBUTE = 'data-ytpd-rendered-title';

export function applyDurationToTitle(
  titleElement: HTMLElement,
  duration: string,
  mode: TitleDisplayMode = 'prefix',
): void {
  const currentTitle = getTitleText(titleElement);
  const previousOriginal = titleElement.getAttribute(ORIGINAL_TITLE_ATTRIBUTE);
  const previousRendered = titleElement.getAttribute(LAST_RENDERED_TITLE_ATTRIBUTE);

  const originalTitle = resolveOriginalTitle({
    currentTitle,
    previousOriginal,
    previousRendered,
  });

  const renderedTitle = formatTitleWithDuration(originalTitle, duration, mode);

  if (titleElement.textContent !== renderedTitle) {
    titleElement.textContent = renderedTitle;
  }

  titleElement.setAttribute(ORIGINAL_TITLE_ATTRIBUTE, originalTitle);
  titleElement.setAttribute(LAST_RENDERED_TITLE_ATTRIBUTE, renderedTitle);
}

export function formatTitleWithDuration(
  title: string,
  duration: string,
  mode: TitleDisplayMode = 'prefix',
): string {
  return mode === 'suffix' ? `${title} [${duration}]` : `[${duration}] ${title}`;
}

function getTitleText(element: HTMLElement): string {
  return element.textContent?.trim() ?? '';
}

type ResolveOriginalTitleInput = {
  currentTitle: string;
  previousOriginal: string | null;
  previousRendered: string | null;
};

function resolveOriginalTitle({
  currentTitle,
  previousOriginal,
  previousRendered,
}: ResolveOriginalTitleInput): string {
  if (!previousOriginal) {
    return currentTitle;
  }

  const titleChangedExternally =
    currentTitle.length > 0 &&
    currentTitle !== previousOriginal &&
    currentTitle !== previousRendered;

  if (titleChangedExternally) {
    return currentTitle;
  }

  return previousOriginal;
}
