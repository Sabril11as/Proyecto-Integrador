# TechStore

Tienda de componentes y periféricos para la API de la entrega. El cliente explora el catálogo, arma un carrito y sigue su pedido. Administración controla el inventario, confirma las órdenes y atiende mensajes. Los precios se muestran en colones costarricenses. El pago es una simulación de la API.

## 1. Encender el backend

1. Descomprimí el archivo original `API.zip` y este ZIP en carpetas hermanas: `API/` y `TechStore/`. El backend se ejecuta desde la carpeta que contiene `server.js`.
2. Usá Node.js 24 y una base de MongoDB de pruebas. Si usás MongoDB Community local, iniciá su servicio. Con Atlas, usá la URI de tu base de pruebas.
3. Si tu API ya está configurada, conservá su `.env`. Para una instalación nueva, en `API/` configurá el archivo `.env`. Si no existe, copiá `.env.example` con ese nombre. Ejemplo para MongoDB local:

   ```dotenv
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/techstore_pruebas
   JWT_SECRET=REEMPLAZAR_CON_LA_CLAVE_GENERADA
   ```

   Generá la clave con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y pegá el resultado en `JWT_SECRET`. El servidor exige al menos 32 caracteres.

4. En una terminal dentro de `API/`, ejecutá:

   ```sh
   npm ci
   npm start
   ```

5. Abrí `http://localhost:5001/`. Debe aparecer `{"message":"Welcome to the API"}`. Dejá abierta la terminal del backend.

## 2. Abrir la tienda

En otra terminal, entrá a `TechStore/`, donde está `index.html`. En Windows con Python instalado:

```sh
py -m http.server 5500
```

En macOS o Linux podés usar `python3 -m http.server 5500`. También podés abrir esa misma carpeta en VS Code y elegir **Open with Live Server** sobre `index.html`.

Abrí **http://localhost:5500/index.html**, o la dirección que indicó Live Server. Usá siempre el mismo origen para navegar. El frontend usa módulos JavaScript, por lo que requiere abrirse mediante HTTP. Bootstrap y las ilustraciones están incluidos. Si cambiaste el puerto del backend, actualizá `API_URL` en `js/api.js`.

## 3. Crear el primer administrador sin modificar la API

Conservá la API del **API.zip original**, con sus dependencias instaladas. Si ya funciona, conservá su configuración. Poné las carpetas `API/` y `TechStore/` una al lado de la otra. Usá la misma base de datos para la API y el panel local.

1. Dejá la API encendida. En otra terminal, desde **TechStore**, ejecutá:

   ```sh
   node herramientas/abrir-panel.cjs
   ```

   Si las carpetas están en otro lugar, pasá la ruta a la API, por ejemplo `node herramientas/abrir-panel.cjs "C:/Proyectos/Backend/API"`.

2. Abrí el **enlace completo que imprime la terminal**. Incluye el puerto local y un permiso temporal después de `#`. No se muestra en el menú de la tienda. Si recargaste la página, volvé a abrir el enlace completo.
3. Escribí nombre, correo nuevo y contraseña. Pulsá **Crear administrador**. La herramienta usa el modelo de usuario original y guarda el rol admin y la contraseña protegida con un hash de bcrypt en MongoDB. El navegador nunca recibe la conexión a la base. Un correo existente no se sobrescribe.
4. En **Iniciar sesión** ingresá con esa cuenta y abrí **Administración**. También podés iniciar sesión desde la tienda en Live Server. Si tenías otra cuenta abierta, cerrá esa sesión primero.
5. Para crear otro administrador, abrí nuevamente el enlace de la terminal. Al terminar pulsá **Ctrl+C** en la terminal de la herramienta. Las cuentas persisten en MongoDB. La tienda sigue disponible desde su servidor habitual.
6. Desde una ventana privada, creá una cuenta de cliente con **Mi cuenta → Crear cuenta** para probar el recorrido de compra.

La API pública registra clientes. El formulario de alta requiere que el operador ejecute esta utilidad local con acceso autorizado a MongoDB. No utiliza una clave de configuración adicional.

## 4. Hacer una compra completa

