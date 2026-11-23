const Producto = require('./Producto');

// Buscar productos según los filtros recibidos
const buscarProductos = async (filtros) => {
    return await Producto.find(filtros)
        .populate('categoria', 'nombre');
};

module.exports = {
    buscarProductos
};