const Producto = require('../../models/catalogo/Producto');
const Categoria = require('../../models/catalogo/Categorias');

// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({
            mensaje: error.message
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const productos = await Producto.find()
            .populate('categoria', 'nombre');

        res.status(200).json({ productos });

    } catch (error) {
        manejarError(res, error);
    }
};


// GET - Obtener producto por ID
const obtenerProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id)
            .populate('categoria', 'nombre');

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.status(200).json({ producto });

    } catch (error) {
        manejarError(res, error);
    }
};


// POST - Crear producto
const crearProducto = async (req, res) => {
    try {

        // Verificar que exista la categoría
        if (req.body.categoria) {
            const categoria = await Categoria.findById(req.body.categoria);

            if (!categoria) {
                return res.status(400).json({
                    mensaje: 'La categoría no existe'
                });
            }
        }

        const producto = await Producto.create(req.body);

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            producto
        });

    } catch (error) {
        manejarError(res, error);
    }
};


// PATCH - Actualizar producto
const actualizarProducto = async (req, res) => {
    try {

        // Validar categoría si se desea cambiar
        if (req.body.categoria) {
            const categoria = await Categoria.findById(req.body.categoria);

            if (!categoria) {
                return res.status(400).json({
                    mensaje: 'La categoría no existe'
                });
            }
        }

        const producto = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            producto
        });

    } catch (error) {
        manejarError(res, error);
    }
};


// DELETE - Eliminar producto
const eliminarProducto = async (req, res) => {
    try {
        const producto = await Producto.findByIdAndDelete(req.params.id);

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Producto eliminado correctamente'
        });

    } catch (error) {
        manejarError(res, error);
    }
};


module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};