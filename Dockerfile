FROM php:8.4-apache

WORKDIR /app

COPY ./modellhajo_backend .
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpq-dev \
    unzip \
    build-essential \
    && docker-php-ext-install zip pdo pdo_pgsql

RUN composer install --no-dev --optimize-autoloader

# Cache configs and routes at build time
RUN php artisan config:cache
RUN php artisan route:cache

# Set storage symlink and start Laravel at container startup
CMD php artisan storage:link || true && \
    php artisan serve --host 0.0.0.0 --port 8000

# mkdir -p storage/app/public
# docker exec -it modellhajo_app bash
# rm -rf public/storage
# php artisan storage:link
# ls -l public 
# You should see something like: storage -> ../storage/app/public
