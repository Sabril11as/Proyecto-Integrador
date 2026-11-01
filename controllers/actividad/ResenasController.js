const mongoose = require('mongoose');

const Resenas = require('../../models/actividad/Resenas');
const Usuario = require('../../models/usuarios/Usuario');
const Producto = require('../../models/catalogo/Producto');


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


// GET - Obtener todas las reseñas
const obtenerResenas = async (req, res) => {
    try {
        const resenas = await Resenas.find()
            .populate('usuario', 'nombre')
            .populate('producto', 'nombre');

        return res.status(200).json({
            total: resenas.length,
            resenas
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener reseña por ID
const obtenerResena = async (req, res) => {
    try {
        const resena = await Resenas.findById(req.params.id)
            .populate('usuario', 'nombre')
            .populate('producto', 'nombre');

        if (!resena) {
            return res.status(404).json({
                mensaje: 'Reseña no encontrada'
            });
        }

        return res.status(200).json({ resena });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Crear reseña
const crearResena = async (req, res) => {
    try {
        const { usuario, producto, calificacion, comentario } = req.body;

        // Verificar IDs
        if (!mongoose.isValidObjectId(usuario) ||
            !mongoose.isValidObjectId(producto)) {

            return res.status(400).json({
                mensaje: 'ID de usuario o producto inválido'
            });
        }

        // Verificar que exista el usuario
        const usuarioExiste = await Usuario.findById(usuario);

        if (!usuarioExiste) {
            return res.status(400).json({
                mensaje: 'El usuario no existe'
            });
        }

        // Verificar que exista el producto
        const productoExiste = await Producto.findById(producto);

        if (!productoExiste) {
            return res.status(400).json({
                mensaje: 'El producto no existe'
            });
        }

        // Crear reseña
        const resena = await Resenas.create({
            usuario,
            producto,
            calificacion,
            comentario
        });

        return res.status(201).json({
            mensaje: 'Reseña creada correctamente',
            resena
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// PATCH - Actualizar reseña
const actualizarResena = async (req, res) => {
    try {
        const { calificacion, comentario } = req.body;

        const datos = {};

        if (calificacion !== undefined) {
            datos.calificacion = calificacion;
        }

        if (comentario !== undefined) {
            datos.comentario = comentario;
        }

        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                mensaje: 'No se enviaron datos para actualizar'
            });
        }

        const resena = await Resenas.findByIdAndUpdate(
            req.params.id,
            datos,
            {
                new: true,
                runValidators: true
            }
        );

        if (!resena) {
            return res.status(404).json({
                mensaje: 'Reseña no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Reseña actualizada correctamente',
            resena
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Eliminar reseña
const eliminarResena = async (req, res) => {
    try {
        const resena = await Resenas.findByIdAndDelete(req.params.id);

        if (!resena) {
            return res.status(404).json({
                mensaje: 'Reseña no encontrada'
            });
        }

        return res.status(200).json({
            mensaje: 'Reseña eliminada correctamente'
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerResenas,
    obtenerResena,
    crearResena,
    actualizarResena,
    eliminarResena
};