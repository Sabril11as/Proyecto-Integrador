const Destacados = require('../../models/catalogo/Destacados');

// GET - Obtener productos destacados
const obtenerDestacados = async (req, res) => {
    try {
        const productos = await Destacados.obtenerDestacados();

        return res.status(200).json({
            total: productos.length,
            productos
        });

    } catch (error) {
        console.error('Error al obtener destacados:', error.message);

        return res.status(500).json({
            mensaje: 'Error al obtener productos destacados'
        });
    }
};

module.exports = {
    obtenerDestacados
};