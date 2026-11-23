const express = require('express');
const router = express.Router();

const {
    obtenerOrdenes,
    obtenerOrden,
    obtenerOrdenesUsuario,
    crearOrden,
    actualizarOrden,
    cancelarOrden
} = require('../../controllers/ventas/OrdenesController');


// GET - Obtener todas las órdenes
router.get('/', obtenerOrdenes);

// GET - Obtener órdenes de un usuario
router.get('/usuario/:usuarioId', obtenerOrdenesUsuario);

// GET - Obtener orden por ID
router.get('/:id', obtenerOrden);

// POST - Crear orden
router.post('/', crearOrden);

// PATCH - Actualizar estado
router.patch('/:id', actualizarOrden);

// DELETE - Cancelar orden
router.delete('/:id', cancelarOrden);

module.exports = router;