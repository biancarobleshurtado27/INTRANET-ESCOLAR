# CLAUDE.md — Memoria del Agente de IA

> Documento de memoria del asistente de IA para el proyecto **Intranet Escolar**.
> Este archivo guía todas las contribuciones automatizadas al repositorio.
> Leerlo completo antes de escribir, modificar o revisar cualquier código.

---

## 1. Contexto

- **Proyecto:** Intranet Escolar para una institución educativa pública.
- **Producto:** Proyecto final del programa de formación (semana 5, carpeta `8-12`).
- **Tecnologías (obligatorias y únicas):**
  - HTML5 (estructura y semántica).
  - CSS3 puro (Flexbox y Grid para layout). Sin frameworks, sin preprocesadores.
  - Vanilla JavaScript (ES6+). Sin frameworks, sin librerías de UI, sin bundlers.
- **Persistencia de datos:** Simulación de backend mediante `localStorage` (y, si se justifica, archivos JSON locales cargados con `fetch`). No hay servidor real.
- **Repositorio:** `origin` → `https://github.com/biancarobleshurtado27/INTRANET-ESCOLAR.git`
  - Rama principal: `main`.
  - Rama de trabajo activa: `bianca`.
- **Usuarios finales:** Administración, Docentes, Estudiantes y Familias. El producto debe ser usable por personas no técnicas.
- **Navegador objetivo:** Navegadores modernos (Chrome, Edge, Firefox, Safari en sus versiones recientes).

---

## 2. Requerimientos

### 2.1 Funcionales (síntesis — el detalle vive en `docs/requerimientos.md`)

- **Roles de usuario** con flujos distintos:
  1. **Administración:**
     - Alta, baja y edición de personas (estudiantes, docentes, personal).
     - Publicación, edición y eliminación de comunicados en el tablón.
  2. **Docente:**
     - Registro y consulta de calificaciones por materia y periodo.
     - Registro y consulta de asistencia por curso.
     - Consulta de aulas asignadas y sus horarios.
  3. **Estudiante / Familia:**
     - Consulta de notas, horarios, comunicados y tareas.
     - Acceso solo de lectura a su propia información.
- **Simulación de autenticación:** Login local (usuario/rol) usando `localStorage`; no se requiere criptografía real, pero las claves no deben almacenarse en texto plano sin anotación.
- **Tablón de comunicados:** Lista cronológica, filtrable por destinatario (estudiantes, docentes, todos).
- **Persistencia:** Toda la información operativa debe sobrevivir al recargar la página.

### 2.2 No funcionales (síntesis)

- **Accesibilidad:** Cumplimiento de pautas WCAG básicas (contraste, etiquetas `label`, navegación por teclado, ARIA donde aplique).
- **Responsividad:** Diseño usable en móvil, tablet y escritorio (breakpoints con Grid/Flexbox).
- **Rendimiento:** Cero dependencias externas; páginas que carguen rápido incluso en conexiones limitadas.
- **Robustez:** Manejo de errores (validación de formularios, datos ausentes en `localStorage`, storage lleno).
- **Mantenibilidad:** Separación estricta HTML/CSS/JS, nombres claros y documentación en Markdown.

### 2.3 Checklist de verificación

Cada entregable de código debe cumplir el checklist de `docs/requerimientos.md` antes de considerarse terminado.

---

## 3. Reglas

Estas reglas son de **cumplimiento obligatorio** para todo trabajo en este repositorio.

1. **Stack cerrado:** Solo HTML5, CSS3 puro y Vanilla JS (ES6+). No agregar librerías, frameworks, preprocesadores ni bundlers sin autorización explícita.
2. **Separación de responsabilidades:**
   - HTML → estructura y semántica.
   - CSS → apariencia y layout (Flexbox/Grid).
   - JS → comportamiento y lógica de datos.
   - Prohibido incrustar estilos inline (`style=""`) o lógica JS en atributos HTML (`onclick="..."`).
