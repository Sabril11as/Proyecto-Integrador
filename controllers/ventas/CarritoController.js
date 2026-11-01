const mongoose = require('mongoose');

const Carrito = require('../../models/ventas/Carrito');
const Usuario = require('../../models/usuarios/Usuario');
const Producto = require('../../models/catalogo/Producto');


// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' ||
        error.name === 'CastError' ||
        error.code === 11000) {

        return res.status(400).json({
            mensaje: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener carrito de un usuario
const obtenerCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!mongoose.isValidObjectId(usuarioId)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        const usuario = await Usuario.findById(usuarioId);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        const carrito = await Carrito.findOne({
            usuario: usuarioId
        }).populate('productos.producto', 'nombre precio stock activo');

        if (!carrito) {
            return res.status(200).json({
                usuario: usuarioId,
                productos: [],
                total: 0
            });
        }

        // Calcular subtotales
        const productos = carrito.productos.map(item => {

            const subtotal = item.producto
                ? item.producto.precio * item.cantidad
                : 0;

            return {
                producto: item.producto,
                cantidad: item.cantidad,
                subtotal
            };
        });

        // Calcular total
        const total = productos.reduce(
            (suma, item) => suma + item.subtotal,
            0
        );

        return res.status(200).json({
            usuario: usuarioId,
            productos,
            total
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Agregar producto al carrito
const agregarProducto = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { producto, cantidad } = req.body || {};

        // Validar IDs
        if (!mongoose.isValidObjectId(usuarioId) ||
            !mongoose.isValidObjectId(producto)) {

            return res.status(400).json({
                mensaje: 'ID de usuario o producto inválido'
            });
        }

        // Validar cantidad
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad debe ser un entero mayor a 0'
            });
        }

        // Verificar usuario
        const usuarioExiste = await Usuario.findById(usuarioId);

        if (!usuarioExiste) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        // Verificar producto
        const productoExiste = await Producto.findById(producto);

        if (!productoExiste || !productoExiste.activo) {
            return res.status(404).json({
                mensaje: 'Producto no disponible'
            });
        }

        // Buscar carrito existente
        let carrito = await Carrito.findOne({
            usuario: usuarioId
        });

        // Crear carrito si no existe
        if (!carrito) {
            carrito = new Carrito({
                usuario: usuarioId,
                productos: []
            });
        }

        // Buscar si el producto ya está en el carrito
        const item = carrito.productos.find(
            item => item.producto.toString() === productoExiste._id.toString()
        );

        const cantidadTotal = (item ? item.cantidad : 0) + cantidad;

        // Verificar stock
        if (cantidadTotal > productoExiste.stock) {
            return res.status(400).json({
                mensaje: 'Stock insuficiente'
            });
        }

        if (item) {
            // Si existe, aumentar cantidad
            item.cantidad = cantidadTotal;

        } else {
            // Si no existe, agregar producto
            carrito.productos.push({
                producto,
                cantidad
            });
        }

        await carrito.save();

        return res.status(item ? 200 : 201).json({
            mensaje: 'Producto agregado correctamente',
            carrito
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// PATCH - Modificar cantidad
const actualizarCantidad = async (req, res) => {
    try {
        const { usuarioId, productoId } = req.params;
        const { cantidad } = req.body || {};

        if (!mongoose.isValidObjectId(usuarioId) ||
            !mongoose.isValidObjectId(productoId)) {

            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'Cantidad inválida'
            });
        }

        const carrito = await Carrito.findOne({
            usuario: usuarioId
        });

        if (!carrito) {
            return res.status(404).json({
                mensaje: 'Carrito no encontrado'
            });
        }

        const item = carrito.productos.find(
            item => item.producto.toString() === productoId
        );

        if (!item) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado en el carrito'
            });
        }

        const producto = await Producto.findById(productoId);

        if (!producto || !producto.activo) {
            return res.status(404).json({
                mensaje: 'Producto no disponible'
            });
        }

        if (cantidad > producto.stock) {
            return res.status(400).json({
                mensaje: 'Stock insuficiente'
            });
        }

        item.cantidad = cantidad;

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Cantidad actualizada correctamente',
            carrito
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Eliminar producto del carrito
const eliminarProducto = async (req, res) => {
    try {
        const { usuarioId, productoId } = req.params;

        if (!mongoose.isValidObjectId(usuarioId) ||
            !mongoose.isValidObjectId(productoId)) {

            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const carrito = await Carrito.findOne({
            usuario: usuarioId
        });

        if (!carrito) {
            return res.status(404).json({
                mensaje: 'Carrito no encontrado'
            });
        }

        const existe = carrito.productos.some(
            item => item.producto.toString() === productoId
        );

        if (!existe) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado en el carrito'
            });
        }

        carrito.productos = carrito.productos.filter(
            item => item.producto.toString() !== productoId
        );

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Producto eliminado del carrito',
            carrito
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Vaciar carrito
const vaciarCarrito = async (req, res) => {
    try {
        const { usuarioId } = req.params;

        if (!mongoose.isValidObjectId(usuarioId)) {
            return res.status(400).json({
                mensaje: 'ID de usuario inválido'
            });
        }

        const carrito = await Carrito.findOne({
            usuario: usuarioId
        });

        if (!carrito) {
            return res.status(404).json({
                mensaje: 'Carrito no encontrado'
            });
        }

        carrito.productos = [];

        await carrito.save();

        return res.status(200).json({
            mensaje: 'Carrito vaciado correctamente',
            carrito
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerCarrito,
    agregarProducto,
    actualizarCantidad,
    eliminarProducto,
    vaciarCarrito
};