const mongoose = require('mongoose');

const Ordenes = require('../../models/ventas/Ordenes');
const Carrito = require('../../models/ventas/Carrito');
const Usuario = require('../../models/usuarios/Usuario');
const Producto = require('../../models/catalogo/Producto');


// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' ||
        error.name === 'CastError') {

        return res.status(400).json({
            mensaje: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener todas las órdenes
const obtenerOrdenes = async (req, res) => {
    try {
        const ordenes = await Ordenes.find()
            .populate('usuario', 'nombre correo');

        return res.status(200).json({
            total: ordenes.length,
            ordenes
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener orden por ID
const obtenerOrden = async (req, res) => {
    try {
        const orden = await Ordenes.findById(req.params.id)
            .populate('usuario', 'nombre correo');

        if (!orden) {
            return res.status(404).json({
                mensaje: 'Orden no encontrada'
            });
        }

        return res.status(200).json({ orden });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener órdenes de un usuario
const obtenerOrdenesUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!mongoose.isValidObjectId(usuarioId)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        const ordenes = await Ordenes.find({
            usuario: usuarioId
        });

        return res.status(200).json({
            total: ordenes.length,
            ordenes
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Crear una orden desde el carrito
const crearOrden = async (req, res) => {
    const descontados = [];
    let ordenCreada = null;

    try {
        const { usuario } = req.body || {};

        if (!mongoose.isValidObjectId(usuario)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        // Verificar usuario
        const usuarioExiste = await Usuario.findById(usuario);

        if (!usuarioExiste) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Obtener carrito
        const carrito = await Carrito.findOne({
            usuario
        }).populate('productos.producto');

        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({
                mensaje: 'El carrito está vacío'
            });
        }

        // Preparar productos
        const productos = [];

        for (const item of carrito.productos) {

            const producto = item.producto;

            if (!producto || !producto.activo) {
                return res.status(400).json({
                    mensaje: 'Uno de los productos no está disponible'
                });
            }

            if (!Number.isInteger(item.cantidad) || item.cantidad <= 0) {
                return res.status(400).json({
                    mensaje: 'Cantidad inválida en el carrito'
                });
            }

            if (producto.stock < item.cantidad) {
                return res.status(400).json({
                    mensaje: `Stock insuficiente para ${producto.nombre}`
                });
            }

            productos.push({
                producto: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: item.cantidad,
                subtotal: producto.precio * item.cantidad
            });
        }

        // Calcular total
        const total = productos.reduce(
            (suma, item) => suma + item.subtotal,
            0
        );

        // Descontar inventario
        for (const item of productos) {

            const actualizado = await Producto.findOneAndUpdate(
                {
                    _id: item.producto,
                    activo: true,
                    stock: { $gte: item.cantidad }
                },
                {
                    $inc: { stock: -item.cantidad }
                },
                { new: true }
            );

            if (!actualizado) {
                const error = new Error(
                    `Stock insuficiente para ${item.nombre}`
                );

                error.status = 400;
                throw error;
            }

            descontados.push(item);
        }

        // Crear orden
        ordenCreada = await Ordenes.create({
            usuario,
            productos,
            total
        });

        // Vaciar carrito
        carrito.productos = [];
        await carrito.save();

        return res.status(201).json({
            mensaje: 'Orden creada correctamente',
            orden: ordenCreada
        });

    } catch (error) {

        // Intentar revertir cambios si falla la creación
        try {
            if (ordenCreada) {
                await Ordenes.findByIdAndDelete(ordenCreada._id);
            }

            for (const item of descontados) {
                await Producto.findByIdAndUpdate(
                    item.producto,
                    { $inc: { stock: item.cantidad } }
                );
            }
        } catch (reversionError) {
            console.error('Error al revertir la orden:', reversionError);
        }

        if (error.status === 400) {
            return res.status(400).json({
                mensaje: error.message
            });
        }

        return manejarError(res, error);
    }
};


// PATCH - Actualizar estado
const actualizarOrden = async (req, res) => {
    try {
        const { estado } = req.body || {};

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                mensaje: 'ID de orden inválido'
            });
        }

        const orden = await Ordenes.findById(req.params.id);

        if (!orden) {
            return res.status(404).json({
                mensaje: 'Orden no encontrada'
            });
        }

        // Estados que se pueden actualizar desde esta ruta
        const siguientes = {
            pendiente: 'confirmada',
            pagada: 'enviada',
            enviada: 'entregada'
        };

        if (siguientes[orden.estado] !== estado) {
            return res.status(400).json({
                mensaje: 'Cambio de estado no permitido'
            });
        }

        orden.estado = estado;

        await orden.save();

        return res.status(200).json({
            mensaje: 'Orden actualizada correctamente',
            orden
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Cancelar orden
const cancelarOrden = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID de orden inválido'
            });
        }

        // Solo cancelar órdenes pendientes o confirmadas
        const orden = await Ordenes.findOneAndUpdate(
            {
                _id: id,
                estado: { $in: ['pendiente', 'confirmada'] }
            },
            {
                $set: { estado: 'cancelada' }
            },
            { new: true }
        );

        if (!orden) {

            const existe = await Ordenes.findById(id);

            if (!existe) {
                return res.status(404).json({
                    mensaje: 'Orden no encontrada'
                });
            }

            return res.status(400).json({
                mensaje: 'Esta orden no se puede cancelar'
            });
        }

        // Devolver productos al inventario
        for (const item of orden.productos) {

            await Producto.findByIdAndUpdate(
                item.producto,
                {
                    $inc: { stock: item.cantidad }
                }
            );
        }

        return res.status(200).json({
            mensaje: 'Orden cancelada correctamente',
            orden
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerOrdenes,
    obtenerOrden,
    obtenerOrdenesUsuario,
    crearOrden,
    actualizarOrden,
    cancelarOrden
};