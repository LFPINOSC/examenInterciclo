const Medico = require('../models/medico.model');

// Obtener todos los médicos
const getMedicos = async (req, res) => {
    try {
        const medicos = await Medico.findAll();
        res.json(medicos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los médicos' });
    }
};

// Registrar un nuevo médico
const createMedico = async (req, res) => {
    try {
        const nuevoMedico = await Medico.create(req.body);
        res.status(201).json({
            message: 'Médico registrado con éxito',
            medico: nuevoMedico
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'No se pudo registrar el médico' });
    }
};

module.exports = {
    getMedicos,
    createMedico
};