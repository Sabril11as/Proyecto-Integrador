const mongoose = require('mongoose');

const Pagos = require('../../models/ventas/Pagos');
const Ordenes = require('../../models/ventas/Ordenes');


// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' ||
        error.name === 'CastError' ||
        error.code === 11000) {

        return res.status(400).json({
            mensaje: error.code === 11000
                ? 'Esta orden ya tiene un pago registrado'
                : error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener todos los pagos
const obtenerPagos = async (req, res) => {
    try {

        const pagos = await Pagos.find()
            .populate('orden', 'usuario total estado');

        return res.status(200).json({
            total: pagos.length,
            pagos
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener pago por ID
const obtenerPago = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID de pago inválido'
            });
        }

        const pago = await Pagos.findById(id)
            .populate('orden', 'usuario total estado');

        if (!pago) {
            return res.status(404).json({
                mensaje: 'Pago no encontrado'
            });
        }

        return res.status(200).json({ pago });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener pago de una orden
const obtenerPagoOrden = async (req, res) => {
    try {

        const { ordenId } = req.params;

        if (!mongoose.isValidObjectId(ordenId)) {
            return res.status(400).json({
                mensaje: 'ID de orden inválido'
            });
        }

        const pago = await Pagos.findOne({
            orden: ordenId
        });

        if (!pago) {
            return res.status(404).json({
                mensaje: 'No existe un pago para esta orden'
            });
        }

        return res.status(200).json({ pago });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Registrar pago
const crearPago = async (req, res) => {

    let ordenMarcada = false;
    let ordenId = null;

    try {

        const { orden, monto, metodo } = req.body || {};
        ordenId = orden;

        // Validar ID
        if (!mongoose.isValidObjectId(orden)) {
            return res.status(400).json({
                mensaje: 'ID de orden inválido'
            });
        }

        // Validar monto
        if (typeof monto !== 'number' ||
            !Number.isFinite(monto) ||
            monto <= 0) {

            return res.status(400).json({
                mensaje: 'El monto debe ser un número mayor a 0'
            });
        }

        // Validar método
        if (!['sinpe', 'tarjeta', 'efectivo'].includes(metodo)) {
            return res.status(400).json({
                mensaje: 'Método de pago inválido'
            });
        }

        // Buscar orden
        const ordenExiste = await Ordenes.findById(orden);

        if (!ordenExiste) {
            return res.status(404).json({
                mensaje: 'Orden no encontrada'
            });
        }

        // Verificar estado de la orden
        if (ordenExiste.estado !== 'confirmada') {
            return res.status(400).json({
                mensaje: 'La orden debe estar confirmada para pagar'
            });
        }

        // Verificar monto
        if (monto !== ordenExiste.total) {
            return res.status(400).json({
                mensaje: 'El monto no coincide con el total de la orden'
            });
        }

        // Verificar que no exista otro pago
        const pagoExiste = await Pagos.findOne({ orden });

        if (pagoExiste) {
            return res.status(400).json({
                mensaje: 'Esta orden ya tiene un pago registrado'
            });
        }

        // Marcar orden como pagada
        const ordenActualizada = await Ordenes.findOneAndUpdate(
            {
                _id: orden,
                estado: 'confirmada'
            },
            {
                estado: 'pagada'
            },
            {
                new: true
            }
        );

        if (!ordenActualizada) {
            return res.status(400).json({
                mensaje: 'La orden ya no está disponible para pagar'
            });
        }

        ordenMarcada = true;

        // Registrar pago simulado
        const pago = await Pagos.create({
            orden,
            monto,
            metodo
        });

        return res.status(201).json({
            mensaje: 'Pago simulado registrado correctamente',
            pago
        });

    } catch (error) {

        // Intentar restaurar el estado si falla el registro
        if (ordenMarcada) {
            try {
                await Ordenes.updateOne(
                    { _id: ordenId, estado: 'pagada' },
                    { estado: 'confirmada' }
                );
            } catch (errorReversion) {
                console.error('Error al restaurar orden:', errorReversion);
            }
        }

        return manejarError(res, error);
    }
};


module.exports = {
    obtenerPagos,
    obtenerPago,
    obtenerPagoOrden,
    crearPago
};