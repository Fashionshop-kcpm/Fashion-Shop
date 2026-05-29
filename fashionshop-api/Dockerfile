FROM php:8.3-cli-alpine

RUN apk add --no-cache git zip unzip curl \
    && docker-php-ext-install pdo pdo_mysql \
    && curl -sS https://getcomposer.org/installer \
       | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY . .

RUN composer install --optimize-autoloader --no-interaction --no-dev

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]
