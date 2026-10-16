const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medico = sequelize.define('Medico', {
    id_medico: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    especialidad: {
        type: DataTypes.STRING(100)
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    correo: {
        type: DataTypes.STRING(150)
    }
}, {
    tableName: 'medico',
    timestamps: false
});

module.exports = Medico;