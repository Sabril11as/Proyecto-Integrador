const Producto = require('../catalogo/Producto');

// Obtener inventario completo
const obtenerInventario = async () => {
    return await Producto.find()
        .select('nombre stock activo')
        .populate('categoria', 'nombre');
};

// Obtener inventario de un producto
const obtenerProducto = async (id) => {
    return await Producto.findById(id)
        .select('nombre stock activo');
};

// Agregar stock
const agregarStock = async (id, cantidad) => {
    return await Producto.findByIdAndUpdate(
        id,
        { $inc: { stock: cantidad } },
        { new: true }
    );
};

// Descontar stock
const descontarStock = async (id, cantidad) => {
    return await Producto.findOneAndUpdate(
        {
            _id: id,
            stock: { $gte: cantidad }
        },
        {
            $inc: { stock: -cantidad }
        },
        { new: true }
    );
};

module.exports = {
    obtenerInventario,
    obtenerProducto,
    agregarStock,
    descontarStock
};