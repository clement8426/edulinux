FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    openssh-server sudo python3 vim \
    && rm -rf /var/lib/apt/lists/*

# Create low-privilege user (simulates a compromised web process)
RUN useradd -m -s /bin/bash www-data-sim && echo 'www-data-sim:webpass' | chpasswd
RUN mkdir /run/sshd

# --- Privesc vector 1: SUID on python3 ---
# GTFOBins: python3 -c 'import os; os.execl("/bin/sh","sh","-p")'
RUN chmod u+s /usr/bin/python3

# --- Privesc vector 2: sudo misconfiguration ---
# GTFOBins: sudo vim -c ':!/bin/sh'
RUN echo 'www-data-sim ALL=(ALL) NOPASSWD: /usr/bin/vim' >> /etc/sudoers

# --- Privesc vector 3: world-writable cron script run as root ---
RUN mkdir -p /opt/scripts
RUN printf '#!/bin/bash\necho "backup running at $(date)" >> /var/log/backup.log\n' \
    > /opt/scripts/backup.sh
RUN chmod 777 /opt/scripts/backup.sh
RUN echo '* * * * * root /opt/scripts/backup.sh' >> /etc/crontab

# Flags
RUN echo 'FLAG{ROOT_OBTAINED}' > /root/root.txt
RUN chmod 600 /root/root.txt

# Low-priv user hint file
RUN echo 'Hint: check sudo -l, find / -perm -4000, writable cron scripts' \
    > /home/www-data-sim/README.txt
RUN chown www-data-sim:www-data-sim /home/www-data-sim/README.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
