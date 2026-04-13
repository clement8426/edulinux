FROM kalilinux/kali-rolling
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    nmap gobuster ffuf nikto whatweb \
    hydra john hashcat \
    sqlmap \
    netcat-openbsd curl wget \
    python3 python3-pip \
    git vim nano \
    dnsutils whois \
    net-tools iputils-ping \
    libpcap-dev \
    && rm -rf /var/lib/apt/lists/*
# theHarvester
RUN pip3 install theharvester 2>/dev/null || true
# chisel (tunneling)
RUN curl -sL https://github.com/jpillora/chisel/releases/download/v1.9.1/chisel_1.9.1_linux_amd64.gz \
    | gzip -d > /usr/local/bin/chisel && chmod +x /usr/local/bin/chisel || true
# proxychains
RUN apt-get update && apt-get install -y proxychains4 && rm -rf /var/lib/apt/lists/*
# wordlists
RUN apt-get update && apt-get install -y wordlists && rm -rf /var/lib/apt/lists/* || true
# Create working directory
RUN mkdir -p /workspace /sessions
WORKDIR /workspace
# Default prompt
RUN echo 'export PS1="\[\033[01;31m\]attacker\[\033[00m\]@\[\033[01;34m\]\h\[\033[00m\]:\w\$ "' >> /etc/bash.bashrc
CMD ["sleep", "infinity"]
