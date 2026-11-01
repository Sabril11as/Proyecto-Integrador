const mongoose = require('mongoose');

const Notificaciones = require('../../models/comunicacion/Notificaciones');
const Usuario = require('../../models/usuarios/Usuario');


// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' ||
        error.name === 'CastError') {

        return res.status(400).json({
            mensaje: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener todas las notificaciones
const obtenerNotificaciones = async (req, res) => {
    try {

        const notificaciones = await Notificaciones.find()
            .populate('usuario', 'nombre correo')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            total: notificaciones.length,
            notificaciones
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener notificaciones de un usuario
const obtenerNotificacionesUsuario = async (req, res) => {
    try {

        const { usuarioId } = req.params;

        if (!mongoose.isValidObjectId(usuarioId)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const notificaciones = await Notificaciones.find({
            usuario: usuarioId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            total: notificaciones.length,
            notificaciones
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener notificación por ID
const obtenerNotificacion = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const notificacion = await Notificaciones.findById(id);

        if (!notificacion) {
            return res.status(404).json({
                mensaje: 'Notificación no encontrada'
            });
        }

        return res.status(200).json({
            notificacion
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Crear notificación
const crearNotificacion = async (req, res) => {
    try {

        const { usuario, titulo, mensaje, tipo } = req.body || {};

        if (!mongoose.isValidObjectId(usuario)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        // Verificar que exista el usuario
        const usuarioExiste = await Usuario.findById(usuario);

        if (!usuarioExiste) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Crear notificación
        const notificacion = await Notificaciones.create({
            usuario,
            titulo,
            mensaje,
            tipo
        });

        return res.status(201).json({
            mensaje: 'Notificación creada correctamente',
            notificacion
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// PATCH - Marcar notificación como leída
const marcarLeida = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const notificacion = await Notificaciones.findByIdAndUpdate(
            id,
            { leida: true },
            {
                new: true,
                runValidators: true
            }
        );

        if (!notificacion) {
            return res.status(404).json({
                mensaje: 'Notificación no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Notificación marcada como leída',
            notificacion
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Eliminar notificación
const eliminarNotificacion = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const notificacion = await Notificaciones.findByIdAndDelete(id);

        if (!notificacion) {
            return res.status(404).json({
                mensaje: 'Notificación no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Notificación eliminada correctamente'
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerNotificaciones,
    obtenerNotificacionesUsuario,
    obtenerNotificacion,
    crearNotificacion,
    marcarLeida,
    eliminarNotificacion
};