3. **Semántica HTML:** Usar etiquetas correctas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<table>`, `<form>`...). Jerarquía de encabezados `h1`–`h6` sin saltos arbitrarios.
4. **Accesibilidad:** Toda entrada requiere `<label>`, toda imagen con sentido requiere `alt`, toda tabla de datos requiere `caption`. Contraste AA como mínimo.
5. **JavaScript ES6+:** `const`/`let` (nunca `var`), funciones flecha, template literals, `modules` (`import`/`export`) si el proyecto crece, `async/await` para `fetch`. Prohibido `document.write`, `innerHTML` con datos de usuario sin sanitizar.
6. **Persistencia:** Toda escritura a `localStorage` debe pasar por funciones del módulo de datos (`store.js`). Prohibido acceder a `localStorage` directamente desde vistas/controladores.
7. **Idioma del código:** Nombres de variables, funciones, clases, archivos y comentarios en **español** (coherente con el dominio educativo).
8. **Commits:** Mensajes en español siguiendo Conventional Commits (ver `CONTRIBUTING.md`). Un commit = un cambio lógico atómico.
9. **Ramas:** Nunca se trabaja directamente sobre `main`. El flujo pasa por ramas de trabajo y `pull request`.
10. **Documentación:** Todo módulo nuevo se refleja en `docs/arquitectura.md`. Todo cambio funcional se anota en `CHANGELOG.md`. Todo requisito nuevo se agrega a `docs/requerimientos.md`.
11. **Sin secretos:** No se almacenan contraseñas reales ni datos personales sensibles reales. Usar datos ficticios de demostración.
12. **Sin comentarios de relleno:** El código no lleva comentarios triviales (`// esto suma`). Solo comentarios que expliquen el *porqué*.

---

## 4. Restricciones

- **No** usar frameworks CSS (Bootstrap, Tailwind), preprocesadores (Sass/LESS) ni librerías JS (jQuery, React, Vue).
- **No** usar `npm`, `yarn`, `vite`, `webpack` ni ningún sistema de build. El proyecto se abre directo en el navegador.
- **No** usar `innerHTML` con valores provenientes del usuario sin sanitización (riesgo XSS en una intranet).
- **No** usar `fetch` a dominios externos. Cualquier JSON local debe servirse con el archivo abierto o embeber los datos iniciales en JS.
- **No** usar fuentes ni recursos de CDN externos (la institución puede tener conectividad limitada).
- **No** modificar `main` directamente. No forzar pushes (`--force`) ni saltarse hooks.
- **No** duplicar lógica: si algo ya existe en un módulo, se reutiliza (DRY).
- **No** escribir CSS sin breakpoints responsivos para las vistas principales.
- **No** dejar `console.log` de depuración en los commits finales.
- **No** crear archivos de documentación no solicitados; los obligatorios son `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/arquitectura.md` y `docs/requerimientos.md`.

---

## 5. Objetivos

- **Objetivo general:** Entregar una Intranet Escolar funcional, accesible y responsiva usando exclusivamente el stack permitido, con persistencia simulada por `localStorage`.
- **Objetivos específicos:**
  1. Implementar los tres roles (Administración, Docente, Estudiante/Familia) con sus flujos completos.
  2. Lograr persistencia completa entre recargas usando el módulo de datos centralizado.
  3. Cumplir WCAG básicas y diseño responsivo en todas las vistas.
  4. Mantener documentación técnica completa y al día (`README`, `CONTRIBUTING`, `CHANGELOG`, `docs/`).
  5. Mantener un historial Git limpio, con commits atómicos y convencionales.
- **Criterios de éxito del sprint:** Cada historia cerrada pasa el checklist de `docs/requerimientos.md`, se verifica manualmente en navegador y se documenta en `CHANGELOG.md`.
- **Prioridad:** Primero funcionalidad con datos simulados → después pulido visual → después accesibilidad fina. La persistencia nunca es opcional.

---

## 6. Memoria

### 6.1 Decisiones registradas (ADR ligeros)

- **2026-08-12 — Proyecto inicializado.** Repo con `index.html` base y `README.md`. Ramas `main` y `bianca`.
- **2026-08-12 — Aplicación construida (v0.1.0).** SPA con roles, persistencia en `localStorage` y documentación completa. Ver `CHANGELOG.md`.
- **2026-08-12 — Rediseño escolar y fondo dinámico (v0.2.0).** Gradiente animado, formas flotantes SVG generadas por JS (`crearFondoDinamico` en `app.js`), cabecera con emblema, saludo y fecha dinámicos. Respeto de `prefers-reduced-motion`. Ver `CHANGELOG.md`.
- **2026-08-12 — Acento rosa y apartado "Cuentas" (v0.3.0).** El acento anaranjado pasa a rosa (`#d81b60`); el login ya no muestra cuentas demo y administración gestiona las cuentas (crear/modificar/eliminar) con fecha de alta `creadoEn`. Ver `CHANGELOG.md`.
- **2026-08-12 — Orden en cuentas y centrado (v0.3.1).** Listado de cuentas ordenable por nombre/rol/curso; se quita la columna "Alta"; formularios de cuentas y comunicados centrados. Ver `CHANGELOG.md`.
- **Persistencia con `localStorage`:** se eligió sobre JSON vía `fetch` porque permite escritura (alta/baja/edición) sin servidor, cumpliendo el requisito de simular backend.
- **Un solo punto de acceso a datos:** módulo `store.js` como única puerta a `localStorage`. Ver regla 6.
- **Sin módulos ES (`import`/`export`):** el proyecto se abre por `file://` y Chrome bloquea los módulos ES en ese contexto; se usan scripts cargados en orden que exponen `window.IntranetEscolar`.
- **Enrutado por hash** (`#tablon`, `#personas`, ...) para permitir volver atrás sin servidor.
- **Idioma español** para código y documentación, por dominio educativo y equipo.
- **Sin dependencias externas** (ni CDN) por posible baja conectividad y por el requisito de stack puro.

