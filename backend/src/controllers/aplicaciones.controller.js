// Registro de vacunas aplicadas. Es el módulo con más reglas de negocio,
// por eso usa TRANSACCIONES: registrar la dosis y descontar el stock del
// lote deben ocurrir juntas o no ocurrir (atomicidad).
const pool = require('../config/db');
const HttpError = require('../utils/httpError');
const {
  texto, esFecha, esEntero, hoy, sumarDias, edadEnMeses, lanzarSiHayErrores, idParam,
} = require('../utils/validar');

const SITIOS = ['BRAZO_IZQUIERDO', 'BRAZO_DERECHO', 'MUSLO_IZQUIERDO', 'MUSLO_DERECHO', 'ORAL', 'INTRADERMICA'];

const SELECT_APLICACIONES = `
  SELECT a.*, p.cedula, CONCAT(p.apellidos, ' ', p.nombres) AS paciente,
         v.id AS vacuna_id, v.nombre AS vacuna, v.dosis_requeridas,
         l.numero_lote, u.nombre AS aplicado_por
    FROM aplicaciones a
    JOIN pacientes p ON p.id = a.paciente_id
    JOIN lotes l     ON l.id = a.lote_id
    JOIN vacunas v   ON v.id = l.vacuna_id
    JOIN usuarios u  ON u.id = a.usuario_id`;

async function buscarPorId(id, conexion = pool) {
  const [filas] = await conexion.query(`${SELECT_APLICACIONES} WHERE a.id = ?`, [id]);
  if (!filas[0]) throw new HttpError(404, 'Aplicación no encontrada');
  return filas[0];
}

function validarCampos(body, conPacienteYLote) {
  const d = {
    paciente_id: Number(body.paciente_id),
    lote_id: Number(body.lote_id),
    fecha_aplicacion: texto(body.fecha_aplicacion),
    sitio_aplicacion: body.sitio_aplicacion,
    observaciones: texto(body.observaciones) || null,
  };
  const errores = [];
  if (conPacienteYLote) {
    if (!esEntero(d.paciente_id, 1)) errores.push('Seleccione el paciente');
    if (!esEntero(d.lote_id, 1)) errores.push('Seleccione el lote de la vacuna');
  }
  if (!esFecha(d.fecha_aplicacion)) errores.push('La fecha de aplicación no es válida');
  else if (d.fecha_aplicacion > hoy()) errores.push('La fecha de aplicación no puede ser futura');
  if (!SITIOS.includes(d.sitio_aplicacion)) errores.push('Seleccione un sitio de aplicación válido');
  if (d.observaciones && d.observaciones.length > 300) errores.push('Observaciones: máximo 300 caracteres');
  lanzarSiHayErrores(errores);
  return d;
}

// Dosis previas del paciente para una vacuna (ordenadas por número de dosis)
async function dosisPrevias(conexion, pacienteId, vacunaId, excluirId = 0) {
  const [filas] = await conexion.query(
    `SELECT a.id, a.numero_dosis, a.fecha_aplicacion
       FROM aplicaciones a JOIN lotes l ON l.id = a.lote_id
      WHERE a.paciente_id = ? AND l.vacuna_id = ? AND a.id <> ?
      ORDER BY a.numero_dosis`,
    [pacienteId, vacunaId, excluirId]
  );
  return filas;
}

// GET /api/aplicaciones?paciente_id=1&desde=2026-01-01&hasta=2026-12-31
async function listar(req, res) {
  const condiciones = [];
  const params = [];
  if (req.query.paciente_id) {
    condiciones.push('a.paciente_id = ?');
    params.push(Number(req.query.paciente_id));
  }
  if (esFecha(req.query.desde)) {
    condiciones.push('a.fecha_aplicacion >= ?');
    params.push(req.query.desde);
  }
  if (esFecha(req.query.hasta)) {
    condiciones.push('a.fecha_aplicacion <= ?');
    params.push(req.query.hasta);
  }
  const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
  const [filas] = await pool.query(
    `${SELECT_APLICACIONES}${where} ORDER BY a.fecha_aplicacion DESC, a.id DESC`,
    params
  );
  res.json(filas);
}

