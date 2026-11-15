https://gemini.google.com/app/363d6e5651601914?utm_source=app_launcher&utm_medium=owned&utm_campaign=base_all# Práctica de Recuperación UD1 - Sistema de inscripción a talleres y actividades

Este proyecto es la práctica de recuperación de la Unidad Didáctica 1 de Desarrollo Web en Entorno Servidor. Consiste en una aplicación web hecha con **Node.js**, **Express** y el motor de plantillas **EJS** para gestionar el listado y las inscripciones de unos talleres para unas jornadas tecnológicas[cite: 1, 2, 3].

Como en esta unidad todavía no trabajamos con bases de datos, toda la información se guarda en memoria usando dos arrays dentro de un archivo JavaScript que se cargan nada más arrancar el servidor. Eso significa que mientras el servidor esté encendido se pueden ir añadiendo inscripciones nuevas y las plazas se van restando en tiempo real, pero si reinicias Node.js vuelven a aparecer los datos iniciales.

## Enlace al chat de apoyo con IA
Tal como indican las normas de entrega de la práctica, dejo aquí el enlace a la conversación que he usado como apoyo para consultar dudas de sintaxis, repasar cómo funcionaban los métodos de arrays y estructurar los archivos:
- [Enlace a la conversación]([PONER_AQUI_EL_ENLACE_DEL_CHAT])

---

## Requisitos previos e instalación

Para ejecutar este proyecto en local hace falta tener instalado **Node.js**. Una vez descargado o clonado el repositorio desde GitHub, hay que abrir una terminal dentro de la carpeta del proyecto y seguir estos pasos:

1. **Instalar las dependencias** (esto lee el `package.json` y descarga `express` y `ejs` en la carpeta `node_modules`):
   ```bash
   npm install