| Paso | Dónde y qué probar | Resultado esperado |
|---|---|---|
| 1 | Admin → Categorías → Crear. Usá **Periféricos**. Luego abrí Detalle y Editar. | La categoría queda disponible en el formulario de productos. |
| 2 | Admin → Productos → Crear. Nombre **Teclado mecánico**, categoría Periféricos, precio **35000**, stock **5**, imagen **img/teclado.jpg**. Marcá Activo y Destacado. | Aparece una tarjeta en Catálogo y en Destacados. Abrí Detalle y Editar en el panel para comprobar los datos. |
| 3 | Admin → Inventario. Consultá el detalle, agregá 2 unidades y descontá 1. | El stock pasa de 5 a 7 y luego a 6. |
| 4 | Cliente → Catálogo. Buscá “teclado”, elegí categoría y probá mínimo 30000 y máximo 40000. Probá luego máximo 32000 con el mismo mínimo. Usá Limpiar y Destacados. | Primero hay coincidencia, después desaparece. Limpiar restaura el catálogo. |
| 5 | Ver producto → Escribir reseña. Guardá una calificación, consultá Detalle, editá el comentario y eliminá la reseña de prueba. | La ficha refleja cada cambio al guardarlo. |
| 6 | En la ficha agregá una unidad. En Carrito cambiá a 2 y pulsá Actualizar. Probá Quitar, volvé a agregar y probá Vaciar carrito. | Con dos unidades el total es ₡70 000. Quitar y Vaciar dejan el carrito vacío. |
| 7 | Agregá dos unidades nuevamente y elegí Crear pedido. | Aparece en Mis compras como pendiente. El carrito queda vacío y el inventario baja de 6 a 4. |
| 8 | Admin → Pedidos → Marcar confirmada. En la ventana del cliente abrí Mis compras → Pedidos de nuevo. | El cliente ve Pagar (simulado). |
| 9 | Cliente → Pagar (simulado) → elegí SINPE, tarjeta o efectivo → Guardar. Abrí Ver comprobante. | Aparece pagada y el comprobante muestra el mismo importe del pedido. No se solicitan datos bancarios. |
| 10 | Admin → Pedidos → Marcar enviada y después Marcar entregada. Revisá Pagos → Detalle, Historial → Detalle y Resumen. | Cambian los estados. En Resumen se muestran las ventas simuladas, los productos activos con cinco unidades o menos y hasta cinco pedidos recientes. |
| 11 | Cliente → Mis compras → Historial → Ver detalle. Luego creá un segundo pedido de una unidad y cancelalo mientras esté pendiente. | Podés consultar los renglones de la compra. El segundo pedido queda cancelado y su unidad vuelve al inventario. |

Las dos ventanas consultan la API al navegar o recargar. Después de cambiar un pedido desde otra ventana, volvé a abrir la sección para ver su estado actual.

## 5. Probar comunicación y gestión

- **Contacto.** Enviá una consulta desde Contacto. En Administración → Mensajes, abrí Detalle, elegí Editar, pasá de pendiente a respondido y guardá. El cambio registra el estado del mensaje. Eliminá la consulta de prueba.
- **Notificaciones.** En Administración → Notificaciones, creá un aviso para la cuenta cliente. En Mis compras → Notificaciones, abrí Detalle y elegí Marcar leída. Volvé al panel, verificá el campo `leida` y eliminá el aviso.
- **Usuarios.** Desde Administración → Usuarios creá un cliente temporal con un correo nuevo. Abrí Detalle, editá nombre, correo o teléfono y eliminá esa cuenta temporal. Crear desde el panel conserva la sesión del administrador.
- **Eliminaciones de catálogo.** Para probarlas sin afectar tus pedidos de ejemplo, creá una categoría temporal y un producto temporal, eliminá primero el producto y luego la categoría. Las reseñas también se pueden consultar, editar y eliminar desde Administración.

## 6. Mapa de endpoints

64 endpoints de la API original. El alta local de administradores se ejecuta por separado. En la tabla, los prefijos de módulo llevan `/api/`. Un guion largo indica la ruta base del módulo. En el navegador, abrí **F12 → Red/Network → Fetch/XHR** para ver método, URL, estado y respuesta JSON de cada acción. La terminal del servidor también imprime el método y la ruta.

