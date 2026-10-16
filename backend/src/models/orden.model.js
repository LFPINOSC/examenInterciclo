const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Paciente = require('./paciente.model');

const OrdenLaboratorio = sequelize.define('OrdenLaboratorio', {
    id_orden: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    estado: {
        type: DataTypes.STRING(30),
        defaultValue: 'Pendiente' // Pendiente, En Proceso, Completada
    },
    id_paciente: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_medico: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'orden_laboratorio',
    timestamps: false
});

// Relación: Una orden pertenece a un paciente
OrdenLaboratorio.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

module.exports = OrdenLaboratorio;