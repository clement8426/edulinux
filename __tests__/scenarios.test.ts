/**
 * Tests d'intégrité des données de scénarios (data/scenarios.ts)
 * Vérifie que tous les scénarios sont complets et cohérents.
 */

import { scenarios, Scenario, getScenarioCategoryLabel, getScenarioCategoryColor, getScenarioCategoryIcon } from '@/data/scenarios';

describe('Intégrité des données — scenarios.ts', () => {

  // ── Structure de base ────────────────────────────────────────────────────────

  test('au moins 4 scénarios définis', () => {
    expect(scenarios.length).toBeGreaterThanOrEqual(4);
  });

  test('aucun ID dupliqué', () => {
    const ids = scenarios.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('tous les scénarios ont un titre non vide', () => {
    const missing = scenarios.filter(s => !s.title || s.title.trim() === '');
    expect(missing.map(s => s.id)).toEqual([]);
  });

  test('tous les scénarios ont une description non vide', () => {
    const missing = scenarios.filter(s => !s.description || s.description.trim() === '');
    expect(missing.map(s => s.id)).toEqual([]);
  });

  test('tous les scénarios ont un contexte (briefing)', () => {
    const missing = scenarios.filter(s => !s.context || s.context.trim() === '');
    expect(missing.map(s => s.id)).toEqual([]);
  });

  test('tous les scénarios ont une durée', () => {
    const missing = scenarios.filter(s => !s.duration || s.duration.trim() === '');
    expect(missing.map(s => s.id)).toEqual([]);
  });

  // ── XP et badges ─────────────────────────────────────────────────────────────

  test('tous les scénarios ont une récompense XP positive', () => {
    const invalid = scenarios.filter(s => !s.xpReward || s.xpReward <= 0);
    expect(invalid.map(s => `${s.id}: ${s.xpReward} XP`)).toEqual([]);
  });

  test('les récompenses XP sont supérieures aux niveaux (>= 500)', () => {
    const low = scenarios.filter(s => s.xpReward < 500);
    expect(low.map(s => `${s.id}: ${s.xpReward} XP`)).toEqual([]);
  });

  // ── Catégories ───────────────────────────────────────────────────────────────

  test('catégories valides', () => {
    const validCats = new Set(['forensic', 'reseau', 'systeme', 'hacking', 'pentest']);
    const invalid = scenarios.filter(s => !validCats.has(s.category));
    expect(invalid.map(s => `${s.id}: ${s.category}`)).toEqual([]);
  });

  test('diversité des catégories (au moins 2 catégories différentes)', () => {
    const cats = new Set(scenarios.map(s => s.category));
    expect(cats.size).toBeGreaterThanOrEqual(2);
  });

  // ── Difficulté ───────────────────────────────────────────────────────────────

  test('difficultés valides', () => {
    const validDiffs = new Set(['intermediate', 'advanced']);
    const invalid = scenarios.filter(s => !validDiffs.has(s.difficulty));
    expect(invalid.map(s => `${s.id}: ${s.difficulty}`)).toEqual([]);
  });

  // ── Étapes ───────────────────────────────────────────────────────────────────

  test('tous les scénarios ont au moins 2 étapes', () => {
    const tooShort = scenarios.filter(s => !s.steps || s.steps.length < 2);
    expect(tooShort.map(s => `${s.id}: ${s.steps?.length ?? 0} étape(s)`)).toEqual([]);
  });

  test('chaque étape a un titre', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, i) => {
        if (!step.title || step.title.trim() === '') {
          errors.push(`scénario ${s.id}, étape ${i}`);
        }
      });
    });
    expect(errors).toEqual([]);
  });

  test('chaque étape a un objectif', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, i) => {
        if (!step.objective || step.objective.trim() === '') {
          errors.push(`scénario ${s.id}, étape ${i}`);
        }
      });
    });
    expect(errors).toEqual([]);
  });

  test('chaque étape a un contexte', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, i) => {
        if (!step.context || step.context.trim() === '') {
          errors.push(`scénario ${s.id}, étape ${i}`);
        }
      });
    });
    expect(errors).toEqual([]);
  });

  test('chaque étape a au moins une validation', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, i) => {
        if (!step.validation || step.validation.length === 0) {
          errors.push(`scénario ${s.id}, étape ${i} "${step.title}"`);
        }
      });
    });
    expect(errors).toEqual([]);
  });

  test('chaque étape a au moins un indice', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, i) => {
        if (!step.hints || step.hints.length === 0) {
          errors.push(`scénario ${s.id}, étape ${i} "${step.title}"`);
        }
      });
    });
    expect(errors).toEqual([]);
  });

  test('IDs des étapes uniques par scénario', () => {
    const errors: string[] = [];
    scenarios.forEach(s => {
      const ids = s.steps.map(step => step.id);
      const unique = new Set(ids);
      if (unique.size !== ids.length) {
        errors.push(`scénario ${s.id}: IDs d'étapes dupliqués`);
      }
    });
    expect(errors).toEqual([]);
  });

  test('les validations des étapes ont des types valides', () => {
    const validTypes = new Set(['command', 'output', 'fileContent', 'fileExists']);
    const errors: string[] = [];
    scenarios.forEach(s => {
      s.steps.forEach((step, si) => {
        step.validation.forEach((v, vi) => {
          if (!validTypes.has(v.type)) {
            errors.push(`scénario ${s.id}, étape ${si}, validation ${vi}: type="${v.type}"`);
          }
        });
      });
    });
    expect(errors).toEqual([]);
  });

  // ── Scénarios spécifiques ─────────────────────────────────────────────────────

  test('scénario 1 : catégorie forensic ou réseau (incident SSH)', () => {
    const s1 = scenarios.find(s => s.id === 1)!;
    expect(s1).toBeDefined();
    expect(['forensic', 'reseau', 'systeme']).toContain(s1.category);
  });

  test('scénarios pentest contiennent des commandes nmap ou curl', () => {
    const pentestScenarios = scenarios.filter(s => s.category === 'pentest');
    if (pentestScenarios.length === 0) return; // skip si pas de pentest
    const hasNmapOrCurl = pentestScenarios.some(s =>
      s.steps.some(step =>
        step.validation.some(v => v.value.includes('nmap') || v.value.includes('curl'))
      )
    );
    expect(hasNmapOrCurl).toBe(true);
  });

  test('scénarios hacking ont des étapes de privesc', () => {
    const hackingScenarios = scenarios.filter(s => s.category === 'hacking');
    if (hackingScenarios.length === 0) return;
    const hasPrivesc = hackingScenarios.some(s =>
      s.steps.some(step =>
        step.validation.some(v =>
          v.value.includes('sudo') || v.value.includes('find / -perm') || v.value.includes('cat /root')
        )
      )
    );
    expect(hasPrivesc).toBe(true);
  });
});

