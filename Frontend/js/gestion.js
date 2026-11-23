import { api } from "./api.js";
import {
  $,
  esc,
  empty,
  button,
  on,
  actions,
  modal,
  detail,
  field,
  select,
  editForm,
  closeModal,
  userFields,
  idOf,
  money,
  start,
  notice,
  requireUser,
} from "./ui.js";
const root = $("#admin");
const user = requireUser(root);
// Ruta, título de pestaña y propiedad que contiene la lista en la respuesta.
const sections = {
  catalogo: ["Productos", "productos", "producto"],
  categorias: ["Categorías", "categorias", "categoria"],
  inventario: ["Inventario", "productos", "producto"],
  usuarios: ["Usuarios", "usuarios", "usuario"],
  ordenes: ["Pedidos", "ordenes", "orden"],
  pagos: ["Pagos", "pagos", "pago"],
  historial: ["Historial", "ordenes", "orden"],
  contacto: ["Mensajes", "contactos", "contacto"],
  notificaciones: ["Notificaciones", "notificaciones", "notificacion"],
  resenas: ["Reseñas", "resenas", "resena"],
};
let section = "resumen";
const path = () => "/api/" + section;
const editable = ["catalogo", "categorias", "usuarios", "contacto", "resenas"];
const creatable = ["catalogo", "categorias", "usuarios", "notificaciones"];
const removable = [...editable, "notificaciones"];
const nextState = {
  pendiente: "confirmada",
  pagada: "enviada",
  enviada: "entregada",
};
let items = [];
function titleOf(item) {
  return (
    item.asunto ||
    item.titulo ||
    item.nombre ||
    item.producto?.nombre ||
    (section === "pagos" ? "Pago" : "Registro") + " #" + item._id.slice(-6)
  );
}
async function show() {
  const active = section;
  document
    .querySelectorAll("#sections button")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.section === active)),
    );
  const area = $("#list");
  area.innerHTML = "<p>Cargando…</p>";
  if (active === "resumen") {
    const [stats, stock, orders] = await Promise.all(
      ["estadisticas", "inventario-bajo", "ultimas-ordenes"].map((key) =>
        api("/api/admin/" + key),
      ),
    );
    if (section !== active) return;
    const metrics = [
      ["Usuarios", stats.estadisticas.totalUsuarios],
      ["Productos", stats.estadisticas.totalProductos],
      ["Pedidos", stats.estadisticas.totalOrdenes],
      ["Stock bajo", stats.estadisticas.productosStockBajo],
      ["Pagos aprobados", stats.estadisticas.cantidadPagos],
      ["Ventas simuladas", money(stats.estadisticas.totalVentas)],
    ];
    area.innerHTML =
      '<h2>Resumen de la tienda</h2><div class="metrics">' +
      metrics
        .map(
          ([label, value]) =>
            `<article class="box"><small>${label}</small><strong>${esc(value)}</strong></article>`,
        )
        .join("") +
      '</div><div class="split"><section class="box"><h2>Stock bajo</h2>' +
      (stock.productos
        .map(
          (p) => "<p>" + esc(p.nombre) + " · " + esc(p.stock) + " unidades</p>",
        )
        .join("") || "Sin productos con stock bajo.") +
      '</section><section class="box"><h2>Últimos pedidos</h2>' +
      (orders.ordenes
        .map(
          (o) =>
            "<p>#" +
            esc(o._id.slice(-6)) +
            " · " +
            money(o.total) +
            " · " +
            esc(o.estado) +
            "</p>",
        )
        .join("") || "Todavía no hay pedidos.") +
      "</section></div>";
    return;
  }
  const response = await api(path());
  if (active !== section) return;
  items = response[sections[section][1]];
  area.innerHTML =
    '<div class="heading"><h2>' +
    sections[section][0] +
    "</h2>" +
    (creatable.includes(section) ? button("Crear", "create") : "") +
    "</div>" +
    (items
      .map((item) => {
        const id = item._id;
        let controls = button("Detalle", "info", id);
        if (editable.includes(section))
          controls += button("Editar", "edit", id);
        if (section === "inventario")
          controls +=
            button("Agregar stock", "plus", id) +
            button("Descontar stock", "minus", id);
        if (section === "ordenes" && nextState[item.estado])
          controls += button("Marcar " + nextState[item.estado], "advance", id);
        if (
          section === "ordenes" &&
          ["pendiente", "confirmada"].includes(item.estado)
        )
          controls += button("Cancelar", "cancel", id);
        if (section === "notificaciones" && !item.leida)
          controls += button("Marcar leída", "read", id);
        if (
          removable.includes(section) &&
          !(section === "usuarios" && id === user.id)
        )
          controls += button("Eliminar", "remove", id);
        const summary =
          item.estado ||
          item.correo ||
          (item.stock !== undefined ? item.stock + " en stock" : "");
        return `<article class="box"><h3>${esc(titleOf(item))}</h3><small>${esc(summary)}</small><div class="actions">${controls}</div></article>`;
      })
      .join("") || empty("Todavía no hay registros."));
}
async function getItem(id) {
  if (section === "historial") {
    const order = items.find((o) => o._id === id);
    return (await api("/api/historial/" + idOf(order.usuario) + "/" + id))
      .orden;
  }
  return (await api(path() + "/" + id))[sections[section][2]];
}
async function fields(item) {
  switch (section) {
    case "usuarios":
      return userFields(item, !item._id);
    case "categorias":
      return (
        field("nombre", "Nombre", "text", item.nombre) +
        field("descripcion", "Descripción", "textarea", item.descripcion, "") +
        field("activo", "Activa", "checkbox", item.activo ?? true)
      );
    case "catalogo": {
      const { categorias } = await api("/api/categorias");
      if (!categorias.length) throw new Error("Primero creá una categoría.");
      return (
        field("nombre", "Nombre", "text", item.nombre) +
        select(
          "categoria",
          "Categoría",
          categorias.map((c) => [c._id, c.nombre]),
          idOf(item.categoria),
        ) +
        field("descripcion", "Descripción", "textarea", item.descripcion, "") +
        field(
          "precio",
          "Precio (₡)",
          "number",
          item.precio,
          'required min="0" step="0.01"',
        ) +
        field("stock", "Stock", "number", item.stock ?? 0, 'required min="0"') +
        field(
          "imagen",
          "Imagen (URL o img/teclado.jpg)",
          "text",
          item.imagen,
          "",
        ) +
        field("destacado", "Destacado", "checkbox", item.destacado) +
        field("activo", "Activo", "checkbox", item.activo ?? true)
      );
    }
    case "contacto":
      return select(
        "estado",
        "Estado",
        [
          ["pendiente", "Pendiente"],
          ["respondido", "Respondido"],
        ],
        item.estado,
      );
    case "resenas":
      return (
        field(
          "calificacion",
          "Calificación",
          "number",
          item.calificacion,
          'required min="1" max="5"',
        ) + field("comentario", "Comentario", "textarea", item.comentario, "")
      );
    case "notificaciones": {
      const { usuarios } = await api("/api/usuarios");
      return (
        select(
          "usuario",
          "Destinatario",
          usuarios.map((u) => [u._id, u.nombre + " · " + u.correo]),
        ) +
        field("titulo", "Título") +
        field("mensaje", "Mensaje", "textarea") +
        select("tipo", "Tipo", [
          ["general", "General"],
          ["compra", "Compra"],
          ["pedido", "Pedido"],
        ])
      );
    }
  }
}
async function edit(id) {
  const item = id ? await getItem(id) : {};
  editForm(
    (id ? "Editar · " : "Crear · ") + sections[section][0],
    await fields(item),
    async (data) => {
      await api(path() + (id ? "/" + id : ""), id ? "PATCH" : "POST", data);
      closeModal();
      await show();
      notice("Cambios guardados.");
    },
  );
}
function stock(id, operation) {
  editForm(
    operation === "agregar" ? "Agregar stock" : "Descontar stock",
    field("cantidad", "Unidades", "number", 1, 'required min="1"'),
    async (data) => {
      await api("/api/inventario/" + id + "/" + operation, "PATCH", data);
      closeModal();
      await show();
      notice("Inventario actualizado.");
    },
  );
}
if (user?.rol === "admin") {
  root.innerHTML =
    '<nav id="sections" class="tabs">' +
    [["resumen", ["Resumen"]], ...Object.entries(sections)]
      .map(
        ([key, [title]]) => `<button data-section="${key}">${title}</button>`,
      )
      .join("") +
    '</nav><section id="list"></section>';
  on($("#sections"), "click", async (e) => {
    if (e.target.dataset.section) {
      section = e.target.dataset.section;
      await show();
    }
  });
  actions($("#list"), {
    info: async (id) => modal("Detalle", detail(await getItem(id))),
    create: () => edit(),
    edit,
    plus: (id) => stock(id, "agregar"),
    minus: (id) => stock(id, "descontar"),
    remove: async (id) => {
      if (confirm("¿Eliminar este registro?")) {
        await api(path() + "/" + id, "DELETE");
        await show();
      }
    },
    cancel: async (id) => {
      if (confirm("¿Cancelar este pedido?")) {
        await api(path() + "/" + id, "DELETE");
        await show();
      }
    },
    read: async (id) => {
      await api(path() + "/" + id + "/leida", "PATCH");
      await show();
    },
    advance: async (id) => {
      const current = items.find((i) => i._id === id);
      await api(path() + "/" + id, "PATCH", {
        estado: nextState[current.estado],
      });
      await show();
    },
  });
  start(show);
} else if (user)
  root.innerHTML = empty("Esta sección requiere una cuenta administradora.");
