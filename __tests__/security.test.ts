/**
 * Tests unitaires pour lib/security.js
 * TDD : ces tests sont écrits AVANT l'implémentation.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  validateFileSystemPath,
  generatePtyToken,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  validateProgress,
  _tokenStore,
} = require('../lib/security');

import * as os from 'os';
import * as path from 'path';

// ── validateFileSystemPath ─────────────────────────────────────────────────────

describe('validateFileSystemPath', () => {
  const base = '/tmp/edulinux/test-session';

  test('chemin normal retourne le path résolu', () => {
    const result = validateFileSystemPath(base, 'fichier.txt');
    expect(result).toBe(path.join(base, 'fichier.txt'));
  });

  test('sous-répertoire normal accepté', () => {
    const result = validateFileSystemPath(base, 'docs/readme.txt');
    expect(result).toBe(path.join(base, 'docs/readme.txt'));
  });

  test('clé avec slash initial acceptée (le slash est retiré)', () => {
    const result = validateFileSystemPath(base, '/fichier.txt');
    expect(result).toBe(path.join(base, 'fichier.txt'));
  });

  test('../ bloqué — retourne null', () => {
    const result = validateFileSystemPath(base, '../escape.txt');
    expect(result).toBeNull();
  });

  test('../../ bloqué — retourne null', () => {
    const result = validateFileSystemPath(base, '../../etc/passwd');
    expect(result).toBeNull();
  });

  test('/etc/passwd avec slash initial → converti en etc/passwd dans workdir (sûr, non null)', () => {
    // Le slash initial est retiré : '/etc/passwd' → 'etc/passwd' → baseDir/etc/passwd
    // Ce n'est PAS un path traversal — le fichier est créé dans le workdir
    const result = validateFileSystemPath(base, '/etc/passwd');
    expect(result).toBe(path.join(base, 'etc/passwd'));
  });

  test('traversal caché dans un sous-dossier bloqué', () => {
    const result = validateFileSystemPath(base, 'docs/../../etc/passwd');
    expect(result).toBeNull();
  });

  test('clé vide retourne baseDir lui-même (non null)', () => {
    const result = validateFileSystemPath(base, '');
    expect(result).not.toBeNull();
  });
});

// ── generatePtyToken / verifyPtyToken ─────────────────────────────────────────

describe('generatePtyToken + verifyPtyToken', () => {
  beforeEach(() => {
    process.env.PTY_TOKEN_SECRET = 'test-secret-32-bytes-exactly-here';
    _tokenStore.clear();
  });

  test('token généré et vérifié avec succès', () => {
    const token = generatePtyToken('user-abc-123');
    const result = verifyPtyToken(token);
    expect(result).toEqual({ userId: 'user-abc-123' });
  });

  test('usage unique : deuxième appel retourne null', () => {
    const token = generatePtyToken('user-abc-123');
    verifyPtyToken(token); // première utilisation
    const second = verifyPtyToken(token);
    expect(second).toBeNull();
  });

  test('token falsifié (HMAC invalide) retourne null', () => {
    const fakePayload = Buffer.from('user-abc:9999999999999:invalidsignature').toString('base64url');
    const result = verifyPtyToken(fakePayload);
    expect(result).toBeNull();
  });

  test('token expiré retourne null', () => {
    jest.useFakeTimers();
    const token = generatePtyToken('user-abc-123');
    jest.advanceTimersByTime(31_000);
    const result = verifyPtyToken(token);
    expect(result).toBeNull();
    jest.useRealTimers();
  });

  test('valeur null retourne null', () => {
    expect(verifyPtyToken(null)).toBeNull();
  });

  test('chaîne vide retourne null', () => {
    expect(verifyPtyToken('')).toBeNull();
  });

  test('token non présent dans le store retourne null', () => {
    const result = verifyPtyToken('ce-token-nexiste-pas');
    expect(result).toBeNull();
  });
});

// ── validateTerminalSize ──────────────────────────────────────────────────────

describe('validateTerminalSize', () => {
  test('valeurs normales passent inchangées', () => {
    expect(validateTerminalSize(80, 24)).toEqual({ cols: 80, rows: 24 });
    expect(validateTerminalSize(120, 40)).toEqual({ cols: 120, rows: 40 });
  });

  test('dépassement MAX est clampé à 500/200', () => {
    expect(validateTerminalSize(999999, 999999)).toEqual({ cols: 500, rows: 200 });
  });

  test('valeurs négatives remontent à MIN (10/3)', () => {
    expect(validateTerminalSize(-1, -100)).toEqual({ cols: 10, rows: 3 });
  });

  test('NaN → défaut (80 x 24)', () => {
    expect(validateTerminalSize(NaN, NaN)).toEqual({ cols: 80, rows: 24 });
  });

  test('chaîne parseable acceptée', () => {
    expect(validateTerminalSize('100', '30')).toEqual({ cols: 100, rows: 30 });
  });

  test('undefined → défaut (80 x 24)', () => {
    expect(validateTerminalSize(undefined, undefined)).toEqual({ cols: 80, rows: 24 });
  });
});

// ── generateWorkDir ───────────────────────────────────────────────────────────

describe('generateWorkDir', () => {
  test('répertoire toujours sous /tmp/edulinux', () => {
    const dir = generateWorkDir('user-123', 'level', 1);
    expect(dir.startsWith(path.join(os.tmpdir(), 'edulinux'))).toBe(true);
  });

  test('userId apparaît dans le chemin', () => {
    const dir = generateWorkDir('user-abc', 'level', 5);
    expect(dir).toContain('user-abc');
  });

  test('100 appels consécutifs produisent 100 chemins uniques', () => {
    const dirs = new Set<string>();
    for (let i = 0; i < 100; i++) {
      dirs.add(generateWorkDir('user-123', 'level', 1));
    }
    expect(dirs.size).toBe(100);
  });

  test('userId avec caractères spéciaux est sanitisé', () => {
    const dir = generateWorkDir('user/../../etc', 'level', 1);
    expect(dir).not.toContain('..');
    expect(dir.startsWith(path.join(os.tmpdir(), 'edulinux'))).toBe(true);
  });
});

// ── validateProgress ──────────────────────────────────────────────────────────

describe('validateProgress', () => {
  test('payload complet valide retourne valid: true', () => {
    const result = validateProgress({
      completedLevels: [1, 2, 3],
      currentLevel: 4,
      totalXP: 150,
      badges: ['first-steps'],
      completedScenarios: [1],
      scenarioSteps: { '1': 2 },
    });
    expect(result.valid).toBe(true);
    expect(result.data).toBeTruthy();
    expect(result.errors).toHaveLength(0);
  });

  test('payload vide retourne valid: true avec defaults', () => {
    const result = validateProgress({});
    expect(result.valid).toBe(true);
    expect(result.data?.completedLevels).toEqual([]);
    expect(result.data?.currentLevel).toBe(1);
    expect(result.data?.totalXP).toBe(0);
  });

  test('XP négatif retourne valid: false', () => {
    const result = validateProgress({ totalXP: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('XP > 999999 retourne valid: false', () => {
    const result = validateProgress({ totalXP: 1_000_000 });
    expect(result.valid).toBe(false);
  });

  test('badge > 64 caractères retourne valid: false', () => {
    const result = validateProgress({ badges: ['a'.repeat(65)] });
    expect(result.valid).toBe(false);
  });

  test('completedLevels avec string retourne valid: false', () => {
    const result = validateProgress({ completedLevels: ['not-a-number'] });
    expect(result.valid).toBe(false);
  });

  test('completedLevels avec niveau 0 retourne valid: false (min = 1)', () => {
    const result = validateProgress({ completedLevels: [0] });
    expect(result.valid).toBe(false);
  });
});

describe('isAllowedOrigin', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { isAllowedOrigin } = require('../lib/security');

  // ── Mode dev (isProd = false, défaut) ─────────────────────────────────────

  test('dev — localhost toujours accepté', () => {
    expect(isAllowedOrigin('http://localhost:3000', undefined, false)).toBe(true);
    expect(isAllowedOrigin('http://localhost:9999', undefined, false)).toBe(true);
  });

  test('dev — hostname de APP_URL accepté', () => {
    expect(isAllowedOrigin('https://edulinux.io', 'https://edulinux.io', false)).toBe(true);
  });

  test('dev — hostname différent refusé', () => {
    expect(isAllowedOrigin('https://evil.com', 'https://edulinux.io', false)).toBe(false);
  });

  test('dev — origin vide sans APP_URL : accepté', () => {
    expect(isAllowedOrigin('', undefined, false)).toBe(false); // string vide → URL() throw → false
    expect(isAllowedOrigin(undefined, undefined, false)).toBe(true);
  });

  test('dev — origin undefined avec APP_URL : refusé', () => {
    expect(isAllowedOrigin(undefined, 'https://edulinux.io', false)).toBe(false);
  });

  // ── Mode prod (isProd = true) ─────────────────────────────────────────────

  test('prod — origin undefined SANS APP_URL : refusé (fail-secure)', () => {
    // Le bug précédent : retournait true ici. Maintenant doit retourner false.
    expect(isAllowedOrigin(undefined, undefined, true)).toBe(false);
  });

  test('prod — origin undefined AVEC APP_URL : refusé', () => {
    expect(isAllowedOrigin(undefined, 'https://edulinux.io', true)).toBe(false);
  });

  test('prod — origin valide avec APP_URL matching : accepté', () => {
    expect(isAllowedOrigin('https://edulinux.io', 'https://edulinux.io', true)).toBe(true);
  });

  test('prod — origin valide sans APP_URL : refusé (fail-secure)', () => {
    expect(isAllowedOrigin('https://evil.com', undefined, true)).toBe(false);
  });

  test('prod — localhost toujours accepté (dev connecté en prod)', () => {
    expect(isAllowedOrigin('http://localhost:3000', undefined, true)).toBe(true);
  });
});
