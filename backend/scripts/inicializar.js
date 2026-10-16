// Instalación idempotente: preserva datos y usuarios existentes.
const path = require('path');
const fs = require('fs/promises');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const pool = require('../src/db');
const { validarUsuario } = require('../src/validators/fields');
const host = process.env.DB_HOST || 'localhost';
const port = Number(process.env.DB_PORT || 5432);
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME || 'gestion_transporte';
async function run() {
  if (!/^[a-z_][a-z0-9_]{1,62}$/i.test(database)) throw new Error('Nombre de base de datos no válido.');
  if (!password || password.startsWith('CAMBIA_') || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Configura DB_PASSWORD y JWT_SECRET en backend/.env.');
  }
  const supervisor = new Client({host,port,user,password,database:'postgres',connectionTimeoutMillis:5000});
  await supervisor.connect();
  try {
    const found=await supervisor.query('SELECT 1 FROM pg_database WHERE datname=$1',[database]);
    if (!found.rowCount) { await supervisor.query(`CREATE DATABASE "${database}"`);console.log(`✓ Base de datos creada: ${database}`); }
    else console.log(`✓ Base de datos existente: ${database}`);
  } finally { await supervisor.end(); }
  try {
    for (const [file,label] of [['01_esquema.sql','Esquema y relaciones'],['02_datos_prueba.sql','Datos iniciales']]) {
      const sql=await fs.readFile(path.resolve(__dirname,'../../database',file),'utf8');
      await pool.query(sql);
      console.log(`✓ ${label}: verificado`);
    }
    const admin = validarUsuario({nombre:process.env.ADMIN_NOMBRE,correo:process.env.ADMIN_EMAIL,
      password:process.env.ADMIN_PASSWORD,rol:'admin'},true);
    if (admin.password.startsWith('REEMPLAZA') || admin.password.startsWith('TU_')) throw new Error('ADMIN_PASSWORD no configurada.');
    const previous=await pool.query('SELECT id_usuario, rol FROM usuarios WHERE correo=$1',[admin.correo]);
    if (previous.rowCount) {
      console.log('✓ Cuenta existente: se conserva su contraseña actual.');
      if(previous.rows[0].rol !== 'admin') console.log('AVISO: el correo configurado ya existe con otro rol. Revísalo desde la gestión de usuarios.');
    } else {
      const hash=await bcrypt.hash(admin.password,12);
      await pool.query('INSERT INTO usuarios(nombre,correo,password_hash,rol,activo) VALUES ($1,$2,$3,$4,TRUE)',[admin.nombre,admin.correo,hash,'admin']);
      console.log('✓ Cuenta de administrador creada.');
    }
    console.log('✓ Instalación lista; los datos existentes se han conservado.');
  } finally {await pool.end();}
}
run().catch(error=>{console.error('ERROR de configuración:',error.message);process.exitCode=1;});
