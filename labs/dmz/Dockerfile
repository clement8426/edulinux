FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openssh-server nginx curl netcat-openbsd python3 gzip \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash www && echo 'www:web2024' | chpasswd
RUN mkdir /run/sshd

# Flag on DMZ server
RUN echo 'FLAG{DMZ_OWNED}' > /root/flag.txt
RUN chmod 600 /root/flag.txt

# Install chisel for pivot exercises; fall back to stub if download fails
RUN curl -sL --max-time 30 \
    https://github.com/jpillora/chisel/releases/download/v1.9.1/chisel_1.9.1_linux_amd64.gz \
    | gzip -d > /usr/local/bin/chisel && chmod +x /usr/local/bin/chisel \
    || (printf '#!/bin/bash\necho "chisel placeholder — download binary at runtime"\n' \
        > /usr/local/bin/chisel && chmod +x /usr/local/bin/chisel)

# Note about reachable internal network (educational hint)
RUN printf 'Internal network (not reachable from pentest net directly):\n  Subnet : 172.21.0.0/24\n  Hosts  : 172.21.0.10 (internal), 172.21.0.20 (corp-internal), 172.21.0.30 (corp-db)\nThis DMZ host has an interface on 172.21.0.5 — use it to pivot.\n' \
    > /etc/network_notes.txt

# Nginx default page hints at internal services
RUN printf '<html><body><h1>DMZ Web Server</h1><p>Internal services: see /etc/network_notes.txt</p></body></html>\n' \
    > /var/www/html/index.html

EXPOSE 22 80
CMD ["/usr/sbin/sshd", "-D", "-e"]
