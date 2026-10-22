const db = require('../db/db');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { usuarioPublico, masRecientePrimero } = require('../utils/formato');
const { productoConDetalles } = require('../servicios/productos.servicio');
const { registrarMovimiento } = require('../servicios/inventario.servicio');

function buscarProducto(idTexto, usuario) {
  const producto = db.porId('productos', validar.id(idTexto, 'id del producto'));
  const esAdmin = usuario && usuario.rol === 'admin';
  if (!producto || (!producto.activo && !esAdmin)) throw new ErrorHttp(404, 'El producto no existe.');
  return producto;
}

function validarCategoria(categoriaId) {
  const idCategoria = validar.id(categoriaId, 'categoriaId');
  if (!db.porId('categorias', idCategoria)) throw new ErrorHttp(400, `La categoría ${idCategoria} no existe.`);
  return idCategoria;
}

function listar(req, res) {
  const esAdmin = req.usuario && req.usuario.rol === 'admin';
  const verInactivos = esAdmin && req.query.incluirInactivos === 'true';

  let productos = db.buscar('productos', (p) => p.activo || verInactivos);
  if (req.query.categoriaId) {
    const categoriaId = validar.id(req.query.categoriaId, 'categoriaId');
    productos = productos.filter((p) => p.categoriaId === categoriaId);
  }

  res.json(validar.paginar(productos.map(productoConDetalles), req.query));
}

function obtener(req, res) {
  const producto = buscarProducto(req.params.id, req.usuario);
  const resenasRecientes = db
    .buscar('resenas', (r) => r.productoId === producto.id)
    .sort(masRecientePrimero)
    .slice(0, 3)
    .map((r) => ({ ...r, usuario: usuarioPublico(db.porId('usuarios', r.usuarioId)) }));

  res.json({ ...productoConDetalles(producto), resenasRecientes });
}

function relacionados(req, res) {
  const producto = buscarProducto(req.params.id, null);
  const relacionados = db
    .buscar('productos', (p) => p.activo && p.categoriaId === producto.categoriaId && p.id !== producto.id)
    .sort((a, b) => b.vendidos - a.vendidos)
    .slice(0, 4)
    .map(productoConDetalles);
  res.json(relacionados);
}

function crear(req, res) {
  validar.requerirCampos(req.body, ['nombre', 'precio', 'categoriaId']);
  const stockInicial = validar.entero(req.body.stock ?? 0, 'stock');

  const producto = db.insertar('productos', {
    nombre: validar.texto(req.body.nombre, 'nombre', { max: 120 }),
    descripcion: validar.texto(req.body.descripcion, 'descripcion', { max: 2000, obligatorio: false }),
    marca: validar.texto(req.body.marca, 'marca', { max: 60, obligatorio: false }),
    categoriaId: validarCategoria(req.body.categoriaId),
    precio: validar.numero(req.body.precio, 'precio', { permitirCero: false }),
    stock: 0, // el stock inicial se registra abajo como movimiento de inventario
    vendidos: 0,
    destacado: req.body.destacado === undefined ? false : validar.booleano(req.body.destacado, 'destacado'),
    especificaciones: validar.especificaciones(req.body.especificaciones),
    imagen: validar.texto(req.body.imagen, 'imagen', { max: 500, obligatorio: false }) || null,
    activo: true,
  });

  if (stockInicial > 0) {
    registrarMovimiento({
      productoId: producto.id,
      tipo: 'entrada',
      cantidad: stockInicial,
      motivo: 'Stock inicial',
      usuarioId: req.usuario.id,
    });
  }

  res.status(201).json({ mensaje: 'Producto creado.', producto: productoConDetalles(db.porId('productos', producto.id)) });
}

function actualizar(req, res) {
  const producto = buscarProducto(req.params.id, req.usuario);
  const b = req.body;
  if (b.stock !== undefined) {
    throw new ErrorHttp(400, 'El stock no se edita aquí. Usa /api/inventario/:productoId/entrada, /salida o /ajuste.');
  }

  const cambios = {};
  if (b.nombre !== undefined) cambios.nombre = validar.texto(b.nombre, 'nombre', { max: 120 });
  if (b.descripcion !== undefined) cambios.descripcion = validar.texto(b.descripcion, 'descripcion', { max: 2000, obligatorio: false });
  if (b.marca !== undefined) cambios.marca = validar.texto(b.marca, 'marca', { max: 60, obligatorio: false });
  if (b.categoriaId !== undefined) cambios.categoriaId = validarCategoria(b.categoriaId);
  if (b.precio !== undefined) cambios.precio = validar.numero(b.precio, 'precio', { permitirCero: false });
  if (b.especificaciones !== undefined) cambios.especificaciones = validar.especificaciones(b.especificaciones);
  if (b.imagen !== undefined) cambios.imagen = validar.texto(b.imagen, 'imagen', { max: 500, obligatorio: false }) || null;
  if (b.destacado !== undefined) cambios.destacado = validar.booleano(b.destacado, 'destacado');
  if (b.activo !== undefined) cambios.activo = validar.booleano(b.activo, 'activo');

  if (Object.keys(cambios).length === 0) throw new ErrorHttp(400, 'No enviaste ningún campo para actualizar.');

  const actualizado = db.actualizar('productos', producto.id, cambios);
  res.json({ mensaje: 'Producto actualizado.', producto: productoConDetalles(actualizado) });
}

function retirar(req, res) {
  const producto = buscarProducto(req.params.id, req.usuario);
  db.actualizar('productos', producto.id, { activo: false, destacado: false });

  for (const carrito of db.todos('carritos')) {
    carrito.items = carrito.items.filter((item) => item.productoId !== producto.id);
  }
  db.guardar();

  res.json({ mensaje: `"${producto.nombre}" fue retirado del catálogo. Para volver a mostrarlo usa PUT con { "activo": true }.` });
}

module.exports = {
  listar,
  obtener,
  relacionados,
  crear,
  actualizar,
  retirar,
};
