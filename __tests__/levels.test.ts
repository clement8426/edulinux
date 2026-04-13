/**
 * Tests d'intégrité des données de niveaux (data/levels.ts)
 * Vérifie que tous les niveaux respectent le contrat attendu.
 */

import { levels, Level, ValidationRule } from '@/data/levels';

describe('Intégrité des données — levels.ts', () => {

  // ── Structure de base ────────────────────────────────────────────────────────

  test('au moins 80 niveaux définis', () => {
    expect(levels.length).toBeGreaterThanOrEqual(80);
  });

  test('aucun ID dupliqué', () => {
    const ids = levels.map(l => l.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('IDs consécutifs de 1 à N', () => {
    const ids = levels.map(l => l.id).sort((a, b) => a - b);
    ids.forEach((id, i) => {
      expect(id).toBe(i + 1);
    });
  });

  test('tous les niveaux ont un titre non vide', () => {
    const missing = levels.filter(l => !l.title || l.title.trim() === '');
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('tous les niveaux ont un objectif non vide', () => {
    const missing = levels.filter(l => !l.objective || l.objective.trim() === '');
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('tous les niveaux ont une description non vide', () => {
    const missing = levels.filter(l => !l.description || l.description.trim() === '');
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('tous les niveaux ont une catégorie', () => {
    const missing = levels.filter(l => !l.category || l.category.trim() === '');
    expect(missing.map(l => l.id)).toEqual([]);
  });

  // ── Difficulté ───────────────────────────────────────────────────────────────

  test('valeurs de difficulté valides', () => {
    const valid = new Set(['beginner', 'intermediate', 'advanced']);
    const invalid = levels.filter(l => !valid.has(l.difficulty));
    expect(invalid.map(l => `${l.id}:${l.difficulty}`)).toEqual([]);
  });

  test('progression de difficulté cohérente : la majorité des beginners précèdent les advanced', () => {
    const beginnerIds = levels.filter(l => l.difficulty === 'beginner').map(l => l.id);
    const advancedIds = levels.filter(l => l.difficulty === 'advanced').map(l => l.id);
    const avgBeginner = beginnerIds.reduce((a, b) => a + b, 0) / beginnerIds.length;
    const avgAdvanced = advancedIds.reduce((a, b) => a + b, 0) / advancedIds.length;
    // En moyenne, les niveaux beginners ont un ID plus faible que les avancés
    expect(avgBeginner).toBeLessThan(avgAdvanced);
  });

  // ── Commandes ────────────────────────────────────────────────────────────────

  test('tous les niveaux ont au moins une commande', () => {
    const missing = levels.filter(l => !l.commands || l.commands.length === 0);
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('les commandes sont des strings non vides', () => {
    const invalid: number[] = [];
    levels.forEach(l => {
      if (l.commands.some(c => typeof c !== 'string' || c.trim() === '')) {
        invalid.push(l.id);
      }
    });
    expect(invalid).toEqual([]);
  });

  // ── Validations ──────────────────────────────────────────────────────────────

  test('tous les niveaux ont au moins une validation', () => {
    const missing = levels.filter(l => !l.validation || l.validation.length === 0);
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('tous les types de validation sont valides', () => {
    const validTypes = new Set(['command', 'output', 'fileContent', 'fileExists']);
    const invalid: string[] = [];
    levels.forEach(l => {
      l.validation.forEach((v, i) => {
        if (!validTypes.has(v.type)) {
          invalid.push(`level ${l.id}, validation ${i}: type="${v.type}"`);
        }
      });
    });
    expect(invalid).toEqual([]);
  });

  test('toutes les validations ont une valeur non vide', () => {
    const invalid: string[] = [];
    levels.forEach(l => {
      l.validation.forEach((v, i) => {
        if (!v.value || v.value.trim() === '') {
          invalid.push(`level ${l.id}, validation ${i}`);
        }
      });
    });
    expect(invalid).toEqual([]);
  });

  // ── Indices ──────────────────────────────────────────────────────────────────

  test('tous les niveaux ont au moins un indice', () => {
    const missing = levels.filter(l => !l.hints || l.hints.length === 0);
    expect(missing.map(l => l.id)).toEqual([]);
  });

  test('les indices sont des strings non vides', () => {
    const invalid: number[] = [];
    levels.forEach(l => {
      if (l.hints.some(h => typeof h !== 'string' || h.trim() === '')) {
        invalid.push(l.id);
      }
    });
    expect(invalid).toEqual([]);
  });

  // ── Contenu pédagogique ──────────────────────────────────────────────────────

  test('les niveaux 1-10 sont tous beginners ou intermediate', () => {
    const advanced = levels
      .filter(l => l.id <= 10 && l.difficulty === 'advanced')
      .map(l => l.id);
    expect(advanced).toEqual([]);
  });

  test('les niveaux > 50 n\'ont pas de difficulté beginner', () => {
    const easy = levels
      .filter(l => l.id > 50 && l.difficulty === 'beginner')
      .map(l => l.id);
    expect(easy).toEqual([]);
  });

  test('les commandes des niveaux 61-80 incluent des outils offensifs', () => {
    const offensiveLevels = levels.filter(l => l.id >= 61 && l.id <= 80);
    const hasOffensive = offensiveLevels.some(l =>
      l.commands.some(c => ['nmap', 'nc', 'openssl', 'ssh', 'sudo', 'find', 'curl'].includes(c))
    );
    expect(hasOffensive).toBe(true);
  });

  // ── Niveaux spécifiques ───────────────────────────────────────────────────────

  test('niveau 1 : objectif naviguer et lister', () => {
    const level1 = levels.find(l => l.id === 1)!;
    expect(level1).toBeDefined();
    expect(level1.difficulty).toBe('beginner');
    expect(level1.validation.length).toBeGreaterThanOrEqual(1);
  });

  test('niveau 10 : SSH (milestone badge)', () => {
    const l = levels.find(l => l.id === 10)!;
    expect(l).toBeDefined();
    const hasSSH = l.commands.some(c => c.toLowerCase().includes('ssh'));
    expect(hasSSH).toBe(true);
  });

  test('niveau 30 : CTF finale (milestone badge)', () => {
    const l = levels.find(l => l.id === 30)!;
    expect(l).toBeDefined();
    expect(l.difficulty).toBe('advanced');
  });

  test('niveau 60 : forensic finale', () => {
    const l = levels.find(l => l.id === 60)!;
    expect(l).toBeDefined();
    expect(l.difficulty).toBe('advanced');
    const hasForensic = l.category.toLowerCase().includes('forensic') ||
                        l.title.toLowerCase().includes('forensic') ||
                        l.commands.some(c => ['grep', 'cat', 'find', 'last', 'who'].includes(c));
    expect(hasForensic).toBe(true);
  });

  test('niveau 80 : reconnaissance web (gobuster/curl)', () => {
    const l = levels.find(l => l.id === 80)!;
    expect(l).toBeDefined();
    // level 80 is web recon (formerly level 70), difficulty intermediate
    expect(['intermediate', 'advanced']).toContain(l.difficulty);
    const hasWebRecon = l.commands.some(c =>
      ['curl', 'gobuster', 'dirb', 'ffuf', 'nmap'].includes(c)
    );
    expect(hasWebRecon).toBe(true);
  });

  // ── Vérification fileSystem ───────────────────────────────────────────────────

  test('le fileSystem est un objet (peut être vide)', () => {
    const invalid = levels.filter(l => typeof l.fileSystem !== 'object' || l.fileSystem === null);
    expect(invalid.map(l => l.id)).toEqual([]);
  });

  test('les niveaux forensic (51-60) ont un fileSystem non vide', () => {
    const forensicLevels = levels.filter(l => l.id >= 51 && l.id <= 60);
    const empty = forensicLevels.filter(l => Object.keys(l.fileSystem).length === 0);
    expect(empty.map(l => l.id)).toEqual([]);
  });
});

// ── Tests de la fonction getDifficultyEmoji ───────────────────────────────────

import { getDifficultyEmoji } from '@/data/levels';

describe('getDifficultyEmoji', () => {
  test('retourne un emoji pour chaque niveau de difficulté', () => {
    expect(getDifficultyEmoji('beginner')).toBeTruthy();
    expect(getDifficultyEmoji('intermediate')).toBeTruthy();
    expect(getDifficultyEmoji('advanced')).toBeTruthy();
  });

  test('valeur par défaut pour une difficulté inconnue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getDifficultyEmoji('unknown' as any);
    expect(typeof result).toBe('string');
  });
});
