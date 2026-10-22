const express = require('express');
const { tokenOpcional, verificarToken, soloAdmin } = require('../middlewares/auth');
const productos = require('../modulos/productos.modulo');

const router = express.Router();

router.get('/', tokenOpcional, productos.listar);
router.get('/:id', tokenOpcional, productos.obtener);
router.get('/:id/relacionados', productos.relacionados);
router.post('/', verificarToken, soloAdmin, productos.crear);
router.put('/:id', verificarToken, soloAdmin, productos.actualizar);
router.delete('/:id', verificarToken, soloAdmin, productos.retirar);

module.exports = router;
