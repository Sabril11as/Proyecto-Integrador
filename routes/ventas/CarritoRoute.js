const express = require('express');
const router = express.Router();

const {
    obtenerCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito
} = require('../../controllers/ventas/CarritoController');


// GET - Obtener carrito
router.get('/:usuarioId', obtenerCarrito);

// POST - Agregar producto
router.post('/:usuarioId/productos', agregarProducto);

// PATCH - Actualizar cantidad
router.patch('/:usuarioId/productos/:productoId', actualizarCantidad);

// DELETE - Eliminar producto
router.delete('/:usuarioId/productos/:productoId', eliminarProducto);

// DELETE - Vaciar carrito
router.delete('/:usuarioId', vaciarCarrito);

module.exports = router;