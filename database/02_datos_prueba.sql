-- Datos ficticios para exhibir el CRUD. Ejecutar DESPUÉS de 01_esquema.sql.
-- No inserta usuarios: se crean con el script seguro npm run crear-admin.
-- Se puede volver a ejecutar sin duplicar las placas, licencias o rutas de ejemplo.
INSERT INTO vehiculos (placa, marca, modelo, capacidad, estado) VALUES
 ('ABC-1023','Hino','FC9J',38,'activo'),
 ('ABC-2024','Chevrolet','NPR',24,'activo'),
 ('ABC-3025','Mercedes-Benz','Sprinter',16,'activo')
ON CONFLICT (placa) DO NOTHING;

INSERT INTO conductores (nombres, licencia, telefono, estado) VALUES
 ('Carlos Andrade','LIC-0001','0987654321','activo'),
 ('María Cabrera','LIC-0002','0991234567','activo'),
 ('Daniel Vargas','LIC-0003','0981122334','activo')
ON CONFLICT (licencia) DO NOTHING;

INSERT INTO rutas (origen,destino,distancia_km,estado) VALUES
 ('Cuenca','Azogues',34.00,'activo'),
 ('Azogues','Cañar',44.50,'activo'),
 ('Cuenca','Guayaquil',196.00,'activo')
ON CONFLICT (origen,destino) DO NOTHING;
