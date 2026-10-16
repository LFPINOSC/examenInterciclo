const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});
const pool = require('../src/db');
const archivos = { esquema:'01_esquema.sql', demo:'02_datos_prueba.sql' };
(async () => {
  const nombre = archivos[process.argv[2]];
  if(!nombre) throw new Error('Uso: node scripts/ejecutar-sql.js esquema|demo');
  const file = path.resolve(__dirname,'../../database',nombre);
  const sql = await fs.readFile(file,'utf8');
  await pool.query(sql);
  console.log(`✔ SQL ejecutado: ${nombre} en ${process.env.DB_NAME || 'gestion_transporte'}`);
})().catch(e=>{console.error('✖ Falló SQL:',e.message);process.exitCode=1;}).finally(()=>pool.end());
