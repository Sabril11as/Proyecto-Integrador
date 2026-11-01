const mongoose = require('mongoose');
const BusquedaFiltro = require('../../models/catalogo/BusquedaFiltro');

// GET - Buscar productos con filtros
const buscarProductos = async (req, res) => {
    try {

        // Recibir filtros desde la URL
        const { nombre, categoria, precioMin, precioMax } = req.query;

        const filtros = {
            activo: true
        };

        // Filtrar por nombre
        if (nombre) {
            if (typeof nombre !== 'string') {
                return res.status(400).json({
                    mensaje: 'El nombre debe ser texto'
                });
            }

            const nombreSeguro = nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            filtros.nombre = {
                $regex: nombreSeguro,
                $options: 'i'
            };
        }

        // Filtrar por categoría
        if (categoria) {

            if (!mongoose.isValidObjectId(categoria)) {
                return res.status(400).json({
                    mensaje: 'El ID de la categoría no es válido'
                });
            }

            filtros.categoria = categoria;
        }

        // Filtrar por precio
        if (precioMin !== undefined || precioMax !== undefined) {

            const precioValido = (valor) =>
                typeof valor === 'string' &&
                valor.trim() !== '' &&
                Number.isFinite(Number(valor)) &&
                Number(valor) >= 0;

            if (precioMin !== undefined && !precioValido(precioMin)) {
                return res.status(400).json({
                    mensaje: 'El precio mínimo no es válido'
                });
            }

            if (precioMax !== undefined && !precioValido(precioMax)) {
                return res.status(400).json({
                    mensaje: 'El precio máximo no es válido'
                });
            }

            if (precioMin !== undefined &&
                precioMax !== undefined &&
                Number(precioMin) > Number(precioMax)) {

                return res.status(400).json({
                    mensaje: 'El precio mínimo no puede superar al máximo'
                });
            }

            filtros.precio = {};

            if (precioMin !== undefined) {
                filtros.precio.$gte = Number(precioMin);
            }

            if (precioMax !== undefined) {
                filtros.precio.$lte = Number(precioMax);
            }
        }

        // Consultar productos
        const productos = await BusquedaFiltro.buscarProductos(filtros);

        return res.status(200).json({
            total: productos.length,
            productos
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

module.exports = {
    buscarProductos
};