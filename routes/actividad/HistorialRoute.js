const express = require('express');
const router = express.Router();

const {
    obtenerHistorial,
    obtenerHistorialUsuario,
    obtenerDetalleCompra
} = require('../../controllers/actividad/HistorialController');


// GET - Obtener historial completo
router.get('/', obtenerHistorial);

// GET - Obtener historial de un usuario
router.get('/:usuarioId', obtenerHistorialUsuario);

// GET - Obtener detalle de compra
router.get('/:usuarioId/:ordenId', obtenerDetalleCompra);

module.exports = router;