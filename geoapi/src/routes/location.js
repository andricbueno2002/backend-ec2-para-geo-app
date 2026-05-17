const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');
const auth    = require('../middleware/auth');

// POST /api/location — Guardar ubicación
router.post('/', auth, async (req, res) => {
  const { device_id, latitude, longitude, accuracy, speed, bearing, timestamp } = req.body;

  // Validación básica
  if (!device_id || !latitude || !longitude || !timestamp) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO locations (device_id, latitude, longitude, accuracy, speed, bearing, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [device_id, latitude, longitude, accuracy, speed, bearing, timestamp]
    );

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      message: 'Ubicación guardada correctamente'
    });

  } catch (err) {
    console.error('Error al guardar ubicación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/location/:device_id — Últimas 50 ubicaciones de un dispositivo
router.get('/:device_id', auth, async (req, res) => {
  const { device_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM locations
       WHERE device_id = $1
       ORDER BY timestamp DESC
       LIMIT 50`,
      [device_id]
    );

    res.json({ success: true, data: result.rows });

  } catch (err) {
    console.error('Error al consultar ubicaciones:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
