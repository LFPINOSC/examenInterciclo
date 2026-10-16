const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Paciente = sequelize.define('Paciente', {
    id_paciente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cedula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20)
    },
    direccion: {
        type: DataTypes.STRING(200)
    },
    fecha_nacimiento: {
        type: DataTypes.DATEONLY
    }
}, {
    tableName: 'paciente',
    timestamps: false // Como tu schema.sql no tiene campos createdAt/updatedAt
});

module.exports = Paciente;