const express = require('express');
const router = express.Router();
const { getExamenes, createExamen } = require('../controllers/examen.controller');

// Rutas para exámenes
router.get('/', getExamenes);
router.post('/', createExamen);

module.exports = router;