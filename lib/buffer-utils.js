'use strict';

const MAX_OUTPUT_BUFFER = 500_000;

/**
 * Tronque un buffer PTY pour éviter un DoS mémoire.
 * Conserve les MAX_OUTPUT_BUFFER/2 derniers caractères si dépassement.
 * @param {string} buf
 * @returns {string}
 */
function capBuffer(buf) {
  if (buf.length <= MAX_OUTPUT_BUFFER) return buf;
  return buf.slice(-(MAX_OUTPUT_BUFFER / 2));
}

module.exports = { MAX_OUTPUT_BUFFER, capBuffer };