| Módulo | Método y ruta relativa | Acción en TechStore |
|---|---|---|
| Raíz | GET / (sin prefijo) | Abrir Catálogo y comprobar la conexión |
| autenticacion | POST /registro, POST /login, GET /perfil | Registrarme, Entrar, abrir Mi cuenta con sesión |
| perfil | GET /:id, PATCH /:id | Cargar y guardar Mis datos |
| usuarios | GET —, POST —, GET /:id, PATCH /:id, DELETE /:id | Admin → Usuarios → listar, crear, detalle, editar y eliminar |
| categorias | GET —, POST —, GET /:id, PATCH /:id, DELETE /:id | Selector de categoría y gestión de categorías |
| catalogo | GET —, GET /:id, POST —, PATCH /:id, DELETE /:id | Catálogo, Ver producto y gestión de productos |
| busqueda-filtro | GET — con nombre, categoria, precioMin, precioMax opcionales | Buscar en Catálogo |
| destacados | GET — | Botón Destacados |
| inventario | GET —, GET /:id, PATCH /:id/agregar, PATCH /:id/descontar | Inventario, Detalle y ajustes de stock |
| resenas | GET —, GET /:id, POST —, PATCH /:id, DELETE /:id | Ficha del producto → reseñas, detalle, escribir, editar y eliminar |
| carrito | GET /:usuarioId, POST /:usuarioId/productos, PATCH /:usuarioId/productos/:productoId, DELETE /:usuarioId/productos/:productoId, DELETE /:usuarioId | Ver carrito, agregar, actualizar, quitar y vaciar |
| ordenes | GET —, GET /usuario/:usuarioId, GET /:id, POST —, PATCH /:id, DELETE /:id | Panel Pedidos, Mis compras, detalle, crear desde carrito, avanzar estado y cancelar |
| pagos | GET —, GET /:id, GET /orden/:ordenId, POST — | Panel Pagos, detalle, comprobante del cliente y pago simulado |
| historial | GET —, GET /:usuarioId, GET /:usuarioId/:ordenId | Historial general, historial del cliente y detalle de compra |
| contacto | GET —, GET /:id, POST —, PATCH /:id, DELETE /:id | Panel Mensajes, detalle, enviar desde Contacto, cambiar estado y eliminar |
| notificaciones | GET —, GET /usuario/:usuarioId, GET /:id, POST —, PATCH /:id/leida, DELETE /:id | Panel, bandeja del cliente, detalle, crear aviso, marcar leída y eliminar |
| admin | GET /estadisticas, GET /inventario-bajo, GET /ultimas-ordenes | Administración → Resumen |

## 7. Cómo está organizado

- Los siete HTML son las pantallas. Cada una carga su propio módulo desde `js/`.
- `js/api.js` concentra la URL del backend, las llamadas con `fetch` y el envío del JWT. La sesión vive en `sessionStorage` de la pestaña.
- `js/ui.js` reúne ayudas compartidas para formularios, mensajes y detalles. Los demás JS corresponden a tienda, cuenta, carrito, pedidos, contacto y gestión.
- `css/bootstrap.min.css` incluye Bootstrap 5.3.3. `css/estilos.css` define los estilos propios. La portada, el logotipo y las ilustraciones provienen del frontend de referencia. La foto opcional de teclado está en `img/teclado.jpg` ([imagen de Unsplash](https://images.unsplash.com/photo-1595225476474-87563907a212)).

## Si algo no coincide

| Síntoma | Qué revisar |
|---|---|
| La API no inicia | Verificá que MongoDB esté encendido, que la URI apunte a la base correcta y que la clave JWT tenga al menos 32 caracteres. |
| Catálogo vacío | En una base nueva, creá una categoría y un producto activo desde el panel. La tienda muestra lo que devuelve el backend. |
| Error de conexión | Abrí la ruta principal del backend y compará su puerto con `API_URL`. Abrí el frontend desde el servidor HTTP. |
| No aparece Administración | Verificá el rol en la misma base del backend y volvé a iniciar sesión. |
| No aparece Pagar | Confirmá el pedido desde el panel y recargá Mis compras. El backend solo acepta el total exacto de una orden confirmada. |
| El servidor rechaza una operación | Leé el mensaje que muestra la pantalla y la respuesta en Network. Por ejemplo, intentá descontar más unidades que las disponibles y comprobá que el stock se conserva. |

**Alcance del control de acceso.** El backend verifica el JWT para perfil, rutas protegidas de usuarios y resumen administrativo. Varias rutas de catálogo, ventas y comunicación aceptan peticiones sin verificar el rol en el servidor. Ocultar el panel en el frontend organiza la práctica. Para publicar la tienda con datos reales, esas autorizaciones también tendrían que aplicarse en el backend.

## Verificación realizada

Se ejecutaron el backend original y MongoDB en una base aislada. Se recorrieron las pantallas con Chromium, usando cuentas separadas de cliente y administrador. El recorrido obtuvo respuestas HTTP exitosas para las 64 combinaciones de método y ruta, incluidas las operaciones de creación, edición, eliminación, confirmación y pago. Los registros de prueba quedan fuera de la entrega.
