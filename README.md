# tienda_eco

Arquitectura monolitica para tienda ecologica:

- Cliente web estatico.
- API con Node.js + Express.
- Base de datos SQLite.
- Nginx como servidor frontal y reverse proxy.
- HTTPS con SSL/TLS (Let's Encrypt o autofirmado para pruebas).

## Estructura

- `public/`: cliente web.
- `src/`: API y acceso a BD.
- `nginx/active.conf`: configuracion activa usada por Nginx.
- `nginx/https.conf.template`: plantilla SSL para dominio.
- `docker-compose.yml`: stack monolitico.
- `docker-compose.https.yml`: override para puertos 80/443 y certificados.
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