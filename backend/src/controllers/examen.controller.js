const Examen = require('../models/examen.model');

// Obtener todos los exámenes del catálogo
const getExamenes = async (req, res) => {
    try {
        const examenes = await Examen.findAll();
        res.json(examenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el catálogo de exámenes' });
    }
};

// Registrar un nuevo examen en el catálogo
const createExamen = async (req, res) => {
    try {
        const nuevoExamen = await Examen.create(req.body);
        res.status(201).json({
            message: 'Examen registrado con éxito',
            examen: nuevoExamen
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'No se pudo registrar el examen (verifique si el código ya existe)' });
    }
};

module.exports = {
    getExamenes,
    createExamen
};