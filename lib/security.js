'use strict';

const crypto = require('crypto');
const path   = require('path');
const os     = require('os');
const { z }  = require('zod');

// ─── Token store (global — partagé entre server.js et les bundles API Next.js) ──
// En production, Next.js bundle chaque route API séparément, ce qui crée des
// instances de module distinctes. global garantit un seul Map pour le processus.
if (!global._ptyTokenStore) {
  global._ptyTokenStore = new Map();
  // Nettoyage des tokens expirés toutes les 60s (unref → ne bloque pas process.exit)
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of global._ptyTokenStore.entries()) {
      if (data.expiry < now) global._ptyTokenStore.delete(token);
    }
  }, 60_000).unref();
}
const _tokenStore = global._ptyTokenStore;

// ─── 1. Path traversal protection ─────────────────────────────────────────────
/**
 * Valide qu'une clé fileSystem ne sort pas du répertoire de base.
 * Retourne le chemin résolu ou null si traversal détecté.
 */
function validateFileSystemPath(baseDir, key) {
  const clean    = (typeof key === 'string' && key.startsWith('/')) ? key.slice(1) : (key || '');
  const resolved = path.resolve(baseDir, clean);
  const base     = path.resolve(baseDir);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    console.warn(`[security] Path traversal blocked: ${JSON.stringify(key)}`);
    return null;
  }
  return resolved;
}

// ─── 2. Token éphémère WS (HMAC-SHA256, TTL 30s, usage unique) ────────────────
const TOKEN_TTL_MS = 30_000;

function _getSecret() {
  if (!process.env.PTY_TOKEN_SECRET) {
    process.env.PTY_TOKEN_SECRET = crypto.randomBytes(32).toString('hex');
    console.warn('[security] PTY_TOKEN_SECRET absent — secret éphémère généré. Définir dans .env pour la prod.');
  }
  return process.env.PTY_TOKEN_SECRET;
}

/**
 * Génère un token signé pour un userId donné.
 * Stocke le token dans _tokenStore (usage unique).
 */
function generatePtyToken(userId) {
  const secret  = _getSecret();
  const expiry  = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${expiry}`;
  const hmac    = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const token   = Buffer.from(`${payload}:${hmac}`).toString('base64url');
  _tokenStore.set(token, { userId, expiry });
  return token;
}

/**
 * Vérifie un token : HMAC, TTL, existence dans le store.
 * Consomme le token (supprimé après première utilisation).
 * Retourne { userId } ou null.
 */
function verifyPtyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const entry = _tokenStore.get(token);
  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    _tokenStore.delete(token);
    return null;
  }

  // Vérification HMAC
  const secret = _getSecret();
  let payload, hmac;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts   = decoded.split(':');
    if (parts.length < 3) { _tokenStore.delete(token); return null; }
    hmac    = parts.pop();
    payload = parts.join(':');
  } catch {
    _tokenStore.delete(token);
    return null;
  }

  let expectedBuf, hmacBuf;
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    expectedBuf = Buffer.from(expected, 'hex');
    hmacBuf     = Buffer.from(hmac, 'hex');
  } catch {
    _tokenStore.delete(token);
    return null;
  }

  if (expectedBuf.length !== hmacBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, hmacBuf)) {
    _tokenStore.delete(token);
    return null;
  }

  _tokenStore.delete(token); // consommé — usage unique
  return { userId: entry.userId };
}

// ─── 3. Bounds check terminal ─────────────────────────────────────────────────
const COLS_MIN = 10,  COLS_MAX = 500;
const ROWS_MIN = 3,   ROWS_MAX = 200;

/**
 * Borne cols et rows dans des plages sûres.
 */
function validateTerminalSize(cols, rows) {
  return {
    cols: Math.max(COLS_MIN, Math.min(COLS_MAX, parseInt(cols) || 80)),
    rows: Math.max(ROWS_MIN, Math.min(ROWS_MAX, parseInt(rows) || 24)),
  };
}

// ─── 4. Workdir isolé par utilisateur ─────────────────────────────────────────
/**
 * Génère un chemin de travail aléatoire et isolé par userId.
 * Format : /tmp/edulinux/<safeUserId>-<kind>-<id>-<16bytesHex>
 */
function generateWorkDir(userId, kind, id) {
  const rand       = crypto.randomBytes(16).toString('hex');
  const safeUserId = (String(userId || 'anon'))
    .replace(/[^a-zA-Z0-9-]/g, '')
    .slice(0, 36) || 'anon';
  return path.join(os.tmpdir(), 'edulinux', `${safeUserId}-${kind}-${id}-${rand}`);
}

// ─── 5. Validation des inputs API progress ────────────────────────────────────
const progressSchema = z.object({
  completedLevels:    z.array(z.number().int().min(1).max(9999)).max(9999).default([]),
  currentLevel:       z.number().int().min(1).max(9999).default(1),
  totalXP:            z.number().int().min(0).max(999999).default(0),
  badges:             z.array(z.string().max(64)).max(200).default([]),
  completedScenarios: z.array(z.number().int().min(1).max(9999)).max(9999).default([]),
  scenarioSteps:      z.record(z.string().max(32), z.number().int().min(0).max(999)).default({}),
});

/**
 * Valide le body d'un POST /api/progress.
 * Retourne { valid, data, errors }.
 */
function validateProgress(body) {
  const result = progressSchema.safeParse(body ?? {});
  if (!result.success) {
    return { valid: false, data: null, errors: result.error.errors };
  }
  return { valid: true, data: result.data, errors: [] };
}

// ─── 6. WebSocket origin validation ──────────────────────────────────────────
/**
 * Vérifie qu'une origin WebSocket est autorisée.
 * @param {string|undefined} origin  - req.headers['origin']
 * @param {string|undefined} appUrl  - process.env.NEXT_PUBLIC_APP_URL
 * @param {boolean} [isProd=false]   - true en production
 * @returns {boolean}
 */
function isAllowedOrigin(origin, appUrl, isProd = false) {
  // En production sans APP_URL configurée : on refuse si origin absente (fail-secure)
  if (origin === undefined || origin === null) {
    if (isProd) return false;       // prod : on exige une origin
    return !appUrl;                  // dev  : OK si pas d'APP_URL, KO si APP_URL définie
  }

  let originHost;
  try { originHost = new URL(origin).hostname; }
  catch { return false; }

  if (originHost === 'localhost' || originHost === '127.0.0.1' || originHost === '::1') {
    return true;
  }

  if (appUrl) {
    try { return originHost === new URL(appUrl).hostname; }
    catch { return false; }
  }

  return !isProd; // dev sans APP_URL : on accepte ; prod sans APP_URL : on refuse
}

module.exports = {
  validateFileSystemPath,
  generatePtyToken,
  verifyPtyToken,
  validateTerminalSize,
  generateWorkDir,
  validateProgress,
  isAllowedOrigin,
  _tokenStore, // exposé pour les tests uniquement
};
