    // Colección de talleres iniciales en memoria
    const talleres = [
    {
        id: 1,
        titulo: "Introducción a Docker",
        categoria: "sistemas",
        plazas: 20,
        nivel: "inicial"
    },
    {
        id: 2,
        titulo: "Desarrollo de APIs con Node y Express",
        categoria: "web",
        plazas: 15,
        nivel: "intermedio"
    },
    {
        id: 3,
        titulo: "Arquitectura de Microservicios",
        categoria: "web",
        plazas: 2,
        nivel: "avanzado"
    }
    ];

    // Colección de inscripciones iniciales en memoria
    const inscripciones = [
    {
        id: 1,
        tallerId: 1,
        nombre: "Curro Ximénez",
        email: "currox@example.com"
    },
    {
        id: 2,
        tallerId: 2,
        nombre: "Ana López",
        email: "ana@example.com"
    },
    {
        id: 3,
        tallerId: 3,
        nombre: "Luis Pérez",
        email: "luis@example.com"
    }
    ];

    module.exports = { talleres, inscripciones };