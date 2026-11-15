    const express = require("express");
    const path = require("path");
    const { talleres, inscripciones } = require("./data/datos");
    const {
    obtenerPlazasRestantes,
    estaInscrito,
    validarInscripcion,
    obtenerEstadoPlazas
} = require("./utilidades/talleres");
    const app = express();
    const PORT = 3000;

    // Configuración de EJS y carpeta de archivos estáticos
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "public")));

    // Middleware obligatorio para leer datos de formularios (POST)
    app.use(express.urlencoded({ extended: true }));

    // Middleware propio de registro de peticiones (Addendum)
    app.use((req, res, next) => {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const anio = ahora.getFullYear();
    const hora = ahora.toTimeString().split(" ")[0];

    console.log(`[${dia}/${mes}/${anio} ${hora}] ${req.method} ${req.originalUrl}`);
    next(); // Pasa el control a la siguiente ruta
    });

    // Redirección de la raíz al listado de talleres
    app.get("/", (req, res) => {
    res.redirect("/talleres");
    });

    // Listado de talleres con filtros (categoria, nivel, disponibles)
    app.get("/talleres", (req, res) => {
    const { categoria, nivel, disponibles } = req.query;

    // Añadimos a cada taller sus plazas restantes y su estado usando map()
    let listaTalleres = talleres.map(taller => {
        const restantes = obtenerPlazasRestantes(taller, inscripciones);
        return {
        ...taller,
        plazasRestantes: restantes,
        estado: obtenerEstadoPlazas(restantes)
        };
    });

    // Aplicamos filtros si vienen en la URL
    if (categoria) {
        listaTalleres = listaTalleres.filter(t => t.categoria === categoria);
    }
    if (nivel) {
        listaTalleres = listaTalleres.filter(t => t.nivel === nivel);
    }
    if (disponibles === "true") {
        listaTalleres = listaTalleres.filter(t => t.plazasRestantes > 0);
    }

    res.render("talleres", {
        talleres: listaTalleres,
        filtros: { categoria: categoria || "", nivel: nivel || "", disponibles: disponibles || "" }
    });
    });

    // Ficha detalle de un taller
    app.get("/talleres/:id", (req, res) => {
    // Convertimos el parámetro a número y evitamos errores si ponen texto
    const id = Number(req.params.id);
    const taller = talleres.find(t => t.id === id);

    if (!taller) {
        return res.status(404).render("404", { mensaje: "El taller solicitado no existe." });
    }

    const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
    const estado = obtenerEstadoPlazas(plazasRestantes);

    // Pasamos un aviso si viene de una inscripción correcta (PRG)
    const exito = req.query.inscrito === "ok";

    res.render("detalle", { taller, plazasRestantes, estado, exito });
    });

    // Mostrar formulario de inscripción
    app.get("/talleres/:id/inscripcion", (req, res) => {
    const id = Number(req.params.id);
    const taller = talleres.find(t => t.id === id);

    if (!taller) {
        return res.status(404).render("404", { mensaje: "El taller solicitado no existe." });
    }

    const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);

    res.render("inscripcion", {
        taller,
        plazasRestantes,
        errores: [],
        datos: { nombre: "", email: "" }
    });
    });

    // Procesar formulario de inscripción
    app.post("/talleres/:id/inscripcion", (req, res) => {
    const id = Number(req.params.id);
    const taller = talleres.find(t => t.id === id);

    if (!taller) {
        return res.status(404).render("404", { mensaje: "El taller solicitado no existe." });
    }

    const plazasRestantes = obtenerPlazasRestantes(taller, inscripciones);
    const errores = validarInscripcion(req.body);

    // Comprobamos si quedan plazas
    if (plazasRestantes <= 0) {
        errores.push("No quedan plazas disponibles para este taller.");
    }

    // Comprobamos si el correo ya estaba inscrito
    if (req.body.email && estaInscrito(id, req.body.email, inscripciones)) {
        errores.push("Este correo electrónico ya está inscrito en este taller.");
    }

    // Si hay errores, volvemos a pintar el formulario conservando los datos escritos
    if (errores.length > 0) {
        return res.status(400).render("inscripcion", {
        taller,
        plazasRestantes,
        errores,
        datos: {
            nombre: req.body.nombre || "",
            email: req.body.email || ""
        }
        });
    }

    // Guardamos la nueva inscripción (sanitizando espacios)
    const nuevaInscripcion = {
        id: inscripciones.length + 1,
        tallerId: id,
        nombre: req.body.nombre.trim(),
        email: req.body.email.trim().toLowerCase()
    };
    inscripciones.push(nuevaInscripcion);

    // Patrón PRG (Post-Redirect-Get) para evitar reenvíos al refrescar
    res.redirect(`/talleres/${id}?inscrito=ok`);
    });

    // Tratamiento global de rutas inexistentes (siempre al final)
    app.use((req, res) => {
    res.status(404).render("404", {
        mensaje: `La ruta "${req.originalUrl}" no existe en la aplicación.`
    });
    });

    app.listen(PORT, () => {
    console.log(`Servidor arrancado en http://localhost:${PORT}`);
    });