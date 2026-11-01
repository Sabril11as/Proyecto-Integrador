const express = require('express');
const router = express.Router();

const {
    obtenerPagos,
    obtenerPago,
    obtenerPagoOrden,
    crearPago
} = require('../../controllers/ventas/PagosController');


// GET - Obtener todos los pagos
router.get('/', obtenerPagos);

// GET - Obtener pago de una orden
router.get('/orden/:ordenId', obtenerPagoOrden);

// GET - Obtener pago por ID
router.get('/:id', obtenerPago);

// POST - Registrar pago
router.post('/', crearPago);

module.exports = router;