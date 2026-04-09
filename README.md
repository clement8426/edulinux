# EduLinux

Interactive Linux learning platform with a real embedded terminal. Inspired by HackTheBox and OverTheWire/Bandit.

---

## Overview

EduLinux runs a real `bash` shell in the browser — no simulation, no fake output. Each exercise spins up an isolated filesystem, validates commands by intercepting what bash actually executed (not keystrokes), and gives the user full freedom to explore before advancing.

**100 levels · 7 scenarios · real terminal · real validation**

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript 5 + Tailwind CSS 4 |
| Terminal | xterm.js (`@xterm/xterm`) |
| Shell | node-pty (real bash via PTY) |
| Transport | WebSocket (`ws`) |
| Server | Custom Node.js HTTP + WS server |
| Tests | Jest + ts-jest |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (Next.js + WebSocket on port 3000)
npm run dev
```

If port 3000 is already in use:

```bash
lsof -ti :3000 | xargs kill -9 2>/dev/null; npm run dev
```

Build for production:

```bash
npm run build
npm start
```

---

## Architecture

```
edulinux/
├── server.js              # Custom Node.js server (Next.js + WebSocket/PTY)
├── app/
│   ├── page.tsx           # Home
│   ├── levels/
│   │   ├── page.tsx       # Level browser
│   │   └── [id]/page.tsx  # Level runner
│   └── scenarios/
│       ├── page.tsx       # Scenario browser
│       └── [id]/page.tsx  # Scenario runner
├── components/
│   └── RealTerminal.tsx   # xterm.js component + WS client
├── data/
│   ├── levels.ts          # All 100 levels (content + validation rules)
│   └── scenarios.ts       # All 7 scenarios
├── hooks/
│   └── useProgress.ts     # Progress tracking (localStorage)
└── __tests__/
    ├── validation.test.ts # matchesRule() unit tests
    ├── levels.test.ts     # Data integrity checks
    └── scenarios.test.ts  # Scenario data integrity
```

### How the terminal works

1. Browser connects to `ws://localhost:3000/pty`
2. Server spawns a real `bash` process via `node-pty` in an isolated temp directory
3. Level filesystem is written to disk from `data/levels.ts`
4. A custom `.bashrc` injects `PROMPT_COMMAND` that sends each executed command back to the server via an invisible OSC escape sequence (`\x1b]777;CMD\x07`)
5. The server strips the OSC sequence from PTY output before forwarding to xterm.js — it is invisible to the user
6. `matchesRule()` validates the intercepted command against the level's rules
7. When all objectives are complete, the user types `ok` to advance

This approach captures **what bash actually executed** — not raw keystrokes — so tab-completion, aliases, and multi-segment paths all validate correctly.

---

## Content

### Levels (100 total)

| Chapter | Levels | Topics |
|---|---|---|
| Linux Fondamentaux | 1–10 | Navigation, fichiers, permissions, redirections |
| Système | 11–20 | Processus, services, variables, scripting |
| Réseau | 21–30 | SSH, netstat, curl, analyse de trafic |
| Administration | 31–40 | Users, cron, logs, sudo |
| Sécurité Système | 41–50 | SUID, capabilities, ACL, audit |
| Forensic Linux | 51–60 | Analyse de logs, artefacts, réponse à incident |
| Reconnaissance | 61–70 | nmap, dig, DNS, OSINT, web enumeration |
| Hacking & PrivEsc | 71–80 | Exploitation, privilege escalation, persistence |
| Bash Avancé | 81–90 | Boucles, fonctions, regex, awk, sed, trap |
| CTF Challenges | 91–100 | Stéganographie, encodages, hash, Docker escape |

### Scenarios (7 missions)

Real-world missions requiring chained knowledge — no hand-holding.

| # | Title | Category |
|---|---|---|
| 1 | Incident SSH : Brute-Force & Accès Non Autorisé | Forensic |
| 2 | Serveur Web Compromis : Webshell & Exfiltration | Forensic |
| 3 | Cartographie Réseau : Découverte d'un Réseau Interne | Réseau |
| 4 | Pentest Phase 1 : Reconnaissance complète | Pentest |
| 5 | Privilege Escalation : De user à root | Hacking |
| 6 | Forensic Avancé : Infrastructure Compromise | Forensic |
| 7 | Pentest Avancé : VLAN, DMZ & Pivot | Pentest |

---

## Validation

Commands are validated by `matchesRule()` in `server.js`. Key behaviors:

- **Quotes are stripped** — `echo "hello"` and `echo hello` are equivalent
- **Trailing slashes ignored** — `cd documents/` validates `cd documents`
- **`cd` destination matching** — `cd work` validates `cd home/user/documents/work` (step-by-step or one-shot)
- **`ls` flags order-independent** — `ls -al` and `ls -l -a` both validate `ls -la`
- **Redirect/pipe operators** — rule `echo >` validates any `echo ... > file`; rule `|` validates any piped command; rule `>>` validates append redirections
- **Pipe chain support** — rule `grep` validates `cat auth.log | grep Failed`
- **Bare commands** — `pwd`, `id`, `whoami`, etc. validate without arguments; other commands require at least one argument

---

## Tests

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
```

98 tests across 3 suites:
- `validation.test.ts` — matchesRule() edge cases (44 tests)
- `levels.test.ts` — data integrity for all 100 levels
- `scenarios.test.ts` — data integrity for all 7 scenarios

---

## Adding a Level

Add an entry to the `levels` array in `data/levels.ts`:

```typescript
{
  id: 101,
  title: "Your Level Title",
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  category: "Category",
  objective: "One-line goal",
  description: "Markdown-supported description.",
  commands: ['cmd1', 'cmd2'],
  hints: ["Hint 1", "Hint 2"],
  fileSystem: {
    'readme.txt': 'File content here',
    'subdir': {
      'nested.txt': 'Nested content'
    }
  },
  validation: [
    { type: 'command', value: 'cat readme.txt', description: 'Read the file' }
  ],
  story: "Narrative context for the level."
}
```

Validation types: `command` (check executed command), `fileContent` (check file content), `fileExists` (check file existence).

---

## License

MIT
