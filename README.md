# Práctica de Recuperación UD1 - Sistema de inscripción a talleres y actividades
Conversación usada como apoyo para consultar dudas durante la realización de la práctica:

- [Chat de apoyo TAMBIEN PARA LA AMPLIACIÓN QUE SIRVE PARA LA RECUPERACIÓN : https://gemini.google.com/app/1f25dcbf45e826c7

Este proyecto es la práctica de recuperación de la Unidad Didáctica 1 de Desarrollo Web en Entorno Servidor. Es una aplicación web hecha con **Node.js**, **Express** y el motor de plantillas **EJS** para consultar los talleres de unas jornadas tecnológicas e inscribirse en ellos.

Como en esta unidad todavía no usamos bases de datos, la información se guarda en memoria en dos arrays (`talleres` e `inscripciones`) definidos en `data/datos.js`, con tres elementos cada uno que se cargan al arrancar el servidor. Mientras el servidor está encendido se pueden añadir inscripciones y las plazas se van restando; si se reinicia Node.js, vuelven los datos iniciales.

## Enlace al chat de apoyo con IA


---

## Instalación y arranque

Hace falta tener instalado **Node.js**. Desde la carpeta del proyecto:

```bash
npm install     # instala express y ejs
npm start       # arranca el servidor (node app.js)
```

El servidor queda escuchando en `http://localhost:3000`. La raíz `/` redirige a `/talleres`.

## Estructura del proyecto

```
app.js                  Servidor Express: middlewares y rutas
data/datos.js           Colecciones en memoria (talleres e inscripciones)
utilidades/talleres.js  Funciones de lógica (no dependen de req ni de res)
views/talleres.ejs      Listado con formulario de filtros
views/detalle.ejs       Ficha de un taller
views/inscripcion.ejs   Formulario de inscripción
views/404.ejs           Página de recurso no encontrado
public/estilos.css      Estilos comunes
```

### Datos iniciales

| id | Taller | Categoría | Nivel | Plazas | Inscritos | Estado inicial |
|----|--------|-----------|-------|--------|-----------|----------------|
| 1 | Introducción a Docker | sistemas | inicial | 20 | 1 | 19 plazas disponibles |
| 2 | Desarrollo de APIs con Node y Express | web | intermedio | 15 | 1 | 14 plazas disponibles |
| 3 | Arquitectura de Microservicios | web | avanzado | 2 | 1 | Última plaza disponible |

---

## Parte de JavaScript

Las funciones de lógica están en `utilidades/talleres.js` y se importan en `app.js` con `require`. Ninguna recibe `req` ni `res`, solo datos normales:

- **`obtenerPlazasRestantes(taller, inscripciones)`**: recorre las inscripciones con un bucle `for...of`, cuenta las del taller y devuelve `plazas - númeroDeInscripciones`.
- **`estaInscrito(tallerId, email, inscripciones)`**: usa `some()` para saber si ya hay una inscripción con ese correo en ese taller (sin distinguir mayúsculas).
- **`validarInscripcion(datos)`**: comprueba el nombre (entre 3 y 100 caracteres) y el correo (formato válido, máximo 254). Devuelve `{ errores, datos }`, donde `datos` solo contiene los campos correctos.
- **Funciones auxiliares**: `obtenerEstadoPlazas()` devuelve el texto del estado, `textoSeguro()` convierte cualquier valor recibido en un texto limpio (o `""` si no es un string) y `convertirId()` convierte el `:id` de la URL en número o devuelve `null` si no es un número entero válido.

Dónde se usa cada elemento pedido:

| Elemento | Dónde |
|----------|-------|
| `find()` | `app.js`, `buscarTaller()`: busca el taller por id |
| `filter()` | `app.js`, ruta `/talleres`: filtros de categoría, nivel y disponibles |
| `map()` | `app.js`: añade plazas restantes y estado a cada taller; calcula el siguiente id de inscripción |
| `some()` | `estaInscrito()` |
| Bucles | `for...of` en `obtenerPlazasRestantes()`; `forEach` en las vistas |
| Conversiones | `Number()` en `convertirId()`, `String()` en el middleware de registro, `toLowerCase()`/`trim()` |
| Condicionales | Validaciones, filtros, estados de la ficha |

El middleware **`express.urlencoded({ extended: true })`** permite leer en `req.body` los datos enviados por el formulario.

---

## Funcionalidades y ejemplos de llamada

Cada llamada con `curl` tiene su equivalente en HTML dentro de la propia aplicación.

### 1. Listado de talleres con filtros

`GET /talleres` muestra todos los talleres. Con `map()` se añade a cada uno sus plazas restantes y su estado, y después se aplica `filter()` por cada parámetro que venga en la URL. Los parámetros se pasan por `textoSeguro()` porque vienen del navegador y no son fiables. Los filtros se pueden combinar.

```bash
curl http://localhost:3000/talleres
curl "http://localhost:3000/talleres?categoria=web"
curl "http://localhost:3000/talleres?nivel=avanzado"
curl "http://localhost:3000/talleres?disponibles=true"
curl "http://localhost:3000/talleres?categoria=web&disponibles=true"
curl "http://localhost:3000/talleres?categoria=web&nivel=avanzado&disponibles=true"
```

- `categoria=web` devuelve los talleres 2 y 3.
- `nivel=avanzado` devuelve el taller 3.
- `disponibles=true` oculta los talleres completos.

**Equivalente HTML:** en `http://localhost:3000/talleres` hay un formulario `GET` con dos desplegables (categoría y nivel), una casilla "Solo disponibles" y el botón **Filtrar**, que generan exactamente esas URLs. El botón **Limpiar** quita los filtros.

### 2. Ficha de un taller y estados

`GET /talleres/:id` busca el taller con `find()`, calcula sus plazas restantes y muestra un contenido distinto según el estado:

- **"N plazas disponibles"**: mensaje normal y botón de inscripción.
- **"Última plaza disponible"**: aviso de que solo queda una plaza y botón de inscripción.
- **"Completo"**: mensaje de que no admite más inscripciones y sin botón.

```bash
curl http://localhost:3000/talleres/1   # "19 plazas disponibles"
curl http://localhost:3000/talleres/3   # "Última plaza disponible"
```

Para ver el estado **Completo**, basta con inscribir a una persona en el taller 3 (ver apartado 4) y volver a pedir la ficha:

```bash
curl --data-urlencode "nombre=Marta Ruiz" --data-urlencode "email=marta@example.com" http://localhost:3000/talleres/3/inscripcion
curl http://localhost:3000/talleres/3   # "Completo"
```

**Equivalente HTML:** botón **Ver ficha** de cada taller en el listado.

### 3. Formulario de inscripción

`GET /talleres/:id/inscripcion` muestra el formulario (nombre y correo) del taller.

```bash
curl http://localhost:3000/talleres/1/inscripcion
```

**Equivalente HTML:** botón **Inscribirse en este taller** de la ficha.

### 4. Alta de inscripción correcta (patrón PRG)

`POST /talleres/:id/inscripcion` recibe los datos en el body. Si todo es correcto, guarda la inscripción con los datos limpios y responde con una **redirección 302** a la ficha (`/talleres/:id?inscrito=ok`), que muestra el mensaje de éxito. Así, si se recarga la página, el navegador no vuelve a enviar el formulario (Post/Redirect/Get).

```bash
curl -i --data-urlencode "nombre=María García" --data-urlencode "email=maria@example.com" http://localhost:3000/talleres/1/inscripcion
```

Respuesta esperada:

```
HTTP/1.1 302 Found
Location: /talleres/1?inscrito=ok
```

Para seguir la redirección y ver la ficha con el mensaje de éxito, se añade `-L` (con otro correo, porque el anterior ya está inscrito):

```bash
curl -L --data-urlencode "nombre=Pedro Gil" --data-urlencode "email=pedro@example.com" http://localhost:3000/talleres/1/inscripcion
```

**Equivalente HTML:** rellenar el formulario y pulsar **Confirmar inscripción**.

### 5. Validaciones del servidor

El servidor comprueba, en este orden:

1. **Que existe el taller.** Si no existe, devuelve 404.
2. **Que nombre y correo son válidos**, con `validarInscripcion()`.
3. **Que quedan plazas**, con `obtenerPlazasRestantes()`.
4. **Que el correo no está ya inscrito** en ese taller, con `estaInscrito()`.
5. **Que un id manipulado no provoca errores.** `convertirId()` solo acepta dígitos, así que `abc`, `1.5`, `-1` o `1e0` dan 404 sin romper nada.
6. **Que todos los datos del navegador se tratan como no fiables.** Todo lo que llega en `req.body`, `req.query` y `req.params` pasa por `textoSeguro()`. Si alguien envía un array u objeto (`nombre[]=x`), se trata como vacío y se muestra el error de validación en lugar de provocar un error 500. Además, EJS escapa la salida con `<%= %>`, así que no se puede inyectar HTML.

Si hay errores, se responde con **código 400** y se vuelve a mostrar el formulario con la lista de errores, **conservando solo los campos correctos**.

```bash
# Nombre corto y correo con formato incorrecto -> los dos errores, ningún campo conservado
curl --data-urlencode "nombre=Al" --data-urlencode "email=correo-malo" http://localhost:3000/talleres/1/inscripcion

# Nombre correcto y correo incorrecto -> se conserva el nombre en el formulario
curl --data-urlencode "nombre=Juan Pérez" --data-urlencode "email=correo-malo" http://localhost:3000/talleres/1/inscripcion

# Correo ya inscrito en el taller 1 -> "Este correo electrónico ya está inscrito en este taller."
curl --data-urlencode "nombre=Curro Ximénez" --data-urlencode "email=currox@example.com" http://localhost:3000/talleres/1/inscripcion

# Taller completo (después de llenar el taller 3, ver apartado 2) -> "No quedan plazas disponibles para este taller."
curl --data-urlencode "nombre=Laura Sanz" --data-urlencode "email=laura@example.com" http://localhost:3000/talleres/3/inscripcion

# Taller inexistente -> 404
curl -i --data-urlencode "nombre=Juan Pérez" --data-urlencode "email=juan@example.com" http://localhost:3000/talleres/99/inscripcion

# Identificador manipulado -> 404 sin errores en el servidor
curl -i http://localhost:3000/talleres/abc
curl -i http://localhost:3000/talleres/1.5/inscripcion

# Datos manipulados (arrays/objetos en lugar de texto) -> 400 con errores de validación, no 500
curl -i -d "nombre[]=Juan&email[a]=x" http://localhost:3000/talleres/1/inscripcion
```

**Equivalente HTML:** enviar el formulario de inscripción con un nombre corto, un correo mal escrito o un correo ya inscrito, o intentar inscribirse en el taller 3 cuando está completo. Los ids manipulados se prueban escribiendo la URL (por ejemplo `http://localhost:3000/talleres/abc`) en el navegador.

---

## Addendum

### Middleware de registro de peticiones

En `app.js` hay un middleware propio (`app.use((req, res, next) => { ... })`) que, para cada petición, muestra por consola la fecha y hora (`dd/mm/aaaa hh:mm:ss`), el método HTTP (`req.method`) y la URL solicitada (`req.originalUrl`). Después llama a `next()` para que la petición siga su camino.

Está colocado **el primero de la cadena de middleware**, antes de `express.static`, de `urlencoded` y de las rutas. Así se ejecuta para **todas** las peticiones: páginas, archivos estáticos (CSS) y rutas inexistentes. Si estuviera después de `express.static`, las peticiones del CSS no se registrarían.

Para comprobarlo, se arranca el servidor y se hacen algunas peticiones:

```bash
curl http://localhost:3000/talleres
curl http://localhost:3000/talleres/3
curl --data-urlencode "nombre=Ana Gómez" --data-urlencode "email=anagomez@example.com" http://localhost:3000/talleres/3/inscripcion
```

En la consola del servidor aparece:

```
[21/11/2026 18:34:21] GET /talleres
[21/11/2026 18:34:28] GET /talleres/3
[21/11/2026 18:34:40] POST /talleres/3/inscripcion
```

**Equivalente HTML:** navegar por la aplicación en el navegador; cada página (y su CSS) aparece en la consola.

### Tratamiento global de rutas inexistentes

Al final de `app.js`, **después de todas las rutas**, hay un `app.use((req, res) => { ... })` sin ruta. Express recorre las rutas en orden, así que solo llega a este middleware una petición que no ha coincidido con ninguna ruta anterior. Responde con `res.status(404)` y renderiza la vista **`views/404.ejs`**. Esa vista usa la misma cabecera y estilos que el resto de la aplicación, muestra la URL que no existe y tiene un botón para volver al listado. No devuelve texto plano.

La misma vista se usa también cuando se pide un taller que no existe (`/talleres/99`).

```bash
curl -i http://localhost:3000/ruta-inexistente
```

Resultado esperado: **debe obtenerse un código HTTP 404**, con una respuesta como:

```
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
...

<!DOCTYPE html>
...
<h1>Error 404 - Recurso no encontrado</h1>
<p>La ruta &#34;/ruta-inexistente&#34; no existe en la aplicación.</p>
...
```

**Equivalente HTML:** escribir en el navegador cualquier URL que no exista, por ejemplo `http://localhost:3000/ruta-inexistente`.
