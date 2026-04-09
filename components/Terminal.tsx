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

    // df
    if (trimmedCmd === 'df' || trimmedCmd.startsWith('df ')) {
      return [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/sda1        50G   18G   30G  38% /',
        '/dev/sda2       100G   72G   28G  72% /var',
        'tmpfs           2.0G  1.2M  2.0G   1% /dev/shm',
      ];
    }

    // du
    if (trimmedCmd.startsWith('du ')) {
      return [
        '420M\t/var/log',
        '12M\t/var/log/auth.log',
        '44M\t/var/log/syslog',
        '364M\t/var/log/kern.log',
      ];
    }

    // free
    if (trimmedCmd === 'free' || trimmedCmd.startsWith('free ')) {
      return [
        '               total        used        free      shared  buff/cache   available',
        'Mem:           7.8Gi       3.2Gi       1.1Gi       512Mi       3.5Gi       4.1Gi',
        'Swap:          2.0Gi       128Mi       1.9Gi',
      ];
    }

    // top
    if (trimmedCmd === 'top' || trimmedCmd.startsWith('top ')) {
      return [
        'top - 14:23:01 up 12 days,  3:42,  2 users,  load average: 1.23, 0.98, 0.87',
        'Tasks: 142 total,   2 running, 140 sleeping',
        '%Cpu(s): 23.4 us,  3.1 sy,  0.0 ni, 72.2 id,  1.3 wa',
        'MiB Mem:   7984.0 total,   1124.3 free,   3276.4 used,   3583.3 buff/cache',
        '',
        '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND',
        ' 1337 root      20   0  312476  45212   8932 R  45.2   0.6   2:34.12 crypto_miner',
        '  842 www-data  20   0  256948  32100   6420 S  12.1   0.4  14:22.01 nginx: worker',
        '  512 mysql     20   0 1024444 128000  12000 S   8.3   1.6  30:11.44 mysqld',
        ' 2345 student   20   0   22340   4556   3200 S   0.3   0.1   0:00.45 bash',
      ];
    }

    // env
    if (trimmedCmd === 'env') {
      return [
        'USER=student',
        'HOME=/home/student',
        'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        'SHELL=/bin/bash',
        'LANG=fr_FR.UTF-8',
        'TERM=xterm-256color',
        'EDITOR=vim',
      ];
    }

    // printenv
    if (trimmedCmd === 'printenv' || trimmedCmd.startsWith('printenv ')) {
      const varName = trimmedCmd.split(' ')[1];
      const vars: Record<string, string> = {
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        HOME: '/home/student',
        USER: 'student',
        SHELL: '/bin/bash',
        LANG: 'fr_FR.UTF-8',
      };
      if (varName && vars[varName]) return [vars[varName]];
      if (varName) return [`printenv: ${varName}: variable not found`];
      return Object.entries(vars).map(([k, v]) => `${k}=${v}`);
    }

    // journalctl
    if (trimmedCmd.startsWith('journalctl')) {
      return [
        '-- Journal begins at Mon 2024-01-15 00:00:01 UTC --',
        'Jan 15 14:00:01 server systemd[1]: Started Session 42 of user student.',
        'Jan 15 14:01:00 server sshd[1235]: Accepted publickey for student from 192.168.1.50',
        'Jan 15 14:02:00 server kernel: [12345.678] EXT4-fs (sda1): mounted filesystem',
        'Jan 15 14:03:00 server nginx[842]: 2024/01/15 14:03:00 [error] 842#842: *1 open() failed',
        'Jan 15 14:05:00 server systemd[1]: nginx.service: Main process exited, code=exited',
        'Jan 15 14:05:01 server systemd[1]: nginx.service: Failed with result exit-code',
        '⚠️ [simulation — journalctl réel nécessite un système avec systemd]',
      ];
    }

    // systemctl
    if (trimmedCmd.startsWith('systemctl')) {
      if (trimmedCmd.includes('status')) {
        const service = trimmedCmd.split('status')[1]?.trim() || 'system';
        return [
          `● ${service}.service - ${service} daemon`,
          '   Loaded: loaded (/lib/systemd/system/' + service + '.service; enabled)',
          '   Active: active (running) since Mon 2024-01-15 02:00:01 UTC; 12h ago',
          '  Process: 842 ExecStart=/usr/sbin/' + service + ' (code=exited, status=0)',
          ' Main PID: 842 (' + service + ')',
          '   CGroup: /system.slice/' + service + '.service',
          '           └─842 /usr/sbin/' + service,
        ];
      }
      if (trimmedCmd.includes('list-units')) {
        return [
          'UNIT                     LOAD   ACTIVE SUB     DESCRIPTION',
          'nginx.service            loaded active running A high performance web server',
          'ssh.service              loaded active running OpenBSD Secure Shell server',
          'mysql.service            loaded active running MySQL Community Server',
          'cron.service             loaded active running Regular background program processing daemon',
          'fail2ban.service         loaded active running Fail2Ban Service',
          '',
          'LOAD   = Reflects whether the unit definition was properly loaded.',
          'ACTIVE = The high-level unit activation state.',
        ];
      }
      return ['systemctl: commande simulée — résultat statique'];
    }

    // crontab
    if (trimmedCmd.startsWith('crontab')) {
      if (trimmedCmd.includes('-l')) {
        // Cherche si le niveau a des crons dans le filesystem
        const cronFile = level.fileSystem['cron_example.txt'] as string;
        if (cronFile) return cronFile.split('\n');
        return [
          '# Tâches cron de l\'utilisateur student',
          '0 * * * * /usr/bin/check_disk.sh',
          '30 2 * * 0 /opt/backup/full_backup.sh',
        ];
      }
      return ['crontab: utilise -l pour lister, -e pour éditer'];
    }

    // ip
    if (trimmedCmd.startsWith('ip ')) {
      if (trimmedCmd.includes('addr')) {
        return [
          '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536',
          '    link/loopback 00:00:00:00:00:00',
          '    inet 127.0.0.1/8 scope host lo',
          '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
          '    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff',
          '    inet 192.168.1.50/24 brd 192.168.1.255 scope global eth0',
          '    inet6 fe80::42:acff:fe11:2/64 scope link',
          '3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500',
          '    link/ether 02:42:0a:00:00:32 brd ff:ff:ff:ff:ff:ff',
          '    inet 10.0.0.50/24 brd 10.0.0.255 scope global eth1',
        ];
      }
      if (trimmedCmd.includes('route') || trimmedCmd === 'ip r') {
        return [
          'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.50 metric 100',
          '10.0.0.0/24 dev eth1 proto kernel scope link src 10.0.0.50',
          '192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.50',
        ];
      }
      return ['ip: essaie `ip addr` ou `ip route`'];
    }

    // ss
    if (trimmedCmd === 'ss' || trimmedCmd.startsWith('ss ')) {
      return [
        'Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port',
        'tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*       users:(("sshd",pid=1235))',
        'tcp    LISTEN  0       511     0.0.0.0:80            0.0.0.0:*       users:(("nginx",pid=842))',
        'tcp    LISTEN  0       511     0.0.0.0:443           0.0.0.0:*       users:(("nginx",pid=842))',
        'tcp    LISTEN  0       70      127.0.0.1:3306        0.0.0.0:*       users:(("mysqld",pid=512))',
        'tcp    LISTEN  0       128     0.0.0.0:31337         0.0.0.0:*       users:(("crypto_miner",pid=1337))',
        'tcp    ESTAB   0       0       192.168.1.50:22       192.168.1.100:54321  users:(("sshd"))',
      ];
    }

    // dig
    if (trimmedCmd.startsWith('dig ')) {
      const domain = trimmedCmd.split(' ').find(w => !w.startsWith('-') && w !== 'dig') || 'example.com';
      if (trimmedCmd.includes('+short')) {
        return ['93.184.216.34'];
      }
      return [
        `; <<>> DiG 9.16.1 <<>> ${domain}`,
        ';; QUESTION SECTION:',
        `;${domain}.            IN      A`,
        ';; ANSWER SECTION:',
        `${domain}.     3600    IN      A       93.184.216.34`,
        ';; Query time: 12 msec',
        ';; SERVER: 8.8.8.8#53(8.8.8.8)',
      ];
    }

    // ping
    if (trimmedCmd.startsWith('ping ')) {
      const host = trimmedCmd.split(' ')[1] || 'host';
      return [
        `PING ${host} (93.184.216.34) 56(84) bytes of data.`,
        `64 bytes from ${host}: icmp_seq=1 ttl=56 time=12.3 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=56 time=11.8 ms`,
        `64 bytes from ${host}: icmp_seq=3 ttl=56 time=12.1 ms`,
        `--- ${host} ping statistics ---`,
        '3 packets transmitted, 3 received, 0% packet loss',
        'rtt min/avg/max/mdev = 11.8/12.1/12.3/0.2 ms',
      ];
    }

    // traceroute
    if (trimmedCmd.startsWith('traceroute ') || trimmedCmd.startsWith('tracepath ')) {
      const host = trimmedCmd.split(' ')[1] || 'host';
      return [
        `traceroute to ${host}, 30 hops max, 60 byte packets`,
        ' 1  192.168.1.1 (192.168.1.1)  1.234 ms  1.156 ms  1.089 ms',
        ' 2  10.0.0.1 (10.0.0.1)  5.432 ms  5.321 ms  5.298 ms',
        ' 3  * * *  (firewall — no response)',
        ' 4  72.14.204.1 (72.14.204.1)  11.234 ms  11.312 ms  11.198 ms',
        ` 5  ${host}  12.312 ms  12.234 ms  12.156 ms`,
      ];
    }

    // iptables
    if (trimmedCmd.startsWith('iptables')) {
      return [
        'Chain INPUT (policy DROP)',
        'target     prot opt source               destination',
        'ACCEPT     all  --  anywhere             anywhere             state RELATED,ESTABLISHED',
        'ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh',
        'ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:http',
        'DROP       tcp  --  anywhere             anywhere             tcp dpt:https',
        '',
        'Chain FORWARD (policy DROP)',
        '',
        'Chain OUTPUT (policy ACCEPT)',
      ];
    }

    // rsync
    if (trimmedCmd.startsWith('rsync ')) {
      return [
        'sending incremental file list',
        'index.html',
        'style.css',
        'app.js',
        '',
        'sent 4,532 bytes  received 134 bytes  9,332.00 bytes/sec',
        'total size is 4,398  speedup is 0.94',
        '✅ Synchronisation terminée.',
      ];
    }

    // lsof
    if (trimmedCmd.startsWith('lsof')) {
      return [
        'COMMAND   PID  USER   FD   TYPE DEVICE SIZE/OFF NODE NAME',
        'sshd     1235  root    3u  IPv4  12345      0t0  TCP *:ssh (LISTEN)',
        'nginx     842  www      4u  IPv4  23456      0t0  TCP *:http (LISTEN)',
        'crypto   1337  root    5u  IPv4  34567      0t0  TCP *:31337 (LISTEN)',
        'crypto   1337  root    6u  IPv4  34568      0t0  TCP 192.168.1.50:31337->185.220.101.5:4444 (ESTABLISHED)',
      ];
    }

    // who
    if (trimmedCmd === 'who' || trimmedCmd.startsWith('who ')) {
      return [
        'student  pts/0        2024-01-15 14:00 (192.168.1.100)',
        'root     pts/1        2024-01-15 02:11 (185.220.101.5)',
      ];
    }

    // last
    if (trimmedCmd === 'last' || trimmedCmd.startsWith('last ')) {
      return [
        'student  pts/0        192.168.1.100    Mon Jan 15 14:00   still logged in',
        'root     pts/1        185.220.101.5    Mon Jan 15 02:11 - 02:45  (00:34)',
        'student  pts/0        192.168.1.100    Sun Jan 14 09:00 - 18:00  (09:00)',
        'admin    pts/2        10.0.0.5         Sun Jan 14 06:00 - 07:00  (01:00)',
        '',
        'wtmp begins Mon Jan  8 00:00:00 2024',
      ];
    }

    // stat
    if (trimmedCmd.startsWith('stat ')) {
      const filename = trimmedCmd.split(' ')[1] || 'file';
      return [
        `  File: ${filename}`,
        `  Size: 1337\t\tBlocks: 8\t IO Block: 4096   regular file`,
        `Device: 801h/2049d\tInode: 789012\t Links: 1`,
        `Access: (0644/-rw-r--r--)  Uid: (33/www-data)  Gid: (33/www-data)`,
        `Access: 2024-01-15 14:23:01.123456789 +0000`,
        `Modify: 2024-01-15 02:11:37.987654321 +0000`,
        `Change: 2024-01-15 02:11:37.987654321 +0000`,
        ` Birth: -`,
      ];
    }

    // lsattr
    if (trimmedCmd.startsWith('lsattr')) {
      const filename = trimmedCmd.split(' ')[1] || '';
      if (filename.includes('hidden')) {
        return [`----i--------e-- ${filename} (immutable — ne peut pas être supprimé)`];
      }
      return [`-------------e-- ${filename || '.'}`];
    }

    // umask
    if (trimmedCmd === 'umask' || trimmedCmd.startsWith('umask ')) {
      const val = trimmedCmd.split(' ')[1];
      if (val) return [`umask fixé à ${val} (simulation)`];
      return ['0022'];
    }

    // ln
    if (trimmedCmd.startsWith('ln ')) {
      const parts = trimmedCmd.split(' ');
      const dest = parts[parts.length - 1] || 'lien';
      return [`Lien symbolique créé : ${dest} -> ${parts[parts.length - 2] || 'cible'}`];
    }

    // id
    if (trimmedCmd === 'id' || trimmedCmd.startsWith('id ')) {
      const user = trimmedCmd.split(' ')[1];
      if (user === 'www-data') return ['uid=33(www-data) gid=33(www-data) groups=33(www-data)'];
      if (user === 'root') return ['uid=0(root) gid=0(root) groups=0(root)'];
      return ['uid=1001(student) gid=1001(student) groups=1001(student),27(sudo)'];
    }

    // groups
    if (trimmedCmd === 'groups') {
      return ['student sudo'];
    }

    // curl avec -I ou -v
    if (trimmedCmd.startsWith('curl ')) {
      if (trimmedCmd.includes('-I')) {
        return [
          'HTTP/1.1 200 OK',
          'Server: nginx/1.18.0 (Ubuntu)',
          'Date: Mon, 15 Jan 2024 14:23:01 GMT',
          'Content-Type: text/html; charset=UTF-8',
          'Content-Length: 4321',
          'X-Powered-By: PHP/8.1.0',
        ];
      }
      if (trimmedCmd.includes('-v')) {
        return [
          '* Trying 93.184.216.34:443...',
          '* Connected to example.com port 443',
          '* ALPN: offers h2,http/1.1',
          '* TLSv1.3 (OUT), handshake...',
          '> GET / HTTP/1.1',
          '> Host: example.com',
          '< HTTP/1.1 200 OK',
          '< Content-Type: text/html',
          '< Content-Length: 4321',
        ];
      }
      return ['🌐 Téléchargement...', '✅ Fichier téléchargé'];
    }

    // nmap
    if (trimmedCmd.startsWith('nmap ') || trimmedCmd === 'nmap') {
      const hasSV = trimmedCmd.includes('-sV') || trimmedCmd.includes('-A');
      const hasSn = trimmedCmd.includes('-sn');
      const hasScript = trimmedCmd.includes('--script');
      const target = trimmedCmd.split(' ').find(w => !w.startsWith('-') && w !== 'nmap') || 'target';
      if (hasSn) {
        return [
          `Starting Nmap 7.94 ( https://nmap.org )`,
          `Nmap scan report for 10.0.0.1 (10.0.0.1) — Host is up`,
          `Nmap scan report for 10.0.0.5 (10.0.0.5) — Host is up`,
          `Nmap scan report for 10.0.0.10 (10.0.0.10) — Host is up`,
          `Nmap scan report for 10.0.0.20 (10.0.0.20) — Host is up`,
          `Nmap scan report for 10.0.0.100 (10.0.0.100) — Host is up`,
          `Nmap done: 256 IP addresses (5 hosts up) scanned in 2.34s`,
        ];
      }
      if (hasScript) {
        const scriptArg = trimmedCmd.match(/--script[=\s](\S+)/)?.[1] || 'default';
        return [
          `Starting Nmap 7.94 — NSE script: ${scriptArg}`,
          `Nmap scan report for ${target}`,
          `PORT   STATE SERVICE`,
          `80/tcp open  http`,
          `| http-title: EduCorp Internal Portal`,
          `| http-server-header: Apache/2.4.29 (Ubuntu)`,
          `| http-robots.txt: /admin /backup /.git`,
          `443/tcp open  https`,
          `| ssl-cert: Subject: CN=target.local`,
          `|   SANs: target.local, internal.target.local, api.target.local`,
          `| ssl-date: 2024-01-15T14:23:01+00:00`,
          `Nmap done: 1 IP address scanned`,
        ];
      }
      if (hasSV) {
        return [
          `Starting Nmap 7.94 ( https://nmap.org )`,
          `Nmap scan report for ${target}`,
          `Host is up (0.012s latency).`,
          ``,
          `PORT     STATE SERVICE       VERSION`,
          `22/tcp   open  ssh           OpenSSH 7.6p1 Ubuntu 4ubuntu0.7`,
          `80/tcp   open  http          Apache httpd 2.4.29 ((Ubuntu))`,
          `443/tcp  open  ssl/http      Apache httpd 2.4.29`,
          `3306/tcp open  mysql         MySQL 5.7.39`,
          `8080/tcp open  http-proxy    nginx 1.14.0`,
          ``,
          `Service detection performed. Nmap done: 1 IP address scanned`,
        ];
      }
      return [
        `Starting Nmap 7.94 ( https://nmap.org )`,
        `Nmap scan report for ${target}`,
        `Host is up (0.012s latency).`,
        `Not shown: 995 closed tcp ports (reset)`,
        `PORT     STATE SERVICE`,
        `22/tcp   open  ssh`,
        `80/tcp   open  http`,
        `443/tcp  open  https`,
        `3306/tcp open  mysql`,
        `8080/tcp open  http-proxy`,
        ``,
        `Nmap done: 1 IP address scanned in 1.42s`,
      ];
    }

    // nc / netcat
    if (trimmedCmd.startsWith('nc ')) {
      const parts = trimmedCmd.split(' ');
      const port = parts[parts.length - 1];
      if (port === '22') return ['SSH-2.0-OpenSSH_7.6p1 Ubuntu-4ubuntu0.7'];
      if (port === '80') return ['HTTP/1.1 400 Bad Request', 'Server: Apache/2.4.29'];
      if (port === '25') return ['220 mail.target.local ESMTP Postfix'];
      if (port === '3306') return ['5.7.39-MySQL Community Server'];
      if (trimmedCmd.includes('-l') || trimmedCmd.includes('-lp')) {
        return ['Listening on port ' + (parts[parts.length - 1] || '4444') + '...', '(simulation — pas de vraie connexion)'];
      }
      return [`Connection to ${parts[1] || 'host'} port ${port} open`, '(simulation)'];
    }

    // openssl
    if (trimmedCmd.startsWith('openssl ')) {
      if (trimmedCmd.includes('s_client')) {
        const host = trimmedCmd.match(/connect\s+(\S+)/)?.[1] || 'host:443';
        return [
          `CONNECTED(00000003)`,
          `depth=2 C=US, O=DigiCert Inc, CN=DigiCert Global Root CA`,
          `depth=1 C=US, O=Let's Encrypt, CN=R3`,
          `depth=0 CN=${host.split(':')[0]}`,
          `---`,
          `Certificate chain`,
          ` 0 s:CN=${host.split(':')[0]}`,
          `   i:C=US, O=Let's Encrypt, CN=R3`,
          `---`,
          `subject=CN=${host.split(':')[0]}`,
          `issuer=C=US, O=Let's Encrypt, CN=R3`,
          `---`,
          `No client certificate CA names sent`,
          `---`,
          `SSL handshake has read 4134 bytes and written 359 bytes`,
          `---`,
          `New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384`,
          `Server public key is 2048 bit`,
          `---`,
          `notBefore=Jan  1 00:00:00 2024 GMT`,
          `notAfter=Apr  1 00:00:00 2024 GMT`,
        ];
      }
      return ['OpenSSL 3.0.2 — commande simulée'];
    }

    // strings
    if (trimmedCmd.startsWith('strings ')) {
      const file = trimmedCmd.split(' ')[1] || 'file';
      const content = (() => {
        let fs: Record<string, unknown> = level.fileSystem as Record<string, unknown>;
        const val = fs[file];
        return typeof val === 'string' ? val : null;
      })();
      if (content) {
        return content.split('\n').filter(l => l.trim().length > 3);
      }
      return [
        '/bin/bash', '/tmp/.x', 'curl', 'wget',
        'http://185.220.101.5:8080/gate.php',
        '/etc/passwd', '/etc/shadow',
        'id_rsa', 'authorized_keys',
        '<?php system($_GET["cmd"]); ?>',
        'XOR_KEY_0x42', 'AES-256-CBC',
      ];
    }

    // dig avec axfr
    if (trimmedCmd.includes('axfr')) {
      const domain = trimmedCmd.split(' ').find(w => !w.startsWith('@') && w !== 'dig' && w !== 'axfr') || 'target.local';
      const server = trimmedCmd.match(/@(\S+)/)?.[1] || 'ns1';
      return [
        `; <<>> DiG 9.16.1 <<>> axfr ${domain} @${server}`,
        `; Transfer failed (REFUSED)`,
        `; — OR if misconfigured —`,
        `${domain}.           3600  IN  SOA   ns1.${domain}. admin.${domain}. 2024011501`,
        `${domain}.           3600  IN  NS    ns1.${domain}.`,
        `${domain}.           3600  IN  A     10.0.0.100`,
        `www.${domain}.       3600  IN  A     10.40.40.10`,
        `mail.${domain}.      3600  IN  A     10.40.40.20`,
        `internal.${domain}.  3600  IN  A     10.20.20.5`,
        `db.${domain}.        3600  IN  A     10.20.20.10`,
        `admin.${domain}.     3600  IN  A     10.10.10.50`,
        `dev.${domain}.       3600  IN  A     10.20.20.30`,
        `; Zone transfer complete — 8 records`,
      ];
    }

    // uname
    if (trimmedCmd === 'uname' || trimmedCmd.startsWith('uname ')) {
      if (trimmedCmd.includes('-a')) {
        return ['Linux target 5.4.0-150-generic #167-Ubuntu SMP Mon May 15 17:35:05 UTC 2023 x86_64 GNU/Linux'];
      }
      return ['Linux'];
    }

    // Exécution locale ./script (niveaux pédagogiques — pas un vrai shell)
    if (trimmedCmd.startsWith('./')) {
      const target = trimmedCmd.slice(2).split(/\s+/)[0];
      if (level.id === 17 && target === 'hello.sh') {
        return [
          'Hello EduLinux',
          '✅ ./hello.sh exécuté (simulation)',
        ];
      }
      if (level.id === 29 && target === 'secret_reader') {
        return [
          '🔓 [SUID — simulation] exécution avec privilèges effectifs du propriétaire',
          '📄 Donnée sensible (exercice) : FLAG_SUID_UNDERSTOOD',
        ];
      }
      if (level.id === 30 && target === 'unlock.sh') {
        return [
          '🏆 Script final exécuté.',
          '✅ Mission EduLinux terminée — félicitations !',
        ];
      }
      return [`bash: ./${target}: fichier introuvable ou non exécutable (simulateur)`];
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
          addLine('success', `✓ ${rule.description || rule.value}`);
        }
      }
    });

    setCompletedValidations(newCompleted);

    // Vérifier si toutes les validations sont complétées
    if (newCompleted.size === level.validation.length && newCompleted.size > 0) {
      setTimeout(() => {
        addLine('success', '');
        addLine('success', '✓ niveau complété — ' + level.title);
        addLine('success', '');
        setTimeout(() => onSuccess(), 1500);
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
        const commands = ['echo', 'ls', 'cd', 'pwd', 'cat', 'grep', 'find', 'chmod', 'base64', 'ssh', 'export', 'tar', 'wget', 'curl', 'scan', 'sudo', 'ssh-keygen', 'md5', 'sha256sum', 'sed', 'ps', 'kill', 'scp', 'tree', 'less', 'head', 'tail', 'sort', 'uniq', 'wc', 'cut', 'df', 'du', 'free', 'top', 'env', 'printenv', 'journalctl', 'systemctl', 'crontab', 'ip', 'ss', 'dig', 'ping', 'traceroute', 'iptables', 'rsync', 'lsof', 'who', 'last', 'stat', 'lsattr', 'umask', 'ln', 'id', 'groups', 'nmap', 'nc', 'openssl', 'strings', 'uname'];
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
      case 'input':   return 'text-[#a3e635] font-semibold';
      case 'error':   return 'text-red-400';
      case 'success': return 'text-[#a3e635]';
      default:        return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060a10] overflow-hidden border-l border-white/5 font-mono">
      {/* Terminal Header */}
      <div className="bg-[#0a0e17] px-5 py-3 flex items-center gap-3 border-b border-white/5 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        <span className="text-gray-600 text-xs ml-2">
          student@edulinux:<span className="text-[#a3e635]">{currentPath}</span>$
        </span>
        {showCopyButton && (
          <button
            onClick={() => {
              const text = history.map(line => line.content).join('\n');
              navigator.clipboard.writeText(text).then(() => {
                addLine('success', 'copié dans le presse-papiers');
                setTimeout(() => setHistory(prev => prev.slice(0, -1)), 1500);
              });
            }}
            className="ml-auto text-gray-600 hover:text-white text-xs transition-colors"
          >
            copier
          </button>
        )}
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-5 text-sm"
        onMouseEnter={() => setShowCopyButton(true)}
        onMouseLeave={() => setShowCopyButton(false)}
        style={{ scrollbarWidth: 'thin', userSelect: 'text' }}
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((line, index) => (
          <div
            key={index}
            className={`${getLineColor(line.type)} whitespace-pre-wrap select-text leading-relaxed`}
          >
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center text-[#a3e635] mt-1">
          <span className="mr-2 select-none">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono text-sm w-full"
            autoFocus
            spellCheck={false}
            style={{ caretColor: '#a3e635' }}
            placeholder=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Hints */}
      {level.hints.length > 0 && (
        <div className="border-t border-white/5 bg-[#0a0e17]">
          <details className="text-sm">
            <summary className="cursor-pointer px-5 py-3 text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-2 select-none">
              <span className="text-[#a3e635]">?</span>
              indices ({level.hints.length})
            </summary>
            <ul className="px-5 pb-4 space-y-2">
              {level.hints.map((hint, index) => (
                <li key={index} className="text-xs text-gray-500 flex items-start gap-2">
                  <span className="text-[#a3e635]/60 mt-0.5">›</span>
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

