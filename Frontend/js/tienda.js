import { api, session } from "./api.js";
import {
  $,
  esc,
  money,
  empty,
  button,
  modal,
  actions,
  on,
  field,
  values,
  notice,
  start,
  idOf,
  detail,
} from "./ui.js";
const catalog = $("#products");
const filter = $("#filters");
// Ilustraciones del frontend de referencia para productos sin foto.
function illustration(name) {
  const kinds = [
    [/teclado|perif/i, "teclado"],
    [/mouse|ratón/i, "mouse"],
    [/audio|aud[ií]fono/i, "audifonos"],
    [/monitor|pantalla/i, "monitor"],
    [/celular|teléfono/i, "celular"],
    [/tablet/i, "tablet"],
    [/reloj|wearable/i, "reloj"],
    [/laptop|computadora/i, "laptop"],
  ];
  return (
    "img/" +
    (kinds.find(([pattern]) => pattern.test(name))?.[1] || "logo") +
    ".svg"
  );
}
function art(product) {
  const src = product.imagen || "";
  const image =
    /^https?:\/\//i.test(src) || src === "img/teclado.jpg"
      ? src
      : illustration(product.nombre + " " + (product.categoria?.nombre || ""));
  return `<img src="${esc(image)}" alt="${esc(product.nombre)}" loading="lazy">`;
}
let queryVersion = 0;
async function loadProducts(path, featured = false) {
  const version = ++queryVersion;
  const { productos } = await api(path);
  if (version !== queryVersion) return;
  const list = productos.filter((p) => p.activo !== false);
  $("#featured").setAttribute("aria-pressed", String(featured));
  $("#count").textContent =
    list.length + (list.length === 1 ? " producto" : " productos");
  catalog.innerHTML =
    list
      .map(
        (p) =>
          `<article class="tile">${art(p)}${p.destacado ? '<span class="featured-tag">★ Destacado</span>' : ""}<span class="kicker">${esc(p.categoria?.nombre || "Hardware")}</span><h3>${esc(p.nombre)}</h3><span class="price">${money(p.precio)}</span><small>${p.stock ? esc(p.stock) + " disponibles" : "Agotado"}</small>${button("Ver producto", "product", p._id)}</article>`,
      )
      .join("") || empty("No hay productos para mostrar.");
}
async function product(id) {
  const [{ producto: p }, { resenas }] = await Promise.all([
    api("/api/catalogo/" + id),
    api("/api/resenas"),
  ]);
  const user = session()?.usuario;
  const reviews = resenas.filter((r) => idOf(r.producto) === id);
  modal(
    p.nombre,
    `<p class="kicker">${esc(p.categoria?.nombre)}</p><p>${esc(p.descripcion)}</p><p class="price">${money(p.precio)}</p><p>Stock disponible: ${esc(p.stock)}</p>` +
      (user && p.stock > 0
        ? '<form id="add" class="actions">' +
          field(
            "cantidad",
            "Cantidad",
            "number",
            1,
            'required min="1" max="' + Number(p.stock) + '"',
          ) +
          '<button class="primary">Agregar al carrito</button></form>'
        : !user
          ? '<a href="cuenta.html">Iniciar sesión para comprar</a>'
          : "<p>Agotado</p>") +
      "<hr><h3>Reseñas</h3>" +
      reviews
        .map(
          (r) =>
            `<div class="rowitem"><strong>${esc(r.usuario?.nombre || "Cliente")} · ${esc(r.calificacion)}/5</strong><p>${esc(r.comentario)}</p>${button("Detalle", "review", r._id)} ${user && idOf(r.usuario) === user.id ? button("Editar", "edit", r._id) + " " + button("Eliminar", "remove", r._id) : ""}</div>`,
        )
        .join("") +
      (!reviews.length ? "<p>Todavía no hay reseñas.</p>" : "") +
      (user ? button("Escribir reseña", "newReview") : ""),
  );
  if ($("#add"))
    on($("#add"), "submit", async (e) => {
      await api("/api/carrito/" + user.id + "/productos", "POST", {
        producto: id,
        ...values(e.target),
      });
      notice("Producto agregado. Podés verlo en Carrito.");
    });
  actions($("#modalContent"), {
    review: async (rid) => {
      const { resena } = await api("/api/resenas/" + rid);
      modal("Detalle de reseña", detail(resena));
    },
    newReview: () => reviewForm(id),
    edit: async (rid) =>
      reviewForm(id, (await api("/api/resenas/" + rid)).resena),
    remove: async (rid) => {
      if (!confirm("¿Eliminar tu reseña?")) return;
      await api("/api/resenas/" + rid, "DELETE");
      await product(id);
      notice("Reseña eliminada.");
    },
  });
}
function reviewForm(productId, review = {}) {
  modal(
    "Mi reseña",
    '<form id="reviewForm">' +
      field(
        "calificacion",
        "Calificación (1–5)",
        "number",
        review.calificacion ?? 5,
        'required min="1" max="5"',
      ) +
      field("comentario", "Comentario", "textarea", review.comentario, "") +
      '<button class="primary">Guardar reseña</button></form>',
  );
  on($("#reviewForm"), "submit", async (e) => {
    const data = values(e.target);
    if (review._id) await api("/api/resenas/" + review._id, "PATCH", data);
    else
      await api("/api/resenas", "POST", {
        ...data,
        producto: productId,
        usuario: session().usuario.id,
      });
    await product(productId);
    notice("Reseña guardada.");
  });
}
actions(catalog, { product });
on(filter, "submit", async () => {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(filter))
    if (value.trim()) params.set(key, value.trim());
  await loadProducts("/api/busqueda-filtro?" + params);
});
on(filter, "reset", () => loadProducts("/api/catalogo"));
on($("#featured"), "click", () => {
  const active = $("#featured").getAttribute("aria-pressed") !== "true";
  if (active) for (const el of filter.elements) if (el.name) el.value = "";
  return loadProducts(active ? "/api/destacados" : "/api/catalogo", active);
});
start(async () => {
  await api("/");
  const { categorias } = await api("/api/categorias");
  for (const c of categorias.filter((c) => c.activo)) {
    filter.elements.categoria.add(new Option(c.nombre, c._id));
    const card = document.createElement("button");
    card.innerHTML = `<img src="${illustration(c.nombre)}" alt=""><span>${esc(c.nombre)}</span>`;
    card.onclick = () => {
      filter.elements.categoria.value = c._id;
      filter.requestSubmit();
      $("#catalogo").scrollIntoView();
    };
    $("#categoryCards").append(card);
  }
  $("#categoryArea").hidden = !$("#categoryCards").childElementCount;
  await loadProducts("/api/catalogo");
});
