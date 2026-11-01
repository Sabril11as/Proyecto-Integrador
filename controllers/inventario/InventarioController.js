const mongoose = require('mongoose');
const Inventario = require('../../models/inventario/Inventario');


// GET - Obtener inventario completo
const obtenerInventario = async (req, res) => {
    try {
        const productos = await Inventario.obtenerInventario();

        return res.status(200).json({
            total: productos.length,
            productos
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener inventario'
        });
    }
};


// GET - Consultar inventario de un producto
const obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const producto = await Inventario.obtenerProducto(id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        return res.status(200).json({ producto });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al consultar inventario'
        });
    }
};


// PATCH - Agregar stock
const agregarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body || {};

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad debe ser un número entero mayor a 0'
            });
        }

        const producto = await Inventario.agregarStock(id, cantidad);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Stock agregado correctamente',
            producto
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al agregar stock'
        });
    }
};


// PATCH - Descontar stock
const descontarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad } = req.body || {};

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: 'La cantidad debe ser un número entero mayor a 0'
            });
        }

        const producto = await Inventario.descontarStock(id, cantidad);

        if (!producto) {

            const existe = await Inventario.obtenerProducto(id);

            if (!existe) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            return res.status(400).json({
                mensaje: 'Stock insuficiente'
            });
        }

        return res.status(200).json({
            mensaje: 'Stock descontado correctamente',
            producto
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al descontar stock'
        });
    }
};


module.exports = {
    obtenerInventario,
    obtenerProducto,
    agregarStock,
    descontarStock
};