const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { texto, esEntero, lanzarSiHayErrores, idParam } = require('../utils/validar');

function validar(body) {
  const d = {
    nombre: texto(body.nombre),
    enfermedad: texto(body.enfermedad),
    fabricante: texto(body.fabricante) || null,
    dosis_requeridas: Number(body.dosis_requeridas),
    intervalo_dias: Number(body.intervalo_dias ?? 0),
    edad_minima_meses: Number(body.edad_minima_meses ?? 0),
    descripcion: texto(body.descripcion) || null,
  };
  const errores = [];
  if (d.nombre.length < 2) errores.push('Ingrese el nombre de la vacuna');
  if (d.enfermedad.length < 3) errores.push('Ingrese la enfermedad que previene');
  if (!esEntero(d.dosis_requeridas, 1, 10)) errores.push('Las dosis requeridas deben estar entre 1 y 10');
  if (!esEntero(d.intervalo_dias, 0, 3650)) errores.push('El intervalo debe ser un número de días entre 0 y 3650');
  if (!esEntero(d.edad_minima_meses, 0, 1200)) errores.push('La edad mínima debe estar entre 0 y 1200 meses');
  if (d.dosis_requeridas > 1 && d.intervalo_dias === 0) {
    errores.push('Una vacuna con varias dosis necesita un intervalo mayor a 0 días');
  }
  lanzarSiHayErrores(errores);
  return d;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT * FROM vacunas WHERE id = ?', [id]);
  if (!filas[0]) throw new HttpError(404, 'Vacuna no encontrada');
  return filas[0];
}

async function listar(req, res) {
  const [filas] = await pool.query(
    `SELECT v.*,
            CAST(COALESCE(SUM(CASE WHEN l.fecha_caducidad >= CURDATE() THEN l.cantidad_disponible END), 0) AS SIGNED) AS stock_vigente
       FROM vacunas v LEFT JOIN lotes l ON l.vacuna_id = v.id
      GROUP BY v.id
      ORDER BY v.nombre`
  );
  res.json(filas);
}

async function obtener(req, res) {
  res.json(await buscarPorId(idParam(req)));
}

async function crear(req, res) {
  const d = validar(req.body);
  const [r] = await pool.query('INSERT INTO vacunas SET ?', [d]);
  res.status(201).json(await buscarPorId(r.insertId));
}

async function actualizar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  const d = validar(req.body);
  await pool.query('UPDATE vacunas SET ? WHERE id = ?', [d, id]);
  res.json(await buscarPorId(id));
}

async function eliminar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  try {
    await pool.query('DELETE FROM vacunas WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'La vacuna tiene lotes registrados y no puede eliminarse');
    }
    throw err;
  }
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
