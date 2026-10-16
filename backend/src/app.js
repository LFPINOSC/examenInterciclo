const express = require('express');
const cors = require('cors');
const pacienteRoutes = require('./routes/paciente.routes');
const examenRoutes = require('./routes/examen.routes');
const ordenRoutes = require('./routes/orden.routes');
const medicoRoutes = require('./routes/medico.routes');
const authRoutes = require('./routes/auth.routes'); // <-- Importar rutas de auth4
const usuariosRoutes = require('./routes/usuarios.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes); // <-- Registrar rutas de autenticación
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/examenes', examenRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API del Sistema de Laboratorio Clínico funcionando correctamente 🚀' });
});

module.exports = app;