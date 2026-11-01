const Producto = require('./Producto');

// Obtener productos destacados
const obtenerDestacados = async () => {
    return await Producto.find({
        destacado: true,
        activo: true
    }).populate('categoria', 'nombre');
};

module.exports = {
    obtenerDestacados
};