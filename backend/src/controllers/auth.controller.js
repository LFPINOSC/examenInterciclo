const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol } = require('../models/usuario.model');

// Registro de usuario (Cifra la contraseña automáticamente)
const register = async (req, res) => {
    try {
        const { nombre_usuario, email, password, id_rol } = req.body;

        // Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            email,
            password: hashedPassword,
            id_rol
        });

        res.status(201).json({
            message: 'Usuario registrado con éxito',
            usuario: {
                id: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre_usuario,
                email: nuevoUsuario.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'No se pudo registrar el usuario (el email ya podría estar en uso)' });
    }
};

// Inicio de sesión (Verifica credenciales y genera Token JWT)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por email
        const usuario = await Usuario.findOne({ 
            where: { email },
            include: [{ model: Rol, as: 'rol' }]
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Credenciales inválidas (usuario no encontrado)' });
        }

        // Validar contraseña
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Credenciales inválidas (contraseña incorrecta)' });
        }

        // Generar Token JWT (válido por 8 horas)
        const token = jwt.sign(
            { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol.nombre_rol },
            process.env.JWT_SECRET || 'secreto_super_seguro_laboratorio',
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: {
                nombre: usuario.nombre_usuario,
                email: usuario.email,
                rol: usuario.rol.nombre_rol
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor durante el login' });
    }
};

module.exports = {
    register,
    login
};