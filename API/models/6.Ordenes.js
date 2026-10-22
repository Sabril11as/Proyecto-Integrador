const db = require('../db/db');
const { esDuenoOAdmin } = require('../middlewares/auth');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { masRecientePrimero } = require('../utils/formato');
const { obtenerCarrito, detalleCarrito } = require('../servicios/carrito.servicio');
const { registrarMovimiento } = require('../servicios/inventario.servicio');
const { crearNotificacion } = require('../servicios/notificaciones.servicio');
const { ESTADOS, cambiarEstadoOrden, cancelarOrden } = require('../servicios/ordenes.servicio');

const TRANSICIONES_ADMIN = {
  pagada: ['enviada'],
  enviada: ['entregada'],
};

function buscarOrden(idTexto, usuario) {
  const orden = db.porId('ordenes', validar.id(idTexto, 'id de la orden'));
  if (!orden || !esDuenoOAdmin(usuario, orden.usuarioId)) throw new ErrorHttp(404, 'La orden no existe.');
  return orden;
}

// POST /api/ordenes
function crear(req, res) {
  const carrito = obtenerCarrito(req.usuario.id);
  const detalle = detalleCarrito(carrito);
  if (detalle.items.length === 0) throw new ErrorHttp(400, 'Tu carrito está vacío.');

  const sinStock = detalle.items.filter((item) => !item.alcanzaStock);
  if (sinStock.length > 0) {
    throw new ErrorHttp(409, 'Algunos productos ya no tienen suficiente stock. Ajusta tu carrito.',
      sinStock.map((i) => ({ productoId: i.productoId, nombre: i.nombre, pedido: i.cantidad, disponible: i.stockDisponible })));
  }

  const direccionEnvio = req.body.direccionEnvio
    ? validar.direccion(req.body.direccionEnvio)
    : req.usuario.direccion;
  if (!direccionEnvio) {
    throw new ErrorHttp(400, 'Falta la dirección de envío. Agrégala en tu perfil (PUT /api/perfil/direccion) o envíala en "direccionEnvio".');
  }

  const fecha = new Date().toISOString();
  const orden = db.insertar('ordenes', {
    usuarioId: req.usuario.id,
    items: detalle.items.map(({ productoId, nombre, precioUnitario, cantidad, subtotal }) =>
      ({ productoId, nombre, precioUnitario, cantidad, subtotal })),
    subtotal: detalle.subtotal,
    impuesto: detalle.impuesto,
    envio: detalle.envio,
    total: detalle.total,
    estado: 'pendiente_pago',
    direccionEnvio,
    notas: validar.texto(req.body.notas, 'notas', { max: 300, obligatorio: false }),
    pagoId: null,
    historialEstados: [{ estado: 'pendiente_pago', fecha, nota: 'Orden creada' }],
  });

  for (const item of orden.items) {
    registrarMovimiento({
      productoId: item.productoId,
      tipo: 'venta',
      cantidad: -item.cantidad,
      motivo: `Orden #${orden.id}`,
      usuarioId: req.usuario.id,
      ordenId: orden.id,
    });
  }

  db.actualizar('carritos', carrito.id, { items: [] });

  crearNotificacion(req.usuario.id, {
    tipo: 'orden',
    titulo: `Orden #${orden.id} creada`,
    mensaje: `Total a pagar: ₡${orden.total.toLocaleString('es-CR')}. Completa el pago para procesarla.`,
    enlace: `/ordenes/${orden.id}`,
  });

  res.status(201).json({ mensaje: 'Orden creada. El siguiente paso es pagarla en POST /api/pagos.', orden });
}

// GET /api/ordenes          
function listarMias(req, res) {
  let ordenes = db.buscar('ordenes', (o) => o.usuarioId === req.usuario.id);
  if (req.query.estado) {
    const estado = validar.unoDe(req.query.estado, 'estado', ESTADOS);
    ordenes = ordenes.filter((o) => o.estado === estado);
  }
  res.json(validar.paginar([...ordenes].sort(masRecientePrimero), req.query));
}

// GET /api/ordenes/:id
function obtener(req, res) {
  const orden = buscarOrden(req.params.id, req.usuario);
  const pago = orden.pagoId ? db.porId('pagos', orden.pagoId) : null;
  res.json({ ...orden, pago });
}

// PATCH /api/ordenes/:id/cancelar   
function cancelar(req, res) {
  const orden = buscarOrden(req.params.id, req.usuario);
  if (!['pendiente_pago', 'pagada'].includes(orden.estado)) {
    throw new ErrorHttp(409, `No se puede cancelar una orden en estado "${orden.estado}".`);
  }
  const motivo = validar.texto(req.body.motivo, 'motivo', { max: 300, obligatorio: false });
  const estabaPagada = orden.estado === 'pagada';
  cancelarOrden(orden, req.usuario.id, motivo);

  res.json({
    mensaje: estabaPagada ? 'Orden cancelada. El pago fue reembolsado (simulado).' : 'Orden cancelada.',
    orden,
  });
}

// PATCH /api/ordenes/:id/estado   
function cambiarEstado(req, res) {
  const orden = buscarOrden(req.params.id, req.usuario);
  const estado = validar.unoDe(req.body.estado, 'estado', ['enviada', 'entregada']);
  const permitidos = TRANSICIONES_ADMIN[orden.estado] || [];
  if (!permitidos.includes(estado)) {
    throw new ErrorHttp(409, `Una orden "${orden.estado}" no puede pasar a "${estado}".`
      + (permitidos.length ? ` Puede pasar a: ${permitidos.join(', ')}.` : ''));
  }

  cambiarEstadoOrden(orden, estado, validar.texto(req.body.nota, 'nota', { max: 300, obligatorio: false }));
  res.json({ mensaje: `La orden ahora está "${estado}".`, orden });
}

module.exports = {
  crear,
  listarMias,
  obtener,
  cancelar,
  cambiarEstado,
};
