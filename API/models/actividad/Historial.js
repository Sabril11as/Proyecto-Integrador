const Ordenes = require('../ventas/Ordenes');

// Obtener historial completo
const obtenerHistorial = async () => {
    return await Ordenes.find()
        .populate('usuario', 'nombre correo')
        .sort({ createdAt: -1 });
};

// Obtener historial de un usuario
const obtenerHistorialUsuario = async (usuarioId) => {
    return await Ordenes.find({
        usuario: usuarioId
    }).sort({ createdAt: -1 });
};

// Obtener detalle de una compra
const obtenerDetalleCompra = async (usuarioId, ordenId) => {
    return await Ordenes.findOne({
        _id: ordenId,
        usuario: usuarioId
    });
};

module.exports = {
    obtenerHistorial,
    obtenerHistorialUsuario,
    obtenerDetalleCompra
};