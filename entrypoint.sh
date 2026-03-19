#!/bin/sh

php artisan storage:link || true
php artisan config:cache
php artisan route:cache

php artisan serve