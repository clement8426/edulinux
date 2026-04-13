/**
 * Tests de sécurité runtime — server.js helpers
 * Vérifie que les buffers sont bornés et ne causent pas de DoS mémoire.
 */

// La constante MAX_OUTPUT_BUFFER est exportée depuis server.js pour les tests.
// On importe directement la constante pour vérifier sa valeur.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MAX_OUTPUT_BUFFER, capBuffer } = require('../lib/buffer-utils');

describe('capBuffer — borne du outputBuffer PTY', () => {

  test('buffer sous la limite : retourné intact', () => {
    const input = 'a'.repeat(100);
    expect(capBuffer(input)).toBe(input);
  });

  test('buffer exactement à la limite : retourné intact', () => {
    const input = 'a'.repeat(MAX_OUTPUT_BUFFER);
    const result = capBuffer(input);
    expect(result.length).toBe(MAX_OUTPUT_BUFFER);
  });

  test('buffer au-dessus de la limite : tronqué à MAX/2 derniers chars', () => {
    const half = MAX_OUTPUT_BUFFER / 2;
    const suffix = 'b'.repeat(half);
    const input = 'a'.repeat(MAX_OUTPUT_BUFFER + 1000) + suffix;
    const result = capBuffer(input);
    expect(result.length).toBe(half);
    expect(result).toBe(suffix);
  });

  test('MAX_OUTPUT_BUFFER est au moins 100k et au plus 1M', () => {
    expect(MAX_OUTPUT_BUFFER).toBeGreaterThanOrEqual(100_000);
    expect(MAX_OUTPUT_BUFFER).toBeLessThanOrEqual(1_000_000);
  });

  test('string vide : retournée vide', () => {
    expect(capBuffer('')).toBe('');
  });

  test('accumulation répétée reste bornée', () => {
    let buf = '';
    for (let i = 0; i < 100; i++) {
      buf = capBuffer(buf + 'x'.repeat(10_000));
    }
    expect(buf.length).toBeLessThanOrEqual(MAX_OUTPUT_BUFFER);
  });
});
