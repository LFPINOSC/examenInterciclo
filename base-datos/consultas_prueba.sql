-- Ejecutar conectado a soporte_tecnico_db DESPUES de arrancar el backend con la siembra habilitada.
SELECT id,nombre,apellido,correo,rol,activo FROM usuarios ORDER BY id;
SELECT id,nombre,apellido,especialidad,activo FROM tecnicos ORDER BY id;
SELECT id,tipo,marca,modelo,cliente_id FROM equipos ORDER BY id;
SELECT id,nombre,precio,activo FROM servicios ORDER BY id;
SELECT t.id,t.estado,t.prioridad,e.marca||' '||e.modelo AS equipo,
  u.nombre||' '||u.apellido AS cliente,tec.nombre AS tecnico
FROM tickets t JOIN equipos e ON e.id=t.equipo_id JOIN usuarios u ON u.id=e.cliente_id
LEFT JOIN tecnicos tec ON tec.id=t.tecnico_id ORDER BY t.id;
SELECT t.id AS ticket,COALESCE(SUM(d.precio_aplicado),0) AS total
FROM tickets t LEFT JOIN detalles_servicio d ON d.ticket_id=t.id GROUP BY t.id ORDER BY t.id;
