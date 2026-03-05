#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=(-f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.https.yml")

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
fi

if [[ -z "${DOMAIN:-}" ]]; then
  DOMAIN="localhost"
fi

mkdir -p "$ROOT_DIR/certbot/conf/live/$DOMAIN" "$ROOT_DIR/certbot/www"

if [[ ! -f "$ROOT_DIR/certbot/conf/live/$DOMAIN/privkey.pem" || ! -f "$ROOT_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" ]]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$ROOT_DIR/certbot/conf/live/$DOMAIN/privkey.pem" \
    -out "$ROOT_DIR/certbot/conf/live/$DOMAIN/fullchain.pem" \
    -subj "/CN=$DOMAIN"
fi

sed "s/__DOMAIN__/${DOMAIN}/g" "$ROOT_DIR/nginx/https.conf.template" > "$ROOT_DIR/nginx/https.conf"
cp "$ROOT_DIR/nginx/https.conf" "$ROOT_DIR/nginx/active.conf"
cp "$ROOT_DIR/nginx/https.conf" "$ROOT_DIR/nginx/nginx.conf"

docker compose "${COMPOSE_FILES[@]}" up -d --build

echo "HTTPS (Nginx + Apache) con certificado autofirmado habilitado en https://${DOMAIN}"
