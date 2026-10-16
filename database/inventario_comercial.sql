-- =====================================================================
-- SISTEMA DE INVENTARIO COMERCIAL
-- Estudiante: Kevin Stalin Marca Gutama (N.º 15)
-- Motor: MySQL 8
-- =====================================================================

DROP DATABASE IF EXISTS inventario_comercial;
CREATE DATABASE inventario_comercial CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inventario_comercial;

-- ---------------------------------------------------------------------
-- USUARIO: personas que ingresan al sistema (seguridad y control)
-- ---------------------------------------------------------------------
CREATE TABLE usuario (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,              -- guardada con BCrypt
    rol             VARCHAR(20)  NOT NULL,              -- ADMIN | EMPLEADO
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_creacion  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuario_rol CHECK (rol IN ('ADMIN', 'EMPLEADO'))
);

-- ---------------------------------------------------------------------
-- CATEGORIA: agrupa productos (Bebidas, Limpieza, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE categoria (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(60)  NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

-- ---------------------------------------------------------------------
-- PROVEEDOR: empresa que abastece los productos
-- ---------------------------------------------------------------------
CREATE TABLE proveedor (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo         VARCHAR(30)   NOT NULL UNIQUE,
    nombre         VARCHAR(120)  NOT NULL,
    descripcion    VARCHAR(255),
    precio_compra  DECIMAL(10,2) NOT NULL,
    precio_venta   DECIMAL(10,2) NOT NULL,
    stock          INT           NOT NULL DEFAULT 0,
    stock_minimo   INT           NOT NULL DEFAULT 0,
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
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo         VARCHAR(10)  NOT NULL,                 -- ENTRADA | SALIDA
    cantidad     INT          NOT NULL,
    motivo       VARCHAR(200),
    fecha        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    producto_id  BIGINT       NOT NULL,
    usuario_id   BIGINT       NOT NULL,
    CONSTRAINT fk_movimiento_producto FOREIGN KEY (producto_id) REFERENCES producto(id),
    CONSTRAINT fk_movimiento_usuario  FOREIGN KEY (usuario_id)  REFERENCES usuario(id),
    CONSTRAINT chk_movimiento_tipo     CHECK (tipo IN ('ENTRADA', 'SALIDA')),
    CONSTRAINT chk_movimiento_cantidad CHECK (cantidad > 0)
);

-- =====================================================================
-- DATOS DE PRUEBA
-- (Los usuarios admin/empleado los crea el backend al arrancar,
--  porque la contraseña debe guardarse cifrada con BCrypt.)
-- =====================================================================
INSERT INTO categoria (nombre, descripcion) VALUES
('Bebidas',   'Gaseosas, jugos y agua'),
('Abarrotes', 'Arroz, azúcar, aceite y granos'),
('Limpieza',  'Detergentes y desinfectantes');

INSERT INTO proveedor (ruc, razon_social, telefono, email, direccion) VALUES
('0190012345001', 'Distribuidora Austral S.A.', '072800100', 'ventas@austral.ec',   'Av. España, Cuenca'),
('0190098765001', 'Comercial Andina Cía. Ltda.', '072833200', 'pedidos@andina.ec', 'Av. de las Américas, Cuenca');

INSERT INTO producto (codigo, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, categoria_id, proveedor_id) VALUES
('BEB-001', 'Agua mineral 1L',       'Botella plástica',      0.45, 0.80, 120, 30, 1, 1),
('BEB-002', 'Gaseosa cola 2L',       'Botella retornable',    1.20, 1.85,  15, 20, 1, 1),
('ABA-001', 'Arroz flor 5 lb',       'Funda',                 2.40, 3.10,  60, 15, 2, 2),
('LIM-001', 'Detergente en polvo 1kg','Funda',                1.90, 2.75,   8, 10, 3, 2);
