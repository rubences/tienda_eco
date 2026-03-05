#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -f "$ROOT_DIR/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
fi

if [[ -z "${AMPLIFY_API_KEY:-}" ]]; then
  echo "WARN: AMPLIFY_API_KEY no esta definido en .env."
  echo "Se levantara solo Netdata. Para Amplify, define la clave y relanza el comando."

  docker compose \
    -f "$ROOT_DIR/docker-compose.yml" \
    -f "$ROOT_DIR/docker-compose.monitoring.yml" \
    up -d netdata nginx-exporter prometheus grafana
else
  docker compose \
    --profile amplify \
    -f "$ROOT_DIR/docker-compose.yml" \
    -f "$ROOT_DIR/docker-compose.monitoring.yml" \
    up -d netdata nginx-exporter prometheus grafana amplify-agent
fi

echo "Monitoreo activo:"
echo "- Netdata: http://localhost:19999"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin)"
if [[ -n "${AMPLIFY_API_KEY:-}" ]]; then
  echo "- Amplify Agent: contenedor tienda-eco-amplify"
else
  echo "- Amplify Agent: pendiente (configura AMPLIFY_API_KEY)"
fi
