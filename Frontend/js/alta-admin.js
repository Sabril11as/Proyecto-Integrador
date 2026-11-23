import { $, userFields, on, values } from "./ui.js";

// Reabrir el enlace desde la misma pestaña también inicia un formulario nuevo.
window.addEventListener("hashchange", () => {
  if (location.hash) location.reload();
});

const form = $("#alta");
const permiso = location.hash.slice(1);
history.replaceState(null, "", location.pathname);
if (!permiso || location.hostname !== "127.0.0.1") {
  form.innerHTML =
    "<p>Desde la carpeta TechStore, ejecutá <code>node herramientas/abrir-panel.cjs</code> y abrí el enlace que aparece en la terminal.</p>";
} else {
  form.innerHTML =
    userFields({}, true) +
    '<button class="primary mt-3">Crear administrador</button>';
  on(form, "submit", async (event) => {
    const response = await fetch("/local/administradores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + permiso,
      },
      body: JSON.stringify(values(event.target)),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.mensaje || "No se pudo crear la cuenta.");
    form.reset();
    $("#notice").className = "notice";
    $("#notice").textContent =
      "Cuenta administradora creada para " + data.correo + ".";
    form.insertAdjacentHTML(
      "beforebegin",
      '<a class="cta" href="cuenta.html">Iniciar sesión</a>',
    );
    form.hidden = true;
  });
}
