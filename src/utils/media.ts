export const isVideoUrl = (url: string) =>
  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

export const isR2Url = (url: string) =>
  /r2\.dev|r2\.cloudflarestorage\.com/i.test(url);

/** Card/thumbnail variant stored beside the canonical object as `*_sm.ext`. */
export function mediaUrl(url: string, size: 'sm' | 'full' = 'full'): string {
  if (!url || size === 'full' || !isR2Url(url) || isVideoUrl(url)) return url;
  if (/_sm\.[a-z0-9]+(\?|$)/i.test(url)) return url;
  return url.replace(/(\.[a-z0-9]+)(\?|$)/i, '_sm$1$2');
}

export function firstImageUrl(urls: Array<string | undefined | null>): string | undefined {
  const list = urls.filter((url): url is string => Boolean(url));
  return list.find((url) => !isVideoUrl(url)) || list[0];
}

export function uniqueMediaUrls(...groups: Array<string[] | null | undefined>): string[] {
  return [...new Set(groups.flatMap((group) => group || []).filter(Boolean))];
}
