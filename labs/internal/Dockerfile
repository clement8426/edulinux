FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y openssh-server && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash internal-user && echo 'internal:internal2024' | chpasswd
RUN mkdir /run/sshd

# Configure SSH (password auth enabled)
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# Final flag — only reachable after successful pivot through DMZ
RUN echo 'FLAG{PIVOT_COMPLETE_DOUBLE_NETWORK}' > /root/final_flag.txt
RUN chmod 600 /root/final_flag.txt

# Hint for the learner
RUN printf 'Congratulations — you reached the internal network via pivot!\nThis host is only accessible through the DMZ (172.21.0.5).\nFlag: /root/final_flag.txt (requires root privesc)\n' \
    > /home/internal-user/README.txt
RUN chown internal-user:internal-user /home/internal-user/README.txt

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
