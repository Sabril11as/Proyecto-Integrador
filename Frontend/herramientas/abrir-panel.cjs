// Ejecutar con Node desde la computadora que tiene acceso a la base de la tienda.
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const { createRequire } = require("node:module");

const frontend = path.resolve(__dirname, "..");
const carpetaAPI = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(frontend, "../API");
const cargar = createRequire(path.join(carpetaAPI, "package.json"));

async function iniciar() {
  const express = cargar("express");
  const mongoose = cargar("mongoose");
  const bcrypt = cargar("bcryptjs");
  cargar("dotenv").config({ path: path.join(carpetaAPI, ".env"), quiet: true });
  if (!process.env.MONGO_URI)
    throw new Error(
      "Falta MONGO_URI en el entorno o en el .env de la API original.",
    );
  const Usuario = cargar("./models/usuarios/Usuario");
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  await Usuario.init();

  const llave = randomBytes(32).toString("hex");
  const app = express();
  const host = "127.0.0.1";
  // Puerto libre asignado por el sistema para que pueda convivir con Live Server.
  const server = app.listen(0, host, () => {
    const origen = "http://" + host + ":" + server.address().port;
    console.log(
      "Abrí este enlace local en tu navegador:\n" +
        origen +
        "/alta-admin.html#" +
        llave,
    );
    console.log("Cerrá el panel con Ctrl+C cuando terminés.");
  });
  app.use((req, res, next) => {
    if (req.get("host") !== host + ":" + server.address().port)
      return res.sendStatus(403);
    res.set("Cache-Control", "no-store");
    res.set("Referrer-Policy", "no-referrer");
    next();
  });
  app.post(
    "/local/administradores",
    (req, res, next) => {
      if (
        req.get("origin") !== "http://" + req.get("host") ||
        req.get("authorization") !== "Bearer " + llave
      ) {
        return res
          .status(403)
          .json({
            mensaje:
              "Abrí el enlace que muestra la terminal de esta herramienta.",
          });
      }
      next();
    },
    express.json({ limit: "8kb" }),
    async (req, res) => {
      const { nombre, correo, telefono, password } = req.body || {};
      if (
        typeof nombre !== "string" ||
        !nombre.trim() ||
        typeof correo !== "string" ||
        typeof password !== "string" ||
        password.length < 8 ||
        Buffer.byteLength(password) > 72 ||
        (telefono !== undefined && typeof telefono !== "string")
      ) {
        return res
          .status(400)
          .json({
            mensaje:
              "Revisá los datos. La contraseña debe tener al menos 8 caracteres y hasta 72 bytes.",
          });
      }
      try {
        const usuario = await Usuario.create({
          nombre,
          correo,
          telefono,
          rol: "admin",
          password: await bcrypt.hash(password, 10),
        });
        res.status(201).json({ correo: usuario.correo });
      } catch (error) {
        if (error.code === 11000)
          return res
            .status(409)
            .json({
              mensaje: "Ese correo ya tiene una cuenta. Usá uno nuevo.",
            });
        if (error.name === "ValidationError")
          return res
            .status(400)
            .json({ mensaje: "Revisá el nombre y el formato del correo." });
        res
          .status(500)
          .json({ mensaje: "No se pudo guardar la cuenta en MongoDB." });
      }
    },
  );
  // Servir únicamente las pantallas y los recursos públicos de TechStore.
  for (const dir of ["css", "img", "js"])
    app.use("/" + dir, express.static(path.join(frontend, dir)));
  app.get("/", (req, res) => res.redirect("/index.html"));
  for (const page of [
    "index",
    "alta-admin",
    "gestion",
    "cuenta",
    "pedidos",
    "carrito",
    "contacto",
  ]) {
    app.get("/" + page + ".html", (req, res) =>
      res.sendFile(path.join(frontend, page + ".html")),
    );
  }
}
iniciar().catch((error) => {
  console.error(
    error.code === "MODULE_NOT_FOUND"
      ? "Verificá la ruta a API y ejecutá npm ci dentro de esa carpeta."
      : error.message.startsWith("Falta MONGO_URI")
        ? error.message
        : "No se pudo abrir el panel. Revisá la conexión de la API original a MongoDB.",
  );
  process.exit(1);
});
