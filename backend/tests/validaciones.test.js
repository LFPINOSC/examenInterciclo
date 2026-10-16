const test=require('node:test');
const assert=require('node:assert/strict');
const {validarVehiculo,validarConductor,validarRuta,validarViaje,validarUsuario} = require('../src/validators/fields');

test('Vehículo válido normaliza placa',()=>{
  assert.equal(validarVehiculo({placa:'abc-1023',marca:'Hino',modelo:'FC9',capacidad:35}).placa,'ABC-1023');
});
test('No acepta placas muy cortas',()=>assert.throws(()=>validarVehiculo({placa:'AB',marca:'Hino',modelo:'F',capacidad:30}),/Placa/));
test('No acepta capacidad negativa',()=>assert.throws(()=>validarVehiculo({placa:'ABC-1023',marca:'Hino',modelo:'F',capacidad:-1}),/Capacidad/));
test('No acepta rutas con origen igual a destino',()=>assert.throws(()=>validarRuta({origen:'Cuenca',destino:'cuenca',distancia_km:24}),/diferentes/));
test('Conductor válido',()=>assert.equal(validarConductor({nombres:'Carlos Moreno',licencia:'lic-001',telefono:'0987654321'}).estado,'activo'));
test('Rechaza llegada anterior a salida',()=>assert.throws(()=>validarViaje({id_vehiculo:1,id_conductor:1,id_ruta:1,fecha_salida:'2026-10-16T15:00:00.000Z',fecha_llegada_prevista:'2026-10-16T13:00:00.000Z'}),/posterior/));
test('Rechaza fecha sin zona horaria',()=>assert.throws(()=>validarViaje({id_vehiculo:1,id_conductor:1,id_ruta:1,fecha_salida:'2026-10-16T15:00',fecha_llegada_prevista:'2026-10-16T17:00'}),/zona horaria/));
test('Rechaza contraseña insegura',()=>assert.throws(()=>validarUsuario({nombre:'Administrador',correo:'a@b.com',password:'123',rol:'admin'}),/Contraseña/));
test('Rechaza rol desconocido',()=>assert.throws(()=>validarUsuario({nombre:'Operador Prueba',correo:'b@b.com',password:'password123',rol:'root'}),/Rol/));
