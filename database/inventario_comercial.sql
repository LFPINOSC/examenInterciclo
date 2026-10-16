-- =====================================================================
-- SISTEMA DE INVENTARIO COMERCIAL
-- Estudiante: Kevin Stalin Marca Gutama (N.º 15)
-- Motor: PostgreSQL (pgAdmin)
--
-- ANTES DE EJECUTAR:
--   1. En pgAdmin crea la base de datos:  inventario_comercial
--      (clic derecho en Databases > Create > Database...)
--   2. Selecciona esa base y abre Query Tool.
--   3. Ejecuta este script completo (F5).
-- =====================================================================

-- Si se vuelve a ejecutar, borra las tablas en orden inverso a las dependencias
DROP TABLE IF EXISTS movimiento_inventario;
DROP TABLE IF EXISTS producto;
DROP TABLE IF EXISTS proveedor;
DROP TABLE IF EXISTS categoria;
DROP TABLE IF EXISTS usuario;

-- ---------------------------------------------------------------------
-- USUARIO: personas que ingresan al sistema (seguridad y control)
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id              BIGSERIAL    PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,              -- guardada con BCrypt
    rol             VARCHAR(20)  NOT NULL,              -- ADMIN | EMPLEADO
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_creacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('ADMIN', 'EMPLEADO'))
);