// ── Tests des fonctions utilitaires ──────────────────────────────────────────

describe('getScenarioCategoryLabel', () => {
  test('retourne un label pour chaque catégorie valide', () => {
    expect(getScenarioCategoryLabel('forensic')).toBe('Forensic Linux');
    expect(getScenarioCategoryLabel('reseau')).toBe('Réseau');
    expect(getScenarioCategoryLabel('systeme')).toBe('Système');
    expect(getScenarioCategoryLabel('hacking')).toBe('Hacking');
    expect(getScenarioCategoryLabel('pentest')).toBe('Pentest');
  });

  test('valeur par défaut pour catégorie inconnue', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = getScenarioCategoryLabel('unknown' as any);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('getScenarioCategoryColor', () => {
  test('retourne des classes CSS pour chaque catégorie', () => {
    const cats: Scenario['category'][] = ['forensic', 'reseau', 'systeme', 'hacking', 'pentest'];
    cats.forEach(cat => {
      const color = getScenarioCategoryColor(cat);
      expect(typeof color).toBe('string');
      expect(color.length).toBeGreaterThan(0);
    });
  });
});

describe('getScenarioCategoryIcon', () => {
  test('retourne un emoji pour chaque catégorie', () => {
    const cats: Scenario['category'][] = ['forensic', 'reseau', 'systeme', 'hacking', 'pentest'];
    cats.forEach(cat => {
      const icon = getScenarioCategoryIcon(cat);
      expect(typeof icon).toBe('string');
      expect(icon.length).toBeGreaterThan(0);
    });
  });
});
