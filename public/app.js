const productosEl = document.getElementById('productos');
const resultadoEl = document.getElementById('resultado');
const form = document.getElementById('pedido-form');
const recargarBtn = document.getElementById('btn-recargar');

async function cargarProductos() {
  const response = await fetch('/api/productos');
  const data = await response.json();
  productosEl.textContent = JSON.stringify(data, null, 2);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    cliente: formData.get('cliente'),
    items: [
      {
        productoId: Number(formData.get('productoId')),
        cantidad: Number(formData.get('cantidad')),
      },
    ],
  };

  const response = await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  resultadoEl.textContent = JSON.stringify(body, null, 2);

  await cargarProductos();
});

recargarBtn.addEventListener('click', cargarProductos);

cargarProductos();