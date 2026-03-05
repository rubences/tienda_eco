# tienda_eco

Arquitectura monolitica para tienda ecologica:

- Cliente web estatico.
- API con Node.js + Express.
- Base de datos SQLite.
- Nginx + Apache combinados: Nginx frontal (proxy inverso y balanceador) y Apache para personalizacion con `.htaccess`.
- HTTPS con SSL/TLS (Let's Encrypt o autofirmado para pruebas).

## Estructura

- `public/`: cliente web.
- `src/`: API y acceso a BD.
- `apache/httpd.conf`: configuracion de Apache con `AllowOverride All`.
- `nginx/nginx.conf`: configuracion principal de Nginx (proxy inverso + upstream).
- `nginx/active.conf`: compatibilidad para flujos SSL existentes.
- `nginx/https.conf.template`: plantilla SSL para dominio.
- `docker-compose.yml`: stack monolitico.
- `docker-compose.https.yml`: override para puertos 80/443 y certificados.
- `docker-compose.monitoring.yml`: stack de monitoreo (Amplify + Netdata + Prometheus + Grafana).
- `postman/tienda-eco.postman_collection.json`: coleccion para pruebas.

## Requisitos

- Node.js 20+.
- npm.
- Docker y Docker Compose (para el modo con Nginx).
- Postman (opcional, para pruebas visuales de peticiones).
- Dominio publico apuntando al servidor (solo para Let's Encrypt).

## Instalacion

```bash
npm install
```

## Ejecucion rapida de scripts iniciales

```bash
npm run start:hola
npm run start:pedido
```

## Modo monolitico con Nginx (recomendado)

Arquitectura combinada:

- Nginx recibe peticiones de clientes y termina TLS.
- Nginx enruta `/` hacia `upstream apache_backends` (dos instancias Apache simuladas).
- Nginx enruta `/api` hacia Node.js + Express.

1. Levantar servicios:

```bash
docker compose up --build
```

2. Abrir cliente web:

- `http://localhost:8080`

3. Endpoints API (via Nginx):

- `GET http://localhost:8080/api/health`
- `GET http://localhost:8080/api/productos`
- `POST http://localhost:8080/api/pedidos`

Body ejemplo para crear pedido:

```json
{
	"cliente": "Ana Perez",
	"items": [
		{ "productoId": 1, "cantidad": 2 },
		{ "productoId": 2, "cantidad": 1 }
	]
}
```

## Modo solo API (sin Nginx)

```bash
npm run start:api
```

API en:

- `http://localhost:3000/api/health`

## Postman

Importa la coleccion:

- `postman/tienda-eco.postman_collection.json`

Con eso podras visualizar y probar el flujo cliente-servidor rapidamente.

## Cuándo usar cada uno

- Usa Apache si necesitas muchas configuraciones personalizadas con `.htaccess`.
- Usa Nginx si tu prioridad es rendimiento y concurrencia.
- Combinar ambos suele ser la mejor opcion en escenarios mixtos.

## HTTPS (SSL/TLS)

`HTTPS = HTTP + SSL/TLS`: cifra la comunicacion, valida identidad del servidor y es clave para SEO, confianza del usuario y cumplimiento de normativas.

Tienes dos modos:

- Produccion: certificado gratuito de Let's Encrypt (autoridad certificadora real).
- Pruebas: certificado autofirmado.

### 1) Let's Encrypt (produccion)

Requisitos:

- Tu dominio debe resolver al servidor.
- Puertos `80` y `443` abiertos.

Configura variables:

```bash
cp .env.example .env
```

Edita `.env` con:

```bash
DOMAIN=tu-dominio.com
EMAIL=admin@tu-dominio.com
```

Habilitar HTTPS:

```bash
npm run https:enable
```

Renovar certificados:

```bash
npm run https:renew
```

### 2) Certificado autofirmado (pruebas)

```bash
npm run https:selfsigned
```

Por defecto usa `DOMAIN=localhost` si no existe `.env`.

### Verificaciones recomendadas

- Navegador: `https://tu-dominio.com`
- API health: `https://tu-dominio.com/api/health`

Si usas Postman con HTTPS autofirmado, desactiva temporalmente la verificacion SSL en Settings.

## Monitoreo de rendimiento

Comandos utiles:

```bash
npm run monitor:compose
npm run monitor:compose:all
npm run monitor:ports
```

## Nginx proxy inverso y balanceador basico

Puntos implementados:

- Nginx expuesto en `http://localhost:8080`.
- `upstream apache_backends` con dos backends:
	- `apache:80`
	- `apache2:80`
- `proxy_pass` a upstream en `location /`.
- `proxy_pass` a Express en `location /api`.

Verificar redireccion con `curl -I`:

```bash
npm run verify:redirects
```

Comprobacion manual:

```bash
curl -I http://localhost:8080/legacy
curl -I http://localhost:8080/
```

Deberas ver `301` para `/legacy` y cabeceras `X-Upstream-*` para `/`.

## Grafana + Prometheus

Servicios añadidos:

- `nginx-exporter`: expone metricas de Nginx para Prometheus.
- `prometheus`: `http://localhost:9090`
- `grafana`: `http://localhost:3001` (`admin/admin`)

Arranque:

```bash
npm run monitor:start
```

## loadtest / ApacheBench

Prueba con ApacheBench:

```bash
npm run bench:ab
```

Prueba con loadtest:

```bash
npm run bench:loadtest
```

Monitoreo en tiempo real de CPU/RAM:

```bash
npm run monitor:top
```

Si `htop` no esta instalado en tu host, instala con `sudo apt install htop` y usa `netstat` como alternativa para conexiones.

## Integracion solicitada: ab + Nginx Amplify + Netdata

### Apache Benchmark (ab)

Benchmark rapido por defecto:

```bash
npm run bench:ab
```

Benchmark custom (`URL`, `requests`, `concurrency`):

```bash
bash scripts/ab-benchmark.sh http://localhost:8080/api/health 500 50
```

El script usa `ab` local si existe; si no, levanta una imagen Docker con ApacheBench automaticamente.

### Nginx Amplify

1. Registra tu servidor en Nginx Amplify y copia el `API Key`.
2. Define en `.env`:

```bash
AMPLIFY_API_KEY=tu_api_key_de_nginx_amplify
```

3. Arranca monitoreo:

```bash
npm run monitor:start
```

Nginx expone internamente `http://nginx/nginx_status` para que el agente capture metricas.

Nota: si no defines `AMPLIFY_API_KEY`, el comando inicia solo Netdata y deja Amplify pendiente.

### Netdata

Con el mismo comando se levanta Netdata:

```bash
npm run monitor:start
```

Dashboard:

- `http://localhost:19999`

### Verificacion rapida

```bash
npm run monitor:compose
npm run monitor:ports
```