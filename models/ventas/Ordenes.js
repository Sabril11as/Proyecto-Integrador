const mongoose = require('mongoose');

const OrdenesSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    productos: [
        {
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
            },

            nombre: {
                type: String,
                required: true
            },

            precio: {
                type: Number,
                required: true,
                min: 0
            },

            cantidad: {
                type: Number,
                required: true,
                min: 1
            },

            subtotal: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],

    total: {
        type: Number,
        required: true,
        min: 0
    },

    estado: {
        type: String,
        enum: [
            'pendiente',
            'confirmada',
            'pagada',
            'enviada',
            'entregada',
            'cancelada'
        ],
        default: 'pendiente'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Ordenes', OrdenesSchema, 'ordenes');