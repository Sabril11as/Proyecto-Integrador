# Guía de uso de la colección de Postman

## 1. Objetivo

Esta guía explica cómo ejecutar, en el orden correcto, la colección **API REST Tienda - Coleccion de Pruebas (16 modulos)**. La colección contiene **16 carpetas y 126 peticiones** con pruebas de éxito y de error para la API REST de la tienda.

La colección ya incluye las URL, los métodos HTTP, los cuerpos JSON y los scripts de validación. No es necesario escribir las 126 peticiones manualmente.

## 2. Requisitos

- Node.js y las dependencias del proyecto instaladas.
- MongoDB local funcionando, con acceso a la base de datos `profeMario`.
- Postman instalado.
- El código de la API y el archivo `Coleccion_Postman_Entrega_16_Modulos.postman_collection.json`.
- Una base de datos de **pruebas**: la colección crea, actualiza y elimina registros.

## 3. Iniciar el servidor

1. Abrir una terminal en la carpeta del proyecto.
2. Instalar las dependencias si aún no están instaladas:

   ```bash
   npm install
   ```

3. Verificar que exista el archivo `.env` con los valores necesarios, por ejemplo:

   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/profeMario
   JWT_SECRET=CLAVE_SECRETA_SEGURA
   ```

   La clave `JWT_SECRET` debe ser una clave real generada para el proyecto. No utilizar la cadena de ejemplo.

4. Ejecutar el servidor:

   ```bash
   node server.js
   ```

5. Confirmar en la consola que MongoDB se conectó y que el servidor está escuchando en `http://localhost:5001`.
6. Opcionalmente, verificar en Postman o el navegador:

   ```http
   GET http://localhost:5001/
   ```

   Respuesta esperada:

   ```json
   { "message": "Welcome to the API" }
   ```

## 4. Crear el usuario administrador (paso manual, una sola vez)

**Hacer este paso antes de ejecutar la colección completa.** La API registra nuevos usuarios con rol `cliente`; para probar el panel de administración se necesita un usuario con rol `admin`.

### 4.1. Registrar el administrador desde Postman

Crear temporalmente una petición con esta configuración:

- Método: `POST`
- URL: `http://localhost:5001/api/autenticacion/registro`
- Authorization: `No Auth`
- Body: `raw` > `JSON`

Body:

```json
{
  "nombre": "Administrador Postman",
  "correo": "admin.postman@example.com",
  "telefono": "88888888",
  "password": "AdminDemo2026!"
}
```

Presionar **Send**. El resultado esperado es **201 Created**. Si este correo ya existe y pertenece al administrador de pruebas, no es necesario volver a registrarlo.

### 4.2. Asignar el rol administrador en MongoDB

Abrir MongoDB Shell (`mongosh`) conectado a la instancia local y ejecutar:

```javascript
use profeMario

db.usuarios.updateOne(
  { correo: "admin.postman@example.com" },
  { $set: { rol: "admin" } }
);
```

Verificar que el usuario quedó con rol `admin`:

```javascript
db.usuarios.findOne(
  { correo: "admin.postman@example.com" },
  { nombre: 1, correo: 1, rol: 1 }
);
```

Debe aparecer `rol: "admin"`. También se puede editar el campo `rol` desde MongoDB Compass o la extensión de MongoDB para VS Code. Este cambio se realiza solamente en el entorno local de pruebas.

**Nota:** La colección inicia sesión como administrador en la petición **`01 - Autenticacion > 08 Iniciar sesion administrador (guarda tokenAdmin)`**. No hace falta copiar manualmente el token.

## 5. Importar la colección en Postman

1. Abrir Postman.
2. Seleccionar **Import**.
3. Seleccionar `Coleccion_Postman_Entrega_16_Modulos.postman_collection.json`.
4. Confirmar la importación.
5. Abrir la colección **API REST Tienda - Coleccion de Pruebas (16 modulos)**.
6. En la pestaña **Variables** de la colección, revisar:

   | Variable | Valor esperado |
   | --- | --- |
   | `baseUrl` | `http://localhost:5001` |
   | `adminCorreo` | `admin.postman@example.com` |
   | `adminPassword` | `AdminDemo2026!` |
   | `clientePassword` | `ClienteDemo2026!` |

7. Guardar los cambios, si se modificó alguna variable.

Las demás variables, por ejemplo `usuarioId`, `productoId`, `categoriaId`, `ordenId`, `ordenTotal`, `tokenCliente` y `tokenAdmin`, se completan mediante los scripts de Postman durante las pruebas. Se recomienda seleccionar **No Environment** para evitar que variables de otro entorno reemplacen las de la colección.

## 6. Ejecutar las pruebas en el orden correcto

**No comenzar desde una carpeta intermedia:** las primeras peticiones crean registros que necesitan las posteriores. También es importante no cambiar el orden de las solicitudes dentro de cada carpeta.

1. Abrir la colección en Postman.
2. Seleccionar **Run**.
3. Mantener seleccionadas las 16 carpetas y todas las peticiones.
4. Configurar **1 iteración**, sin retraso obligatorio entre solicitudes, y mantener el orden predeterminado.
5. Ejecutar **Run collection**.
6. Revisar los resultados **Passed** y **Failed** en el Collection Runner.

### Orden de las carpetas

