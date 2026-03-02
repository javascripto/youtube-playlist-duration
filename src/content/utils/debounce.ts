export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitInMilliseconds: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), waitInMilliseconds);
  };
}
