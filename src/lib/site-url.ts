/**
 * Canonical site URL — set VITE_SITE_URL in production when the domain is known.
 */
export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function getCanonicalUrl(pathname: string = ""): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (!base) return path;
  return `${base}${path}`;
}

export function getAbsoluteAssetUrl(assetPath: string): string {
  const path = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  const base = getSiteUrl();
  return base ? `${base}${path}` : path;
}
