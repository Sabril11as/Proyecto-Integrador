# API REST - Sistema de Tienda en Línea

## 1. Descripción

API REST desarrollada con Node.js, Express, MongoDB y Mongoose para administrar las funcionalidades de una tienda en línea.

El sistema permite gestionar usuarios, productos, categorías, inventario, reseñas, carritos de compras, órdenes, pagos simulados, historial de compras, mensajes de contacto y notificaciones.

También incluye autenticación mediante JWT y un panel de administración.

## 2. Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript
- JWT (JSON Web Token)
- bcryptjs
- dotenv
- cors
- Postman o Thunder Client

## 3. Requisitos previos

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js y npm.
- MongoDB local o acceso a MongoDB Atlas.
- Visual Studio Code u otro editor.
- Postman o Thunder Client para probar los endpoints.

## 4. Instalación del proyecto

### Paso 1. Obtener el proyecto

Clonar el repositorio:

```bash
git clone https://github.com/Sabril11as/Proyecto-Integrador.git
```

Ingresar a la carpeta del proyecto:

```bash
cd Proyecto-Integrador
```

### Paso 2. Instalar dependencias

Ejecutar el siguiente comando:

```bash
npm install
```

Si las dependencias no están configuradas en el proyecto, instalarlas con:

```bash
npm install express mongoose dotenv cors bcryptjs jsonwebtoken
```

### Paso 3. Configurar las variables de entorno

Crear un archivo `.env` en la raíz del proyecto.

