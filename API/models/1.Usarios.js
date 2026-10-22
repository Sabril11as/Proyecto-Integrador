const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    clave: {
        type: String,
        required: true,
        trim: true
    }
});

module.exports = mongoose.model('Usuario', userSchema);