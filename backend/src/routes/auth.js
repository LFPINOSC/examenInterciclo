const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const { asyncHandler, fail } = require('../errors');
const { autenticar } = require('../middleware/auth');
const { email } = require('../validators/fields');
const router = express.Router();
const limiteLogin = rateLimit({ windowMs: 15*60*1000, limit: 15, standardHeaders:'draft-7', legacyHeaders:false,
  message: { error:'Demasiados intentos. Intenta nuevamente en 15 minutos.' } });
router.post('/login', limiteLogin, asyncHandler(async(req,res) => {
  const correo = email(req.body?.correo);
  if(typeof req.body?.password !== 'string') fail(400,'Contraseña requerida.');
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE correo=$1 AND activo=TRUE', [correo]);
  if(!rows.length || !(await bcrypt.compare(req.body.password,rows[0].password_hash))) fail(401,'Credenciales incorrectas.');
  const user = rows[0];
  const token = jwt.sign({}, process.env.JWT_SECRET, { algorithm:'HS256', subject:String(user.id_usuario), expiresIn:'4h' });
  res.json({ token, usuario:{ id_usuario:user.id_usuario, nombre:user.nombre, correo:user.correo, rol:user.rol } });
}));
router.get('/me', autenticar, (req,res) => {
  const {id_usuario,nombre,correo,rol} = req.usuario;
  res.json({id_usuario,nombre,correo,rol});
});
module.exports = router;
