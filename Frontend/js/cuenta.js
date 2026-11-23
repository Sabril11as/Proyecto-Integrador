import { api, session } from "./api.js";
import { $, field, userFields, values, on, notice, start, esc } from "./ui.js";
const root = $("#account");
async function show() {
  if (!session()) {
    root.innerHTML =
      '<div class="split"><section class="box"><h2>Iniciar sesión</h2><form id="login">' +
      field("correo", "Correo", "email") +
      field("password", "Contraseña", "password") +
      '<button class="primary mt-2">Entrar</button></form></section><section class="box"><h2>Crear cuenta</h2><form id="register">' +
      userFields({}, true) +
      '<button class="mt-2">Registrarme</button></form></section></div>';
    for (const [selector, path] of [
      ["#login", "login"],
      ["#register", "registro"],
    ]) {
      on($(selector), "submit", async (e) => {
        const { usuario, token } = await api(
          "/api/autenticacion/" + path,
          "POST",
          values(e.target),
        );
        sessionStorage.setItem("techstore", JSON.stringify({ usuario, token }));
        location.reload();
      });
    }
    return;
  }
  root.innerHTML =
    '<button id="logout">Cerrar sesión</button><section id="profile" class="box narrow mt-3"></section>';
  $("#logout").onclick = () => {
    sessionStorage.removeItem("techstore");
    location.reload();
  };
  const { usuario } = await api("/api/autenticacion/perfil");
  const path = "/api/perfil/" + usuario.id;
  const profile = (await api(path)).usuario;
  $("#profile").innerHTML =
    '<p class="kicker">' +
    esc(usuario.rol.toUpperCase()) +
    '</p><h2>Mis datos</h2><form id="profileForm">' +
    userFields(profile) +
    '<button class="primary mt-2">Guardar cambios</button></form>';
  on($("#profileForm"), "submit", async (e) => {
    const { usuario: u } = await api(path, "PATCH", values(e.target));
    const s = session();
    Object.assign(s.usuario, { nombre: u.nombre, correo: u.correo });
    sessionStorage.setItem("techstore", JSON.stringify(s));
    notice("Perfil actualizado.");
  });
}
start(show);
