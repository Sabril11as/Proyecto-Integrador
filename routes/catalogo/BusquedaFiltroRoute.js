const express = require('express');
const router = express.Router();

const {
    buscarProductos
} = require('../../controllers/catalogo/BusquedaFiltroController');

// GET - Buscar productos
router.get('/', buscarProductos);

module.exports = router;