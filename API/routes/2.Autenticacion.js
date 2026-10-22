const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const autenticacion = require('../modulos/auth.modulo');

const router = express.Router();

router.post('/registro', autenticacion.registro);
router.post('/login', autenticacion.login);
router.get('/yo', verificarToken, autenticacion.yo);
router.post('/logout', verificarToken, autenticacion.logout);

module.exports = router;