| Orden | Carpeta en Postman | Qué hace y qué comprobar |
| --- | --- | --- |
| 01 | Autenticacion (8 peticiones) | Registra un cliente, inicia sesión, obtiene `tokenCliente`, prueba errores y finalmente inicia sesión como administrador para guardar `tokenAdmin`. |
| 02 | Usuarios (7) | Crea otro usuario, consulta con JWT de admin, comprueba permisos, actualiza y elimina el usuario adicional. |
| 03 | Perfil (4) | Consulta y actualiza el perfil del cliente; comprueba acceso sin token y a perfiles ajenos. |
| 04 | Categorias (9) | Crea una categoría principal y guarda `categoriaId`; ejecuta CRUD y casos de error. |
| 05 | Catalogo (9) | Crea un producto asociado a `categoriaId`, guarda `productoId`, consulta, actualiza y prueba validaciones. |
| 06 | Busqueda y Filtros (8) | Busca el producto por nombre, categoría y rango de precios; incluye filtros inválidos. |
| 07 | Destacados (5) | Consulta destacados, desmarca y vuelve a marcar el producto principal. |
| 08 | Inventario (7) | Consulta inventario, agrega y descuenta existencias; verifica stock insuficiente. |
| 09 | Resenas (8) | Crea una reseña con `usuarioId` y `productoId`, la modifica, comprueba errores y la elimina. |
| 10 | Carrito (10) | Agrega productos, modifica cantidades, elimina, vacía y finalmente deja el carrito listo para crear una orden. |
| 11 | Ordenes (12) | Crea una orden, guarda `ordenId` y `ordenTotal`, la confirma y crea/cancela otra orden de prueba. |
| 12 | Pagos simulados (9) | Comprueba errores de pago y registra uno válido usando `ordenId` y `ordenTotal`; guarda `pagoId`. |
| 13 | Historial (6) | Consulta el historial general, el del cliente y el detalle de la orden. |
| 14 | Contacto (9) | Envía un mensaje, lo consulta, cambia su estado, valida errores y lo elimina. |
| 15 | Notificaciones (10) | Crea una notificación para el cliente, la consulta, marca como leída y elimina. |
| 16 | PanelAdmin (5) | Consulta estadísticas, inventario bajo y últimas órdenes con `tokenAdmin`; comprueba 401 sin token y 403 como cliente. |

**La primera petición del módulo 01 genera automáticamente un correo único** para el cliente. Por eso puede ejecutarse de nuevo la colección sin registrar siempre el mismo correo. También guarda un identificador `runId` que se utiliza en algunos nombres y correos de prueba.

## 7. Cómo revisar los Body y los tokens

Cada solicitud POST o PATCH contiene un cuerpo JSON de ejemplo en **Body > raw > JSON**. Por ejemplo:

**Crear categoría** (`POST {{baseUrl}}/api/categorias`):

```json
{
  "nombre": "Electronica {{runId}}",
  "descripcion": "Accesorios y tecnologia"
}
```

**Crear producto** (`POST {{baseUrl}}/api/catalogo`):

```json
{
  "nombre": "Laptop Prueba {{runId}}",
  "descripcion": "16GB RAM",
  "precio": 450000,
  "stock": 10,
  "categoria": "{{categoriaId}}",
  "imagen": "https://example.com/laptop.jpg",
  "destacado": true
}
```

**Crear orden** (`POST {{baseUrl}}/api/ordenes`):

```json
{
  "usuario": "{{usuarioId}}"
}
```

**Registrar pago simulado** (`POST {{baseUrl}}/api/pagos`):

```json
{
  "orden": "{{ordenId}}",
  "monto": {{ordenTotal}},
  "metodo": "sinpe"
}
```

Los campos `{{...}}` son variables de Postman. **No hay que reemplazarlos a mano** si las solicitudes anteriores se ejecutaron correctamente.

En las peticiones protegidas, abrir **Authorization > Bearer Token** para comprobar que se utiliza `{{tokenCliente}}` o `{{tokenAdmin}}`. Los tokens se almacenan después de los respectivos inicios de sesión. Las peticiones públicas utilizan `No Auth`.

## 8. Interpretar los resultados

Los scripts de la colección comparan el código recibido con el esperado y verifican que la respuesta sea JSON. Los códigos más comunes son:

| Código | Resultado |
| --- | --- |
| `200 OK` | Consulta, actualización o eliminación correcta. |
| `201 Created` | Documento creado. |
| `400 Bad Request` | Error esperado cuando se envían datos inválidos. |
| `401 Unauthorized` | Error esperado al omitir o invalidar el token. |
| `403 Forbidden` | Error esperado cuando un cliente intenta acceder a una función de administrador. |
| `404 Not Found` | Error esperado al solicitar un documento inexistente. |

**Atención:** una petición que se llama `(error)` y devuelve `400`, `401`, `403` o `404` puede ser una prueba **Passed**, porque ese es precisamente el resultado esperado. No se debe corregir esa respuesta si coincide con el caso de prueba.

Si aparece **Failed**, abrir la petición correspondiente y revisar: el código HTTP, el JSON devuelto, la URL, la existencia de los IDs en las variables, el token y los mensajes de error en la consola de Node.js.

## 9. Verificar los resultados en MongoDB

Además de comprobar las respuestas de Postman, se pueden revisar las colecciones `usuarios`, `categorias`, `productos`, `carritos`, `ordenes`, `pagos`, `contactos` y `notificaciones` en la base de datos `profeMario`.

Comprobaciones útiles:

- Después de registrar el cliente, aparece un documento en `usuarios` con contraseña en formato hash.
- Después de crear la categoría y el producto, aparecen registros en `categorias` y `productos`.
- Después de crear una orden, cambia el inventario y se vacía el carrito.
- Después del pago simulado, la orden cambia a estado `pagada` y se crea un registro en `pagos`.
- Las operaciones DELETE eliminan o cancelan registros según la funcionalidad de cada módulo.

## 10. Finalización

La colección permite probar los 16 módulos de la API mediante 126 solicitudes y scripts de validación. Una vez ejecutada, el profesor puede verificar los resultados en Postman y consultar los registros en MongoDB.

**El sistema utiliza pagos simulados; no realiza cobros reales.**
