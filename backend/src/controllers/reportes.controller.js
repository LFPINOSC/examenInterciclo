const pool = require('../config/db');

// GET /api/reportes/resumen -> datos del panel principal
async function resumen(req, res) {
  const [[totales]] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM pacientes) AS pacientes,
       (SELECT COUNT(*) FROM aplicaciones) AS aplicaciones,
       (SELECT COUNT(*) FROM aplicaciones WHERE fecha_aplicacion = CURDATE()) AS aplicaciones_hoy,
       (SELECT COUNT(*) FROM aplicaciones
         WHERE YEAR(fecha_aplicacion) = YEAR(CURDATE()) AND MONTH(fecha_aplicacion) = MONTH(CURDATE())) AS aplicaciones_mes,
       (SELECT COUNT(*) FROM vacunas) AS vacunas`
  );

  // Próximas dosis (atrasadas o en los próximos 30 días) que aún no se aplican
  const [proximas] = await pool.query(
    `SELECT a.proxima_dosis, a.numero_dosis + 1 AS dosis_siguiente,
            p.id AS paciente_id, p.cedula, CONCAT(p.apellidos, ' ', p.nombres) AS paciente,
            p.telefono, v.nombre AS vacuna,
            (a.proxima_dosis < CURDATE()) AS atrasada
       FROM aplicaciones a
       JOIN lotes l     ON l.id = a.lote_id
       JOIN vacunas v   ON v.id = l.vacuna_id
       JOIN pacientes p ON p.id = a.paciente_id
      WHERE a.proxima_dosis IS NOT NULL
        AND a.proxima_dosis <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND NOT EXISTS (
              SELECT 1 FROM aplicaciones a2 JOIN lotes l2 ON l2.id = a2.lote_id
               WHERE a2.paciente_id = a.paciente_id AND l2.vacuna_id = l.vacuna_id
                 AND a2.numero_dosis > a.numero_dosis)
      ORDER BY a.proxima_dosis`
  );

  // Lotes que requieren atención: caducados con stock, por caducar (30 días) o stock bajo
  const [alertasLotes] = await pool.query(
    `SELECT l.id, l.numero_lote, v.nombre AS vacuna, l.fecha_caducidad, l.cantidad_disponible,
            CASE WHEN l.fecha_caducidad < CURDATE() THEN 'CADUCADO'
                 WHEN l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'POR_CADUCAR'
                 ELSE 'STOCK_BAJO' END AS alerta
       FROM lotes l JOIN vacunas v ON v.id = l.vacuna_id
      WHERE l.cantidad_disponible > 0
        AND (l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) OR l.cantidad_disponible < 10)
      ORDER BY l.fecha_caducidad`
  );

  // Dosis aplicadas por vacuna
  const [porVacuna] = await pool.query(
    `SELECT v.nombre AS vacuna, COUNT(a.id) AS total
       FROM vacunas v
       LEFT JOIN lotes l ON l.vacuna_id = v.id
       LEFT JOIN aplicaciones a ON a.lote_id = l.id
      GROUP BY v.id
      ORDER BY total DESC, v.nombre`
  );

  res.json({ totales, proximas, alertasLotes, porVacuna });
}

module.exports = { resumen };
