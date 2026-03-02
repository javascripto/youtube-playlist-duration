export function isYouTubeHost(hostname: string): boolean {
  return /(^|\.)youtube\.com$/i.test(hostname);
}
