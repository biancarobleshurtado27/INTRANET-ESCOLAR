# Changelog

Registro estructurado de versiones y cambios del proyecto **Intranet Escolar**.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.2.0] — 2026-08-12

### Agregado

- **Rediseño escolar:** cabecera con gradiente, emblema (birrete) y franja ámbar.
- **Fondo dinámico:** gradiente animado en login y app, con formas flotantes
  (libros, lápices, birretes, reglas, estrellas) generadas por JS en posiciones
  aleatorias y animadas con CSS.
- **Cabecera dinámica:** saludo según la hora del día ("Buenos días/tardes/noches"),
  fecha actual en español (actualizada cada minuto) y nombre del usuario.
- **Microinteracciones:** botones pill con gradiente, tarjetas con elevación al
  pasar el cursor, animación de entrada de vistas y foco con anillo ámbar.
- **Accesibilidad:** las formas decorativas son `aria-hidden`, el fondo no interfiere
  con la interacción (`pointer-events: none`) y todas las animaciones se desactivan
  con `prefers-reduced-motion`.

## [0.1.0] — 2026-08-12

### Agregado

- Esqueleto del proyecto: `index.html` con `lang="es"` y vista de login.
- Hoja de estilos `css/estilos.css` con variables, layout Grid/Flexbox,
  breakpoints responsivos (860 px y 480 px) y foco visible (`:focus-visible`).
- Módulos JS en `js/`:
  - `utilidades.js`: escape de HTML, fechas, ids y codificación simple de claves.
  - `store.js`: capa de datos sobre `localStorage` con siembra automática de demo.
  - `auth.js`: login/logout y sesión persistente por pestaña (`sessionStorage`).
  - `vistas.js`: render de las vistas por rol (tablón, personas, comunicados,
    calificaciones, asistencia, aulas, notas, horarios, tareas).
  - `app.js`: orquestador, menú por rol, enrutado por hash y manejo de eventos.
- Datos de demostración: 3 cursos, 5 materias, 1 admin, 2 docentes, 12 estudiantes,
  comunicados, calificaciones, asistencia, horarios y tareas.
- Documentación: `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CLAUDE.md`,
  `docs/arquitectura.md` y `docs/requerimientos.md`.
- `README.md` normalizado a UTF-8 (se detectó y corrigió un encoding UTF-16/BOM).

### Roles implementados

- **Administración:** alta, baja y edición de personas; publicación, edición y
  eliminación de comunicados.
- **Docente:** calificaciones por materia y periodo, asistencia por curso y fecha,
  consulta de aulas y horarios.
- **Estudiante / Familia:** notas con promedio, horario, tareas y comunicados (solo
  lectura).

### Accesibilidad y robustez

- Etiquetas `label`, `<caption>` en tablas, jerarquía de encabezados y `lang="es"`.
- Mensajes de error/éxito con `role="alert"` y `aria-live="polite"`.
- Escape de datos antes de insertar HTML (prevención de XSS).
- Validación de formularios HTML5 + respaldo JS.
- Manejo de `localStorage` lleno/corrupto.

### Corregido

- `README.md` original tenía encoding UTF-16 con BOM; reescrito en UTF-8.
- `index.html` original usaba `lang="en"`; corregido a `lang="es"`.

---

## [Sin publicar]

- Pendiente: pruebas manuales en navegador (recarga, 320 px / 1280 px, teclado).
- Pendiente: validar checklist completo de `docs/requerimientos.md`.
