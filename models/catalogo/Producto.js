const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    descripcion: {
        type: String,
        default: ''
    },

    precio: {
        type: Number,
        required: true,
        min: 0
    },

    stock: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'El stock debe ser un número entero'
        }
    },

    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    },

    imagen: {
        type: String,
        default: ''
    },

    destacado: {
        type: Boolean,
        default: false
    },

    activo: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Producto', ProductoSchema, 'productos');