#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILES=(-f "$ROOT_DIR/docker-compose.yml" -f "$ROOT_DIR/docker-compose.https.yml")

echo "Renovando certificados..."
docker compose "${COMPOSE_FILES[@]}" run --rm certbot renew --webroot -w /var/www/certbot

echo "Recargando Nginx..."
docker compose "${COMPOSE_FILES[@]}" exec nginx nginx -s reload

echo "Renovacion finalizada."
