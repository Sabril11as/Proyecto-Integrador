const crypto = require('crypto');
const db = require('../db/db');
const { esDuenoOAdmin } = require('../middlewares/auth');
const { ErrorHttp } = require('../utils/errores');
const validar = require('../utils/validar');
const { masRecientePrimero } = require('../utils/formato');
const { cambiarEstadoOrden } = require('../servicios/ordenes.servicio');
const { crearNotificacion } = require('../servicios/notificaciones.servicio');

const METODOS = ['tarjeta', 'sinpe'];

const TARJETAS_RECHAZADAS = {
  '4000000000000002': 'La tarjeta fue declinada por el banco (simulado).',
  '4000000000009995': 'Fondos insuficientes (simulado).',
};

function pasaLuhn(numero) {
  let suma = 0;
  let doblar = false;
  for (let i = numero.length - 1; i >= 0; i--) {
    let digito = Number(numero[i]);
    if (doblar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }
    suma += digito;
    doblar = !doblar;
  }
  return suma % 10 === 0;
}

function marcaDeTarjeta(numero) {
  if (/^4/.test(numero)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(numero)) return 'Mastercard';
  if (/^3[47]/.test(numero)) return 'American Express';
  return 'Otra';
}

function procesarTarjeta(tarjeta) {
  if (!tarjeta || typeof tarjeta !== 'object') {
    throw new ErrorHttp(400, 'Envía "tarjeta": { numero, titular, vencimiento: "MM/AA", cvv }.');
  }
  validar.requerirCampos(tarjeta, ['numero', 'titular', 'vencimiento', 'cvv']);

  const numero = String(tarjeta.numero).replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(numero) || !pasaLuhn(numero)) {
    throw new ErrorHttp(400, 'El número de tarjeta no es válido.');
  }
  if (!/^\d{3,4}$/.test(String(tarjeta.cvv))) throw new ErrorHttp(400, 'El CVV debe tener 3 o 4 dígitos.');

  const partes = /^(\d{2})\/(\d{2})$/.exec(String(tarjeta.vencimiento));
  if (!partes || Number(partes[1]) < 1 || Number(partes[1]) > 12) {
    throw new ErrorHttp(400, 'El vencimiento debe tener formato MM/AA, por ejemplo 08/29.');
  }

  const primerDiaDelMesSiguiente = new Date(2000 + Number(partes[2]), Number(partes[1]), 1);

  let motivoRechazo = null;
  if (primerDiaDelMesSiguiente <= new Date()) motivoRechazo = 'La tarjeta está vencida.';
  else if (TARJETAS_RECHAZADAS[numero]) motivoRechazo = TARJETAS_RECHAZADAS[numero];

  return {
    motivoRechazo,
    datosGuardados: {
      tarjeta: {
        marca: marcaDeTarjeta(numero),
        ultimos4: numero.slice(-4),
        titular: validar.texto(tarjeta.titular, 'titular', { max: 80 }),
      },
      telefono: null,
    },
  };
}

function procesarSinpe(telefonoRecibido) {
  const telefono = String(telefonoRecibido ?? '').replace(/[\s-]/g, '');
  if (!/^\d{8}$/.test(telefono)) throw new ErrorHttp(400, 'Para SINPE Móvil envía "telefono" con 8 dígitos.');
  return {
    motivoRechazo: telefono.endsWith('0000') ? 'El número no tiene SINPE Móvil asociado (simulado).' : null,
    datosGuardados: { tarjeta: null, telefono: `****${telefono.slice(-4)}` },
  };
}

// POST /api/pagos
function pagar(req, res) {
  validar.requerirCampos(req.body, ['ordenId', 'metodo']);
  const orden = db.porId('ordenes', validar.id(req.body.ordenId, 'ordenId'));
  if (!orden || orden.usuarioId !== req.usuario.id) throw new ErrorHttp(404, 'La orden no existe.');
  if (orden.estado !== 'pendiente_pago') {
    throw new ErrorHttp(409, `Esta orden no se puede pagar porque está "${orden.estado}".`);
  }

  const metodo = validar.unoDe(req.body.metodo, 'metodo', METODOS);
  const resultado = metodo === 'tarjeta' ? procesarTarjeta(req.body.tarjeta) : procesarSinpe(req.body.telefono);
  const aprobado = resultado.motivoRechazo === null;

  const pago = db.insertar('pagos', {
    ordenId: orden.id,
    usuarioId: req.usuario.id,
    metodo,
    monto: orden.total,
    estado: aprobado ? 'aprobado' : 'rechazado',
    motivoRechazo: resultado.motivoRechazo,
    referencia: `SIM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    ...resultado.datosGuardados,
  });

  if (!aprobado) {
    crearNotificacion(req.usuario.id, {
      tipo: 'pago',
      titulo: 'Pago rechazado',
      mensaje: `No se pudo pagar la orden #${orden.id}: ${resultado.motivoRechazo}`,
      enlace: `/ordenes/${orden.id}`,
    });

    return res.status(402).json({ error: resultado.motivoRechazo, pago });
  }

  orden.pagoId = pago.id;
  db.actualizar('ordenes', orden.id, { pagoId: pago.id });
  for (const item of orden.items) {
    const producto = db.porId('productos', item.productoId);
    if (producto) db.actualizar('productos', producto.id, { vendidos: producto.vendidos + item.cantidad });
  }
  cambiarEstadoOrden(orden, 'pagada', `Pago ${pago.referencia} aprobado`);

  res.status(201).json({ mensaje: 'Pago aprobado.', pago, orden });
}

// GET /api/pagos
function listarMios(req, res) {
  const pagos = db.buscar('pagos', (p) => p.usuarioId === req.usuario.id).sort(masRecientePrimero);
  res.json(validar.paginar(pagos, req.query));
}

// GET /api/pagos/:id
function obtener(req, res) {
  const pago = db.porId('pagos', validar.id(req.params.id, 'id del pago'));
  if (!pago || !esDuenoOAdmin(req.usuario, pago.usuarioId)) throw new ErrorHttp(404, 'El pago no existe.');
  res.json(pago);
}

module.exports = {
  pagar,
  listarMios,
  obtener,
};
