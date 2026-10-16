// Evita eliminar recursos que siguen vinculados a un viaje.
// Los identificadores de columna son una lista interna, nunca datos del usuario.
const { fail } = require('../errors');

const columnas = Object.freeze({
  vehiculos: 'id_vehiculo',
  conductores: 'id_conductor',
  rutas: 'id_ruta'
});

async function verificarSinViajes(pool, tipo, id) {
  const columna = columnas[tipo];
  if (!columna) throw new Error('Catálogo no admitido para validar referencias.');
  const { rowCount } = await pool.query(
    `SELECT 1 FROM viajes WHERE ${columna} = $1 LIMIT 1`,
    [id]
  );
  if (rowCount > 0) {
    fail(409, 'Este registro está relacionado con uno o más viajes y no puede eliminarse.');
  }
}

module.exports = { verificarSinViajes };
