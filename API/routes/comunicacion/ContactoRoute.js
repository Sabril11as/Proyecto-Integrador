const express = require('express');
const router = express.Router();

const {
    obtenerContactos,
    obtenerContacto,
    crearContacto,
    actualizarContacto,
    eliminarContacto
} = require('../../controllers/comunicacion/ContactoController');


// GET - Obtener todos los mensajes
router.get('/', obtenerContactos);

// GET - Obtener mensaje por ID
router.get('/:id', obtenerContacto);

// POST - Crear mensaje
router.post('/', crearContacto);

// PATCH - Actualizar estado
router.patch('/:id', actualizarContacto);

// DELETE - Eliminar mensaje
router.delete('/:id', eliminarContacto);

module.exports = router;