const express = require('express');
const { verificarToken, soloAdmin } = require('../middlewares/auth');
const categorias = require('../modulos/categorias.modulo');

const router = express.Router();

router.get('/', categorias.listar);
router.get('/:id', categorias.obtener);
router.get('/:id/productos', categorias.productosDeCategoria);
router.post('/', verificarToken, soloAdmin, categorias.crear);
router.put('/:id', verificarToken, soloAdmin, categorias.actualizar);
router.delete('/:id', verificarToken, soloAdmin, categorias.eliminar);

module.exports = router;
