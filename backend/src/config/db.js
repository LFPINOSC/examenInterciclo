// Pool de conexiones a MySQL. Un pool reutiliza conexiones abiertas en
// lugar de abrir una nueva en cada petición, lo que mejora el rendimiento.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'control_vacunacion',
  waitForConnections: true,
  connectionLimit: 10,
  // Devuelve DATE como 'YYYY-MM-DD' en lugar de objetos Date con zona horaria
  dateStrings: true,
});

module.exports = pool;
