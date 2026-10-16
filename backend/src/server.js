const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');
const routes = require('./routes');

// Crea el admin inicial si no existe ningún usuario
if (db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n === 0) {
  db.prepare('INSERT INTO usuarios (nombre,email,password_hash,rol) VALUES (?,?,?,?)')
    .run('Administrador', 'admin@ordenes.com', bcrypt.hashSync('admin123', 10), 'admin');
  console.log('Usuario inicial creado: admin@ordenes.com / admin123');
}

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

const PORT = process.env.PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
module.exports = app;
