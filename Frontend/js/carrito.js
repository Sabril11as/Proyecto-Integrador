import { api } from "./api.js";
import {
  $,
  requireUser,
  start,
  empty,
  money,
  esc,
  field,
  on,
  values,
  button,
  actions,
  notice,
} from "./ui.js";
const root = $("#cart");
const user = requireUser(root);
const path = "/api/carrito/" + user?.id;
async function show() {
  const { productos, total } = await api(path);
  if (!productos.length) {
    root.innerHTML =
      empty("Tu carrito está vacío.") +
      '<a href="index.html">Explorar catálogo →</a>';
    return;
  }
  root.innerHTML =
    '<section class="box">' +
    productos
      .map(({ producto: p, cantidad, subtotal }) =>
        p
          ? `<div class="rowitem"><h3>${esc(p.nombre)}</h3><span>${money(p.precio)} por unidad · Subtotal ${money(subtotal)}</span><form class="actions" data-id="${esc(p._id)}">${field("cantidad", "Cantidad", "number", cantidad, 'required min="1"')}<button>Actualizar</button></form>${button("Quitar", "remove", p._id)}</div>`
          : "<p>Un producto fue eliminado del catálogo. Vaciá el carrito para retirarlo.</p>",
      )
      .join("") +
    `<div class="heading mt-4"><strong>Total ${money(total)}</strong><div class="actions">${button("Vaciar carrito", "clear")}<button class="primary" data-action="checkout">Crear pedido</button></div></div></section>`;
}
on(root, "submit", async (e) => {
  await api(
    path + "/productos/" + e.target.dataset.id,
    "PATCH",
    values(e.target),
  );
  await show();
  notice("Cantidad actualizada.");
});
actions(root, {
  remove: async (id) => {
    await api(path + "/productos/" + id, "DELETE");
    await show();
  },
  clear: async () => {
    if (confirm("¿Vaciar todo el carrito?")) {
      await api(path, "DELETE");
      await show();
    }
  },
  checkout: async () => {
    await api("/api/ordenes", "POST", { usuario: user.id });
    location.href = "pedidos.html";
  },
});
if (user) start(show);
