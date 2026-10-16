const estado = (options = ['activo', 'inactivo']) => ({ name: 'estado', label: 'Estado', type: 'select', required: true, options: options.map(value => ({value, label: labelsEstado[value] || value})) });
export const labelsEstado = {
  activo: 'Activo', inactivo: 'Inactivo', programado: 'Programado', en_curso: 'En curso',
  finalizado: 'Finalizado', cancelado: 'Cancelado', admin: 'Administrador', operador: 'Operador'
};
export const resources = {
  vehiculos: {
    title: 'Vehículos', description: 'Controla los datos y la disponibilidad de tu flota.', pk: 'id_vehiculo',
    columns: [['placa','Placa'],['marca','Marca'],['modelo','Modelo'],['capacidad','Capacidad'],['estado','Estado']],
    fields: [
      {name:'placa',label:'Placa',type:'text',placeholder:'ABC-1234',minlength:5,maxlength:12,required:true},
      {name:'marca',label:'Marca',type:'text',placeholder:'Hino',minlength:2,maxlength:60,required:true},
      {name:'modelo',label:'Modelo',type:'text',placeholder:'FC9J',maxlength:60,required:true},
      {name:'capacidad',label:'Capacidad (pasajeros)',type:'number',min:1,max:120,required:true},
      estado()
    ]
  },
  conductores: {
    title:'Conductores', description:'Administra personal, licencias y estado de disponibilidad.', pk:'id_conductor',
    columns:[['nombres','Nombre completo'],['licencia','Licencia'],['telefono','Teléfono'],['estado','Estado']],
    fields:[
      {name:'nombres',label:'Nombre completo',type:'text',minlength:3,maxlength:120,required:true},
      {name:'licencia',label:'Licencia',type:'text',minlength:4,maxlength:30,required:true},
      {name:'telefono',label:'Teléfono',type:'tel',minlength:7,maxlength:20,required:true},
      estado()
    ]
  },
  rutas: {
    title:'Rutas', description:'Define los trayectos disponibles y sus distancias.', pk:'id_ruta',
    columns:[['origen','Origen'],['destino','Destino'],['distancia_km','Distancia (km)'],['estado','Estado']],
    fields:[
      {name:'origen',label:'Ciudad de origen',type:'text',minlength:2,maxlength:100,required:true},
      {name:'destino',label:'Ciudad de destino',type:'text',minlength:2,maxlength:100,required:true},
      {name:'distancia_km',label:'Distancia (km)',type:'number',min:0.01,step:0.01,required:true},
      estado()
    ]
  },
  viajes: {
    title:'Viajes', description:'Programa viajes y verifica la disponibilidad de conductor y vehículo.', pk:'id_viaje',
    columns:[['id_viaje','Número'],['ruta_nombre','Recorrido'],['vehiculo_placa','Vehículo'],['conductor_nombre','Conductor'],['fecha_salida','Salida'],['estado','Estado']],
    fields:[
      {name:'id_vehiculo',label:'Vehículo',type:'relation',source:'vehiculos',required:true},
      {name:'id_conductor',label:'Conductor',type:'relation',source:'conductores',required:true},
      {name:'id_ruta',label:'Ruta',type:'relation',source:'rutas',required:true},
      {name:'fecha_salida',label:'Fecha y hora de salida',type:'datetime-local',required:true},
      {name:'fecha_llegada_prevista',label:'Llegada prevista',type:'datetime-local',required:true},
      estado(['programado','en_curso','finalizado','cancelado']),
      {name:'observaciones',label:'Observaciones',type:'textarea',maxlength:250,full:true}
    ]
  },
  usuarios: {
    title:'Usuarios', description:'Gestiona las cuentas y permisos de acceso al sistema.', pk:'id_usuario',
    columns:[['nombre','Nombre'],['correo','Correo'],['rol','Rol'],['activo','Acceso']],
    fields:[
      {name:'nombre',label:'Nombre completo',type:'text',minlength:3,maxlength:100,required:true},
      {name:'correo',label:'Correo electrónico',type:'email',maxlength:160,required:true},
      {name:'password',label:'Contraseña',type:'password',minlength:8,maxlength:72,placeholder:'Mínimo 8 caracteres'},
      {name:'rol',label:'Rol',type:'select',required:true,options:[{value:'admin',label:'Administrador'},{value:'operador',label:'Operador'}]},
      {name:'activo',label:'Acceso',type:'select',required:true,options:[{value:'true',label:'Habilitado'},{value:'false',label:'Deshabilitado'}]}
    ]
  }
};
