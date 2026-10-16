const Paciente = require('../models/paciente.model');

// Obtener todos los pacientes
const getPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.findAll();
        res.json(pacientes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los pacientes' });
    }
};

// Registrar un nuevo paciente
const createPaciente = async (req, res) => {
    try {
        const nuevoPaciente = await Paciente.create(req.body);
        res.status(201).json({
            message: 'Paciente registrado con éxito',
            paciente: nuevoPaciente
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'No se pudo registrar el paciente (verifique si la cédula ya existe)' });
    }
};

module.exports = {
    getPacientes,
    createPaciente
};