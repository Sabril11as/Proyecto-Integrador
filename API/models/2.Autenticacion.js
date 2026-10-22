const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const config = require('../config');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { sinPassword } = require('../utils/formato');
const { crearNotificacion } = require('../servicios/notificaciones.servicio');

function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, config.jwtSecreto, { expiresIn: config.jwtExpira });
}

// POST /api/auth/registro
function registro(req, res) {
  validar.requerirCampos(req.body, ['nombre', 'correo', 'password']);
  const correo = validar.correo(req.body.correo);
  const password = validar.password(req.body.password);

  if (db.buscarUno('usuarios', (u) => u.correo === correo)) {
    throw new ErrorHttp(409, 'Ya existe una cuenta con ese correo.');
  }

  const usuario = db.insertar('usuarios', {
    nombre: validar.texto(req.body.nombre, 'nombre', { max: 60 }),
    apellido: validar.texto(req.body.apellido, 'apellido', { max: 60, obligatorio: false }),
    correo,
    password: bcrypt.hashSync(password, 10), // se guarda encriptada
    rol: 'cliente', // nadie puede registrarse como admin desde aquí
    telefono: validar.texto(req.body.telefono, 'telefono', { max: 20, obligatorio: false }),
    direccion: null,
    foto: null,
    activo: true,
  });

  crearNotificacion(usuario.id, {
    tipo: 'bienvenida',
    titulo: `¡Bienvenido(a), ${usuario.nombre}!`,
    mensaje: 'Tu cuenta fue creada. Completa tu perfil y tu dirección de envío.',
    enlace: '/perfil',
  });

  res.status(201).json({
    mensaje: 'Cuenta creada correctamente.',
    token: generarToken(usuario),
    usuario: sinPassword(usuario),
  });
}

// POST /api/auth/login
function login(req, res) {
  validar.requerirCampos(req.body, ['correo', 'password']);
  const correo = String(req.body.correo).trim().toLowerCase();
  const usuario = db.buscarUno('usuarios', (u) => u.correo === correo);

  if (!usuario || !bcrypt.compareSync(String(req.body.password), usuario.password)) {
    throw new ErrorHttp(401, 'Correo o contraseña incorrectos.');
  }
  if (!usuario.activo) throw new ErrorHttp(403, 'Tu cuenta está desactivada. Contacta a soporte.');

  usuario.ultimoAcceso = new Date().toISOString();
  db.guardar();

  res.json({
    mensaje: 'Inicio de sesión correcto.',
    token: generarToken(usuario),
    usuario: sinPassword(usuario),
  });
}

// GET /api/auth/yo
function yo(req, res) {
  res.json(sinPassword(req.usuario));
}

// POST /api/auth/logout
function logout(req, res) {
  res.json({ mensaje: 'Sesión cerrada. Elimina el token guardado en el navegador o app.' });
}

module.exports = {
  registro,
  login,
  yo,
  logout,
};
