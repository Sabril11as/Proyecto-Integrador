const express = require('express');
const router = express.Router();

const {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} = require('../../controllers/catalogo/CategoriasController');

router.get('/', obtenerCategorias);

router.get('/:id', obtenerCategoria);

router.post('/', crearCategoria);

router.patch('/:id', actualizarCategoria);

router.delete('/:id', eliminarCategoria);

module.exports = router;