const express = require('express');
const { verificarToken, soloAdmin } = require('../middlewares/auth');
const ordenes = require('../modulos/ordenes.modulo');

const router = express.Router();

router.use(verificarToken);
router.post('/', ordenes.crear);
router.get('/', ordenes.listarMias);
router.get('/:id', ordenes.obtener);
router.patch('/:id/cancelar', ordenes.cancelar);
router.patch('/:id/estado', soloAdmin, ordenes.cambiarEstado);

module.exports = router;