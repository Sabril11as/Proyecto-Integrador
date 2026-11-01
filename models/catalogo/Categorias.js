const mongoose = require('mongoose');

const CategoriaSchema = new mongoose.Schema({

    nombre: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },

    descripcion: {
        type: String,
        default: ''
    },

    activo: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Categoria', CategoriaSchema, 'categorias');