async function obtener(req, res) {
  res.json(await buscarPorId(idParam(req)));
}

// POST /api/aplicaciones  { paciente_id, lote_id, fecha_aplicacion, sitio_aplicacion, observaciones }
// El número de dosis y la próxima dosis los calcula el servidor (no el cliente).
async function crear(req, res) {
  const d = validarCampos(req.body, true);
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();

    const [pacientes] = await conexion.query('SELECT * FROM pacientes WHERE id = ?', [d.paciente_id]);
    const paciente = pacientes[0];
    if (!paciente) throw new HttpError(404, 'Paciente no encontrado');

    // FOR UPDATE bloquea la fila del lote hasta el COMMIT: si dos enfermeras
    // usan la última dosis al mismo tiempo, la segunda espera y ve stock 0.
    const [lotes] = await conexion.query(
      `SELECT l.*, v.nombre AS vacuna, v.dosis_requeridas, v.intervalo_dias, v.edad_minima_meses
         FROM lotes l JOIN vacunas v ON v.id = l.vacuna_id
        WHERE l.id = ? FOR UPDATE`,
      [d.lote_id]
    );
    const lote = lotes[0];
    if (!lote) throw new HttpError(404, 'Lote no encontrado');

    const errores = [];
    if (lote.cantidad_disponible <= 0) errores.push(`El lote ${lote.numero_lote} no tiene stock disponible`);
    if (lote.fecha_caducidad < d.fecha_aplicacion) errores.push(`El lote ${lote.numero_lote} estaba caducado en la fecha de aplicación`);
    if (d.fecha_aplicacion < paciente.fecha_nacimiento) errores.push('La fecha de aplicación es anterior al nacimiento del paciente');
    else if (edadEnMeses(paciente.fecha_nacimiento, d.fecha_aplicacion) < lote.edad_minima_meses) {
      errores.push(`${lote.vacuna} se aplica desde los ${lote.edad_minima_meses} meses de edad`);
    }

    const previas = await dosisPrevias(conexion, paciente.id, lote.vacuna_id);
    const numeroDosis = previas.length + 1;
    if (numeroDosis > lote.dosis_requeridas) {
      errores.push(`El paciente ya completó el esquema de ${lote.vacuna} (${lote.dosis_requeridas} dosis)`);
    }
    const ultima = previas[previas.length - 1];
    if (ultima) {
      const minima = sumarDias(ultima.fecha_aplicacion, lote.intervalo_dias);
      if (d.fecha_aplicacion < minima) {
        errores.push(`Deben pasar ${lote.intervalo_dias} días desde la dosis anterior; fecha mínima: ${minima}`);
      }
    }
    if (errores.length) throw new HttpError(409, 'No se puede registrar la vacuna', errores);

    const proxima = numeroDosis < lote.dosis_requeridas ? sumarDias(d.fecha_aplicacion, lote.intervalo_dias) : null;

    const [r] = await conexion.query(
      `INSERT INTO aplicaciones
         (paciente_id, lote_id, usuario_id, numero_dosis, fecha_aplicacion, sitio_aplicacion, proxima_dosis, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [paciente.id, lote.id, req.usuario.id, numeroDosis, d.fecha_aplicacion, d.sitio_aplicacion, proxima, d.observaciones]
    );
    await conexion.query('UPDATE lotes SET cantidad_disponible = cantidad_disponible - 1 WHERE id = ?', [lote.id]);

    await conexion.commit();
    res.status(201).json(await buscarPorId(r.insertId));
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

// PUT /api/aplicaciones/:id  { fecha_aplicacion, sitio_aplicacion, observaciones }
// Paciente y lote no se cambian (trazabilidad); si hubo un error se elimina
// el registro y se vuelve a registrar.
async function actualizar(req, res) {
  const id = idParam(req);
  const actual = await buscarPorId(id);
  const d = validarCampos(req.body, false);

  const [[info]] = await pool.query(
    `SELECT p.fecha_nacimiento, l.fecha_caducidad, v.intervalo_dias, v.edad_minima_meses
       FROM aplicaciones a JOIN pacientes p ON p.id = a.paciente_id
       JOIN lotes l ON l.id = a.lote_id JOIN vacunas v ON v.id = l.vacuna_id
      WHERE a.id = ?`,
    [id]
  );
  const errores = [];
  if (info.fecha_caducidad < d.fecha_aplicacion) errores.push('El lote estaba caducado en esa fecha');
  if (d.fecha_aplicacion < info.fecha_nacimiento) errores.push('La fecha es anterior al nacimiento del paciente');
  else if (edadEnMeses(info.fecha_nacimiento, d.fecha_aplicacion) < info.edad_minima_meses) {
    errores.push(`La vacuna se aplica desde los ${info.edad_minima_meses} meses de edad`);
  }
  // La nueva fecha debe respetar el intervalo con la dosis anterior y la siguiente
  const otras = await dosisPrevias(pool, actual.paciente_id, actual.vacuna_id, id);
  const anterior = otras.filter((o) => o.numero_dosis < actual.numero_dosis).pop();
  const siguiente = otras.find((o) => o.numero_dosis > actual.numero_dosis);
  if (anterior && d.fecha_aplicacion < sumarDias(anterior.fecha_aplicacion, info.intervalo_dias)) {
    errores.push('La fecha no respeta el intervalo con la dosis anterior');
  }
  if (siguiente && sumarDias(d.fecha_aplicacion, info.intervalo_dias) > siguiente.fecha_aplicacion) {
    errores.push('La fecha no respeta el intervalo con la dosis siguiente');
  }
  if (errores.length) throw new HttpError(409, 'No se puede actualizar la vacuna', errores);

  const proxima = actual.numero_dosis < actual.dosis_requeridas
    ? sumarDias(d.fecha_aplicacion, info.intervalo_dias)
    : null;
  await pool.query(
    'UPDATE aplicaciones SET fecha_aplicacion = ?, sitio_aplicacion = ?, observaciones = ?, proxima_dosis = ? WHERE id = ?',
    [d.fecha_aplicacion, d.sitio_aplicacion, d.observaciones, proxima, id]
  );
  res.json(await buscarPorId(id));
}

// DELETE /api/aplicaciones/:id -> solo la última dosis del esquema; devuelve la dosis al lote
async function eliminar(req, res) {
  const id = idParam(req);
  const conexion = await pool.getConnection();
  try {
    await conexion.beginTransaction();
    const actual = await buscarPorId(id, conexion);
    const otras = await dosisPrevias(conexion, actual.paciente_id, actual.vacuna_id, id);
    if (otras.some((o) => o.numero_dosis > actual.numero_dosis)) {
      throw new HttpError(409, 'Solo se puede eliminar la última dosis registrada de esta vacuna');
    }
    await conexion.query('DELETE FROM aplicaciones WHERE id = ?', [id]);
    await conexion.query('UPDATE lotes SET cantidad_disponible = cantidad_disponible + 1 WHERE id = ?', [actual.lote_id]);
    // La dosis anterior vuelve a quedar "pendiente de siguiente dosis"
    await conexion.query(
      `UPDATE aplicaciones a JOIN lotes l ON l.id = a.lote_id JOIN vacunas v ON v.id = l.vacuna_id
          SET a.proxima_dosis = DATE_ADD(a.fecha_aplicacion, INTERVAL v.intervalo_dias DAY)
        WHERE a.paciente_id = ? AND l.vacuna_id = ? AND a.numero_dosis = ?`,
      [actual.paciente_id, actual.vacuna_id, actual.numero_dosis - 1]
    );
    await conexion.commit();
    res.status(204).end();
  } catch (err) {
    await conexion.rollback();
    throw err;
  } finally {
    conexion.release();
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
