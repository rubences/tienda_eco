const dayjs = require('dayjs');

const IVA = 0.21;
const DESCUENTO_MAYOR_100 = 0.05;

const cliente = 'Ana Pérez';
const clienteNormalizado = cliente.toUpperCase();

const productos = [
  {
    nombre: 'Detergente ecológico',
    precioUnitario: 18.5,
    cantidad: 2,
    stockDisponible: 10,
    categoria: 'limpieza',
  },
  {
    nombre: 'Tarro de vidrio reciclado',
    precioUnitario: 12.99,
    cantidad: 3,
    stockDisponible: 5,
    categoria: 'fragil',
  },
  {
    nombre: 'Cepillo de bambú',
    precioUnitario: 6.5,
    cantidad: 4,
    stockDisponible: 20,
    categoria: 'higiene',
  },
];

const hayProductosFragiles = productos
  .map((producto) => producto.categoria)
  .includes('fragil');

let stockValido = true;
for (const producto of productos) {
  if (producto.cantidad > producto.stockDisponible) {
    stockValido = false;
    break;
  }
}

if (!stockValido) {
  console.log('No se puede procesar el pedido: stock insuficiente.');
} else {
  let subtotal = 0;
  for (const producto of productos) {
    subtotal += producto.precioUnitario * producto.cantidad;
  }

  let descuentoAplicado = 0;
  if (subtotal > 100) {
    descuentoAplicado = subtotal * DESCUENTO_MAYOR_100;
  } else {
    descuentoAplicado = 0;
  }

  let subtotalConDescuento = subtotal - descuentoAplicado;
  let total = subtotalConDescuento * (1 + IVA);

  const fechaEntrega = dayjs().add(3, 'day').format('YYYY-MM-DD');

  const resumenPedido = `
Resumen del pedido
------------------
Cliente: ${clienteNormalizado}
Productos: ${productos.length}
Incluye frágiles: ${hayProductosFragiles ? 'Sí' : 'No'}
Subtotal: €${subtotal.toFixed(2)}
Descuento (5% > 100€): -€${descuentoAplicado.toFixed(2)}
Subtotal con descuento: €${subtotalConDescuento.toFixed(2)}
IVA (21%): €${(subtotalConDescuento * IVA).toFixed(2)}
Total final: €${total.toFixed(2)}
Fecha estimada de entrega: ${fechaEntrega}
`;

  console.log(resumenPedido);
}