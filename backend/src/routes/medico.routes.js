const express = require('express');
const router = express.Router();
const { getMedicos, createMedico } = require('../controllers/medico.controller');

router.get('/', getMedicos);
router.post('/', createMedico);

module.exports = router;