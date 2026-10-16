const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Asegúrate de que esta sea la ruta correcta a tu conexión de base de datos

// --- RUTA DE REGISTRO ---
router.post('/register', async (req, res) => {
    try {
        const { nombres, apellidos, email, password, rol } = req.body;
        // rol esperado: 'admin', 'medico', o 'paciente'

        // 1. Verificar si el usuario ya existe
        const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExistente.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // 2. Encriptar la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Guardar en la base de datos (PostgreSQL)
        await pool.query(
            'INSERT INTO usuarios (nombres, apellidos, email, password, rol) VALUES ($1, $2, $3, $4, $5)',
            [nombres, apellidos, email, hashedPassword, rol || 'paciente']
        );

        res.status(201).json({ mensaje: '¡Usuario registrado con éxito!' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario en el servidor.' });
    }
});

// --- RUTA DE LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar el usuario en la base de datos por su email
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (resultado.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas (usuario no encontrado).' });
        }

        const usuario = resultado.rows[0];

        // 2. Validar si la contraseña coincide con bcrypt.compare
        const esValida = await bcrypt.compare(password, usuario.password);
        if (!esValida) {
            return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
        }

        // 3. Generar token JWT incluyendo el id y el rol
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            process.env.JWT_SECRET || 'tu_secreto_jwt', // Usa variable de entorno o una clave por defecto
            { expiresIn: '8h' }
        );

        // 4. Responder enviando el token y los datos del usuario
        res.json({
            token,
            usuario: {
                id: usuario.id_usuario || usuario.id, // Ajusta según el nombre de tu columna en BD (id o id_usuario)
                nombre: usuario.nombres,
                rol: usuario.rol // Devuelve 'admin', 'medico' o 'paciente'
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno en el servidor.' });
    }
});

module.exports = router;