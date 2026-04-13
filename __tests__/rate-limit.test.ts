// eslint-disable-next-line @typescript-eslint/no-require-imports
const { checkRateLimit, _rlStore } = require('../lib/rate-limit');

describe('checkRateLimit', () => {
  beforeEach(() => { _rlStore.clear(); });

  test('première requête : allowed=true, remaining=limit-1', () => {
    const r = checkRateLimit('u1', 5, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(4);
    expect(r.resetAt).toBeGreaterThan(Date.now());
  });

  test('dépassement : allowed=false, remaining=0', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('u2', 5, 60_000);
    const r = checkRateLimit('u2', 5, 60_000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });

  test('5e requête sur limit=5 : allowed=true (dernière autorisée)', () => {
    for (let i = 0; i < 4; i++) checkRateLimit('u3', 5, 60_000);
    const r = checkRateLimit('u3', 5, 60_000);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(0);
  });

  test('nouvelle fenêtre après windowMs : compteur réinitialisé', () => {
    checkRateLimit('u4', 2, 80);
    checkRateLimit('u4', 2, 80);
    const blocked = checkRateLimit('u4', 2, 80);
    expect(blocked.allowed).toBe(false);
    return new Promise<void>(resolve => setTimeout(() => {
      const r = checkRateLimit('u4', 2, 80);
      expect(r.allowed).toBe(true);
      resolve();
    }, 120));
  });

  test('clés différentes : indépendantes', () => {
    checkRateLimit('u5', 1, 60_000);
    const blocked = checkRateLimit('u5', 1, 60_000);
    const other   = checkRateLimit('u6', 1, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(other.allowed).toBe(true);
  });

  test('resetAt est dans ~windowMs ms du premier appel', () => {
    const before = Date.now();
    const r = checkRateLimit('u7', 5, 60_000);
    expect(r.resetAt).toBeGreaterThanOrEqual(before + 59_900);
    expect(r.resetAt).toBeLessThanOrEqual(before + 60_200);
  });
});
