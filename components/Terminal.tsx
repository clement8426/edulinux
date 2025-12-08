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
  }, [history]);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setHistory(prev => [...prev, { type, content }]);
  };

  const simulateCommand = (cmd: string): string[] => {
    const trimmedCmd = cmd.trim();
    
    // Echo
    if (trimmedCmd.startsWith('echo ')) {
      const text = trimmedCmd.substring(5).replace(/['"]/g, '');
      return [text];
    }

    // ls
    if (trimmedCmd === 'ls' || trimmedCmd.startsWith('ls ')) {
      const files = Object.keys(level.fileSystem);
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
      const content = level.fileSystem[filename];
      if (typeof content === 'string') {
        return [content];
      }
      return [`cat: ${filename}: No such file or directory`];
    }

    // cd
    if (trimmedCmd.startsWith('cd ')) {
      const path = trimmedCmd.substring(3).trim();
      if (path === '..') {
        setCurrentPath(prev => {
          const parts = prev.split('/');
          parts.pop();
          return parts.length > 0 ? parts.join('/') : '~';
        });
        return [];
      }
      if (level.fileSystem[path]) {
        setCurrentPath(`${currentPath}/${path}`);
        return [];
      }
      return [`cd: ${path}: No such file or directory`];
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
              return [atob(content)];
            } catch {
              return ['base64: invalid input'];
            }
          }
        }
      }
      return ['base64: pipe content to decode'];
    }

    // ssh
    if (trimmedCmd.startsWith('ssh ')) {
      return ['🔐 Connexion SSH simulée...', '✅ Authentification réussie !'];
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

    // Commande inconnue
    return [`Command not found: ${trimmedCmd.split(' ')[0]}. Type 'help' for available commands.`];
  };

  const validateCommand = (cmd: string) => {
    const newCompleted = new Set(completedValidations);
    let hasNewValidation = false;

    level.validation.forEach((rule, index) => {
      if (completedValidations.has(index)) return;

      if (rule.type === 'command') {
        if (cmd.toLowerCase().includes(rule.value.toLowerCase())) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
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
      case 'input': return 'text-cyan-400';
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-gray-400 text-sm ml-4">terminal@edulinux: {currentPath}</span>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, index) => (
          <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center text-cyan-400 mt-2">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            autoFocus
            spellCheck={false}
          />
        </div>
      </div>

      {/* Hints Section */}
      {level.hints.length > 0 && (
        <div className="bg-gray-800 border-t border-gray-700 p-3">
          <details className="text-gray-400 text-sm">
            <summary className="cursor-pointer hover:text-gray-300">💡 Indices ({level.hints.length})</summary>
            <ul className="mt-2 space-y-1 ml-4">
              {level.hints.map((hint, index) => (
                <li key={index} className="text-xs">→ {hint}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}

