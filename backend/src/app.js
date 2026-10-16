const path = require('path');
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { noEncontrado, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());                          // permite que el frontend (otro origen/puerto) consuma la API
app.use(express.json({ limit: '100kb' })); // convierte el cuerpo JSON en req.body

app.use('/api', rutas);
app.use('/api', noEncontrado);

// Sirve el frontend estático: http://localhost:3000
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

module.exports = app;
