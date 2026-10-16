const { Pool } = require('pg');

// Configuración del Pool usando las variables del archivo .env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
    console.log('Base de datos conectada exitosamente');
});

module.exports = pool;