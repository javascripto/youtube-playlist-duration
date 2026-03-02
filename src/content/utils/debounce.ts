export type DebouncedFunction<T extends (...args: never[]) => void> = ((
  ...args: Parameters<T>
) => void) & {
  cancel: () => void;
};

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitInMilliseconds: number,
): DebouncedFunction<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), waitInMilliseconds);
  };

  debounced.cancel = () => {
    if (!timeoutId) {
      return;
    }

    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return debounced;
}
