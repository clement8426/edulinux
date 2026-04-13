FROM php:7.4-apache
# Install MySQL PDO
RUN docker-php-ext-install pdo pdo_mysql

# Vulnerable PHP app directories
RUN mkdir -p /var/www/html/uploads /var/www/html/backup /var/www/html/admin

# Copy application files
COPY index.php /var/www/html/
COPY upload.php /var/www/html/
COPY read.php /var/www/html/
COPY robots.txt /var/www/html/

# Flag file
RUN echo 'FLAG{WEB_PENTEST_COMPLETE}' > /var/www/html/flag.txt
RUN chmod 644 /var/www/html/flag.txt

# Backup directory with sensitive info (directory listing bait)
RUN echo '<?php phpinfo(); ?>' > /var/www/html/backup/phpinfo.php
RUN echo 'DB_HOST=172.20.0.99\nDB_USER=webapp\nDB_PASS=supersecret123\nDB_NAME=appdb' > /var/www/html/backup/config.txt

# Admin stub (hint at attack surface)
RUN echo '<?php echo "Admin panel — coming soon"; ?>' > /var/www/html/admin/index.php

# Permissions for upload directory
RUN chown -R www-data:www-data /var/www/html/uploads
RUN chmod 777 /var/www/html/uploads

# Enable Apache mod_rewrite
RUN a2enmod rewrite

EXPOSE 80
