const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'tienda.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      stock INTEGER NOT NULL,
      es_fragil INTEGER NOT NULL DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente TEXT NOT NULL,
      subtotal REAL NOT NULL,
      descuento REAL NOT NULL,
      iva REAL NOT NULL,
      total REAL NOT NULL,
      fecha_entrega TEXT NOT NULL,
      creado_en TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS pedido_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);

  const row = await get('SELECT COUNT(*) AS total FROM productos');
  if (row.total === 0) {
    await run(
      `
      INSERT INTO productos (nombre, precio, stock, es_fragil)
      VALUES
        ('Detergente ecologico', 18.5, 10, 0),
        ('Tarro de vidrio reciclado', 12.99, 5, 1),
        ('Cepillo de bambu', 6.5, 20, 0)
      `
    );
  }
}

module.exports = {
  db,
  run,
  all,
  get,
  initDb,
};