const Usuario = require('../../models/usuarios/Usuario');

// Manejo de errores
const manejarError = (res, error) => {

    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return res.status(400).json({
            mensaje: error.message
        });
    }

    if (error.code === 11000) {
        return res.status(400).json({
            mensaje: 'El correo ya está registrado'
        });
    }

    console.error(error);

    return res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
};


// GET - Obtener todos los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find();

        return res.status(200).json({
            usuarios
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// GET - Obtener usuario por ID
const obtenerUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            usuario
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// POST - Crear usuario
const crearUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.create(req.body);

        return res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


// PATCH - Actualizar usuario
const actualizarUsuario = async (req, res) => {
    try {

        const datos = {};

        // Solo permitimos actualizar estos campos
        for (const campo of ['nombre', 'correo', 'telefono']) {
            if (Object.prototype.hasOwnProperty.call(req.body || {}, campo)) {
                datos[campo] = req.body[campo];
            }
        }

        if (Object.keys(datos).length === 0) {
            return res.status(400).json({
                mensaje: 'No se enviaron datos válidos'
            });
        }

        const usuario = await Usuario.findByIdAndUpdate(
            req.params.id,
            datos,
            {
                new: true,
                runValidators: true
            }
        );

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Usuario actualizado correctamente',
            usuario
        });

    } catch (error) {

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
    }
};


// DELETE - Eliminar usuario
const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            mensaje: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        return manejarError(res, error);
    }
};


module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
};