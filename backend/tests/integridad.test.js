const test = require('node:test');
const assert = require('node:assert/strict');
const { verificarSinViajes } = require('../src/services/integridad');
const { errorHandler } = require('../src/errors');

test('rechaza eliminar un vehículo asociado a un viaje (409)', async () => {
  const fakePool = {
    async query(sql, params) {
      assert.match(sql, /FROM viajes WHERE id_vehiculo = \$1/);
      assert.deepEqual(params, [17]);
      return { rowCount: 1 };
    }
  };
  await assert.rejects(verificarSinViajes(fakePool, 'vehiculos', 17), e => e.status === 409);
});

test('permite eliminar un conductor sin viajes', async () => {
  const fakePool = { async query(sql) {
    assert.match(sql, /id_conductor/);
    return { rowCount: 0 };
  }};
  await verificarSinViajes(fakePool, 'conductores', 23);
});

test('rechaza tipos de catálogo no permitidos', async () => {
  await assert.rejects(verificarSinViajes({query:async()=>({rowCount:0})},'otra_tabla',23));
});

test('el manejador devuelve 409 ante violación de clave foránea PostgreSQL', () => {
  const res = {
    statusCode: null,
    jsonValue: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.jsonValue = value; return this; }
  };
  errorHandler({code:'23503'}, null, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.match(res.jsonValue.error, /referencias/);
});
