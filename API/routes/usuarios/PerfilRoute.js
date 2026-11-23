const express = require('express');
const router = express.Router();

const {
    obtenerUsuario,
    actualizarUsuario
} = require('../../controllers/usuarios/UsuarioController');

const {
    verificarToken,
    propietarioOAdmin
} = require('../../controllers/auth/AutenticationController');

router.get('/:id', verificarToken, propietarioOAdmin, obtenerUsuario);

router.patch('/:id', verificarToken, propietarioOAdmin, actualizarUsuario);

module.exports = router;