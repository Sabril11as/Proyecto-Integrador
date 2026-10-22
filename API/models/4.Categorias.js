const db = require('../db/db');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { productoConDetalles } = require('../servicios/productos.servicio');

function buscarCategoria(idTexto) {
  const categoria = db.porId('categorias', validar.id(idTexto, 'id de la categoría'));
  if (!categoria) throw new ErrorHttp(404, 'La categoría no existe.');
  return categoria;
}

function conCantidad(categoria) {
  const cantidadProductos = db.buscar('productos', (p) => p.activo && p.categoriaId === categoria.id).length;
  return { ...categoria, cantidadProductos };
}

function nombreDisponible(nombre, idActual = null) {
  const repetida = db.buscarUno('categorias',
    (c) => validar.normalizar(c.nombre) === validar.normalizar(nombre) && c.id !== idActual);
  if (repetida) throw new ErrorHttp(409, `Ya existe la categoría "${repetida.nombre}".`);
}

// GET /api/categorias
function listar(req, res) {
  const categorias = db.todos('categorias').map(conCantidad)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  res.json(categorias);
}

// GET /api/categorias/:id
function obtener(req, res) {
  res.json(conCantidad(buscarCategoria(req.params.id)));
}

// GET /api/categorias/:id/productos
function productosDeCategoria(req, res) {
  const categoria = buscarCategoria(req.params.id);
  const productos = db.buscar('productos', (p) => p.activo && p.categoriaId === categoria.id).map(productoConDetalles);
  res.json({ categoria: { id: categoria.id, nombre: categoria.nombre }, ...validar.paginar(productos, req.query) });
}

// POST /api/categorias   (admin)    body: { "nombre": "Tablets", "descripcion": "..." }
function crear(req, res) {
  const nombre = validar.texto(req.body.nombre, 'nombre', { max: 60 });
  nombreDisponible(nombre);
  const categoria = db.insertar('categorias', {
    nombre,
    descripcion: validar.texto(req.body.descripcion, 'descripcion', { max: 300, obligatorio: false }),
  });
  res.status(201).json({ mensaje: 'Categoría creada.', categoria });
}

// PUT /api/categorias/:id   (admin)
function actualizar(req, res) {
  const categoria = buscarCategoria(req.params.id);
  const cambios = {};
  if (req.body.nombre !== undefined) {
    cambios.nombre = validar.texto(req.body.nombre, 'nombre', { max: 60 });
    nombreDisponible(cambios.nombre, categoria.id);
  }
  if (req.body.descripcion !== undefined) {
    cambios.descripcion = validar.texto(req.body.descripcion, 'descripcion', { max: 300, obligatorio: false });
  }
  if (Object.keys(cambios).length === 0) throw new ErrorHttp(400, 'Envía nombre o descripcion.');

  res.json({ mensaje: 'Categoría actualizada.', categoria: db.actualizar('categorias', categoria.id, cambios) });
}

// DELETE /api/categorias/:id   (admin)
function eliminar(req, res) {
  const categoria = buscarCategoria(req.params.id);
  const cantidad = db.buscar('productos', (p) => p.categoriaId === categoria.id).length;
  if (cantidad > 0) {
    throw new ErrorHttp(409, `No se puede eliminar: la categoría tiene ${cantidad} producto(s). Muévelos a otra categoría primero.`);
  }
  db.eliminar('categorias', categoria.id);
  res.json({ mensaje: 'Categoría eliminada.' });
}

module.exports = {
  listar,
  obtener,
  productosDeCategoria,
  crear,
  actualizar,
  eliminar,
};