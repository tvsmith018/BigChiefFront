export function toHttpsUrl(url?: string | null) {
  if (!url) return undefined;
  return url.replace(/^http:\/\//, "https://");
}
