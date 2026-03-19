FROM php:8.4-apache

WORKDIR /var/www/html

COPY ./modellhajo_backend .
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpq-dev \
    unzip \
    build-essential \
    && docker-php-ext-install zip pdo pdo_pgsql

RUN composer install --no-dev --optimize-autoloader


# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Enable rewrite
RUN a2enmod rewrite

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]