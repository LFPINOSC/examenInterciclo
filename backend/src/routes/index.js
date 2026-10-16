// Definición de todos los endpoints de la API REST.
// Recurso (sustantivo en plural) + verbo HTTP = operación CRUD:
//   GET /recurso        -> listar        POST   /recurso     -> crear
//   GET /recurso/:id    -> obtener uno   PUT    /recurso/:id -> actualizar
//                                        DELETE /recurso/:id -> eliminar
const { Router } = require('express');
const { autenticar, autorizar } = require('../middleware/auth');

const auth = require('../controllers/auth.controller');
const roles = require('../controllers/roles.controller');
const usuarios = require('../controllers/usuarios.controller');
const pacientes = require('../controllers/pacientes.controller');
const vacunas = require('../controllers/vacunas.controller');
const lotes = require('../controllers/lotes.controller');
const aplicaciones = require('../controllers/aplicaciones.controller');
const reportes = require('../controllers/reportes.controller');

const router = Router();
const soloAdmin = autorizar('ADMIN');

// ---- Rutas públicas ----
router.post('/auth/login', auth.login);

// ---- Todo lo que sigue requiere token válido ----
router.use(autenticar);

router.get('/auth/perfil', auth.perfil);

router.get('/roles', soloAdmin, roles.listar);

router.get('/usuarios', soloAdmin, usuarios.listar);
router.get('/usuarios/:id', soloAdmin, usuarios.obtener);
router.post('/usuarios', soloAdmin, usuarios.crear);
router.put('/usuarios/:id', soloAdmin, usuarios.actualizar);
router.delete('/usuarios/:id', soloAdmin, usuarios.eliminar);

router.get('/pacientes', pacientes.listar);
router.get('/pacientes/:id', pacientes.obtener);
router.get('/pacientes/:id/carnet', pacientes.carnet);
router.post('/pacientes', pacientes.crear);
router.put('/pacientes/:id', pacientes.actualizar);
router.delete('/pacientes/:id', soloAdmin, pacientes.eliminar);

router.get('/vacunas', vacunas.listar);
router.get('/vacunas/:id', vacunas.obtener);
router.post('/vacunas', soloAdmin, vacunas.crear);
router.put('/vacunas/:id', soloAdmin, vacunas.actualizar);
router.delete('/vacunas/:id', soloAdmin, vacunas.eliminar);

router.get('/lotes', lotes.listar);
router.get('/lotes/:id', lotes.obtener);
router.post('/lotes', soloAdmin, lotes.crear);
router.put('/lotes/:id', soloAdmin, lotes.actualizar);
router.delete('/lotes/:id', soloAdmin, lotes.eliminar);

router.get('/aplicaciones', aplicaciones.listar);
router.get('/aplicaciones/:id', aplicaciones.obtener);
router.post('/aplicaciones', aplicaciones.crear);
router.put('/aplicaciones/:id', aplicaciones.actualizar);
router.delete('/aplicaciones/:id', soloAdmin, aplicaciones.eliminar);

router.get('/reportes/resumen', reportes.resumen);

module.exports = router;
