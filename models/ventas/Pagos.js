const mongoose = require('mongoose');

const PagosSchema = new mongoose.Schema({

    orden: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ordenes',
        required: true,
        unique: true
    },

    monto: {
        type: Number,
        required: true,
        min: 0.01
    },

    metodo: {
        type: String,
        required: true,
        enum: ['sinpe', 'tarjeta', 'efectivo']
    },

    estado: {
        type: String,
        enum: ['aprobado'],
        default: 'aprobado'
    },

    simulado: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Pagos', PagosSchema, 'pagos');