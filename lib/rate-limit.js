'use strict';

const MAX_ENTRIES = 10_000;
// global — partagé entre server.js et les bundles API Next.js (prod)
if (!global._ptyRlStore) {
  global._ptyRlStore = new Map();
  setInterval(() => {
    const cutoff = Date.now() - 120_000;
    for (const [k, v] of global._ptyRlStore.entries()) {
      if (v.windowStart < cutoff) global._ptyRlStore.delete(k);
    }
  }, 300_000).unref();
}
/** @type {Map<string, {count:number, windowStart:number}>} */
const _rlStore = global._ptyRlStore;

/**
 * Vérifie si une clé dépasse le rate limit (sliding window).
 * @param {string} key       - identifiant (userId)
 * @param {number} limit     - max requêtes par fenêtre
 * @param {number} windowMs  - durée fenêtre en ms
 * @returns {{ allowed:boolean, remaining:number, resetAt:number }}
 */
function checkRateLimit(key, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = _rlStore.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    if (_rlStore.size >= MAX_ENTRIES) _rlStore.delete(_rlStore.keys().next().value);
    _rlStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return {
    allowed:   entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt:   entry.windowStart + windowMs,
  };
}

module.exports = { checkRateLimit, _rlStore };
