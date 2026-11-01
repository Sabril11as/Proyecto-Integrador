const express = require('express');
const router = express.Router();

const {
    obtenerNotificaciones,
    obtenerNotificacionesUsuario,
    obtenerNotificacion,
    crearNotificacion,
    marcarLeida,
    eliminarNotificacion
} = require('../../controllers/comunicacion/NotificacionesController');


// GET - Obtener todas las notificaciones
router.get('/', obtenerNotificaciones);

// GET - Obtener notificaciones de un usuario
router.get('/usuario/:usuarioId', obtenerNotificacionesUsuario);

// GET - Obtener notificación por ID
router.get('/:id', obtenerNotificacion);

// POST - Crear notificación
router.post('/', crearNotificacion);

// PATCH - Marcar como leída
router.patch('/:id/leida', marcarLeida);

// DELETE - Eliminar notificación
router.delete('/:id', eliminarNotificacion);

module.exports = router;