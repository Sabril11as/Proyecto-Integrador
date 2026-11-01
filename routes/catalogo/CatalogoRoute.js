const express = require('express');
const router = express.Router();

const {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} = require('../../controllers/catalogo/ProductoController');


// GET - Obtener productos
router.get('/', obtenerProductos);

// GET - Obtener producto por ID
router.get('/:id', obtenerProducto);

// POST - Crear producto
router.post('/', crearProducto);

// PATCH - Actualizar producto
router.patch('/:id', actualizarProducto);

// DELETE - Eliminar producto
router.delete('/:id', eliminarProducto);

module.exports = router;