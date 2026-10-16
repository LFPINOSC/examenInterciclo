const express = require('express');
const cors = require('cors');
const { init } = require('./db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const pacientesRoutes = require('./routes/pacientes');
const medicosRoutes = require('./routes/medicos');
const habitacionesRoutes = require('./routes/habitaciones');
const hospitalizacionesRoutes = require('./routes/hospitalizaciones');
const usuariosRoutes = require('./routes/usuarios');

init();

const app = express();
const puerto = Number(process.env.PORT) || 3000;

app.use(cors({ origin: ['http://localhost:4200', 'http://127.0.0.1:4200'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'control-hospitalizacion' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/hospitalizaciones', hospitalizacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la petición no es JSON válido' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(puerto, () => {
  console.log(`API de hospitalización en http://localhost:${puerto}`);
});
