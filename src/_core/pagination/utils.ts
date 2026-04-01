export function mergeUniqueItems<T>(
  current: T[],
  incoming: T[],
  getItemId?: (item: T) => string | number,
  dedupe = true
): T[] {
  if (!dedupe || !getItemId) {
    return [...current, ...incoming];
  }

  const seen = new Set(current.map((item) => getItemId(item)));
  const filtered = incoming.filter((item) => !seen.has(getItemId(item)));

  return [...current, ...filtered];
}