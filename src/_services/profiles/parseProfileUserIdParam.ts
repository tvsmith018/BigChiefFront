/**
 * Route param may be a numeric DB id or a Relay global id (e.g. from GraphQL `UserNode.id`).
 */
export function parseProfileUserIdParam(raw: string): number | null {
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = Number.parseInt(trimmed, 10);
    return Number.isFinite(n) ? n : null;
  }
  try {
    const decoded = globalThis.atob(trimmed);
    const colon = decoded.indexOf(":");
    if (colon === -1) return null;
    const pk = decoded.slice(colon + 1);
    const n = Number.parseInt(pk, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
