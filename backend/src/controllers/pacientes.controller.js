const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const {
  texto, esFecha, esCedulaValida, hoy, edadEnMeses, lanzarSiHayErrores, idParam,
} = require('../utils/validar');

function validar(body) {
  const d = {
    cedula: texto(body.cedula),
    nombres: texto(body.nombres),
    apellidos: texto(body.apellidos),
    fecha_nacimiento: texto(body.fecha_nacimiento),
    sexo: body.sexo,
    telefono: texto(body.telefono) || null,
    direccion: texto(body.direccion) || null,
    representante: texto(body.representante) || null,
  };
  const errores = [];
  if (!esCedulaValida(d.cedula)) errores.push('La cédula no es válida');
  if (d.nombres.length < 2) errores.push('Ingrese los nombres');
  if (d.apellidos.length < 2) errores.push('Ingrese los apellidos');
  if (!esFecha(d.fecha_nacimiento)) errores.push('La fecha de nacimiento no es válida');
  else if (d.fecha_nacimiento > hoy()) errores.push('La fecha de nacimiento no puede ser futura');
  if (!['M', 'F'].includes(d.sexo)) errores.push('El sexo debe ser M o F');
  if (d.telefono && !/^0\d{8,9}$/.test(d.telefono)) errores.push('El teléfono debe tener 9 o 10 dígitos y empezar con 0');
  if (esFecha(d.fecha_nacimiento) && edadEnMeses(d.fecha_nacimiento, hoy()) < 216 && !d.representante) {
    errores.push('El paciente es menor de edad: ingrese el nombre del representante');
  }
  lanzarSiHayErrores(errores);
  return d;
}

async function buscarPorId(id) {
  const [filas] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [id]);
  if (!filas[0]) throw new HttpError(404, 'Paciente no encontrado');
  return filas[0];
}

// GET /api/pacientes?q=texto  (busca por cédula, nombres o apellidos)
async function listar(req, res) {
  const q = texto(req.query.q);
  let sql = `SELECT p.*,
               (SELECT COUNT(*) FROM aplicaciones a WHERE a.paciente_id = p.id) AS total_dosis
             FROM pacientes p`;
  const params = [];
  if (q) {
    sql += ' WHERE p.cedula LIKE ? OR p.nombres LIKE ? OR p.apellidos LIKE ?';
    params.push(`${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY p.apellidos, p.nombres';
  const [filas] = await pool.query(sql, params);
  res.json(filas);
}

async function obtener(req, res) {
  res.json(await buscarPorId(idParam(req)));
}

async function crear(req, res) {
  const d = validar(req.body);
  const [r] = await pool.query('INSERT INTO pacientes SET ?', [d]);
  res.status(201).json(await buscarPorId(r.insertId));
}

async function actualizar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  const d = validar(req.body);
  await pool.query('UPDATE pacientes SET ? WHERE id = ?', [d, id]);
  res.json(await buscarPorId(id));
}

async function eliminar(req, res) {
  const id = idParam(req);
  await buscarPorId(id);
  try {
    await pool.query('DELETE FROM pacientes WHERE id = ?', [id]);
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new HttpError(409, 'El paciente tiene historial de vacunación y no puede eliminarse');
    }
    throw err;
  }
  res.status(204).end();
}

// GET /api/pacientes/:id/carnet -> paciente + historial + estado de cada esquema
async function carnet(req, res) {
  const id = idParam(req);
  const paciente = await buscarPorId(id);
  paciente.edad_meses = edadEnMeses(paciente.fecha_nacimiento, hoy());

  const [historial] = await pool.query(
    `SELECT a.id, a.numero_dosis, a.fecha_aplicacion, a.sitio_aplicacion, a.proxima_dosis,
            a.observaciones, v.id AS vacuna_id, v.nombre AS vacuna, v.dosis_requeridas,
            l.numero_lote, u.nombre AS aplicado_por
       FROM aplicaciones a
       JOIN lotes l    ON l.id = a.lote_id
       JOIN vacunas v  ON v.id = l.vacuna_id
       JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.paciente_id = ?
      ORDER BY a.fecha_aplicacion, v.nombre`,
    [id]
  );

  // Estado de cada vacuna del catálogo para este paciente
  const [vacunas] = await pool.query('SELECT id, nombre, dosis_requeridas, edad_minima_meses FROM vacunas ORDER BY edad_minima_meses, nombre');
  const esquema = vacunas.map((v) => {
    const dosis = historial.filter((h) => h.vacuna_id === v.id);
    const ultima = dosis[dosis.length - 1];
    let estado = 'PENDIENTE';
    if (dosis.length >= v.dosis_requeridas) estado = 'COMPLETO';
    else if (dosis.length > 0) estado = 'EN_CURSO';
    else if (paciente.edad_meses < v.edad_minima_meses) estado = 'NO_APLICA_AUN';
    return {
      vacuna_id: v.id,
      vacuna: v.nombre,
      dosis_aplicadas: dosis.length,
      dosis_requeridas: v.dosis_requeridas,
      proxima_dosis: estado === 'EN_CURSO' ? ultima.proxima_dosis : null,
      estado,
    };
  });

  res.json({ paciente, historial, esquema });
}

module.exports = { listar, obtener, crear, actualizar, eliminar, carnet };
