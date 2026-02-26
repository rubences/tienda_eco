# tienda_eco

Script de práctica backend en Node.js para procesar un pedido en una tienda de productos ecológicos.

## Requisitos

- Node.js instalado.
- npm disponible.

## Instalación

```bash
npm install
```

## Ejecución

### 1) Script inicial "Hola mundo"

```bash
node hola_mundo.js
```

Salida esperada:

```text
Hola mundo
```

### 2) Procesamiento del pedido

```bash
node pedido.js
```

El script `pedido.js` realiza:

- Normalización del nombre del cliente en mayúsculas.
- Verificación de productos frágiles con `.includes()`.
- Validación de stock de cada producto.
- Cálculo de subtotal, descuento del 5% (si supera 100€), IVA del 21% y total final.
- Cálculo de fecha estimada de entrega con `dayjs` (+3 días).
- Impresión del resumen con Template Literals.