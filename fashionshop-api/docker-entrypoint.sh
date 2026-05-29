#!/bin/sh
set -e

# Tạo APP_KEY nếu chưa có
if [ -z "$APP_KEY" ]; then
  php artisan key:generate --no-interaction
fi

# Tạo symlink storage
php artisan storage:link --no-interaction 2>/dev/null || true

# Cache config
php artisan config:cache
php artisan route:cache

# Chạy migration
php artisan migrate --no-interaction --force

exec php artisan serve --host=0.0.0.0 --port=8000
