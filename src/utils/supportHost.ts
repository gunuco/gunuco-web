/** Support desk host: support.localhost, support.gunuco.com, etc. */
export function isSupportHost(hostname?: string): boolean {
  const host = (hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname))
    .split(':')[0]
    .toLowerCase();
  return host === 'support.localhost' || host.startsWith('support.');
}
