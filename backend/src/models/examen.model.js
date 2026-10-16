const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Examen = sequelize.define('Examen', {
    id_examen: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    nombre_examen: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    descripcion: {
        type: DataTypes.TEXT
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    valores_referencia: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
}, {
    tableName: 'examen',
    timestamps: false
});

module.exports = Examen;