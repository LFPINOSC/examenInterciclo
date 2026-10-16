// Roles del sistema. Son de solo lectura en la API: los permisos están
// programados por nombre de rol (autorizar('ADMIN')), así que crear un rol
// nuevo desde la interfaz no le daría permisos reales.
const pool = require('../config/db');

// GET /api/roles -> roles con la cantidad de usuarios asignados
async function listar(req, res) {
  const [filas] = await pool.query(
    `SELECT r.id, r.nombre, r.descripcion, COUNT(u.id) AS usuarios
       FROM roles r LEFT JOIN usuarios u ON u.rol_id = r.id
      GROUP BY r.id
      ORDER BY r.id`
  );
  res.json(filas);
}

module.exports = { listar };
