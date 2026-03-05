# tienda_eco

Arquitectura monolitica para tienda ecologica:

- Cliente web estatico.
- API con Node.js + Express.
- Base de datos SQLite.
- Nginx como servidor frontal y reverse proxy.

## Estructura

- `public/`: cliente web.
- `src/`: API y acceso a BD.
- `nginx/default.conf`: configuracion de Nginx.
- `docker-compose.yml`: stack monolitico.
- `postman/tienda-eco.postman_collection.json`: coleccion para pruebas.

## Requisitos

- Node.js 20+.
- npm.
- Docker y Docker Compose (para el modo con Nginx).
- Postman (opcional, para pruebas visuales de peticiones).

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