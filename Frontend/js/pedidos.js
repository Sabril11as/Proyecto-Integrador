import { api } from "./api.js";
import {
  $,
  requireUser,
  start,
  empty,
  money,
  esc,
  on,
  button,
  actions,
  modal,
  detail,
  select,
  editForm,
  closeModal,
  notice,
} from "./ui.js";
const root = $("#records");
const user = requireUser(root);
let tab = "ordenes";
let records = [];
async function show() {
  const paths = {
    ordenes: "/api/ordenes/usuario/",
    historial: "/api/historial/",
    notificaciones: "/api/notificaciones/usuario/",
  };
  const active = tab;
  const result = await api(paths[active] + user.id);
  if (active !== tab) return;
  records = result.ordenes || result.notificaciones;
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.tab === tab)),
    );
  root.innerHTML =
    records
      .map((item) => {
        const id = item._id;
        if (tab === "notificaciones")
          return `<article class="box"><h3>${esc(item.titulo)}</h3><p>${esc(item.mensaje)}</p><small>${item.leida ? "Leída" : "Sin leer"}</small><div class="actions">${button("Detalle", "info", id)}${item.leida ? "" : button("Marcar leída", "read", id)}</div></article>`;
        let controls = button("Ver detalle", "info", id);
        if (tab === "ordenes") {
          if (item.estado === "confirmada")
            controls += button("Pagar (simulado)", "pay", id);
          if (["pendiente", "confirmada"].includes(item.estado))
            controls += button("Cancelar pedido", "cancel", id);
          if (["pagada", "enviada", "entregada"].includes(item.estado))
            controls += button("Ver comprobante", "receipt", id);
        }
        return `<article class="box"><p class="kicker">${esc(item.estado.toUpperCase())}</p><h3>Pedido #${esc(id.slice(-6))}</h3><p>${money(item.total)} · ${esc(new Date(item.createdAt).toLocaleDateString("es-CR"))}</p><div class="actions">${controls}</div></article>`;
      })
      .join("") || empty("Todavía no hay registros en esta sección.");
}
on($(".tabs"), "click", async (e) => {
  if (user && e.target.dataset.tab) {
    tab = e.target.dataset.tab;
    await show();
  }
});
actions(root, {
  info: async (id) => {
    const paths = {
      ordenes: "/api/ordenes/",
      historial: "/api/historial/" + user.id + "/",
      notificaciones: "/api/notificaciones/",
    };
    const result = await api(paths[tab] + id);
    modal("Detalle", detail(result.orden || result.notificacion));
  },
  cancel: async (id) => {
    if (confirm("¿Cancelar este pedido?")) {
      await api("/api/ordenes/" + id, "DELETE");
      await show();
    }
  },
  read: async (id) => {
    await api("/api/notificaciones/" + id + "/leida", "PATCH");
    await show();
  },
  receipt: async (id) =>
    modal(
      "Comprobante simulado",
      detail((await api("/api/pagos/orden/" + id)).pago),
    ),
  pay: (id) => {
    const order = records.find((r) => r._id === id);
    editForm(
      "Pago simulado",
      "<p>Total a registrar: <strong>" +
        money(order.total) +
        "</strong></p>" +
        select("metodo", "Método", [
          ["sinpe", "SINPE"],
          ["tarjeta", "Tarjeta"],
          ["efectivo", "Efectivo"],
        ]),
      async (data) => {
        await api("/api/pagos", "POST", {
          orden: id,
          monto: order.total,
          ...data,
        });
        closeModal();
        await show();
        notice("Pago simulado registrado.");
      },
    );
  },
});
if (user) start(show);
