const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');
const auth    = require('../middleware/auth');

// GET /api/dashboard/devices — lista de dispositivos
router.get('/devices', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT device_id FROM locations ORDER BY device_id`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error interno' });
    }
});

// GET /api/dashboard/track — recorrido por filtros
router.get('/track', auth, async (req, res) => {
    const { device_id, from, to } = req.query;

    if (!device_id || !from || !to) {
        return res.status(400).json({ error: 'Faltan parámetros: device_id, from, to' });
    }

    try {
        const result = await pool.query(
            `SELECT latitude, longitude, accuracy, speed, timestamp
             FROM locations
             WHERE device_id = $1
               AND timestamp BETWEEN $2 AND $3
             ORDER BY timestamp ASC`,
            [device_id, from, to]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error interno' });
    }
});

// GET /api/dashboard/latest — última posición de cada dispositivo
router.get('/latest', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (device_id)
                device_id, latitude, longitude, accuracy, speed, timestamp
             FROM locations
             ORDER BY device_id, timestamp DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ error: 'Error interno' });
    }
});

module.exports = router;