-- ---------------------------------------------------------------------
-- CATEGORIA: agrupa productos (Bebidas, Limpieza, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE categoria (
    id          BIGSERIAL    PRIMARY KEY,
    nombre      VARCHAR(60)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- ---------------------------------------------------------------------
-- PROVEEDOR: empresa que abastece los productos
-- ---------------------------------------------------------------------
CREATE TABLE proveedor (
    id            BIGSERIAL    PRIMARY KEY,
    ruc           VARCHAR(13)  NOT NULL UNIQUE,
    razon_social  VARCHAR(120) NOT NULL,
    telefono      VARCHAR(15),
    email         VARCHAR(100),
    direccion     VARCHAR(200)
);

-- ---------------------------------------------------------------------
-- PRODUCTO: artículo del inventario
--   N productos pertenecen a 1 categoría
--   N productos son provistos por 1 proveedor
-- ---------------------------------------------------------------------
CREATE TABLE producto (
    id             BIGSERIAL     PRIMARY KEY,
    codigo         VARCHAR(30)   NOT NULL UNIQUE,
    nombre         VARCHAR(120)  NOT NULL,
    descripcion    VARCHAR(255),
    precio_compra  NUMERIC(10,2) NOT NULL,
    precio_venta   NUMERIC(10,2) NOT NULL,
    stock          INTEGER       NOT NULL DEFAULT 0,
    stock_minimo   INTEGER       NOT NULL DEFAULT 0,
    activo         BOOLEAN       NOT NULL DEFAULT TRUE,
    categoria_id   BIGINT        NOT NULL,
    proveedor_id   BIGINT        NOT NULL,
    CONSTRAINT fk_producto_categoria FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    CONSTRAINT fk_producto_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor(id),
    CONSTRAINT chk_producto_precios CHECK (precio_compra >= 0 AND precio_venta >= 0),
    CONSTRAINT chk_producto_stock   CHECK (stock >= 0 AND stock_minimo >= 0)
);

-- ---------------------------------------------------------------------
-- MOVIMIENTO_INVENTARIO: historial (kardex) de entradas y salidas.
--   N movimientos afectan a 1 producto
--   N movimientos son registrados por 1 usuario
-- ---------------------------------------------------------------------
CREATE TABLE movimiento_inventario (
    id           BIGSERIAL    PRIMARY KEY,
    tipo         VARCHAR(10)  NOT NULL,                 -- ENTRADA | SALIDA
    cantidad     INTEGER      NOT NULL,
    motivo           VARCHAR(200),
    precio_unitario  NUMERIC(10,2) NOT NULL,             -- precio al momento (venta o compra)
    costo_unitario   NUMERIC(10,2) NOT NULL,             -- costo al momento (para la ganancia)
    fecha        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    producto_id  BIGINT       NOT NULL,
    usuario_id   BIGINT       NOT NULL,
    CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_movimiento_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario(id),
    CONSTRAINT chk_movimiento_tipo     CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_movimiento_precios  CHECK (precio_unitario >= 0 AND costo_unitario >= 0)
);

-- =====================================================================
-- DATOS DE PRUEBA: catálogo de un minimarket en Cuenca
-- =====================================================================

-- Usuarios (contraseñas cifradas con BCrypt).
--   admin / admin123  -> ADMIN
--   empleado, cruiz, lgarcia / empleado123 -> EMPLEADO  (mpesantez está desactivada)
INSERT INTO usuario (nombre, username, password, rol, activo) VALUES
('Kevin Marca', 'admin', '$2a$10$OqC6/5kwdJycV62JkCzHgu4xqZCbjW0S5.iMinSZsI8ZwzX4Jvrc6', 'ADMIN', TRUE),
('Ana Torres', 'empleado', '$2a$10$RYr.DARvA960gie0xH9fpeIWtNOh3Tp/jnuFKrPromCK6Ho3Q9lT.', 'EMPLEADO', TRUE),
('Carlos Ruiz', 'cruiz', '$2a$10$lUuauKCbAwzcM7dKlKD6R.gzrducdXsJe6gXa8.N6nxOgbczt9b32', 'EMPLEADO', TRUE),
('Luis García', 'lgarcia', '$2a$10$BpjJqWAf5vj.8Cdf0rhAf.f1xFgvdXdJBS7o9Ag1Iff/b7N3u9WL2', 'EMPLEADO', TRUE),
('María Pesántez', 'mpesantez', '$2a$10$ih9geeJRQKs.wIHryJTqhugGw7Oz7KdgXdXHuo0i4q.t5DBPgQwGa', 'EMPLEADO', FALSE);

INSERT INTO categoria (nombre, descripcion) VALUES
('Bebidas', 'Gaseosas, aguas, jugos y energizantes'),
('Lácteos y huevos', 'Leche, yogur, quesos, mantequilla y huevos'),
('Abarrotes', 'Arroz, azúcar, aceite, granos, fideos y enlatados'),
('Snacks y dulces', 'Papas fritas, galletas, chocolates y caramelos'),
('Panadería', 'Pan, pasteles y productos de harina'),
('Embutidos y carnes', 'Salchichas, jamón, mortadela y pollo'),
('Frutas y verduras', 'Productos frescos de temporada'),
('Limpieza del hogar', 'Detergentes, desinfectantes y utensilios'),
('Higiene personal', 'Jabones, champú, papel higiénico y cuidado dental'),
('Mascotas', 'Alimento y cuidado para mascotas');

INSERT INTO proveedor (ruc, razon_social, telefono, email, direccion) VALUES
('0190012345001', 'Distribuidora Austral S.A.', '072800100', 'ventas@austral.ec', 'Av. España y Turuhuayco, Cuenca'),
('0190098765001', 'Comercial Andina Cía. Ltda.', '072833200', 'pedidos@andina.ec', 'Av. de las Américas 4-56, Cuenca'),
('0190056789001', 'Lácteos del Azuay S.A.', '072845500', 'ventas@lacteosazuay.ec', 'Parque Industrial, Cuenca'),
('0190034567001', 'Panificadora El Trigal', '072820330', 'pedidos@eltrigal.ec', 'Calle Larga 7-21, Cuenca'),
('0190078901001', 'Embutidos La Cuencana Cía. Ltda.', '072867800', 'ventas@lacuencana.ec', 'Av. Ordóñez Lasso, Cuenca'),
('0190045678001', 'Agroproductos del Sur', '0991234567', 'contacto@agrosur.ec', 'Mercado El Arenal, Cuenca'),
('0190023456001', 'Higiene Total Distribuciones S.A.', '072811900', 'ventas@higienetotal.ec', 'Av. Huayna Cápac 3-10, Cuenca');

-- Productos: la categoría y el proveedor se buscan por nombre para no depender de los id.
INSERT INTO producto (codigo, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, activo, categoria_id, proveedor_id)
SELECT d.codigo, d.nombre, d.descripcion, d.compra, d.venta, d.stock, d.minimo, d.activo, c.id, p.id
FROM (VALUES
  ('BEB-001', 'Agua mineral 1L', 'Botella plástica', 0.45, 0.80, 120, 30, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-002', 'Gaseosa cola 2L', 'Botella retornable', 1.20, 1.85, 15, 20, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-003', 'Gaseosa naranja 1.35L', 'Botella plástica', 0.85, 1.25, 48, 20, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-004', 'Jugo de naranja 1L', 'Tetrapack', 1.10, 1.60, 36, 12, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-005', 'Té helado limón 500ml', 'Botella', 0.55, 0.90, 60, 24, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-006', 'Bebida energizante 473ml', 'Lata', 1.05, 1.60, 30, 12, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-007', 'Agua sin gas 625ml', 'Botella', 0.30, 0.50, 0, 24, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('BEB-008', 'Bebida hidratante 600ml', 'Sabor mora', 0.70, 1.10, 40, 15, TRUE, 'Bebidas', 'Distribuidora Austral S.A.'),
  ('LAC-001', 'Leche entera 1L', 'Funda', 0.85, 1.05, 90, 40, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('LAC-002', 'Leche deslactosada 1L', 'Cartón', 1.10, 1.40, 25, 20, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('LAC-003', 'Yogur de fresa 1L', 'Botella', 1.60, 2.20, 18, 15, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('LAC-004', 'Queso fresco 500g', 'Empaque al vacío', 2.30, 3.10, 14, 10, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('LAC-005', 'Mantequilla 250g', 'Barra', 1.40, 1.95, 22, 8, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('LAC-006', 'Huevos cubeta x30', 'Huevos medianos', 3.80, 4.80, 6, 10, TRUE, 'Lácteos y huevos', 'Agroproductos del Sur'),
  ('LAC-007', 'Queso mozzarella 400g', 'Bloque', 3.20, 4.30, 12, 6, TRUE, 'Lácteos y huevos', 'Lácteos del Azuay S.A.'),
  ('ABA-001', 'Arroz flor 5 lb', 'Funda', 2.40, 3.10, 60, 15, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-002', 'Azúcar blanca 2 kg', 'Funda', 1.90, 2.45, 45, 15, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-003', 'Aceite vegetal 1L', 'Botella', 2.10, 2.75, 30, 12, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-004', 'Fideo tallarín 400g', 'Funda', 0.65, 0.95, 55, 20, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-005', 'Atún en aceite 170g', 'Lata', 1.15, 1.60, 70, 25, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-006', 'Sal yodada 1 kg', 'Funda', 0.35, 0.55, 40, 10, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-007', 'Harina de trigo 1 kg', 'Funda', 0.95, 1.35, 28, 10, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-008', 'Lenteja 500g', 'Funda', 0.80, 1.15, 9, 12, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-009', 'Café soluble 85g', 'Frasco', 2.60, 3.50, 20, 8, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-010', 'Avena en hojuelas 500g', 'Funda', 0.90, 1.30, 32, 10, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-011', 'Salsa de tomate 400g', 'Doypack', 1.05, 1.50, 26, 10, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('ABA-012', 'Mayonesa 400g', 'Doypack', 1.30, 1.85, 24, 10, TRUE, 'Abarrotes', 'Comercial Andina Cía. Ltda.'),
  ('SNK-001', 'Papas fritas 150g', 'Funda', 1.10, 1.60, 40, 15, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-002', 'Galletas de chocolate 6 pack', 'Paquete', 1.20, 1.75, 35, 12, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-003', 'Chocolate en barra 100g', 'Barra', 1.40, 2.00, 4, 10, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-004', 'Caramelos surtidos 500g', 'Funda', 1.80, 2.60, 15, 6, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-005', 'Maní salado 200g', 'Funda', 1.00, 1.45, 22, 8, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-006', 'Chifles de plátano 150g', 'Funda', 0.75, 1.10, 30, 10, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('SNK-007', 'Galletas de soda 8 pack', 'Paquete', 1.05, 1.50, 0, 10, TRUE, 'Snacks y dulces', 'Distribuidora Austral S.A.'),
  ('PAN-001', 'Pan de molde blanco 600g', 'Funda', 1.70, 2.35, 16, 8, TRUE, 'Panadería', 'Panificadora El Trigal'),
  ('PAN-002', 'Pan integral 550g', 'Funda', 1.90, 2.60, 10, 6, TRUE, 'Panadería', 'Panificadora El Trigal'),
  ('PAN-003', 'Tostadas 200g', 'Paquete', 1.10, 1.55, 14, 6, TRUE, 'Panadería', 'Panificadora El Trigal'),
  ('PAN-004', 'Pastel de chocolate', 'Porción familiar', 6.50, 9.00, 3, 2, TRUE, 'Panadería', 'Panificadora El Trigal'),
  ('PAN-005', 'Empanadas de queso x6', 'Bandeja', 2.20, 3.00, 8, 4, TRUE, 'Panadería', 'Panificadora El Trigal'),
  ('EMB-001', 'Salchicha de pollo 500g', 'Empaque', 2.10, 2.85, 20, 8, TRUE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('EMB-002', 'Jamón de cerdo 200g', 'Rebanado', 2.40, 3.20, 12, 6, TRUE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('EMB-003', 'Mortadela 500g', 'Empaque', 1.80, 2.50, 15, 6, TRUE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('EMB-004', 'Chorizo parrillero 500g', 'Empaque', 3.10, 4.20, 5, 6, TRUE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('EMB-005', 'Pechuga de pollo 1 kg', 'Bandeja refrigerada', 4.80, 6.20, 10, 5, TRUE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('EMB-006', 'Tocino ahumado 200g', 'Rebanado', 2.70, 3.60, 0, 4, FALSE, 'Embutidos y carnes', 'Embutidos La Cuencana Cía. Ltda.'),
  ('FRU-001', 'Banano (libra)', 'Granel', 0.25, 0.45, 80, 30, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-002', 'Manzana roja (libra)', 'Granel', 0.70, 1.10, 40, 15, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-003', 'Tomate riñón (libra)', 'Granel', 0.45, 0.75, 35, 15, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-004', 'Cebolla paiteña (libra)', 'Granel', 0.40, 0.65, 30, 15, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-005', 'Papa chola (arroba)', 'Saco', 6.00, 8.50, 6, 4, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-006', 'Limón (funda x10)', 'Funda', 0.60, 1.00, 12, 15, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('FRU-007', 'Aguacate (unidad)', 'Granel', 0.45, 0.75, 25, 10, TRUE, 'Frutas y verduras', 'Agroproductos del Sur'),
  ('LIM-001', 'Detergente en polvo 1kg', 'Funda', 1.90, 2.75, 8, 10, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-002', 'Cloro 1L', 'Botella', 0.70, 1.05, 34, 12, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-003', 'Lavavajillas en crema 500g', 'Tarrina', 1.25, 1.80, 26, 10, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-004', 'Desinfectante lavanda 1L', 'Botella', 1.50, 2.20, 18, 8, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-005', 'Esponja doble uso x3', 'Paquete', 0.80, 1.25, 30, 10, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-006', 'Fundas de basura x10', 'Paquete', 0.90, 1.40, 22, 10, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('LIM-007', 'Suavizante de ropa 1L', 'Botella', 1.70, 2.40, 7, 8, TRUE, 'Limpieza del hogar', 'Comercial Andina Cía. Ltda.'),
  ('HIG-001', 'Papel higiénico x4', 'Paquete', 1.60, 2.30, 50, 20, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-002', 'Jabón de tocador 120g', 'Barra', 0.55, 0.85, 45, 15, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-003', 'Champú 400ml', 'Botella', 2.80, 3.90, 16, 8, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-004', 'Jabón líquido 500ml', 'Dispensador', 1.90, 2.70, 3, 10, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-005', 'Pasta dental 100ml', 'Tubo', 1.20, 1.75, 28, 10, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-006', 'Cepillo dental', 'Cerdas medias', 0.90, 1.40, 20, 8, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-007', 'Desodorante en barra 50g', 'Barra', 2.10, 3.00, 14, 6, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('HIG-008', 'Toallas húmedas x80', 'Paquete', 1.80, 2.60, 11, 6, TRUE, 'Higiene personal', 'Higiene Total Distribuciones S.A.'),
  ('MAS-001', 'Alimento para perro adulto 2 kg', 'Funda', 5.20, 7.10, 12, 5, TRUE, 'Mascotas', 'Higiene Total Distribuciones S.A.'),
  ('MAS-002', 'Alimento para gato 1 kg', 'Funda', 3.40, 4.80, 9, 5, TRUE, 'Mascotas', 'Higiene Total Distribuciones S.A.'),
  ('MAS-003', 'Arena para gato 4 kg', 'Funda', 3.00, 4.25, 2, 4, TRUE, 'Mascotas', 'Higiene Total Distribuciones S.A.'),
  ('MAS-004', 'Snack dental para perro x7', 'Paquete', 2.20, 3.10, 10, 4, FALSE, 'Mascotas', 'Higiene Total Distribuciones S.A.')
) AS d(codigo, nombre, descripcion, compra, venta, stock, minimo, activo, categoria, proveedor)
JOIN categoria c ON c.nombre = d.categoria
JOIN proveedor p ON p.razon_social = d.proveedor;

-- Movimientos de los últimos 7 días (se calculan desde la fecha actual,
-- así el gráfico del dashboard siempre muestra datos recientes).
-- precio_unitario: precio de venta si es SALIDA, de compra si es ENTRADA; costo_unitario: precio de compra.
INSERT INTO movimiento_inventario (tipo, cantidad, motivo, precio_unitario, costo_unitario, fecha, producto_id, usuario_id)
SELECT d.tipo, d.cantidad, d.motivo,
       CASE WHEN d.tipo = 'SALIDA' THEN pr.precio_venta ELSE pr.precio_compra END, pr.precio_compra,
       CURRENT_DATE - d.dias + d.hora::time, pr.id, u.id
FROM (VALUES
  ('ENTRADA', 24, 'Compra factura 001-1180', 6, '08:15', 'BEB-001', 'admin'),
  ('SALIDA', 12, 'Venta mostrador', 6, '10:40', 'LAC-001', 'empleado'),
  ('SALIDA', 6, 'Venta mostrador', 6, '16:05', 'ABA-001', 'cruiz'),
  ('ENTRADA', 30, 'Compra factura 002-0457', 5, '09:00', 'LAC-001', 'admin'),
  ('SALIDA', 8, 'Venta mostrador', 5, '12:20', 'SNK-001', 'empleado'),
  ('SALIDA', 5, 'Venta mostrador', 5, '18:30', 'BEB-002', 'lgarcia'),
  ('ENTRADA', 20, 'Compra factura 004-0921', 4, '08:45', 'HIG-001', 'admin'),
  ('SALIDA', 10, 'Venta mostrador', 4, '11:10', 'FRU-001', 'cruiz'),
  ('SALIDA', 4, 'Venta mostrador', 4, '17:50', 'LIM-001', 'empleado'),
  ('ENTRADA', 15, 'Compra factura 001-1192', 3, '09:30', 'ABA-005', 'admin'),
  ('SALIDA', 7, 'Venta mostrador', 3, '13:15', 'EMB-001', 'lgarcia'),
  ('SALIDA', 3, 'Venta mostrador', 3, '19:00', 'SNK-003', 'empleado'),
  ('ENTRADA', 40, 'Compra a productor local', 2, '08:20', 'FRU-001', 'cruiz'),
  ('SALIDA', 5, 'Venta mostrador', 2, '14:45', 'LIM-001', 'empleado'),
  ('SALIDA', 10, 'Venta al por mayor', 2, '18:10', 'ABA-001', 'admin'),
  ('ENTRADA', 12, 'Entrega diaria panadería', 1, '09:05', 'PAN-001', 'empleado'),
  ('SALIDA', 4, 'Venta mostrador', 1, '15:35', 'HIG-004', 'cruiz'),
  ('SALIDA', 2, 'Venta mostrador', 1, '17:20', 'MAS-003', 'lgarcia'),
  ('ENTRADA', 10, 'Compra factura 001-1205', 0, '08:10', 'BEB-002', 'admin'),
  ('SALIDA', 6, 'Venta mostrador', 0, '08:30', 'LAC-006', 'empleado'),
  ('SALIDA', 12, 'Venta mostrador', 0, '09:15', 'BEB-001', 'empleado'),
  ('SALIDA', 4, 'Venta mostrador', 0, '09:40', 'ABA-001', 'cruiz'),
  ('SALIDA', 6, 'Venta mostrador', 0, '10:05', 'LAC-001', 'empleado'),
  ('SALIDA', 3, 'Venta mostrador', 0, '10:30', 'HIG-001', 'lgarcia'),
  ('SALIDA', 8, 'Venta mostrador', 0, '10:55', 'SNK-001', 'cruiz'),
  ('SALIDA', 2, 'Venta mostrador', 0, '11:20', 'EMB-005', 'empleado'),
  ('SALIDA', 5, 'Venta mostrador', 0, '11:45', 'BEB-003', 'lgarcia')
) AS d(tipo, cantidad, motivo, dias, hora, codigo, username)
JOIN producto pr ON pr.codigo = d.codigo
JOIN usuario u ON u.username = d.username;
