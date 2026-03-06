FROM php:8.4-apache

WORKDIR /app
COPY ./modellhajo_backend .
COPY --from=composer /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpq-dev \
    unzip \
    build-essential \
    && docker-php-ext-install zip pdo pdo_pgsql
RUN composer install
# RUN php artisan migrate
CMD php artisan serve --host 0.0.0.0 --port 8000