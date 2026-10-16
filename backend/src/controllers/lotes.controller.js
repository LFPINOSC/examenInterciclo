const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const { texto, esFecha, esEntero, lanzarSiHayErrores, idParam } = require('../utils/validar');

const SELECT_LOTES = `
  SELECT l.*, v.nombre AS vacuna,
         (l.fecha_caducidad < CURDATE()) AS caducado,
         (SELECT COUNT(*) FROM aplicaciones a WHERE a.lote_id = l.id) AS dosis_usadas
    FROM lotes l JOIN vacunas v ON v.id = l.vacuna_id`;

function validar(body) {
  const d = {
    vacuna_id: Number(body.vacuna_id),
    numero_lote: texto(body.numero_lote).toUpperCase(),
    fecha_caducidad: texto(body.fecha_caducidad),
    cantidad_disponible: Number(body.cantidad_disponible),
    fecha_ingreso: texto(body.fecha_ingreso),
  };
  const errores = [];
  if (!esEntero(d.vacuna_id, 1)) errores.push('Seleccione la vacuna');
  if (!/^[A-Z0-9-]{3,40}$/.test(d.numero_lote)) errores.push('El número de lote debe tener 3-40 caracteres (letras, números o guiones)');
  if (!esFecha(d.fecha_caducidad)) errores.push('La fecha de caducidad no es válida');
  if (!esEntero(d.cantidad_disponible, 0, 100000)) errores.push('La cantidad debe ser un entero entre 0 y 100000');
  if (!esFecha(d.fecha_ingreso)) errores.push('La fecha de ingreso no es válida');
  if (esFecha(d.fecha_caducidad) && esFecha(d.fecha_ingreso) && d.fecha_caducidad <= d.fecha_ingreso) {
    errores.push('La caducidad debe ser posterior a la fecha de ingreso');
  }
  lanzarSiHayErrores(errores);
  return d;
}

async function buscarPorId(id) {
  const [filas] = await pool.query(`${SELECT_LOTES} WHERE l.id = ?`, [id]);
  if (!filas[0]) throw new HttpError(404, 'Lote no encontrado');
  return filas[0];
}

// GET /api/lotes?vacuna_id=1&vigentes=1
//   vigentes=1 -> solo lotes no caducados y con stock (para aplicar vacunas)
async function listar(req, res) {
  const condiciones = [];
  const params = [];
  if (req.query.vacuna_id) {
    condiciones.push('l.vacuna_id = ?');
    params.push(Number(req.query.vacuna_id));
  }
  if (req.query.vigentes === '1') {
    condiciones.push('l.fecha_caducidad >= CURDATE() AND l.cantidad_disponible > 0');
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(`${SELECT_LOTES}${where} ORDER BY v.nombre, l.fecha_caducidad`, params);
  res.json(filas);
}

async function obtener(req, res) {
  res.json(await buscarPorId(idParam(req)));
}

async function crear(req, res) {
  const d = validar(req.body);
  const [r] = await pool.query('INSERT INTO lotes SET ?', [d]);
  res.status(201).json(await buscarPorId(r.insertId));
}

async function actualizar(req, res) {
  const id = idParam(req);
  const actual = await buscarPorId(id);
  const d = validar(req.body);
  // Si ya se aplicaron dosis de este lote, cambiar la vacuna rompería el historial
  if (actual.dosis_usadas > 0 && d.vacuna_id !== actual.vacuna_id) {
    throw new HttpError(409, 'No se puede cambiar la vacuna de un lote que ya fue utilizado');
  }
  await pool.query('UPDATE lotes SET ? WHERE id = ?', [d, id]);
  res.json(await buscarPorId(id));
}

async function eliminar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  try {
    await pool.query('DELETE FROM lotes WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'El lote ya fue aplicado a pacientes y no puede eliminarse');
    }
    throw err;
  }
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
