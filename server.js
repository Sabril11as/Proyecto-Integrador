require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT;

// Variables rutas
const usuarioRoutes = require('./routes/usuarios/UsuarioRoute');
const perfilRoutes = require('./routes/usuarios/PerfilRoute');
const categoriasRoutes = require('./routes/catalogo/CategoriasRoute');
const catalogoRoutes = require('./routes/catalogo/CatalogoRoute');
const busquedaFiltroRoutes = require('./routes/catalogo/BusquedaFiltroRoute');
const destacadosRoutes = require('./routes/catalogo/DestacadosRoute');
const inventarioRoutes = require('./routes/inventario/InventarioRoute');
const resenasRoutes = require('./routes/actividad/ResenasRoute');
const carritoRoutes = require('./routes/ventas/CarritoRoute');
const ordenesRoutes = require('./routes/ventas/OrdenesRoutes');
const pagosRoutes = require('./routes/ventas/PagosRoute');
const historialRoutes = require('./routes/actividad/HistorialRoute');
const contactoRoutes = require('./routes/comunicacion/ContactoRoute');
const notificacionesRoutes = require('./routes/comunicacion/NotificacionesRoute');
const autenticacionRoutes = require('./routes/auth/AutenticationRoute');
const panelAdminRoutes = require('./routes/admin/PanelAdminRoute');

// Middlewares
app.use(cors());
app.use(express.json());

// Verificar peticiones recibidas
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Registrar rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/busqueda-filtro', busquedaFiltroRoutes);
app.use('/api/destacados', destacadosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/autenticacion', autenticacionRoutes);
app.use('/api/admin', panelAdminRoutes);



// Iniciar servidor
const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            throw new Error('JWT_SECRET no está configurada correctamente');
        }
        await db();

        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error starting server:', error.message);
        process.exit(1);
    }
};

startServer();