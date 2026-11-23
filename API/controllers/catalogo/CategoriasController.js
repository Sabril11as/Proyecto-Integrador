const Categoria = require('../../models/catalogo/Categorias');

// GET - Obtener categorías
const obtenerCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();

        res.status(200).json({ categorias });

    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
};

// GET - Obtener categoría por ID
const obtenerCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findById(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });
        }

        res.status(200).json({ categoria });

    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500)
            .json({ mensaje: error.message });
    }
};

// POST - Crear categoría
const crearCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.create(req.body);

        res.status(201).json({
            mensaje: 'Categoría creada correctamente',
            categoria
        });

    } catch (error) {
        const status = error.name === 'ValidationError' || error.code === 11000
            ? 400 : 500;

        res.status(status).json({ mensaje: error.message });
    }
};

// PATCH - Actualizar categoría
const actualizarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Categoría actualizada correctamente',
            categoria
        });

    } catch (error) {
        const status = error.name === 'ValidationError' ||
            error.name === 'CastError' ||
            error.code === 11000 ? 400 : 500;

        res.status(status).json({ mensaje: error.message });
    }
};

// DELETE - Eliminar categoría
const eliminarCategoria = async (req, res) => {
    try {
        const categoria = await Categoria.findByIdAndDelete(req.params.id);

        if (!categoria) {
            return res.status(404).json({
                mensaje: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            mensaje: 'Categoría eliminada correctamente'
        });

    } catch (error) {
        res.status(error.name === 'CastError' ? 400 : 500)
            .json({ mensaje: error.message });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
};