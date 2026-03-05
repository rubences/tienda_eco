#!/usr/bin/env bash
set -euo pipefail

echo "Verificando redireccion /legacy -> / ..."
curl -I -s http://localhost:8080/legacy | sed -n '1,6p'

echo
echo "Verificando cabeceras de balanceo en / ..."
curl -I -s http://localhost:8080/ | grep -Ei 'HTTP/|X-Upstream-Addr|X-Upstream-Status|Location' || true
