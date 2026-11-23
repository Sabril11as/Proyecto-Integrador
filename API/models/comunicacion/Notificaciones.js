const mongoose = require('mongoose');

const NotificacionesSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    titulo: {
        type: String,
        required: true,
        trim: true
    },

    mensaje: {
        type: String,
        required: true,
        trim: true
    },

    tipo: {
        type: String,
        enum: ['general', 'compra', 'pedido'],
        default: 'general'
    },

    leida: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    'Notificaciones',
    NotificacionesSchema,
    'notificaciones'
);