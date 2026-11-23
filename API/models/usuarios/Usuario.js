const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    correo: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    telefono: {
        type: String,
        default: ''
    },

    password: {
        type: String,
        required: true,
        select: false
    },

    rol: {
        type: String,
        enum: ['cliente', 'admin'],
        default: 'cliente'
    },

    activo: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Usuario', UsuarioSchema);