const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { firmar, autenticar } = require('../middleware');
const { correo } = require('../validators');

const router = express.Router();

router.post('/login', (req, res) => {
  const validacion = correo(req.body?.correo);
  const password = String(req.body?.password ?? '');
  if (validacion.error || !password) {
    return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
  }

  const usuario = db.prepare(
    `SELECT id_usuario AS id, nombres, apellidos, correo, password_hash AS passwordHash, activo, rol
     FROM usuarios WHERE correo = ?`
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
    nombre: `${usuario.nombres} ${usuario.apellidos}`,
  };

  return res.json({ token: firmar(perfil), user: perfil });
});

router.get('/perfil', autenticar, (req, res) => {
  const usuario = db.prepare(
    `SELECT id_usuario AS id, nombres, apellidos, correo, rol FROM usuarios WHERE id_usuario = ? AND activo = 1`
  ).get(req.usuario.id);
  if (!usuario) return res.status(401).json({ message: 'Sesión no válida' });
  return res.json(usuario);
});

module.exports = router;
