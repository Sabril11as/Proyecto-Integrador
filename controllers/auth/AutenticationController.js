const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Autenticacion = require('../../models/auth/Autentication');


// Generar token JWT
const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario._id.toString() },
        process.env.JWT_SECRET,
        {
            expiresIn: '2h',
            algorithm: 'HS256'
        }
    );
};


// POST - Registrar usuario
const registrar = async (req, res) => {
    try {

        const { nombre, correo, telefono, password } = req.body || {};

        // Validar datos
        if (typeof nombre !== 'string' || !nombre.trim() ||
            typeof correo !== 'string' || !correo.trim() ||
            typeof password !== 'string' ||
            password.length < 8 ||
            Buffer.byteLength(password, 'utf8') > 72) {

            return res.status(400).json({
                mensaje: 'Nombre, correo y contraseña válida son obligatorios'
            });
        }

        // Verificar correo
        const usuarioExiste = await Autenticacion.buscarPorCorreo(
            correo.trim().toLowerCase()
        );

        if (usuarioExiste) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        // Proteger contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const usuario = await Autenticacion.crearUsuario({
            nombre,
            correo,
            telefono,
            password: passwordHash,
            rol: 'cliente'
        });

        // Generar token
        const token = generarToken(usuario);

        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            },
            token
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                mensaje: error.message
            });
        }

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al registrar usuario'
        });
    }
};


// POST - Iniciar sesión
const login = async (req, res) => {
    try {

        const { correo, password } = req.body || {};

        if (typeof correo !== 'string' ||
            typeof password !== 'string' ||
            !correo.trim() || !password) {

            return res.status(400).json({
                mensaje: 'Correo y contraseña son obligatorios'
            });
        }

        // Buscar usuario
        const usuario = await Autenticacion.buscarPorCorreo(
            correo.trim().toLowerCase()
        );

        if (!usuario || !usuario.password || !usuario.activo) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        // Verificar contraseña
        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }

        // Generar token
        const token = generarToken(usuario);

        return res.status(200).json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                rol: usuario.rol
            },
            token
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al iniciar sesión'
        });
    }
};


// Middleware - Verificar token
const verificarToken = async (req, res, next) => {

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'Token no proporcionado'
        });
    }

    const token = authorization.split(' ')[1];

    try {

        const datos = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        const usuario = await Autenticacion.buscarPorId(datos.id);

        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                mensaje: 'Usuario no autorizado'
            });
        }

        req.usuario = usuario;

        next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError') {

            return res.status(401).json({
                mensaje: 'Token inválido o expirado'
            });
        }

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al verificar autenticación'
        });
    }
};


// GET - Obtener usuario autenticado
const obtenerPerfil = async (req, res) => {

    return res.status(200).json({
        usuario: {
            id: req.usuario._id,
            nombre: req.usuario.nombre,
            correo: req.usuario.correo,
            telefono: req.usuario.telefono,
            rol: req.usuario.rol
        }
    });
};


// Middleware - Solo administradores
const soloAdmin = (req, res, next) => {

    if (req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso reservado para administradores'
        });
    }

    next();
};


// Middleware - Propietario o administrador
const propietarioOAdmin = (req, res, next) => {

    if (req.usuario.rol !== 'admin' &&
        req.usuario._id.toString() !== req.params.id) {

        return res.status(403).json({
            mensaje: 'No tienes permiso para acceder a este usuario'
        });
    }

    next();
};


module.exports = {
    registrar,
    login,
    verificarToken,
    obtenerPerfil,
    soloAdmin,
    propietarioOAdmin
};