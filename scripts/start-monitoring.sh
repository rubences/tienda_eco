#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
fi

if [[ -z "${AMPLIFY_API_KEY:-}" ]]; then
  echo "WARN: AMPLIFY_API_KEY no esta definido en .env."
  echo "El servicio amplify-agent arrancara pero no podra enviar metricas."
fi

docker compose \
  -f "$ROOT_DIR/docker-compose.yml" \
  -f "$ROOT_DIR/docker-compose.monitoring.yml" \
  up -d netdata amplify-agent

echo "Monitoreo activo:"
echo "- Netdata: http://localhost:19999"
echo "- Amplify Agent: contenedor tienda-eco-amplify"
