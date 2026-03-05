#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=(-f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.https.yml")

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
fi

if [[ -z "${DOMAIN:-}" || -z "${EMAIL:-}" ]]; then
  echo "ERROR: Define DOMAIN y EMAIL en .env (puedes copiar .env.example)."
  exit 1
fi

mkdir -p "$ROOT_DIR/certbot/www" "$ROOT_DIR/certbot/conf"

sed "s/__DOMAIN__/${DOMAIN}/g" "$ROOT_DIR/nginx/https.conf.template" > "$ROOT_DIR/nginx/https.conf"
cp "$ROOT_DIR/nginx/http-challenge.conf" "$ROOT_DIR/nginx/active.conf"

echo "[1/4] Levantando app + nginx en modo challenge HTTP..."
docker compose "${COMPOSE_FILES[@]}" up -d --build app nginx

echo "[2/4] Solicitando certificado Let's Encrypt para ${DOMAIN}..."
docker compose "${COMPOSE_FILES[@]}" run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  -d "$DOMAIN" \
  --agree-tos --no-eff-email

echo "[3/4] Activando configuracion HTTPS en Nginx..."
cp "$ROOT_DIR/nginx/https.conf" "$ROOT_DIR/nginx/active.conf"
docker compose "${COMPOSE_FILES[@]}" up -d nginx

echo "[4/4] HTTPS habilitado."
echo "Valida en: https://${DOMAIN}"
