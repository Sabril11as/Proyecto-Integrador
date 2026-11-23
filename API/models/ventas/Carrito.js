const mongoose = require('mongoose');

const CarritoSchema = new mongoose.Schema({

    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        unique: true
    },

    productos: [
        {
            producto: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Producto',
                required: true
            },

            cantidad: {
                type: Number,
                required: true,
                min: 1,
                validate: {
                    validator: Number.isInteger,
                    message: 'La cantidad debe ser un número entero'
                }
            }
        }
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model('Carrito', CarritoSchema, 'carritos');