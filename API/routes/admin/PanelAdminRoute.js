const express = require('express');
const router = express.Router();

const {
    obtenerEstadisticas,
    obtenerInventarioBajo,
    obtenerUltimasOrdenes
} = require('../../controllers/admin/PanelAdminController');

const {
    verificarToken,
    soloAdmin
} = require('../../controllers/auth/AutenticationController');


// Proteger todas las rutas de administración
router.use(verificarToken, soloAdmin);


// GET - Estadísticas generales
router.get('/estadisticas', obtenerEstadisticas);

// GET - Inventario bajo
router.get('/inventario-bajo', obtenerInventarioBajo);

// GET - Últimas órdenes
router.get('/ultimas-ordenes', obtenerUltimasOrdenes);


module.exports = router;