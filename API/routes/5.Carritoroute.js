const express = require('express');
const { verificarToken } = require('../middlewares/auth');
const carrito = require('../modulos/carrito.modulo');

const router = express.Router();

router.use(verificarToken);
router.get('/', carrito.verCarrito);
router.post('/items', carrito.agregarItem);
router.put('/items/:productoId', carrito.cambiarCantidad);
router.delete('/items/:productoId', carrito.quitarItem);
router.delete('/', carrito.vaciar);

module.exports = router;
