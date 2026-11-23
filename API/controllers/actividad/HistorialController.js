const mongoose = require('mongoose');

const Historial = require('../../models/actividad/Historial');
const Usuario = require('../../models/usuarios/Usuario');


// GET - Obtener historial completo
const obtenerHistorial = async (req, res) => {
    try {

        const ordenes = await Historial.obtenerHistorial();

        return res.status(200).json({
            total: ordenes.length,
            ordenes
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener el historial'
        });
    }
};


// GET - Obtener historial de un usuario
const obtenerHistorialUsuario = async (req, res) => {
    try {

        const { usuarioId } = req.params;

        // Validar ID
        if (!mongoose.isValidObjectId(usuarioId)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        // Verificar usuario
        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Consultar historial
        const ordenes = await Historial.obtenerHistorialUsuario(usuarioId);

        return res.status(200).json({
            usuario: usuarioId,
            total: ordenes.length,
            ordenes
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener historial del usuario'
        });
    }
};


// GET - Obtener detalle de una compra
const obtenerDetalleCompra = async (req, res) => {
    try {

        const { usuarioId, ordenId } = req.params;

        // Validar IDs
        if (!mongoose.isValidObjectId(usuarioId) ||
            !mongoose.isValidObjectId(ordenId)) {

            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        // Buscar compra
        const orden = await Historial.obtenerDetalleCompra(
            usuarioId,
            ordenId
        );

        if (!orden) {
            return res.status(404).json({
                mensaje: 'Compra no encontrada'
            });
        }

        return res.status(200).json({
            orden
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al consultar la compra'
        });
    }
};


module.exports = {
    obtenerHistorial,
    obtenerHistorialUsuario,
    obtenerDetalleCompra
};