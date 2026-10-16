-- MODELO RELACIONAL PROPUESTO - GESTIÓN DE BIBLIOTECA
-- Spring JPA puede crear estas tablas automáticamente con ddl-auto=update.
-- Este archivo sirve como evidencia del diseño lógico/físico del examen.

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    nombre_completo VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'LECTOR')),
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE autores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    nationality VARCHAR(80),
    biography VARCHAR(500)
);

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(300)
);

CREATE TABLE libros (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    publication_year INTEGER CHECK (publication_year BETWEEN 1400 AND 2100),
    total_copies INTEGER NOT NULL CHECK (total_copies >= 1),
    available_copies INTEGER NOT NULL CHECK (available_copies >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    author_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    CONSTRAINT fk_libro_autor FOREIGN KEY (author_id) REFERENCES autores(id),
    CONSTRAINT fk_libro_categoria FOREIGN KEY (category_id) REFERENCES categorias(id),
    CONSTRAINT ck_disponibles_total CHECK (available_copies <= total_copies)
);

CREATE TABLE prestamos (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVO', 'DEVUELTO', 'VENCIDO')),
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (user_id) REFERENCES usuarios(id),
    CONSTRAINT fk_prestamo_libro FOREIGN KEY (book_id) REFERENCES libros(id),
    CONSTRAINT ck_fechas_prestamo CHECK (due_date >= loan_date),
    CONSTRAINT ck_fecha_devolucion CHECK (return_date IS NULL OR return_date >= loan_date)
);

CREATE INDEX idx_libros_title ON libros(title);
CREATE INDEX idx_prestamos_usuario ON prestamos(user_id);
CREATE INDEX idx_prestamos_libro ON prestamos(book_id);
CREATE INDEX idx_prestamos_estado ON prestamos(status);
