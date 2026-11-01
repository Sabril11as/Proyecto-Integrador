const express = require('express');
const router = express.Router();

const {
    obtenerUsuarios,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario
} = require('../../controllers/usuarios/UsuarioController');

const {
    registrar,
    verificarToken,
    soloAdmin,
    propietarioOAdmin
} = require('../../controllers/auth/AutenticationController');


// GET - Obtener usuarios
router.get('/', verificarToken, soloAdmin, obtenerUsuarios);

// GET - Obtener usuario por ID
router.get('/:id', verificarToken, propietarioOAdmin, obtenerUsuario);

// POST - Registrar usuario de forma segura
router.post('/', registrar);

// PATCH - Actualizar usuario
router.patch('/:id', verificarToken, propietarioOAdmin, actualizarUsuario);

// DELETE - Eliminar usuario
router.delete('/:id', verificarToken, soloAdmin, eliminarUsuario);

module.exports = router;