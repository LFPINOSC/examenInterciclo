const OrdenLaboratorio = require('../models/orden.model');
const DetalleOrden = require('../models/detalleOrden.model');
const Paciente = require('../models/paciente.model');
const Examen = require('../models/examen.model');

// Obtener todas las órdenes con sus pacientes y los exámenes detallados
const getOrdenes = async (req, res) => {
    try {
        const ordenes = await OrdenLaboratorio.findAll({
            include: [
                { model: Paciente, as: 'paciente' },
                { 
                    model: DetalleOrden, 
                    as: 'detalles',
                    include: [{ model: Examen, as: 'examen' }]
                }
            ]
        });
        res.json(ordenes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las órdenes de laboratorio' });
    }
};

// Crear una nueva orden con sus exámenes asociados
const createOrden = async (req, res) => {
    try {
        const { id_paciente, id_medico, examenes } = req.body; 
        // 'examenes' será un arreglo con los IDs de los exámenes, ej: [1, 2]

        // 1. Crear la cabecera de la orden
        const nuevaOrden = await OrdenLaboratorio.create({
            id_paciente,
            id_medico,
            estado: 'Pendiente'
        });

        // 2. Registrar los detalles (exámenes solicitados)
        if (examenes && examenes.length > 0) {
            const detallesData = examenes.map(id_examen => ({
                id_orden: nuevaOrden.id_orden,
                id_examen: id_examen
            }));
            await DetalleOrden.bulkCreate(detallesData);
        }

        res.status(201).json({
            message: 'Orden de laboratorio creada con éxito',
            orden: nuevaOrden
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'No se pudo crear la orden de laboratorio' });
    }
};

module.exports = {
    getOrdenes,
    createOrden
};