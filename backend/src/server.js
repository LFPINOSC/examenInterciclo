require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

async function iniciar() {
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en el archivo .env (copie .env.example como .env)');
    process.exit(1);
  }
  try {
    await pool.query('SELECT 1');
    console.log(`Conectado a MySQL: ${process.env.DB_NAME || 'control_vacunacion'}`);
  } catch (err) {
    console.error('No se pudo conectar a MySQL:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}/api`);
    console.log(`Frontend disponible en http://localhost:${PORT}`);
  });
}

iniciar();
