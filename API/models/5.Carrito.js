const db = require('../db/db');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { obtenerCarrito, detalleCarrito } = require('../servicios/carrito.servicio');

function productoVendible(productoId) {
  const producto = db.porId('productos', productoId);
  if (!producto || !producto.activo) throw new ErrorHttp(404, 'El producto no existe o ya no está a la venta.');
  return producto;
}

function revisarStock(producto, cantidad) {
  if (cantidad > producto.stock) {
    throw new ErrorHttp(409, `Solo hay ${producto.stock} unidad(es) disponibles de "${producto.nombre}".`);
  }
}

// GET /api/carrito
function verCarrito(req, res) {
  res.json(detalleCarrito(obtenerCarrito(req.usuario.id)));
}

// POST /api/carrito/items     body: { "productoId": 5, "cantidad": 2 }
// Si el producto ya estaba en el carrito, se SUMA la cantidad.
function agregarItem(req, res) {
  validar.requerirCampos(req.body, ['productoId']);
  const producto = productoVendible(validar.id(req.body.productoId, 'productoId'));
  const cantidad = validar.entero(req.body.cantidad ?? 1, 'cantidad', { permitirCero: false });

  const carrito = obtenerCarrito(req.usuario.id);
  const existente = carrito.items.find((item) => item.productoId === producto.id);
  const cantidadFinal = (existente ? existente.cantidad : 0) + cantidad;
  revisarStock(producto, cantidadFinal);

  if (existente) existente.cantidad = cantidadFinal;
  else carrito.items.push({ productoId: producto.id, cantidad });
  db.actualizar('carritos', carrito.id, { items: carrito.items });

  res.status(201).json({ mensaje: `"${producto.nombre}" agregado al carrito.`, carrito: detalleCarrito(carrito) });
}

// PUT /api/carrito/items/:productoId     body: { "cantidad": 3 }
function cambiarCantidad(req, res) {
  const productoId = validar.id(req.params.productoId, 'productoId');
  const cantidad = validar.entero(req.body.cantidad, 'cantidad', { permitirCero: false });
  const carrito = obtenerCarrito(req.usuario.id);
  const item = carrito.items.find((i) => i.productoId === productoId);
  if (!item) throw new ErrorHttp(404, 'Ese producto no está en tu carrito.');

  revisarStock(productoVendible(productoId), cantidad);
  item.cantidad = cantidad;
  db.actualizar('carritos', carrito.id, { items: carrito.items });

  res.json({ mensaje: 'Cantidad actualizada.', carrito: detalleCarrito(carrito) });
}

// DELETE /api/carrito/items/:productoId
function quitarItem(req, res) {
  const productoId = validar.id(req.params.productoId, 'productoId');
  const carrito = obtenerCarrito(req.usuario.id);
  const items = carrito.items.filter((i) => i.productoId !== productoId);
  if (items.length === carrito.items.length) throw new ErrorHttp(404, 'Ese producto no está en tu carrito.');

  db.actualizar('carritos', carrito.id, { items });
  res.json({ mensaje: 'Producto quitado del carrito.', carrito: detalleCarrito(carrito) });
}

// DELETE /api/carrito
function vaciar(req, res) {
  const carrito = obtenerCarrito(req.usuario.id);
  db.actualizar('carritos', carrito.id, { items: [] });
  res.json({ mensaje: 'Carrito vaciado.', carrito: detalleCarrito(carrito) });
}

module.exports = {
  verCarrito,
  agregarItem,
  cambiarCantidad,
  quitarItem,
  vaciar,
};
