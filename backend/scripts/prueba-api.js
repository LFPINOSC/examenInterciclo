const path=require('path');
require('dotenv').config({path:path.resolve(__dirname,'../.env')});
const base=(process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/,'');
let token='';
const created = [];
let ok = 0;
async function request(method,endpoint,data,auth=token,expected) {
  const response=await fetch(`${base}${endpoint}`,{
    method,headers:{'Content-Type':'application/json', ...(auth?{Authorization:`Bearer ${auth}`}:{})},
    ...(data===undefined?{}:{body:JSON.stringify(data)})
  });
  let output;
  try{output=await response.json();}catch{output={};}
  if (expected != null && response.status!==expected) throw Error(`${method} ${endpoint}: HTTP ${response.status}, esperado ${expected}. ${JSON.stringify(output)}`);
  if (expected == null && !response.ok) throw Error(`${method} ${endpoint}: HTTP ${response.status}. ${JSON.stringify(output)}`);
  return output;
}
async function check(label,callback) { await callback();ok++;console.log(`✔ ${label}`); }
const suffix=String(Date.now()).slice(-8);
(async()=>{
  await check('PostgreSQL y servidor conectados',async()=>{
    const h=await request('GET','/api/health');
    if(h.estado!=='ok') throw Error('Health incorrecto');
  });
  const auth=await request('POST','/api/auth/login',{correo:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});
  token=auth.token;
  if(!token) throw Error('No se generó JWT.');
  ok++;console.log('✔ Autenticación y JWT');
  const veh={placa:`TST-${suffix.slice(-6)}`,marca:'Prueba',modelo:'Integración',capacidad:22,estado:'activo'};
  const cond={nombres:'Conductor de Prueba',licencia:`TEST-${suffix}`,telefono:'0987654321',estado:'activo'};
  const ruta={origen:`Ciudad ${suffix}`,destino:`Puerto ${suffix}`,distancia_km:35.5,estado:'activo'};
  const v=await request('POST','/api/vehiculos',veh);created.push(['/api/vehiculos',v.id_vehiculo]);ok++;console.log('✔ Crear vehículo');
  const c=await request('POST','/api/conductores',cond);created.push(['/api/conductores',c.id_conductor]);ok++;console.log('✔ Crear conductor');
  const r=await request('POST','/api/rutas',ruta);created.push(['/api/rutas',r.id_ruta]);ok++;console.log('✔ Crear ruta');
  await check('Consultar vehículo por ID',async()=>{const row=await request('GET',`/api/vehiculos/${v.id_vehiculo}`);if(row.placa!==veh.placa)throw Error('Datos diferentes');});
  await check('Actualizar vehículo mediante PUT',async()=>{const row=await request('PUT',`/api/vehiculos/${v.id_vehiculo}`,{...veh,capacidad:23});if(row.capacidad!==23)throw Error('PUT no actualizó');});
  await check('Placa única, error HTTP 409',async()=>{await request('POST','/api/vehiculos',veh,token,409);});
  const viaje={id_vehiculo:v.id_vehiculo,id_conductor:c.id_conductor,id_ruta:r.id_ruta,fecha_salida:'2032-06-15T10:00:00.000Z',fecha_llegada_prevista:'2032-06-15T12:00:00.000Z',estado:'programado',observaciones:'Prueba automática'};
  const t=await request('POST','/api/viajes',viaje);created.push(['/api/viajes',t.id_viaje]);ok++;console.log('✔ Programar viaje asociado a tres catálogos');
  await check('Evitar solapamiento de viajes (HTTP 409)',async()=>{await request('POST','/api/viajes',{...viaje,fecha_salida:'2032-06-15T11:00:00.000Z',fecha_llegada_prevista:'2032-06-15T13:00:00.000Z'},token,409);});
  await check('Proteger integridad referencial (HTTP 409)',async()=>{await request('DELETE',`/api/vehiculos/${v.id_vehiculo}`,undefined,token,409);});
  await check('Actualizar viaje a finalizado',async()=>{const upd=await request('PUT',`/api/viajes/${t.id_viaje}`,{...viaje,estado:'finalizado'});if(upd.estado!=='finalizado')throw Error('PUT viaje falló');});
  const user=await request('POST','/api/usuarios',{nombre:'Operador de Prueba',correo:`operador.${suffix}@example.test`,password:'PruebaSegura123!',rol:'operador',activo:true});
  created.push(['/api/usuarios',user.id_usuario]);ok++;console.log('✔ Crear usuario operador');
  const userAuth=await request('POST','/api/auth/login',{correo:`operador.${suffix}@example.test`,password:'PruebaSegura123!'});
  await check('Bloquear administración al operador (HTTP 403)',async()=>{await request('POST','/api/vehiculos',veh,userAuth.token,403);});
  await check('El operador puede consultar viajes',async()=>{await request('GET','/api/viajes',undefined,userAuth.token);});
  await check('API resumen funcional',async()=>{const s=await request('GET','/api/resumen');if(typeof s.viajes!=='number')throw Error('Resumen inválido');});
  console.log(`\n✔ ${ok} comprobaciones completadas. Los registros de prueba se eliminarán.`);
})().catch(error=>{console.error('✖ Prueba fallida:',error.message);process.exitCode=1;}).finally(async()=>{
  for(const [endpoint,id] of created.reverse()) {
    try{await request('DELETE',`${endpoint}/${id}`);}catch(error){console.error(`Aviso: limpiar ${endpoint}/${id}: ${error.message}`);}
  }
});
