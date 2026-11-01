const express = require('express');
const router = express.Router();

const {
    registrar,
    login,
    verificarToken,
    obtenerPerfil
} = require('../../controllers/auth/AutenticationController');


// POST - Registrar usuario
router.post('/registro', registrar);

// POST - Iniciar sesión
router.post('/login', login);

// GET - Obtener perfil autenticado
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;