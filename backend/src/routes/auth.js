const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { firmar, autenticar } = require('../middleware');
const { correo } = require('../validators');

const router = express.Router();

function buscarUsuario(id) {
  return db.prepare(
    `SELECT u.id_usuario AS id, u.nombres, u.apellidos, u.correo, u.password_hash AS passwordHash,
            u.activo, r.nombre AS rol, m.id_medico AS medicoId
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     LEFT JOIN medicos m ON m.id_usuario = u.id_usuario
     WHERE u.id_usuario = ?`
  ).get(id);
}

router.post('/login', (req, res) => {
  const validacion = correo(req.body?.correo);
  const password = String(req.body?.password ?? '');
  if (validacion.error || !password) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  const usuario = db.prepare(
    `SELECT u.id_usuario AS id, u.nombres, u.apellidos, u.correo, u.password_hash AS passwordHash,
            u.activo, r.nombre AS rol, m.id_medico AS medicoId
     FROM usuarios u
     JOIN roles r ON r.id_rol = u.id_rol
     LEFT JOIN medicos m ON m.id_usuario = u.id_usuario
     WHERE u.correo = ?`
  ).get(validacion.valor);

  if (!usuario || !usuario.activo || !bcrypt.compareSync(password, usuario.passwordHash)) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  const perfil = {
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    rol: usuario.rol,
    medicoId: usuario.medicoId,
    nombre: `${usuario.nombres} ${usuario.apellidos}`,
  };

  return res.json({ token: firmar(perfil), user: perfil });
});

router.get('/perfil', autenticar, (req, res) => {
  const usuario = buscarUsuario(req.usuario.id);
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ message: 'La cuenta ya no está activa' });
  }
  return res.json({
    id: usuario.id,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    correo: usuario.correo,
    rol: usuario.rol,
    medicoId: usuario.medicoId,
  });
});

module.exports = router;
