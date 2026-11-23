import { session } from "./api.js";
export const $ = (selector) => document.querySelector(selector);
export const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const money = (value) =>
  new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(
    value,
  );
export const idOf = (value) => value?._id || value?.id || value;
export const empty = (message) => '<p class="empty">' + esc(message) + "</p>";
export const button = (label, action, id = "") =>
  `<button data-action="${esc(action)}" data-id="${esc(id)}">${esc(label)}</button>`;
export function notice(message, error = false) {
  const target = $("#modal").open ? $("#modalNotice") : $("#notice");
  target.className = "notice" + (error ? " error" : "");
  target.textContent = message;
  target.scrollIntoView({ block: "nearest" });
}
export const closeModal = () => $("#modal").close();
$("#closeModal").onclick = closeModal;
export function modal(title, content) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML =
    '<div id="modalNotice" role="status"></div><div id="modalContent">' +
    content +
    "</div>";
  if (!$("#modal").open) $("#modal").showModal();
}
// Centraliza los errores y evita repetir una operación mientras se guarda.
export function on(element, event, handler) {
  element.addEventListener(event, async (e) => {
    if (event === "submit") e.preventDefault();
    const control = e.submitter || e.target.closest?.("button[data-action]");
    if (control?.disabled) return;
    if (control) control.disabled = true;
    try {
      await handler(e);
    } catch (error) {
      notice(error.message, true);
    } finally {
      if (control) control.disabled = false;
    }
  });
}
export function actions(element, handlers) {
  on(element, "click", async (e) => {
    const b = e.target.closest("[data-action]");
    if (b && handlers[b.dataset.action])
      await handlers[b.dataset.action](b.dataset.id, b);
  });
}
export function requireUser(target) {
  if (session()) return session().usuario;
  target.innerHTML =
    '<div class="box"><p>Iniciá sesión para continuar.</p><a href="cuenta.html">Ir a mi cuenta →</a></div>';
  return null;
}
export function field(
  name,
  title,
  type = "text",
  value = "",
  attributes = "required",
) {
  if (type === "checkbox")
    return `<label><input type="checkbox" name="${name}" ${value ? "checked" : ""}>${esc(title)}</label>`;
  if (type === "textarea")
    return `<label>${esc(title)}<textarea name="${name}" ${attributes}>${esc(value)}</textarea></label>`;
  return `<label>${esc(title)}<input type="${type}" name="${name}" value="${esc(value)}" ${attributes}></label>`;
}
export function select(name, title, options, current = "") {
  return `<label>${esc(title)}<select name="${name}" required>${options
    .map(
      ([value, label]) =>
        `<option value="${esc(value)}" ${String(current) === String(value) ? "selected" : ""}>${esc(label)}</option>`,
    )
    .join("")}</select></label>`;
}
export function values(form) {
  const data = Object.fromEntries(new FormData(form));
  for (const input of form.querySelectorAll("[type=checkbox]"))
    data[input.name] = input.checked;
  for (const input of form.querySelectorAll("[type=number]"))
    data[input.name] = Number(input.value);
  return data;
}
export function editForm(title, fields, save) {
  modal(
    title,
    '<form id="editor">' +
      fields +
      '<button class="primary mt-2">Guardar</button></form>',
  );
  on($("#editor"), "submit", async (e) => {
    await save(values(e.target));
  });
}
export const userFields = (u = {}, password = false) =>
  field("nombre", "Nombre", "text", u.nombre) +
  field("correo", "Correo", "email", u.correo) +
  field("telefono", "Teléfono", "tel", u.telefono, "") +
  (password
    ? field(
        "password",
        "Contraseña (mínimo 8 caracteres)",
        "password",
        "",
        'required minlength="8"',
      )
    : "");
const labels = {
  _id: "ID",
  createdAt: "Creación",
  updatedAt: "Actualización",
  calificacion: "Calificación",
  descripcion: "Descripción",
  metodo: "Método",
  titulo: "Título",
  telefono: "Teléfono",
  categoria: "Categoría",
  totalUsuarios: "Usuarios",
  totalProductos: "Productos",
  totalOrdenes: "Pedidos",
  productosStockBajo: "Productos con stock bajo",
  cantidadPagos: "Pagos",
  totalVentas: "Ventas simuladas",
};
export function detail(data) {
  if (data === null || data === undefined) return "—";
  if (Array.isArray(data))
    return (
      data
        .map((item) => '<div class="rowitem">' + detail(item) + "</div>")
        .join("") || "Sin registros"
    );
  if (typeof data === "boolean") return data ? "Sí" : "No";
  if (typeof data !== "object") return esc(data);
  return (
    "<dl>" +
    Object.entries(data)
      .filter(([k]) => !["__v", "password", "token"].includes(k))
      .map(
        ([k, v]) =>
          `<dt>${esc(labels[k] || k[0].toUpperCase() + k.slice(1))}</dt><dd>${["precio", "total", "subtotal", "monto", "totalVentas"].includes(k) ? money(v) : detail(v)}</dd>`,
      )
      .join("") +
    "</dl>"
  );
}
export const start = (fn) => fn().catch((error) => notice(error.message, true));
$("#adminLink").hidden = session()?.usuario.rol !== "admin";
