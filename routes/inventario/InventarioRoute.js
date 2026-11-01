const express = require('express');
const router = express.Router();

const {
    obtenerInventario,
    obtenerProducto,
    agregarStock,
    descontarStock
} = require('../../controllers/inventario/InventarioController');


// GET - Obtener inventario
router.get('/', obtenerInventario);

// GET - Consultar producto
router.get('/:id', obtenerProducto);

// PATCH - Agregar stock
router.patch('/:id/agregar', agregarStock);

// PATCH - Descontar stock
router.patch('/:id/descontar', descontarStock);

module.exports = router;