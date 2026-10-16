const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});
const pool=require('./db');
const app=require('./app');
async function iniciar(){
  if(!process.env.JWT_SECRET || process.env.JWT_SECRET.length<32 || process.env.JWT_SECRET.startsWith('REEMPLAZA')) {
    throw new Error('Configura JWT_SECRET seguro (mínimo 32 caracteres) en backend/.env');
  }
  const conexion=await pool.query('SELECT current_database() AS db');
  const port=Number(process.env.PORT || 3000);
  app.listen(port,()=>{
    console.log(`✅ API y web: http://localhost:${port} | PostgreSQL: ${conexion.rows[0].db}`);
    if(process.env.RUTACONTROL_OPEN_BROWSER === '1' && process.platform === 'win32') {
      try {
        const {spawn} = require('child_process');
        const child=spawn('powershell.exe',['-NoProfile','-Command',`Start-Process 'http://localhost:${port}'`],{detached:true,stdio:'ignore'});
        child.unref();
      } catch (error) { console.warn('Abre manualmente la dirección del servidor.'); }
    }
  });
}
iniciar().catch(e=>{console.error('❌ No se pudo iniciar:',e.message);process.exit(1);});
