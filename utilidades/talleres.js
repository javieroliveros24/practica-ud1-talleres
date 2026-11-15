    // Calcula las plazas que quedan libres en un taller
    function obtenerPlazasRestantes(taller, inscripciones) {
    // Filtramos las inscripciones que pertenecen a este taller
    const inscritosTaller = inscripciones.filter(ins => ins.tallerId === taller.id);
    return taller.plazas - inscritosTaller.length;
    }

    // Comprueba si un correo ya está apuntado a un taller concreto
    function estaInscrito(tallerId, email, inscripciones) {
    const emailLimpio = email.trim().toLowerCase();
    // some() devuelve true en cuanto encuentra una coincidencia
    return inscripciones.some(
        ins => ins.tallerId === tallerId && ins.email.toLowerCase() === emailLimpio
    );
    }

    // Valida los datos del formulario y devuelve un array de errores
    function validarInscripcion(datos) {
    const errores = [];
    const nombre = datos.nombre ? datos.nombre.trim() : "";
    const email = datos.email ? datos.email.trim() : "";

    if (nombre.length < 3) {
        errores.push("El nombre debe tener al menos 3 caracteres.");
    }

    // Comprobación básica de formato de correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
        errores.push("El correo electrónico no tiene un formato válido.");
    }

    return errores;
    }

    // Devuelve el texto de estado según las plazas disponibles
    function obtenerEstadoPlazas(plazasRestantes) {
    if (plazasRestantes <= 0) {
        return "Completo";
    } else if (plazasRestantes === 1) {
        return "Última plaza disponible";
    } else {
        return `${plazasRestantes} plazas disponibles`;
    }
    }

    module.exports = {
    obtenerPlazasRestantes,
    estaInscrito,
    validarInscripcion,
    obtenerEstadoPlazas
    };