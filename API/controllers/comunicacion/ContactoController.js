const mongoose = require('mongoose');
const Contacto = require('../../models/comunicacion/Contacto');


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


// GET - Obtener todos los mensajes
const obtenerContactos = async (req, res) => {
    try {

        const contactos = await Contacto.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            total: contactos.length,
            contactos
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener mensaje por ID
const obtenerContacto = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const contacto = await Contacto.findById(id);

        if (!contacto) {
            return res.status(404).json({
                mensaje: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            contacto
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Crear mensaje
const crearContacto = async (req, res) => {
    try {

        const { nombre, correo, asunto, mensaje } = req.body || {};

        const contacto = await Contacto.create({
            nombre,
            correo,
            asunto,
            mensaje
        });

        return res.status(201).json({
            mensaje: 'Mensaje enviado correctamente',
            contacto
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// PATCH - Actualizar estado
const actualizarContacto = async (req, res) => {
    try {

        const { id } = req.params;
        const { estado } = req.body || {};

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        if (!['pendiente', 'respondido'].includes(estado)) {
            return res.status(400).json({
                mensaje: 'Estado inválido'
            });
        }

        const contacto = await Contacto.findByIdAndUpdate(
            id,
            { estado },
            {
                new: true,
                runValidators: true
            }
        );

        if (!contacto) {
            return res.status(404).json({
                mensaje: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Estado actualizado correctamente',
            contacto
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// DELETE - Eliminar mensaje
const eliminarContacto = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                mensaje: 'ID inválido'
            });
        }

        const contacto = await Contacto.findByIdAndDelete(id);

        if (!contacto) {
            return res.status(404).json({
                mensaje: 'Mensaje no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Mensaje eliminado correctamente'
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerContactos,
    obtenerContacto,
    crearContacto,
    actualizarContacto,
    eliminarContacto
};