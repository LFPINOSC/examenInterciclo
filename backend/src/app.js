const path = require('path');
const express = require('express');
const helmet = require('helmet');
const pool = require('./db');
const { asyncHandler, errorHandler } = require('./errors');
const { autenticar } = require('./middleware/auth');
const { crearRouter } = require('./routes/catalogos');
const app = express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{directives:{
  defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'",'data:'],
  connectSrc:["'self'"],fontSrc:["'self'"],objectSrc:["'none'"],upgradeInsecureRequests:null
}}}));
app.use(express.json({limit:'50kb'}));
app.get('/api/health',asyncHandler(async(req,res)=>{
  await pool.query('SELECT 1 FROM usuarios LIMIT 1');
  res.json({estado:'ok',backend:'conectado',base_de_datos:'conectada'});
}));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/vehiculos',autenticar,crearRouter('vehiculos'));
app.use('/api/conductores',autenticar,crearRouter('conductores'));
app.use('/api/rutas',autenticar,crearRouter('rutas'));
app.use('/api/viajes',autenticar,require('./routes/viajes'));
app.use('/api/usuarios',autenticar,require('./routes/usuarios'));
app.get('/api/resumen',autenticar,asyncHandler(async(req,res)=>{
  const [v,c,r,t,estados,proximos]=await Promise.all([
    pool.query('SELECT COUNT(*)::int AS n FROM vehiculos'),
    pool.query('SELECT COUNT(*)::int AS n FROM conductores'),
    pool.query('SELECT COUNT(*)::int AS n FROM rutas'),
    pool.query('SELECT COUNT(*)::int AS n FROM viajes'),
    pool.query('SELECT estado,COUNT(*)::int AS total FROM viajes GROUP BY estado'),
    pool.query(`SELECT v.id_viaje,v.fecha_salida,v.estado,ve.placa,c.nombres,
      r.origen,r.destino FROM viajes v
      JOIN vehiculos ve USING(id_vehiculo) JOIN conductores c USING(id_conductor)
      JOIN rutas r USING(id_ruta)
      WHERE v.estado IN ('programado','en_curso')
      ORDER BY v.fecha_salida ASC LIMIT 6`)
  ]);
  res.json({vehiculos:v.rows[0].n,conductores:c.rows[0].n,rutas:r.rows[0].n,
    viajes:t.rows[0].n,estados:estados.rows,proximos:proximos.rows});
}));
app.use(express.static(path.resolve(__dirname,'../../frontend')));
app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint no encontrado.'}));
app.get('*',(req,res)=>res.sendFile(path.resolve(__dirname,'../../frontend/index.html')));
app.use((err,req,res,next)=>{
  if(err instanceof SyntaxError && err.status===400 && 'body' in err) return res.status(400).json({error:'JSON inválido.'});
  errorHandler(err,req,res,next);
});
module.exports=app;
