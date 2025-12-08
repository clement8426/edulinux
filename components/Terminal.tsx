'use client';

import { useState, useEffect, useRef } from 'react';
import { Level } from '@/data/levels';

interface TerminalProps {
  level: Level;
  onSuccess: () => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success';
  content: string;
}

export default function Terminal({ level, onSuccess }: TerminalProps) {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('~');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [completedValidations, setCompletedValidations] = useState<Set<number>>(new Set());
  const [showCopyButton, setShowCopyButton] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Message de bienvenue
    setHistory([
      { type: 'output', content: `🎮 ${level.story || 'Commence ta mission...'}` },
      { type: 'output', content: '' },
      { type: 'output', content: `📋 Objectif : ${level.objective}` },
      { type: 'output', content: `💡 ${level.description}` },
      { type: 'output', content: '' },
    ]);
    setCompletedValidations(new Set());
  }, [level]);

  useEffect(() => {
    // Auto-scroll
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Focus input après chaque rendu
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [history]);

  useEffect(() => {
    // Focus input au montage
    setTimeout(() => {
      inputRef.current?.focus();
    }, 200);
  }, []);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setHistory(prev => [...prev, { type, content }]);
  };

  const simulateCommand = (cmd: string): string[] => {
    const trimmedCmd = cmd.trim();
    
    // Echo
    if (trimmedCmd === 'echo' || trimmedCmd.startsWith('echo ')) {
      if (trimmedCmd === 'echo') {
        return ['(empty line)'];
      }
      const text = trimmedCmd.substring(5).replace(/['"]/g, '');
      return [text];
    }

    // ls
    if (trimmedCmd === 'ls' || trimmedCmd.startsWith('ls ')) {
      // Obtenir le filesystem du répertoire actuel
      let currentFs: any = level.fileSystem;
      const pathParts = currentPath === '~' ? [] : currentPath.replace('~/', '').split('/').filter(p => p);
      
      // Naviguer dans le filesystem jusqu'au répertoire actuel
      for (const part of pathParts) {
        if (currentFs[part] && typeof currentFs[part] === 'object') {
          currentFs = currentFs[part];
        } else {
          return [`ls: cannot access '${currentPath}': No such file or directory`];
        }
      }
      
      const files = Object.keys(currentFs);
      if (files.length === 0) return ['(empty directory)'];
      return files;
    }

    // pwd
    if (trimmedCmd === 'pwd') {
      return [currentPath];
    }

    // cat
    if (trimmedCmd.startsWith('cat ')) {
      const filename = trimmedCmd.substring(4).trim();
      
      // Obtenir le filesystem du répertoire actuel
      let currentFs: any = level.fileSystem;
      const pathParts = currentPath === '~' ? [] : currentPath.replace('~/', '').split('/').filter(p => p);
      
      // Naviguer dans le filesystem jusqu'au répertoire actuel
      for (const part of pathParts) {
        if (currentFs[part] && typeof currentFs[part] === 'object') {
          currentFs = currentFs[part];
        } else {
          return [`cat: ${filename}: No such file or directory`];
        }
      }
      
      // Chercher le fichier dans le répertoire actuel ou absolu
      let content: any = null;
      if (filename.includes('/')) {
        // Chemin absolu ou relatif
        const fileParts = filename.split('/').filter(p => p);
        let fileFs: any = level.fileSystem;
        for (let i = 0; i < fileParts.length - 1; i++) {
          if (fileFs[fileParts[i]] && typeof fileFs[fileParts[i]] === 'object') {
            fileFs = fileFs[fileParts[i]];
          } else {
            return [`cat: ${filename}: No such file or directory`];
          }
        }
        content = fileFs[fileParts[fileParts.length - 1]];
      } else {
        // Fichier dans le répertoire actuel
        content = currentFs[filename];
      }
      
      if (typeof content === 'string') {
        return [content];
      }
      return [`cat: ${filename}: No such file or directory`];
    }

    // cd
    if (trimmedCmd.startsWith('cd ')) {
      const path = trimmedCmd.substring(3).trim();
      
      // cd sans argument ou cd ~
      if (!path || path === '~' || path === '') {
        setCurrentPath('~');
        return [];
      }
      
      // cd ..
      if (path === '..') {
        setCurrentPath(prev => {
          if (prev === '~') return '~';
          // Enlever le ~ du début et split
          const parts = prev.replace(/^~\/?/, '').split('/').filter(p => p);
          parts.pop();
          return parts.length > 0 ? '~/' + parts.join('/') : '~';
        });
        return [];
      }
      
      // Navigation relative depuis le chemin actuel
      const currentParts = currentPath === '~' ? [] : currentPath.replace('~/', '').split('/').filter(p => p);
      const targetParts = path.split('/').filter(p => p);
      
      // Résoudre le chemin
      let resolvedParts: string[] = [];
      if (path.startsWith('/') || path.startsWith('~/')) {
        // Chemin absolu
        resolvedParts = path.replace(/^~\/?/, '').split('/').filter(p => p);
      } else {
        // Chemin relatif
        resolvedParts = [...currentParts];
        for (const part of targetParts) {
          if (part === '..') {
            resolvedParts.pop();
          } else if (part !== '.' && part !== '') {
            resolvedParts.push(part);
          }
        }
      }
      
      // Vérifier si le chemin existe dans le filesystem
      let currentFs: any = level.fileSystem;
      for (const part of resolvedParts) {
        if (currentFs[part] && typeof currentFs[part] === 'object') {
          currentFs = currentFs[part];
        } else {
          return [`cd: ${path}: No such file or directory`];
        }
      }
      
      // Mettre à jour le chemin
      setCurrentPath(resolvedParts.length > 0 ? '~/' + resolvedParts.join('/') : '~');
      return [];
    }

    // grep
    if (trimmedCmd.includes('grep')) {
      const parts = trimmedCmd.split(' ');
      const searchTerm = parts[1]?.replace(/['"]/g, '');
      const filename = parts[2];
      
      if (filename && level.fileSystem[filename]) {
        const content = level.fileSystem[filename] as string;
        const lines = content.split('\n').filter(line => 
          line.toLowerCase().includes(searchTerm?.toLowerCase() || '')
        );
        return lines.length > 0 ? lines : [`grep: no match found`];
      }
    }

    // find
    if (trimmedCmd.startsWith('find')) {
      const files: string[] = [];
      const searchName = trimmedCmd.match(/-name\s+['"]?(\S+)['"]?/)?.[1];
      
      const searchFiles = (fs: any, path: string = '.') => {
        Object.keys(fs).forEach(key => {
          const fullPath = `${path}/${key}`;
          if (searchName && key.includes(searchName.replace('*', ''))) {
            files.push(fullPath);
          }
          if (typeof fs[key] === 'object') {
            searchFiles(fs[key], fullPath);
          }
        });
      };
      
      searchFiles(level.fileSystem);
      return files.length > 0 ? files : ['find: no files found'];
    }

    // chmod
    if (trimmedCmd.startsWith('chmod ')) {
      return [`chmod: permissions changed successfully`];
    }

    // base64
    if (trimmedCmd.includes('base64 -d') || trimmedCmd.includes('base64 --decode')) {
      if (trimmedCmd.includes('|')) {
        const input = trimmedCmd.split('|')[0].trim();
        if (input.includes('cat ')) {
          const filename = input.split('cat ')[1].trim();
          const content = level.fileSystem[filename];
          if (typeof content === 'string') {
            try {
              const decoded = atob(content);
              return [
                decoded,
                '',
                '✅ Message décodé avec succès !',
                `📝 Texte décodé : "${decoded}"`
              ];
            } catch {
              return ['base64: invalid input'];
            }
          }
        }
      }
      // Si on fait base64 -d directement sur un fichier
      if (trimmedCmd.includes('base64 -d ') && !trimmedCmd.includes('|')) {
        const parts = trimmedCmd.split('base64 -d ');
        if (parts.length > 1) {
          const filename = parts[1].trim();
          const content = level.fileSystem[filename];
          if (typeof content === 'string') {
            try {
              const decoded = atob(content);
              return [
                decoded,
                '',
                '✅ Message décodé avec succès !',
                `📝 Texte décodé : "${decoded}"`
              ];
            } catch {
              return ['base64: invalid input'];
            }
          }
        }
      }
      return ['base64: pipe content to decode (ex: cat file.txt | base64 -d)'];
    }

    // ssh
    if (trimmedCmd.startsWith('ssh ')) {
      // Extraire les informations de la commande SSH
      const sshMatch = trimmedCmd.match(/ssh\s+(\S+)@(\S+)(?:\s+-p\s+(\d+))?/);
      
      if (!sshMatch) {
        return ['ssh: usage: ssh [user]@[host] [-p port]'];
      }
      
      const [, user, host, port] = sshMatch;
      const portNum = port ? parseInt(port) : 22;
      
      // Vérifier si c'est la bonne connexion (pour le niveau 10)
      if (level.id === 10) {
        if (user === 'admin' && host === 'backup.edulinux.local' && portNum === 2222) {
          return [
            '🔐 Connexion SSH à backup.edulinux.local...',
            'The authenticity of host \'backup.edulinux.local (192.168.1.100)\' can\'t be established.',
            'ECDSA key fingerprint is SHA256:AbCdEf123456...',
            'Are you sure you want to continue connecting (yes/no)? [yes]',
            '',
            'Warning: Permanently added \'backup.edulinux.local\' to the list of known hosts.',
            'admin@backup.edulinux.local\'s password: [password entered]',
            '',
            '✅ Authentification réussie !',
            'Welcome to EduLinux Backup Server',
            'Last login: Mon Dec  8 14:23:15 2024 from 192.168.1.50',
            '',
            'admin@backup:~$'
          ];
        } else {
          return [
            `🔐 Tentative de connexion SSH à ${host}...`,
            `ssh: connect to host ${host} port ${portNum || 22}: Connection refused`,
            '❌ Connexion échouée. Vérifie les informations dans instructions.txt'
          ];
        }
      }
      
      // Pour les autres niveaux, connexion générique
      return [
        `🔐 Connexion SSH à ${host}...`,
        `✅ Authentification réussie !`,
        `Connecté en tant que ${user}`
      ];
    }

    // export
    if (trimmedCmd.startsWith('export ')) {
      return [`✅ Variable d'environnement définie`];
    }

    // tar
    if (trimmedCmd.includes('tar ') && trimmedCmd.includes('-x')) {
      return ['📦 Extraction de l\'archive...', '✅ Fichiers extraits avec succès'];
    }

    // wget / curl
    if (trimmedCmd.startsWith('wget ') || trimmedCmd.startsWith('curl ')) {
      return ['🌐 Téléchargement...', '✅ Fichier téléchargé'];
    }

    // scan (custom command)
    if (trimmedCmd.startsWith('scan ')) {
      return [
        '🛰️  Scanning target...',
        'PORT     STATE   SERVICE',
        '22/tcp   open    ssh',
        '80/tcp   open    http',
        '443/tcp  open    https',
        '8080/tcp open    http-proxy'
      ];
    }

    // sudo
    if (trimmedCmd.startsWith('sudo ')) {
      const innerCmd = trimmedCmd.substring(5);
      return ['[sudo] 🔑 Elevated privileges granted', ...simulateCommand(innerCmd)];
    }

    // ssh-keygen
    if (trimmedCmd.includes('ssh-keygen')) {
      return [
        '🔐 Generating SSH key pair...',
        '✅ Your public key has been saved in ~/.ssh/id_rsa.pub'
      ];
    }

    // md5, sha256
    if (trimmedCmd.includes('md5') || trimmedCmd.includes('sha256')) {
      return ['5d41402abc4b2a76b9719d911017c592'];
    }

    // sed
    if (trimmedCmd.includes('sed ')) {
      return ['✅ Text substitution completed'];
    }

    // ps
    if (trimmedCmd === 'ps' || trimmedCmd.startsWith('ps ')) {
      return [
        'PID   USER     COMMAND',
        '1234  user     /bin/bash',
        '5678  user     malicious_process',
        '9012  user     systemd'
      ];
    }

    // kill
    if (trimmedCmd.startsWith('kill ')) {
      return ['✅ Process terminated'];
    }

    // scp
    if (trimmedCmd.startsWith('scp ')) {
      return ['📡 Transferring file...', '✅ Transfer complete'];
    }

    // tree
    if (trimmedCmd === 'tree' || trimmedCmd.startsWith('tree ')) {
      const getTree = (fs: any, prefix: string = '', isLast: boolean = true, depth: number = 0, maxDepth: number = 10): string[] => {
        if (depth > maxDepth) return [];
        
        const lines: string[] = [];
        const entries = Object.keys(fs).sort();
        
        entries.forEach((key, index) => {
          const isLastEntry = index === entries.length - 1;
          const currentPrefix = prefix + (isLast ? '└── ' : '├── ');
          lines.push(currentPrefix + key);
          
          if (typeof fs[key] === 'object' && fs[key] !== null) {
            const nextPrefix = prefix + (isLast ? '    ' : '│   ');
            lines.push(...getTree(fs[key], nextPrefix, isLastEntry, depth + 1, maxDepth));
          }
        });
        
        return lines;
      };
      
      // Obtenir le filesystem du répertoire actuel
      let currentFs: any = level.fileSystem;
      const pathParts = currentPath === '~' ? [] : currentPath.replace('~/', '').split('/').filter(p => p);
      
      // Naviguer dans le filesystem jusqu'au répertoire actuel
      for (const part of pathParts) {
        if (currentFs[part] && typeof currentFs[part] === 'object') {
          currentFs = currentFs[part];
        } else {
          return [`tree: ${currentPath}: No such file or directory`];
        }
      }
      
      const treeLines = getTree(currentFs);
      return treeLines.length > 0 ? treeLines : ['.'];
    }

    // Commande inconnue
    return [`Command not found: ${trimmedCmd.split(' ')[0]}. Type 'help' for available commands.`];
  };

  const validateCommand = (cmd: string) => {
    const newCompleted = new Set(completedValidations);
    let hasNewValidation = false;

    level.validation.forEach((rule, index) => {
      if (completedValidations.has(index)) return;

      if (rule.type === 'command') {
        // Normaliser la commande (enlever guillemets, espaces multiples, etc.)
        const normalizedCmd = cmd.toLowerCase()
          .replace(/['"]/g, '')  // Enlever guillemets
          .replace(/\s+/g, ' ')  // Normaliser espaces
          .trim();
        
        const normalizedRule = rule.value.toLowerCase()
          .replace(/['"]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Vérifier si la commande contient les mots-clés de la validation
        const ruleWords = normalizedRule.split(' ').filter(w => w.length > 0);
        const cmdWords = normalizedCmd.split(' ').filter(w => w.length > 0);
        
        // Vérifier que tous les mots-clés importants sont présents
        const allKeywordsPresent = ruleWords.every(word => 
          normalizedCmd.includes(word) || cmdWords.some(cw => cw.includes(word) || word.includes(cw))
        );
        
        if (allKeywordsPresent && normalizedCmd.includes(ruleWords[0])) {
          newCompleted.add(index);
          hasNewValidation = true;
          addLine('success', `✅ ${rule.description || `Commande validée : ${rule.value}`}`);
        }
      }
    });

    setCompletedValidations(newCompleted);

    // Vérifier si toutes les validations sont complétées
    if (newCompleted.size === level.validation.length && newCompleted.size > 0) {
      setTimeout(() => {
        addLine('success', '');
        addLine('success', '🎉 NIVEAU COMPLÉTÉ ! 🎉');
        addLine('success', '🏆 Tu as maîtrisé : ' + level.title);
        addLine('success', '');
        setTimeout(() => onSuccess(), 2000);
      }, 500);
    }

    return hasNewValidation;
  };

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    // Ajouter à l'historique
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    // Afficher la commande
    addLine('input', `$ ${cmd}`);

    // Simuler et afficher le résultat
    const output = simulateCommand(cmd);
    output.forEach(line => {
      if (line.includes('not found') || line.includes('No such file')) {
        addLine('error', line);
      } else {
        addLine('output', line);
      }
    });

    // Valider
    validateCommand(cmd);

    setCurrentInput('');
  };

  const getAutocompleteSuggestions = (input: string): string[] => {
    if (!input.trim()) return [];
    
    // Obtenir le filesystem du répertoire actuel
    let currentFs: any = level.fileSystem;
    const pathParts = currentPath === '~' ? [] : currentPath.replace('~/', '').split('/').filter(p => p);
    
    // Naviguer dans le filesystem jusqu'au répertoire actuel
    for (const part of pathParts) {
      if (currentFs[part] && typeof currentFs[part] === 'object') {
        currentFs = currentFs[part];
      } else {
        return [];
      }
    }
    
    const availableItems = Object.keys(currentFs);
    const lowerInput = input.toLowerCase();
    
    return availableItems.filter(item => 
      item.toLowerCase().startsWith(lowerInput)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      // Autocomplétion
      const words = currentInput.trim().split(/\s+/);
      const lastWord = words[words.length - 1] || '';
      
      // Si on est dans une commande (cd, cat, ls, etc.)
      if (words.length > 1) {
        const command = words[0];
        const suggestions = getAutocompleteSuggestions(lastWord);
        
        if (suggestions.length === 1) {
          // Une seule suggestion : compléter automatiquement
          words[words.length - 1] = suggestions[0];
          setCurrentInput(words.join(' ') + ' ');
        } else if (suggestions.length > 1) {
          // Plusieurs suggestions : afficher les options
          const commonPrefix = suggestions.reduce((prefix, suggestion) => {
            let i = 0;
            while (i < prefix.length && i < suggestion.length && 
                   prefix[i].toLowerCase() === suggestion[i].toLowerCase()) {
              i++;
            }
            return prefix.substring(0, i);
          }, suggestions[0]);
          
          if (commonPrefix.length > lastWord.length) {
            // Compléter avec le préfixe commun
            words[words.length - 1] = commonPrefix;
            setCurrentInput(words.join(' '));
          } else {
            // Afficher toutes les suggestions
            addLine('output', suggestions.join('  '));
          }
        }
      } else {
        // Autocomplétion des commandes
        const commands = ['echo', 'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'chmod', 'base64', 'ssh', 'export', 'tar', 'wget', 'curl', 'scan', 'sudo', 'ssh-keygen', 'md5', 'sha256sum', 'sed', 'ps', 'kill', 'scp', 'tree', 'less', 'head', 'tail', 'sort', 'uniq', 'wc', 'cut'];
        const matchingCommands = commands.filter(cmd => 
          cmd.toLowerCase().startsWith(lastWord.toLowerCase())
        );
        
        if (matchingCommands.length === 1) {
          setCurrentInput(matchingCommands[0] + ' ');
        } else if (matchingCommands.length > 1) {
          const commonPrefix = matchingCommands.reduce((prefix, cmd) => {
            let i = 0;
            while (i < prefix.length && i < cmd.length && 
                   prefix[i].toLowerCase() === cmd[i].toLowerCase()) {
              i++;
            }
            return prefix.substring(0, i);
          }, matchingCommands[0]);
          
          if (commonPrefix.length > lastWord.length) {
            setCurrentInput(commonPrefix);
          } else {
            addLine('output', matchingCommands.join('  '));
          }
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-cyan-300 font-semibold';
      case 'error': return 'text-red-400 font-semibold';
      case 'success': return 'text-green-400 font-semibold';
      default: return 'text-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl backdrop-blur-sm">
      {/* Terminal Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-4 py-3 flex items-center gap-3 border-b border-cyan-500/30 shadow-lg">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></div>
        </div>
        <span className="text-cyan-300 text-sm ml-4 font-mono font-semibold">terminal@edulinux:<span className="text-cyan-500">{currentPath}</span></span>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-6 font-mono text-sm bg-gray-950/50 relative group"
        onMouseEnter={() => setShowCopyButton(true)}
        onMouseLeave={() => setShowCopyButton(false)}
        style={{ scrollbarWidth: 'thin', userSelect: 'text' }}
      >
        {/* Copy Button */}
        {showCopyButton && (
          <button
            onClick={() => {
              const text = history.map(line => line.content).join('\n');
              navigator.clipboard.writeText(text).then(() => {
                addLine('success', '📋 Contenu copié dans le presse-papiers !');
                setTimeout(() => {
                  setHistory(prev => prev.slice(0, -1));
                }, 2000);
              });
            }}
            className="absolute top-4 right-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-semibold border border-cyan-500/30 backdrop-blur-sm transition-all z-20"
            title="Copier tout le contenu du terminal"
          >
            📋 Copier
          </button>
        )}
        {history.map((line, index) => (
          <div 
            key={index} 
            className={`${getLineColor(line.type)} whitespace-pre-wrap select-text cursor-text`}
            onDoubleClick={(e) => {
              // Sélectionner tout le texte de la ligne au double-clic
              const range = document.createRange();
              range.selectNodeContents(e.currentTarget);
              const selection = window.getSelection();
              selection?.removeAllRanges();
              selection?.addRange(range);
            }}
          >
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div 
          className="flex items-center text-cyan-400 mt-2 relative z-10"
          onClick={(e) => {
            // Si on clique sur l'input, focus dessus
            if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'SPAN') {
              inputRef.current?.focus();
            }
          }}
        >
          <span className="mr-2 font-bold select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono text-sm w-full"
            autoFocus
            spellCheck={false}
            style={{ caretColor: '#22d3ee' }}
            placeholder="Tape ta commande ici..."
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Hints Section */}
      {level.hints.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-t border-purple-500/30 p-4 backdrop-blur-sm">
          <details className="text-gray-200 text-sm">
            <summary className="cursor-pointer hover:text-cyan-300 font-semibold flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span>Indices ({level.hints.length})</span>
            </summary>
            <ul className="mt-3 space-y-2 ml-6">
              {level.hints.map((hint, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">→</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