### 6.2 Estado actual del proyecto

- `index.html`: login + shell de la app (`lang="es"`, cabecera con emblema y saludo, menú, `main`, pie).
- `css/estilos.css`: variables, Grid/Flexbox, gradientes y animaciones (flotar, fondoGradiente, aparecer), breakpoints 860 px y 480 px, `:focus-visible`, `prefers-reduced-motion`.
- `js/utilidades.js`, `js/store.js`, `js/auth.js`, `js/vistas.js`, `js/app.js`: todos implementados y con `node --check` OK (incluye `crearFondoDinamico` y `actualizarCabecera`).
- `docs/arquitectura.md` y `docs/requerimientos.md`: creados.
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `CLAUDE.md`: creados (README normalizado a UTF-8).
- Pendiente: prueba manual en navegador de todos los flujos y validación del checklist.

### 6.3 Lecciones y pendientes

- **Lección:** el `README.md` original estaba en UTF-16 con BOM; todos los archivos Markdown deben escribirse en UTF-8.
- **Lección:** a `file://`, los módulos ES fallan en Chrome; por eso la app usa scripts clásicos con namespace `window.IntranetEscolar`.
- Pendiente de verificación manual: login por rol, CRUD de personas, publicación de comunicados, calificaciones/asistencia, recarga (persistencia), 320 px / 1280 px y navegación por teclado.
- Estructura actual del proyecto:
  ```
  /          → index.html, README.md, CONTRIBUTING.md, CHANGELOG.md, CLAUDE.md
  /css       → estilos.css
  /js        → utilidades.js, store.js, auth.js, vistas.js, app.js
  /docs      → arquitectura.md, requerimientos.md
  /assets    → (reservado, sin usar aún)
  ```

### 6.4 Historial Git

- `34ef7cd` — "first commit"
- `db2ee08` — "rama bianca" (rama actual)
- Cambios de la v0.1.0: **sin commitear** (pendiente de revisión y commit del usuario)

---

## 7. Buenas Prácticas

### Git y flujo de trabajo

1. Trabajar sobre ramas de funcionalidad: `git checkout -b feature/<nombre>` o `fix/<nombre>`.
2. Mensajes de commit: Conventional Commits (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`).
3. Antes de cada commit: revisar `git status` y `git diff`, no subir archivos temporales ni `.DS_Store`/`Thumbs.db`.
4. Commits pequeños y atómicos; si se mezcla refactor + feature, separar.
5. Al terminar una funcionalidad: actualizar `CHANGELOG.md` y `docs/requerimientos.md`.

### Código

6. Escribir el HTML primero (estructura), después CSS (apariencia), después JS (comportamiento).
7. Nombres descriptivos: `calcularPromedio()` en vez de `calc()`, `tabla-notas` en vez de `tab`.
8. Usar clases CSS en español y una metodología simple y consistente (ej. BEM-lite: `bloque__elemento--modificador`).
9. Funciones cortas y de una sola responsabilidad. Máximo ~20 líneas por función; si excede, dividir.
10. Normalizar la lectura/escritura de `localStorage` con `JSON.parse`/`JSON.stringify` dentro de `store.js`, con `try/catch`.
11. Validar entradas siempre: formularios con atributos HTML5 (`required`, `min`, `maxlength`) **y** validación JS de respaldo.
12. Manejar el estado vacío: si no hay datos en `localStorage`, sembrar datos de demostración automáticamente.

### Accesibilidad y UI

13. Texto de contraste AA: comprobar combinaciones de color antes de fijarlas.
14. Todos los formularios con `<label for>`, `autocomplete` donde aplique y foco visible.
15. Navegación usable solo con teclado (`tab`, `enter`, `escape`); `:focus-visible` estilizado.
16. Estados de error y éxito anunciados con `aria-live`.

### Revisión y entrega

17. Probar cada cambio en navegador (recargar, validar persistencia, probar a 320px y 1280px).
18. Verificar con el checklist de `docs/requerimientos.md` antes de abrir un PR.
19. El PR incluye: descripción clara, capturas si aplica, y referencia a `CHANGELOG.md`.

---

*Fin del documento. Mantenerlo sincronizado: si una regla cambia, este archivo es la fuente de verdad para el agente.*
