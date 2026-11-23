const express = require('express');
const router = express.Router();

const {
    obtenerResenas,
    obtenerResena,
    crearResena,
    actualizarResena,
    eliminarResena
} = require('../../controllers/actividad/ResenasController');


// GET - Obtener reseñas
router.get('/', obtenerResenas);

// GET - Obtener reseña por ID
router.get('/:id', obtenerResena);

// POST - Crear reseña
router.post('/', crearResena);

// PATCH - Actualizar reseña
router.patch('/:id', actualizarResena);

// DELETE - Eliminar reseña
router.delete('/:id', eliminarResena);

module.exports = router;