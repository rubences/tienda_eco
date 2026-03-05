#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:8080/}"
REQUESTS="${2:-200}"
CONCURRENCY="${3:-20}"

run_local() {
  echo "Ejecutando Apache Benchmark local..."
  ab -n "$REQUESTS" -c "$CONCURRENCY" "$URL"
}

run_docker() {
  echo "Apache Benchmark no esta instalado localmente. Se usara Docker."
  docker build -t tienda-eco-ab "$PWD/tools/ab" >/dev/null
  docker run --rm --network host tienda-eco-ab \
    -n "$REQUESTS" -c "$CONCURRENCY" "$URL"
}

if command -v ab >/dev/null 2>&1; then
  run_local
else
  run_docker
fi
