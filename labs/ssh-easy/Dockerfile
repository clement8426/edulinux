FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server sudo && rm -rf /var/lib/apt/lists/*

# Create users with weak passwords
RUN useradd -m -s /bin/bash admin && echo 'admin:admin123' | chpasswd
RUN useradd -m -s /bin/bash deploy && echo 'deploy:deploy2024' | chpasswd
RUN useradd -m -s /bin/bash backup && echo 'backup:backup' | chpasswd

# SSH configuration (realistic weak setup)
RUN mkdir /run/sshd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin no/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Flag in admin's home
RUN echo 'FLAG{SSH_BRUTE_FORCE_SUCCESS}' > /home/admin/flag.txt
RUN chown admin:admin /home/admin/flag.txt

# Post-exploit artifacts
RUN printf 'ls\nid\nwhoami\ncat /etc/passwd\nuname -a\n' > /home/admin/.bash_history
RUN mkdir -p /home/admin/data
RUN echo 'CONFIDENTIAL_DATA: user_ids=1234,5678,9012' > /home/admin/data/users.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
