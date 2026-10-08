require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

const conexion = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

conexion.connect(err => {
  if (err) {
    console.error('❌ Error conectando a Aiven:', err);
    return;
  }
  console.log('✅ Conectado a la base de datos de Gabriel');
});

// GET estudiantes
app.get('/estudiantes', (req, res) => {
  conexion.query('SELECT * FROM estudiantes', (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// GET productos
app.get('/productos', (req, res) => {
  conexion.query('SELECT * FROM productos', (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// GET ventas (JOIN sin imagen)
app.get('/ventas', (req, res) => {
  const sql = `
    SELECT v.id, e.nombre AS estudiante, e.grupo, p.nombre AS producto,
           v.cantidad, v.fecha, p.precio,
           (v.cantidad * p.precio) AS total,
           v.estudiante_id, v.producto_id
    FROM ventas v
    INNER JOIN estudiantes e ON v.estudiante_id = e.id
    INNER JOIN productos p ON v.producto_id = p.id
  `;
  conexion.query(sql, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(resultados);
  });
});

// POST venta
app.post('/ventas', (req, res) => {
  const { estudiante_id, producto_id, cantidad, fecha } = req.body;
  conexion.query(
    'INSERT INTO ventas (estudiante_id, producto_id, cantidad, fecha) VALUES (?, ?, ?, ?)',
    [estudiante_id, producto_id, cantidad, fecha],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: '✅ Venta registrada' });
    }
  );
});

// PUT venta
app.put('/ventas/:id', (req, res) => {
  const { estudiante_id, producto_id, cantidad, fecha } = req.body;
  conexion.query(
    'UPDATE ventas SET estudiante_id=?, producto_id=?, cantidad=?, fecha=? WHERE id=?',
    [estudiante_id, producto_id, cantidad, fecha, req.params.id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '✅ Venta actualizada' });
    }
  );
});

// DELETE venta
app.delete('/ventas/:id', (req, res) => {
  conexion.query('DELETE FROM ventas WHERE id=?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '✅ Venta eliminada' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});