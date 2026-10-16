const { fail } = require('../errors');
const limpiar = v => typeof v === 'string' ? v.trim() : v;
function texto(v, campo, min=1, max=120) {
  if (typeof v !== 'string' || limpiar(v).length < min || limpiar(v).length > max) fail(400, `${campo}: debe tener entre ${min} y ${max} caracteres.`);
  return limpiar(v);
}
function enumValor(v, campo, opciones) {
  if (!opciones.includes(v)) fail(400, `${campo}: elige ${opciones.join(', ')}.`);
  return v;
}
function entero(v,campo,min=1,max=1000000) {
  const n = Number(v);
  if (v === '' || v === null || v === undefined || !Number.isInteger(n) || n < min || n > max) fail(400, `${campo}: ingresa un entero entre ${min} y ${max}.`);
  return n;
}
function decimal(v,campo,min=0.01,max=999999) {
  const n = Number(v);
  if (v === '' || v === null || v === undefined || !Number.isFinite(n) || n < min || n > max) fail(400, `${campo}: ingresa un número positivo válido.`);
  return Number(n.toFixed(2));
}
function fecha(v,campo) {
  if (typeof v !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v) || !/(Z|[+-]\d\d:\d\d)$/.test(v) || !Number.isFinite(Date.parse(v))) fail(400, `${campo}: envía una fecha ISO con zona horaria.`);
  return new Date(v).toISOString();
}
function email(v) {
  const t = texto(v, 'Correo', 5, 160).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) fail(400, 'Correo electrónico inválido.');
  return t;
}
function validarVehiculo(b) {
  const placa = texto(b.placa,'Placa',5,12).toUpperCase();
  if (!/^[A-Z0-9-]{5,12}$/.test(placa)) fail(400, 'Placa: utiliza letras, números y guiones.');
  return { placa, marca:texto(b.marca,'Marca',2,60), modelo:texto(b.modelo,'Modelo',1,60),
    capacidad:entero(b.capacidad,'Capacidad',1,120), estado:enumValor(b.estado || 'activo','Estado',['activo','inactivo']) };
}
function validarConductor(b) {
  return { nombres:texto(b.nombres,'Nombres',3,120), licencia:texto(b.licencia,'Licencia',4,30).toUpperCase(),
    telefono:texto(b.telefono,'Teléfono',7,20), estado:enumValor(b.estado || 'activo','Estado',['activo','inactivo']) };
}
function validarRuta(b) {
  const o = texto(b.origen,'Origen',2,100), d = texto(b.destino,'Destino',2,100);
  if (o.toLowerCase() === d.toLowerCase()) fail(400, 'Origen y destino deben ser diferentes.');
  return { origen:o, destino:d, distancia_km:decimal(b.distancia_km,'Distancia',0.01,999999),
    estado:enumValor(b.estado || 'activo','Estado',['activo','inactivo']) };
}
function validarViaje(b) {
  const salida=fecha(b.fecha_salida,'Salida'), llegada=fecha(b.fecha_llegada_prevista,'Llegada prevista');
  if (Date.parse(llegada)<=Date.parse(salida)) fail(400,'La llegada prevista debe ser posterior a la salida.');
  return { id_vehiculo:entero(b.id_vehiculo,'Vehículo'), id_conductor:entero(b.id_conductor,'Conductor'),
    id_ruta:entero(b.id_ruta,'Ruta'), fecha_salida:salida, fecha_llegada_prevista:llegada,
    estado:enumValor(b.estado || 'programado','Estado',['programado','en_curso','finalizado','cancelado']),
    observaciones: b.observaciones ? texto(b.observaciones,'Observaciones',0,250) : '' };
}
function validarUsuario(b, requierePassword=true) {
  const data = { nombre:texto(b.nombre,'Nombre',3,100), correo:email(b.correo),
    rol:enumValor(b.rol || 'operador','Rol',['admin','operador']), activo: b.activo !== false && b.activo !== 'false' };
  if (requierePassword || b.password) {
    if (typeof b.password !== 'string' || b.password.length < 8 || b.password.length > 72) fail(400,'Contraseña: usa entre 8 y 72 caracteres.');
    data.password = b.password;
  }
  return data;
}
module.exports = { texto, entero, validarVehiculo, validarConductor, validarRuta, validarViaje, validarUsuario, email };
