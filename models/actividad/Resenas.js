const mongoose = require('mongoose');

const ResenasSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },

    producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Producto',
        required: true
    },

    calificacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'La calificación debe ser un número entero'
        }
    },

    comentario: {
        type: String,
        default: '',
        trim: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Resenas', ResenasSchema, 'resenas');