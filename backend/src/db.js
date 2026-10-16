const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'gestion_transporte',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 12,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});
pool.on('error', (err) => console.error('Error de conexión PostgreSQL:', err.message));
module.exports = pool;
