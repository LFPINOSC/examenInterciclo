const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});
const bcrypt=require('bcryptjs');
const pool=require('../src/db');
const { validarUsuario }=require('../src/validators/fields');
(async()=>{
  const d=validarUsuario({nombre:process.env.ADMIN_NOMBRE,correo:process.env.ADMIN_EMAIL,
    password:process.env.ADMIN_PASSWORD,rol:'admin'},true);
  if(d.password.startsWith('REEMPLAZA')) throw new Error('Edita ADMIN_PASSWORD en backend/.env antes de crear el admin.');
  const hash=await bcrypt.hash(d.password,12);
  const {rows}=await pool.query(`INSERT INTO usuarios(nombre,correo,password_hash,rol,activo)
    VALUES($1,$2,$3,'admin',TRUE)
    ON CONFLICT(correo) DO UPDATE SET nombre=EXCLUDED.nombre,password_hash=EXCLUDED.password_hash,
      rol='admin',activo=TRUE RETURNING id_usuario,correo,rol`,[d.nombre,d.correo,hash]);
  console.log('✅ Administrador creado/actualizado:',rows[0].correo,'| ID:',rows[0].id_usuario);
})().catch(e=>{console.error('❌',e.message);process.exitCode=1;}).finally(()=>pool.end());
