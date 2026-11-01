const PanelAdmin = require('../../models/admin/PanelAdmin');


// GET - Obtener estadísticas generales
const obtenerEstadisticas = async (req, res) => {
    try {

        const estadisticas = await PanelAdmin.obtenerEstadisticas();

        return res.status(200).json({
            mensaje: 'Estadísticas obtenidas correctamente',
            estadisticas
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener estadísticas'
        });
    }
};


// GET - Obtener productos con stock bajo
const obtenerInventarioBajo = async (req, res) => {
    try {

        const productos = await PanelAdmin.obtenerInventarioBajo();

        return res.status(200).json({
            total: productos.length,
            productos
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener inventario bajo'
        });
    }
};


// GET - Obtener últimas órdenes
const obtenerUltimasOrdenes = async (req, res) => {
    try {

        const ordenes = await PanelAdmin.obtenerUltimasOrdenes();

        return res.status(200).json({
            total: ordenes.length,
            ordenes
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al obtener últimas órdenes'
        });
    }
};


module.exports = {
    obtenerEstadisticas,
    obtenerInventarioBajo,
    obtenerUltimasOrdenes
};