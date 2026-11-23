import { api, session } from "./api.js";
import { $, field, values, on, notice } from "./ui.js";
const u = session()?.usuario || {};
$("#contact").innerHTML =
  field("nombre", "Nombre", "text", u.nombre) +
  field("correo", "Correo", "email", u.correo) +
  field("asunto", "Asunto") +
  field("mensaje", "Mensaje", "textarea") +
  '<button class="primary mt-2">Enviar mensaje</button>';
on($("#contact"), "submit", async (e) => {
  const response = await api("/api/contacto", "POST", values(e.target));
  e.target.reset();
  notice(response.mensaje);
});