Agregar las siguientes variables:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/profeMario
JWT_SECRET=CLAVE_SECRETA_GENERADA
```

Descripción:

- PORT: puerto donde se ejecutará la API.
- MONGO_URI: dirección de conexión a MongoDB.
- JWT_SECRET: clave utilizada para firmar los tokens de autenticación.

Para generar una clave JWT segura se puede ejecutar:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiar el resultado en `JWT_SECRET`.

Si se utiliza MongoDB Atlas, reemplazar `MONGO_URI` por la cadena de conexión correspondiente.

El archivo `.env` no debe incluirse en el repositorio de Git.

### Paso 4. Ejecutar MongoDB

Verificar que el servicio de MongoDB esté funcionando y que la cadena de conexión sea correcta.

La base de datos utilizada en este proyecto se llama:

```text
profeMario
```

### Paso 5. Iniciar el servidor

Ejecutar:

```bash
node server.js
```

También se puede utilizar:

```bash
npm start
```

Siempre que el archivo `package.json` tenga configurado:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

Si todo funciona correctamente, la consola mostrará mensajes similares a:

```text
MongoDB connected successfully
Server is running on http://localhost:5001
```

### Paso 6. Verificar el servidor

Abrir el navegador o Postman y realizar una petición GET a:

```http
http://localhost:5001/
```

Respuesta esperada:

```json
{
  "message": "Welcome to the API"
}
```

## 5. Documentación de endpoints

La URL base de la API es:

```text
http://localhost:5001
```

Todos los endpoints reciben y devuelven información en formato JSON.

Para las peticiones POST y PATCH se debe configurar el encabezado:

```text
Content-Type: application/json
```

Los parámetros que comienzan con `:` representan identificadores que deben reemplazarse por valores reales de MongoDB.

Por ejemplo:

```text
/api/usuarios/:id
```

Debe utilizarse de esta manera:

```text
/api/usuarios/6906d123456789abcdef1234
```

Las rutas protegidas requieren un token JWT mediante el encabezado:

```text
Authorization: Bearer TOKEN_JWT
```

### 5.1. Usuarios

Ruta base:

```text
/api/usuarios
```

**GET /api/usuarios**

Obtiene todos los usuarios registrados.

- Parámetros: ninguno.
- Body: ninguno.
- Autenticación: requiere administrador.

**GET /api/usuarios/:id**

Obtiene la información de un usuario mediante su ID.

- Parámetros: id del usuario.
- Body: ninguno.
- Autenticación: propietario del usuario o administrador.

**POST /api/usuarios**

Registra un nuevo usuario.

Body:

```json
{
  "nombre": "Santiago",
  "correo": "santiago@gmail.com",
  "telefono": "88888888",
  "password": "PruebaSegura2026!"
}
```

**PATCH /api/usuarios/:id**

Actualiza los datos de un usuario.

- Parámetros: id del usuario.
- Autenticación: propietario o administrador.

Body:

```json
{
  "nombre": "Santiago Actualizado",
  "telefono": "87777777"
}
```

Solamente permite actualizar nombre, correo y teléfono.

**DELETE /api/usuarios/:id**

Elimina un usuario.

- Parámetros: id del usuario.
- Body: ninguno.
- Autenticación: requiere administrador.

### 5.2. Perfil

Ruta base:

```text
/api/perfil
```

**GET /api/perfil/:id**

Consulta el perfil de un usuario.

- Parámetros: id del usuario.
- Body: ninguno.
- Autenticación: propietario o administrador.

**PATCH /api/perfil/:id**

Actualiza la información del perfil.

- Parámetros: id del usuario.
- Autenticación: propietario o administrador.

Body:

```json
{
  "nombre": "Santiago",
  "telefono": "88889999"
}
```

### 5.3. Categorías

Ruta base:

```text
/api/categorias
```

**GET /api/categorias**

Obtiene todas las categorías.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/categorias/:id**

Consulta una categoría mediante su ID.

- Parámetros: id de la categoría.
- Body: ninguno.

**POST /api/categorias**

Crea una categoría.

Body:

```json
{
  "nombre": "Electrónica",
  "descripcion": "Productos electrónicos"
}
```

**PATCH /api/categorias/:id**

Actualiza una categoría.

- Parámetros: id de la categoría.

Body:

```json
{
  "nombre": "Tecnología",
  "descripcion": "Computadoras y accesorios"
}
```

**DELETE /api/categorias/:id**

Elimina una categoría.

- Parámetros: id de la categoría.
- Body: ninguno.

### 5.4. Catálogo

Ruta base:

```text
/api/catalogo
```

**GET /api/catalogo**

Obtiene todos los productos.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/catalogo/:id**

Obtiene un producto mediante su ID.

- Parámetros: id del producto.
- Body: ninguno.

**POST /api/catalogo**

Registra un nuevo producto.

Body:

```json
{
  "nombre": "Laptop Lenovo",
  "descripcion": "Laptop con 16GB RAM",
  "precio": 450000,
  "stock": 10,
  "categoria": "ID_CATEGORIA",
  "imagen": "https://ejemplo.com/laptop.jpg",
  "destacado": true
}
```

El campo `categoria` debe contener el ID de una categoría existente.

**PATCH /api/catalogo/:id**

Actualiza un producto.

- Parámetros: id del producto.

Body:

```json
{
  "nombre": "Laptop Lenovo ThinkPad",
  "precio": 425000,
  "stock": 8
}
```

**DELETE /api/catalogo/:id**

Elimina un producto.

- Parámetros: id del producto.
- Body: ninguno.

### 5.5. Búsqueda y filtros

Ruta base:

```text
/api/busqueda-filtro
```

**GET /api/busqueda-filtro**

Busca productos utilizando filtros opcionales.

Parámetros de consulta:

- nombre: nombre del producto.
- categoria: ID de la categoría.
- precioMin: precio mínimo.
- precioMax: precio máximo.

Body: ninguno.

Ejemplos:

Buscar por nombre:

```http
GET /api/busqueda-filtro?nombre=Lenovo
```

Filtrar por precio:

```http
GET /api/busqueda-filtro?precioMin=100000&precioMax=500000
```

Buscar por categoría:

```http
GET /api/busqueda-filtro?categoria=ID_CATEGORIA
```

Combinar filtros:

```http
GET /api/busqueda-filtro?nombre=Laptop&precioMin=200000&precioMax=600000
```

### 5.6. Productos destacados

Ruta base:

```text
/api/destacados
```

**GET /api/destacados**

Obtiene todos los productos activos marcados como destacados.

- Parámetros: ninguno.
- Body: ninguno.

Para marcar un producto como destacado se utiliza:

```http
PATCH /api/catalogo/:id
```

Body:

```json
{
  "destacado": true
}
```

Para quitarlo de destacados:

```json
{
  "destacado": false
}
```

### 5.7. Inventario

Ruta base:

```text
/api/inventario
```

**GET /api/inventario**

Obtiene el inventario completo.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/inventario/:id**

Consulta las existencias de un producto.

- Parámetros: id del producto.
- Body: ninguno.

**PATCH /api/inventario/:id/agregar**

Agrega unidades al inventario.

- Parámetros: id del producto.

Body:

```json
{
  "cantidad": 5
}
```

**PATCH /api/inventario/:id/descontar**

Descuenta unidades del inventario.

- Parámetros: id del producto.

Body:

```json
{
  "cantidad": 3
}
```

La cantidad debe ser un número entero mayor que cero.

No se permite descontar más unidades de las disponibles.

### 5.8. Reseñas

Ruta base:

```text
/api/resenas
```

**GET /api/resenas**

Obtiene todas las reseñas.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/resenas/:id**

Consulta una reseña por ID.

- Parámetros: id de la reseña.
- Body: ninguno.

**POST /api/resenas**

Crea una reseña de un producto.

Body:

```json
{
  "usuario": "ID_USUARIO",
  "producto": "ID_PRODUCTO",
  "calificacion": 5,
  "comentario": "Excelente producto"
}
```

La calificación debe ser un número entero entre 1 y 5.

**PATCH /api/resenas/:id**

Actualiza una reseña.

- Parámetros: id de la reseña.

Body:

```json
{
  "calificacion": 4,
  "comentario": "Buen producto"
}
```

**DELETE /api/resenas/:id**

Elimina una reseña.

- Parámetros: id de la reseña.
- Body: ninguno.

### 5.9. Carrito de compras

Ruta base:

```text
/api/carrito
```

**GET /api/carrito/:usuarioId**

Obtiene el carrito de un usuario y calcula su total.

- Parámetros: usuarioId.
- Body: ninguno.

**POST /api/carrito/:usuarioId/productos**

Agrega un producto al carrito.

- Parámetros: usuarioId.

Body:

```json
{
  "producto": "ID_PRODUCTO",
  "cantidad": 2
}
```

**PATCH /api/carrito/:usuarioId/productos/:productoId**

Actualiza la cantidad de un producto.

- Parámetros: usuarioId y productoId.

Body:

```json
{
  "cantidad": 3
}
```

**DELETE /api/carrito/:usuarioId/productos/:productoId**

Elimina un producto del carrito.

- Parámetros: usuarioId y productoId.
- Body: ninguno.

**DELETE /api/carrito/:usuarioId**

Vacía completamente el carrito.

- Parámetros: usuarioId.
- Body: ninguno.

### 5.10. Órdenes

Ruta base:

```text
/api/ordenes
```

**GET /api/ordenes**

Obtiene todas las órdenes registradas.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/ordenes/:id**

Consulta una orden mediante su ID.

- Parámetros: id de la orden.
- Body: ninguno.

**GET /api/ordenes/usuario/:usuarioId**

Obtiene las órdenes de un usuario.

- Parámetros: usuarioId.
- Body: ninguno.

**POST /api/ordenes**

Crea una orden utilizando los productos del carrito del usuario.

Body:

```json
{
  "usuario": "ID_USUARIO"
}
```

El sistema calcula el total, descuenta el inventario y vacía el carrito.

**PATCH /api/ordenes/:id**

Actualiza el estado de una orden.

- Parámetros: id de la orden.

Body:

```json
{
  "estado": "confirmada"
}
```

Estados utilizados:

- pendiente
- confirmada
- pagada
- enviada
- entregada
- cancelada

Los cambios de estado están restringidos según el estado actual de la orden. El estado `pagada` se asigna mediante el módulo de pagos.

**DELETE /api/ordenes/:id**

Cancela una orden pendiente o confirmada.

- Parámetros: id de la orden.
- Body: ninguno.

La orden no se elimina físicamente. Su estado cambia a `cancelada` y el sistema intenta devolver las unidades al inventario.

### 5.11. Pagos

Ruta base:

```text
/api/pagos
```

**GET /api/pagos**

Obtiene todos los pagos registrados.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/pagos/:id**

Consulta un pago por ID.

- Parámetros: id del pago.
- Body: ninguno.

**GET /api/pagos/orden/:ordenId**

Consulta el pago asociado a una orden.

- Parámetros: ordenId.
- Body: ninguno.

**POST /api/pagos**

Registra un pago simulado.

Body:

```json
{
  "orden": "ID_ORDEN",
  "monto": 900000,
  "metodo": "sinpe"
}
```

Métodos permitidos:

- sinpe
- tarjeta
- efectivo

El monto debe coincidir con el total de la orden.

Solamente se permiten pagos sobre órdenes confirmadas.

Los pagos de este proyecto son simulados y no realizan transacciones bancarias reales.

### 5.12. Historial

Ruta base:

```text
/api/historial
```

**GET /api/historial**

Obtiene el historial completo de órdenes.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/historial/:usuarioId**

Obtiene el historial de compras de un usuario.

- Parámetros: usuarioId.
- Body: ninguno.

**GET /api/historial/:usuarioId/:ordenId**

Obtiene el detalle de una compra específica.

- Parámetros: usuarioId y ordenId.
- Body: ninguno.

El historial utiliza las órdenes almacenadas en MongoDB.

### 5.13. Contacto

Ruta base:

```text
/api/contacto
```

**GET /api/contacto**

Obtiene todos los mensajes de contacto.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/contacto/:id**

Consulta un mensaje por ID.

- Parámetros: id del mensaje.
- Body: ninguno.

**POST /api/contacto**

Registra un mensaje de contacto.

Body:

```json
{
  "nombre": "Santiago",
  "correo": "santiago@gmail.com",
  "asunto": "Consulta sobre producto",
  "mensaje": "Quisiera saber si tienen disponible la Laptop Lenovo."
}
```

**PATCH /api/contacto/:id**

Actualiza el estado de un mensaje.

- Parámetros: id del mensaje.

Body:

```json
{
  "estado": "respondido"
}
```

Estados permitidos:

- pendiente
- respondido

**DELETE /api/contacto/:id**

Elimina un mensaje.

- Parámetros: id del mensaje.
- Body: ninguno.

### 5.14. Notificaciones

Ruta base:

```text
/api/notificaciones
```

**GET /api/notificaciones**

Obtiene todas las notificaciones.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/notificaciones/usuario/:usuarioId**

Obtiene las notificaciones de un usuario.

- Parámetros: usuarioId.
- Body: ninguno.

**GET /api/notificaciones/:id**

Consulta una notificación por ID.

- Parámetros: id de la notificación.
- Body: ninguno.

**POST /api/notificaciones**

Crea una notificación.

Body:

```json
{
  "usuario": "ID_USUARIO",
  "titulo": "Compra realizada",
  "mensaje": "Tu compra fue registrada correctamente.",
  "tipo": "compra"
}
```

Tipos permitidos:

- general
- compra
- pedido

**PATCH /api/notificaciones/:id/leida**

Marca una notificación como leída.

- Parámetros: id de la notificación.
- Body: ninguno.

**DELETE /api/notificaciones/:id**

Elimina una notificación.

- Parámetros: id de la notificación.
- Body: ninguno.

### 5.15. Autenticación

Ruta base:

```text
/api/autenticacion
```

**POST /api/autenticacion/registro**

Registra un nuevo usuario con contraseña protegida mediante hash.

Body:

```json
{
  "nombre": "Santiago",
  "correo": "santiago@gmail.com",
  "telefono": "88888888",
  "password": "PruebaSegura2026!"
}
```

La contraseña debe tener al menos 8 caracteres.

**POST /api/autenticacion/login**

Permite iniciar sesión.

Body:

```json
{
  "correo": "santiago@gmail.com",
  "password": "PruebaSegura2026!"
}
```

Si las credenciales son correctas, devuelve un token JWT.

**GET /api/autenticacion/perfil**

Obtiene los datos del usuario autenticado.

- Parámetros: ninguno.
- Body: ninguno.
- Autenticación: requiere JWT.

Encabezado:

```text
Authorization: Bearer TOKEN_JWT
```

### 5.16. Panel de Administración

Ruta base:

```text
/api/admin
```

Todos los endpoints del panel requieren un JWT válido y un usuario con rol `admin`.

**GET /api/admin/estadisticas**

Obtiene las estadísticas generales de la tienda.

- Parámetros: ninguno.
- Body: ninguno.

Incluye:

- Total de usuarios.
- Total de productos.
- Total de órdenes.
- Cantidad de productos con stock bajo.
- Cantidad de pagos simulados aprobados.
- Monto total de pagos simulados aprobados.

**GET /api/admin/inventario-bajo**

Obtiene los productos activos con cinco unidades o menos disponibles.

- Parámetros: ninguno.
- Body: ninguno.

**GET /api/admin/ultimas-ordenes**

Obtiene las últimas cinco órdenes registradas.

- Parámetros: ninguno.
- Body: ninguno.

## 6. Códigos de respuesta HTTP

La API utiliza los siguientes códigos de estado:

| Código | Significado                            |
| ------ | -------------------------------------- |
| 200    | Solicitud procesada correctamente      |
| 201    | Recurso creado correctamente           |
| 400    | Datos incorrectos o validación fallida |
| 401    | Usuario no autenticado                 |
| 403    | Usuario sin permisos                   |
| 404    | Recurso no encontrado                  |
| 500    | Error interno del servidor             |

Las respuestas utilizan formato JSON.

Ejemplo de respuesta exitosa:

```json
{
  "mensaje": "Usuario creado correctamente"
}
```

Ejemplo de respuesta de error:

```json
{
  "mensaje": "Usuario no encontrado"
}
```

## 7. Pruebas de la API

Las pruebas se pueden realizar utilizando Postman o Thunder Client.

Procedimiento:

1. Ejecutar MongoDB.
2. Iniciar el servidor con `node server.js`.
3. Abrir Postman o Thunder Client.
4. Seleccionar el método HTTP correspondiente.
5. Ingresar la URL del endpoint.
6. Si es necesario, configurar el Body en formato JSON.
7. Si el endpoint está protegido, agregar el token JWT.
8. Ejecutar la petición.
9. Verificar el código HTTP y la respuesta JSON.
10. Comprobar los cambios realizados en MongoDB.

Las pruebas deben contemplar tanto solicitudes correctas como casos de error.

Para las operaciones relacionadas con usuarios, productos y órdenes, se deben utilizar identificadores reales existentes en MongoDB.

## 8. Consideraciones

- El proyecto utiliza MongoDB para almacenar la información.
- Los esquemas y validaciones se administran mediante Mongoose.
- Las contraseñas del módulo de autenticación se almacenan mediante hash.
- El sistema utiliza JWT para autenticar usuarios en los endpoints protegidos.
- Los pagos son simulados.
- Los productos agregados al carrito no descuentan automáticamente el inventario.
- El inventario se descuenta al crear una orden.
- Las órdenes canceladas permanecen registradas en MongoDB.
- Las notificaciones se almacenan en la base de datos y no se envían mediante correo electrónico.
- El panel de administración requiere un usuario con rol `admin`.

Esta API fue desarrollada con fines académicos. Los módulos de usuarios, perfil y administración incluyen controles de autenticación, pero todavía es necesario agregar autorización a los demás endpoints antes de utilizar el sistema en producción.

También se recomienda implementar transacciones de MongoDB para garantizar la consistencia de las operaciones que modifican órdenes, inventario y pagos.
