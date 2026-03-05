const dayjs = require('dayjs');
const express = require('express');
const { all, get, initDb, run } = require('./db');

const app = express();

const IVA = 0.21;
const DESCUENTO = 0.05;
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tienda-eco-api' });
});

app.get('/api/productos', async (_req, res) => {
  try {
    const productos = await all(
      'SELECT id, nombre, precio, stock, es_fragil AS esFragil FROM productos ORDER BY id'
    );
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/api/pedidos', async (req, res) => {
  const { cliente, items } = req.body;

  if (!cliente || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Debes enviar cliente e items validos' });
    return;
  }

  const clienteNormalizado = String(cliente).toUpperCase();

  try {
    let subtotal = 0;
    let incluyeFragiles = false;
    const productosPedido = [];

    for (const item of items) {
      if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
        res.status(400).json({ error: 'Cada item requiere productoId y cantidad > 0' });
        return;
      }

      const producto = await get(
        'SELECT id, nombre, precio, stock, es_fragil AS esFragil FROM productos WHERE id = ?',
        [item.productoId]
      );

      if (!producto) {
        res.status(404).json({ error: `Producto ${item.productoId} no encontrado` });
        return;
      }

      if (producto.stock < item.cantidad) {
        res.status(409).json({ error: `Stock insuficiente para ${producto.nombre}` });
        return;
      }

      subtotal += producto.precio * item.cantidad;
      if (producto.esFragil === 1) {
        incluyeFragiles = true;
      }

      productosPedido.push({
        producto,
        cantidad: item.cantidad,
      });
    }

    const descuento = subtotal > 100 ? subtotal * DESCUENTO : 0;
    const subtotalConDescuento = subtotal - descuento;
    const iva = subtotalConDescuento * IVA;
    const total = subtotalConDescuento + iva;
    const fechaEntrega = dayjs().add(3, 'day').format('YYYY-MM-DD');

    await run('BEGIN TRANSACTION');

    const pedidoInsert = await run(
      `
      INSERT INTO pedidos (cliente, subtotal, descuento, iva, total, fecha_entrega)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        clienteNormalizado,
        subtotal,
        descuento,
        iva,
        total,
        fechaEntrega,
      ]
    );

    for (const item of productosPedido) {
      await run(
        `
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
        `,
        [pedidoInsert.lastID, item.producto.id, item.cantidad, item.producto.precio]
      );

      await run('UPDATE productos SET stock = stock - ? WHERE id = ?', [
        item.cantidad,
        item.producto.id,
      ]);
    }

    await run('COMMIT');

    res.status(201).json({
      pedidoId: pedidoInsert.lastID,
      cliente: clienteNormalizado,
      incluyeFragiles,
      subtotal: Number(subtotal.toFixed(2)),
      descuento: Number(descuento.toFixed(2)),
      iva: Number(iva.toFixed(2)),
      total: Number(total.toFixed(2)),
      fechaEntrega,
    });
  } catch (error) {
    try {
      await run('ROLLBACK');
    } catch (_rollbackError) {
      // Ignoramos errores de rollback para conservar respuesta original.
    }
    res.status(500).json({ error: 'Error interno al crear el pedido' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API escuchando en puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo inicializar la base de datos:', error);
    process.exit(1);
  });