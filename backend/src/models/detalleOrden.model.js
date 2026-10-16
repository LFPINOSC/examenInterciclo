const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const OrdenLaboratorio = require('./orden.model');
const Examen = require('./examen.model');

const DetalleOrden = sequelize.define('DetalleOrden', {
    id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_orden: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_examen: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    resultado_obtenido: {
        type: DataTypes.STRING(255)
    },
    observaciones: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'detalle_orden',
    timestamps: false
});

// Relaciones
OrdenLaboratorio.hasMany(DetalleOrden, { foreignKey: 'id_orden', as: 'detalles' });
DetalleOrden.belongsTo(OrdenLaboratorio, { foreignKey: 'id_orden' });
DetalleOrden.belongsTo(Examen, { foreignKey: 'id_examen', as: 'examen' });

module.exports = DetalleOrden;