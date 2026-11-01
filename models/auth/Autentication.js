const Usuario = require('../usuarios/Usuario');

// Registrar usuario
const crearUsuario = async (datos) => {
    return await Usuario.create(datos);
};

// Buscar usuario por correo
const buscarPorCorreo = async (correo) => {
    return await Usuario.findOne({ correo })
        .select('+password');
};

// Buscar usuario por ID
const buscarPorId = async (id) => {
    return await Usuario.findById(id);
};

module.exports = {
    crearUsuario,
    buscarPorCorreo,
    buscarPorId
};