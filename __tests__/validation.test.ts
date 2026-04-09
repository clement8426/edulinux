/**
 * Tests unitaires pour la logique de validation des commandes (server.js)
 * Ces fonctions tournent côté serveur et déterminent si un exercice est validé.
 */

// ── Réplication exacte de la logique de server.js pour les tests ─────────────

interface ValidationRule {
  type: 'command' | 'output' | 'fileContent' | 'fileExists';
  value: string;
  description?: string;
}

// Miroir de normalise() dans server.js
function normalise(s: string): string {
  return s
    .replace(/['"]/g, '')
    .replace(/\/+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Miroir de NO_ARG_COMMANDS dans server.js
const NO_ARG_COMMANDS = new Set([
  'pwd', 'id', 'whoami', 'ls', 'env', 'printenv', 'who', 'last',
  'top', 'free', 'df', 'ps', 'history', 'uptime', 'uname', 'date',
  'groups', 'umask', 'lsattr', 'sudo -l', 'ss', 'ip', 'netstat',
]);

function matchesRule(cmd: string, rule: ValidationRule): boolean {
  if (rule.type !== 'command') return false;
  const c = normalise(cmd);
  const v = normalise(rule.value);

  // Cas spécial cd : "cd work" doit matcher "cd home/user/documents/work"
  if (v.startsWith('cd ') && c.startsWith('cd ')) {
    const vPath = v.slice(3).replace(/\/+$/, '');
    const cPath = c.slice(3).replace(/\/+$/, '');
    if (cPath === vPath || cPath.endsWith('/' + vPath)) return true;
  }

  // Opérateurs purs (|, >, >>) : vérifier la présence dans la commande
  if (v === '|') return c.includes('|');
  if (v === '>>') return c.includes('>>');
  if (v === '>') return c.includes('>');

  // Règle de type "cmd >" ou "cmd |" : cmd présent en début ET opérateur présent
  const opMatch = v.match(/^(\S+)\s+(>>|>|\|)$/);
  if (opMatch) {
    const [, baseCmd, op] = opMatch;
    if (c.startsWith(baseCmd + ' ') && c.includes(op)) return true;
  }

  // ls : flags équivalents peu importe l'ordre ou le regroupement (-la == -al == -l -a)
  if (v.startsWith('ls') && c.startsWith('ls')) {
    const extractFlags = (s: string) =>
      (s.match(/-([a-zA-Z]+)/g) || []).join('').replace(/-/g, '').split('').sort();
    const vFlags = extractFlags(v);
    const cFlagsSet = new Set(extractFlags(c));
    if (vFlags.length > 0 && vFlags.every(f => cFlagsSet.has(f))) return true;
  }

  // Règle avec arguments → match exact ou startsWith
  if (v.includes(' ')) {
    return c === v || c.startsWith(v + ' ') || c.startsWith(v);
  }

  // Règle bare : argument requis OU dans la whitelist
  if (c.startsWith(v + ' ')) return true;
  if (c === v && NO_ARG_COMMANDS.has(v)) return true;

  // Pipes : vérifier chaque segment
  if (c.includes('|')) {
    return c.split('|').some(part => matchesRule(part.trim(), rule));
  }
  return false;
}

function cleanBuffer(buf: string): string {
  let result = '';
  let i = 0;
  while (i < buf.length) {
    const code = buf.charCodeAt(i);
    if (code === 0x7f || code === 0x08) {
      result = result.slice(0, -1);
      i++;
    } else if (code === 0x1b) {
      i++;
      if (buf[i] === '[') {
        i++;
        while (i < buf.length && !/[A-Za-z~]/.test(buf[i])) i++;
        i++;
      } else {
        i++;
      }
    } else if (code === 0x03 || code === 0x04 || code === 0x15) {
      result = '';
      i++;
    } else {
      result += buf[i];
      i++;
    }
  }
  return result.trim();
}

// ── Tests matchesRule ─────────────────────────────────────────────────────────

// Commandes no-arg whitelistées (valides sans argument)
const NO_ARG_WHITELIST = new Set([
  'pwd', 'id', 'whoami', 'ls', 'env', 'who', 'last', 'top', 'free',
  'df', 'ps', 'history', 'uptime', 'uname', 'date', 'groups', 'umask',
  'lsattr', 'sudo -l', 'ss', 'ip', 'netstat',
]);

describe('normalise — nettoyage des entrées', () => {
  test('supprime les slashes finaux', () => {
    expect(normalise('cd documents/')).toBe('cd documents');
    expect(normalise('ls /etc/')).toBe('ls /etc');
  });

  test('supprime les guillemets', () => {
    expect(normalise('echo "hello"')).toBe('echo hello');
    expect(normalise("echo 'hello'")).toBe('echo hello');
  });

  test('normalise les espaces multiples', () => {
    expect(normalise('ls   -la')).toBe('ls -la');
  });

  test('slash interne préservé', () => {
    expect(normalise('cat /etc/passwd')).toBe('cat /etc/passwd');
    expect(normalise('ls /home/user/')).toBe('ls /home/user');
  });
});

describe('matchesRule — commandes basiques', () => {
  test('commande whitelistée sans argument : valide (ls, pwd, id…)', () => {
    // ls est dans la whitelist → valide même seul
    expect(matchesRule('ls', { type: 'command', value: 'ls' })).toBe(true);
    expect(matchesRule('pwd', { type: 'command', value: 'pwd' })).toBe(true);
    expect(matchesRule('id', { type: 'command', value: 'id' })).toBe(true);
    expect(matchesRule('who', { type: 'command', value: 'who' })).toBe(true);
  });

  test('commande NON whitelistée (echo, cat, grep…) requiert un argument', () => {
    expect(matchesRule('echo', { type: 'command', value: 'echo' })).toBe(false);
    expect(matchesRule('cat', { type: 'command', value: 'cat' })).toBe(false);
    expect(matchesRule('grep', { type: 'command', value: 'grep' })).toBe(false);
  });

  test('commande avec argument valide une règle bare', () => {
    expect(matchesRule('ls -la', { type: 'command', value: 'ls' })).toBe(true);
    expect(matchesRule('cat fichier.txt', { type: 'command', value: 'cat' })).toBe(true);
    expect(matchesRule('grep motif fichier', { type: 'command', value: 'grep' })).toBe(true);
  });

  test('règle avec arguments — préfixe requis', () => {
    expect(matchesRule('ls -la', { type: 'command', value: 'ls -la' })).toBe(true);
    expect(matchesRule('ls -la /etc', { type: 'command', value: 'ls -la' })).toBe(true);
    expect(matchesRule('ls -l', { type: 'command', value: 'ls -la' })).toBe(false);
  });

  test('insensible à la casse', () => {
    expect(matchesRule('CAT fichier.txt', { type: 'command', value: 'cat' })).toBe(true);
    expect(matchesRule('GREP motif', { type: 'command', value: 'grep' })).toBe(true);
  });

  test('espaces en début/fin ignorés', () => {
    expect(matchesRule('  ls -la  ', { type: 'command', value: 'ls -la' })).toBe(true);
    expect(matchesRule('  echo hello  ', { type: 'command', value: 'echo' })).toBe(true);
  });

  test('non-commande (type output) toujours false', () => {
    expect(matchesRule('ls -la', { type: 'output', value: 'ls -la' })).toBe(false);
    expect(matchesRule('anything', { type: 'fileContent', value: 'anything' })).toBe(false);
  });
});

describe('matchesRule — commandes spécifiques EduLinux', () => {
  test('echo requiert un argument (pas dans la whitelist)', () => {
    expect(matchesRule('echo', { type: 'command', value: 'echo' })).toBe(false);
    expect(matchesRule('echo "hello world"', { type: 'command', value: 'echo' })).toBe(true);
    expect(matchesRule('echo hello', { type: 'command', value: 'echo' })).toBe(true);
  });

  test('pwd seul est valide (dans la whitelist no-arg)', () => {
    expect(matchesRule('pwd', { type: 'command', value: 'pwd' })).toBe(true);
  });

  test('slash final ignoré (cd documents/ == cd documents)', () => {
    expect(matchesRule('cd documents/', { type: 'command', value: 'cd documents' })).toBe(true);
    expect(matchesRule('ls /etc/', { type: 'command', value: 'ls /etc' })).toBe(true);
  });

  test('cd chemin complet matche la destination finale', () => {
    const rule = { type: 'command' as const, value: 'cd work' };
    // Étape par étape
    expect(matchesRule('cd work', rule)).toBe(true);
    expect(matchesRule('cd work/', rule)).toBe(true);
    // En un seul chemin complet
    expect(matchesRule('cd home/user/documents/work', rule)).toBe(true);
    expect(matchesRule('cd documents/work', rule)).toBe(true);
    // Ne doit PAS matcher un autre répertoire
    expect(matchesRule('cd documents', rule)).toBe(false);
    expect(matchesRule('cd homework', rule)).toBe(false);
  });

  test('guillemets ignorés (echo "hello" == echo hello)', () => {
    expect(matchesRule('echo "hello"', { type: 'command', value: 'echo hello' })).toBe(true);
    expect(matchesRule("echo 'world'", { type: 'command', value: 'echo world' })).toBe(true);
  });

  test('ls : normalisation des flags — ordre indifférent (niveau 57)', () => {
    const rule = { type: 'command' as const, value: 'ls -la' };
    // Ordre inversé
    expect(matchesRule('ls -al', rule)).toBe(true);
    // Flags séparés
    expect(matchesRule('ls -l -a', rule)).toBe(true);
    // Avec un chemin en plus
    expect(matchesRule('ls -la /tmp', rule)).toBe(true);
    expect(matchesRule('ls -al /tmp', rule)).toBe(true);
    // ls -l seul NE suffit PAS (manque -a)
    expect(matchesRule('ls -l', rule)).toBe(false);
    // ls bare NE suffit PAS
    expect(matchesRule('ls', rule)).toBe(false);
    // Règle bare "ls" accepte toujours toute variante avec argument
    expect(matchesRule('ls -al', { type: 'command', value: 'ls' })).toBe(true);
    expect(matchesRule('ls -la', { type: 'command', value: 'ls' })).toBe(true);
  });

  test('nmap avec différentes options', () => {
    expect(matchesRule('nmap -sV 10.0.0.5', { type: 'command', value: 'nmap -sV' })).toBe(true);
    expect(matchesRule('nmap -sV -sC 10.0.0.5', { type: 'command', value: 'nmap -sV' })).toBe(true);
    expect(matchesRule('nmap 10.0.0.5', { type: 'command', value: 'nmap -sV' })).toBe(false);
  });

  test('find avec options de permissions SUID', () => {
    const rule = { type: 'command' as const, value: 'find / -perm -4000' };
    expect(matchesRule('find / -perm -4000 -type f 2>/dev/null', rule)).toBe(true);
    expect(matchesRule('find / -perm -4000', rule)).toBe(true);
    expect(matchesRule('find /tmp -perm -4000', rule)).toBe(false);
  });

  test('sudo -l pour audit privesc', () => {
    expect(matchesRule('sudo -l', { type: 'command', value: 'sudo -l' })).toBe(true);
    expect(matchesRule('sudo -la', { type: 'command', value: 'sudo -l' })).toBe(true);
    expect(matchesRule('sudo ls', { type: 'command', value: 'sudo -l' })).toBe(false);
  });

  test('cat avec chemin absolu', () => {
    expect(matchesRule('cat /root/flag.txt', { type: 'command', value: 'cat /root/flag.txt' })).toBe(true);
    expect(matchesRule('cat /root/flag.txt', { type: 'command', value: 'cat' })).toBe(true);
  });

  test('grep avec pipe', () => {
    const rule = { type: 'command' as const, value: 'grep' };
    expect(matchesRule('cat auth.log | grep Failed', rule)).toBe(true);
    expect(matchesRule('grep Failed auth.log | wc -l', rule)).toBe(true);
  });

  test('curl -I pour inspection de headers', () => {
    expect(matchesRule('curl -I http://10.0.0.5', { type: 'command', value: 'curl -I' })).toBe(true);
    expect(matchesRule('curl http://10.0.0.5', { type: 'command', value: 'curl -I' })).toBe(false);
  });

  test('ssh port forwarding', () => {
    const rule = { type: 'command' as const, value: 'ssh -L' };
    expect(matchesRule('ssh -L 3306:10.20.20.5:3306 user@host', rule)).toBe(true);
    expect(matchesRule('ssh user@host', rule)).toBe(false);
  });

  test('openssl inspection TLS', () => {
    expect(matchesRule('openssl s_client -connect host:443', {
      type: 'command', value: 'openssl s_client',
    })).toBe(true);
  });
});

describe('matchesRule — commandes forensic', () => {
  test('grep sur auth.log', () => {
    const rule = { type: 'command' as const, value: 'grep Failed auth.log' };
    expect(matchesRule('grep Failed auth.log', rule)).toBe(true);
    expect(matchesRule('grep Failed auth.log | wc -l', rule)).toBe(true);
    expect(matchesRule('grep "Failed" auth.log', rule)).toBe(true); // guillemets ignorés par normalise()
  });

  test('dig axfr zone transfer', () => {
    const rule = { type: 'command' as const, value: 'dig axfr' };
    expect(matchesRule('dig axfr target.local @10.0.0.100', rule)).toBe(true);
    expect(matchesRule('dig target.local', rule)).toBe(false);
  });
});

// ── Tests cleanBuffer ─────────────────────────────────────────────────────────

describe('cleanBuffer — nettoyage du buffer de saisie', () => {
  test('chaîne normale inchangée', () => {
    expect(cleanBuffer('ls -la')).toBe('ls -la');
    expect(cleanBuffer('cat /etc/passwd')).toBe('cat /etc/passwd');
  });

  test('espaces en début/fin supprimés', () => {
    expect(cleanBuffer('  ls  ')).toBe('ls');
  });

  test('backspace (0x7f) supprime le dernier caractère', () => {
    expect(cleanBuffer('lss\x7f')).toBe('ls');
    expect(cleanBuffer('cat\x7f\x7f\x7f')).toBe('');
    expect(cleanBuffer('echo\x7f\x7f hello')).toBe('ec hello');
  });

  test('séquences d\'échappement (touches flèches) ignorées', () => {
    // Flèche haut = ESC [ A
    expect(cleanBuffer('\x1b[Als')).toBe('ls');
    expect(cleanBuffer('ls\x1b[C\x1b[D-la')).toBe('ls-la');
  });

  test('Ctrl+C (0x03) remet le buffer à zéro', () => {
    expect(cleanBuffer('ls -la\x03')).toBe('');
    expect(cleanBuffer('some cmd\x03new cmd')).toBe('new cmd');
  });

  test('Ctrl+U (0x15) remet le buffer à zéro', () => {
    expect(cleanBuffer('typo\x15correct')).toBe('correct');
  });

  test('chaîne vide', () => {
    expect(cleanBuffer('')).toBe('');
    expect(cleanBuffer('   ')).toBe('');
  });
});

// ── Tests de pipeline de validation ──────────────────────────────────────────

describe('pipeline de validation complet', () => {
  interface WsState {
    _validations: ValidationRule[];
    _completedValidations: Set<number>;
  }

  function simulateValidation(ws: WsState, rawInput: string): number[] {
    const cmd = cleanBuffer(rawInput);
    const newly: number[] = [];
    if (!cmd) return newly;

    for (let i = 0; i < ws._validations.length; i++) {
      if (ws._completedValidations.has(i)) continue;
      if (matchesRule(cmd, ws._validations[i])) {
        ws._completedValidations.add(i);
        newly.push(i);
      }
    }
    return newly;
  }

  test('niveau 1 : ls valide avec ou sans argument (whitelist)', () => {
    const ws: WsState = {
      _validations: [{ type: 'command', value: 'ls', description: 'Lister les fichiers' }],
      _completedValidations: new Set(),
    };
    expect(simulateValidation(ws, 'ls')).toEqual([0]);       // whitelist → validé
    expect(simulateValidation(ws, 'ls')).toEqual([]);        // déjà validé → pas de doublon
  });

  test('niveau multi-validation : toutes les étapes requises', () => {
    const ws: WsState = {
      _validations: [
        { type: 'command', value: 'ls', description: 'Lister les fichiers' },
        { type: 'command', value: 'cat', description: 'Lire un fichier' },
        { type: 'command', value: 'grep', description: 'Chercher un pattern' },
      ],
      _completedValidations: new Set(),
    };

    expect(simulateValidation(ws, 'ls -la')).toEqual([0]);
    expect(ws._completedValidations.size).toBe(1);

    expect(simulateValidation(ws, 'cat fichier.txt')).toEqual([1]);
    expect(ws._completedValidations.size).toBe(2);

    expect(simulateValidation(ws, 'grep motif fichier.txt')).toEqual([2]);
    expect(ws._completedValidations.size).toBe(3);
  });

  test('commande non pertinente ne valide rien', () => {
    const ws: WsState = {
      _validations: [{ type: 'command', value: 'cat', description: 'Lire' }],
      _completedValidations: new Set(),
    };
    expect(simulateValidation(ws, 'ls -la')).toEqual([]);
    expect(simulateValidation(ws, 'pwd')).toEqual([]);
    expect(simulateValidation(ws, 'echo hello')).toEqual([]);
  });

  test('commande avec typo corrigée par backspace', () => {
    const ws: WsState = {
      _validations: [{ type: 'command', value: 'cat', description: 'Lire' }],
      _completedValidations: new Set(),
    };
    // Tape "catt" (doublon du t), backspace → "cat", puis " fichier.txt"
    expect(simulateValidation(ws, 'catt\x7f fichier.txt')).toEqual([0]);
  });

  test('ordre de saisie ne force pas l\'ordre des validations', () => {
    const ws: WsState = {
      _validations: [
        { type: 'command', value: 'find', description: 'Trouver des fichiers' },
        { type: 'command', value: 'ls', description: 'Lister' },
      ],
      _completedValidations: new Set(),
    };
    // Valide la deuxième règle en premier
    expect(simulateValidation(ws, 'ls -la')).toEqual([1]);
    expect(simulateValidation(ws, 'find / -name test')).toEqual([0]);
  });

  test('pipe valide les deux côtés si les deux règles correspondent', () => {
    const ws: WsState = {
      _validations: [
        { type: 'command', value: 'grep', description: 'Chercher' },
      ],
      _completedValidations: new Set(),
    };
    expect(simulateValidation(ws, 'cat auth.log | grep Failed')).toEqual([0]);
  });
});
