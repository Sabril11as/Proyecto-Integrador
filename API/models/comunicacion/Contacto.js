const mongoose = require('mongoose');

const ContactoSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        trim: true
    },

    correo: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },

    asunto: {
        type: String,
        required: true,
        trim: true
    },

    mensaje: {
        type: String,
        required: true,
        trim: true
    },

    estado: {
        type: String,
        enum: ['pendiente', 'respondido'],
        default: 'pendiente'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Contacto', ContactoSchema, 'contactos');