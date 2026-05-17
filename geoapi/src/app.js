const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const morgan   = require('morgan');
const jwt      = require('jsonwebtoken');
const path     = require('path');
require('dotenv').config();

const locationRoutes = require('./routes/location');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middlewares globales
app.use(helmet({
    contentSecurityPolicy: false  // necesario para cargar Leaflet
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ruta de salud
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Generar token para dispositivo
app.post('/api/auth/token', (req, res) => {
    const { device_id, secret } = req.body;
    if (secret !== process.env.JWT_SECRET) {
        return res.status(403).json({ error: 'No autorizado' });
    }
    const token = jwt.sign(
        { device_id },
        process.env.JWT_SECRET,
        { expiresIn: '365d' }
    );
    res.json({ token });
});

// Login del panel web
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (
        username === process.env.PANEL_USER &&
        password === process.env.PANEL_PASSWORD
    ) {
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Credenciales incorrectas' });
    }
});

// Rutas API
app.use('/api/location', locationRoutes);
app.use('/api/dashboard', dashboardRoutes);

module.exports = app;
