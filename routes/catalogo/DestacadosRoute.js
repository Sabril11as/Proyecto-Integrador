const express = require('express');
const router = express.Router();

const {
    obtenerDestacados
} = require('../../controllers/catalogo/DestacadosController');

// GET - Obtener destacados
router.get('/', obtenerDestacados);

module.exports = router;