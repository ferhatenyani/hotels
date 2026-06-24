// Short, prefix-tagged, deterministic-enough IDs for mock entities.
// Not for production — fine for an admin demo where IDs only need to be
// unique within a single browser session.

export function newId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}_${time}${rand}`;
}

/** Construit une référence visible (ex. RES-2026-AB12C). */
export function newRef(prefix: string): string {
  const year = new Date().getFullYear();
  const code = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `${prefix}-${year}-${code}`;
}
