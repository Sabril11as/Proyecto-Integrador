const Usuario = require('../usuarios/Usuario');
const Producto = require('../catalogo/Producto');
const Ordenes = require('../ventas/Ordenes');
const Pagos = require('../ventas/Pagos');


// Obtener estadísticas generales
const obtenerEstadisticas = async () => {

    const totalUsuarios = await Usuario.countDocuments();

    const totalProductos = await Producto.countDocuments();

    const totalOrdenes = await Ordenes.countDocuments();

    const productosStockBajo = await Producto.countDocuments({
        stock: { $lte: 5 },
        activo: true
    });

    // Calcular pagos simulados aprobados
    const pagos = await Pagos.find({
        estado: 'aprobado',
        simulado: true
    });

    const totalVentas = pagos.reduce(
        (total, pago) => total + pago.monto,
        0
    );

    return {
        totalUsuarios,
        totalProductos,
        totalOrdenes,
        productosStockBajo,
        cantidadPagos: pagos.length,
        totalVentas
    };
};


// Obtener productos con inventario bajo
const obtenerInventarioBajo = async () => {

    return await Producto.find({
        stock: { $lte: 5 },
        activo: true
    })
    .select('nombre precio stock')
    .sort({ stock: 1 });

};


// Obtener últimas órdenes
const obtenerUltimasOrdenes = async () => {

    return await Ordenes.find()
        .populate('usuario', 'nombre correo')
        .sort({ createdAt: -1 })
        .limit(5);

};


module.exports = {
    obtenerEstadisticas,
    obtenerInventarioBajo,
    obtenerUltimasOrdenes
};