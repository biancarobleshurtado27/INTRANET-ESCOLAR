# Requerimientos — Intranet Escolar

> Lista de verificación de requerimientos funcionales y no funcionales del proyecto.
> Un entregable solo se considera terminado si cumple **todos** los ítems aplicables.

---

## 1. Requerimientos funcionales

### 1.1 Autenticación

- [ ] Existe una pantalla de login con campos `usuario` y `contraseña`.
- [ ] El login valida contra los datos de `localStorage` (vía `store.js`).
- [ ] Se muestran mensajes de error accesibles (`role="alert"`) ante credenciales inválidas.
- [ ] La sesión activa persiste al recargar la página (mientras no se cierre el navegador).
- [ ] Existe un botón de "Salir" que cierra la sesión y vuelve al login.
- [ ] Las contraseñas no se guardan en texto plano (codificación simple, anotada como demo).
- [ ] El acceso se restringe según el rol (un estudiante no puede abrir vistas de administración).

### 1.2 Roles

#### Administración

- [ ] Alta de personas (nombre, rol, usuario, contraseña; curso o materia según rol).
- [ ] Baja de personas con confirmación previa.
- [ ] Edición de personas (los datos se precargan en el formulario).
- [ ] Publicación de comunicados (título, contenido, destinatario).
- [ ] Edición y eliminación de comunicados publicados.
- [ ] Validación de usuario duplicado al dar de alta o editar.

#### Docente

- [ ] Registro de calificaciones por materia y periodo (1° a 3°).
- [ ] Consulta de calificaciones cargadas (los valores se precargan al abrir el periodo).
- [ ] Registro de asistencia por curso y fecha (presente, ausente, tarde).
- [ ] Consulta de aulas asignadas y horarios de su materia.
- [ ] Almacenamiento en `localStorage` de calificaciones y asistencias.

#### Estudiante / Familia

- [ ] Consulta de notas por materia y periodo, con promedio.
- [ ] Consulta del horario semanal de su curso.
- [ ] Consulta de comunicados (solo los dirigidos a estudiantes o a todos).
- [ ] Consulta de tareas de su curso, indicando pendiente/vencida.
- [ ] Acceso únicamente de lectura (sin formularios de escritura).

### 1.3 Tablón de comunicados

- [ ] Lista cronológica (más recientes primero).
- [ ] Filtro por destinatario: todos, estudiantes, docentes.
- [ ] El contenido se muestra acorde al rol (docentes no ven avisos para estudiantes y viceversa).
- [ ] Fecha de publicación visible en cada comunicado.

### 1.4 Persistencia

- [ ] Toda la información operativa sobrevive a la recarga de la página.
- [ ] Si `localStorage` está vacío, se siembran datos de demostración automáticamente.
- [ ] Toda lectura/escritura pasa por el módulo `store.js` (única puerta de acceso).
- [ ] Manejo de error ante `localStorage` lleno (se informa al usuario).

---

## 2. Requerimientos no funcionales

### 2.1 Stack y estructura

- [ ] Solo HTML5, CSS3 puro y Vanilla JavaScript (ES6+).
- [ ] Sin frameworks, librerías, preprocesadores, bundlers ni dependencias de CDN.
- [ ] Separación estricta: HTML (estructura), CSS (apariencia), JS (comportamiento).
- [ ] Sin estilos inline (`style=""`) ni handlers JS en atributos HTML (`onclick`).
- [ ] No hay `console.log` de depuración en el código.
- [ ] No hay `document.write`.
- [ ] `innerHTML` solo se usa con valores escapados/sanitizados.

### 2.2 Accesibilidad (WCAG básicas)

- [ ] Toda entrada tiene su `<label>` asociado.
- [ ] Toda tabla de datos tiene `<caption>`.
- [ ] Jerarquía de encabezados `h1`–`h6` sin saltos arbitrarios.
- [ ] Contraste de color AA en texto (paleta verificada).
- [ ] Foco visible en elementos interactivos (`:focus-visible`).
- [ ] Mensajes de error/éxito anunciados (`role="alert"`, `aria-live`).
- [ ] Navegación operable con teclado (menú como enlaces, `tab`/`enter`).
- [ ] `lang="es"` en el documento y atributos semánticos (`nav`, `main`, `section`, `table`).

### 2.3 Responsividad

- [ ] Diseño usable en móvil (≈320 px), tablet (≈768 px) y escritorio (≥1280 px).
- [ ] Tablas con desplazamiento horizontal en pantallas pequeñas.
- [ ] Cabecera/navegación que se adapta en pantallas angostas.

### 2.4 Robustez

- [ ] Validación de formularios con atributos HTML5 y respaldo en JS.
- [ ] Estados vacíos cubiertos (sin datos se muestra mensaje claro).
- [ ] Datos ausentes/corruptos en `localStorage` no rompen la app (se re-siembran).
- [ ] Fechas, notas y asistencias con valores dentro de rangos válidos.

### 2.5 Mantenibilidad y documentación

- [ ] Nombres de archivos, funciones, variables y clases en español.
- [ ] Funciones cortas y de una sola responsabilidad.
- [ ] Lógica duplicada reutilizada (DRY).
- [ ] Módulos documentados en `docs/arquitectura.md`.
- [ ] Cambios registrados en `CHANGELOG.md`.
- [ ] Requisitos nuevos agregados a este documento.

---

## 3. Checklist de verificación de entregable

Antes de cerrar un PR o marcar una historia como terminada, completar:

- [ ] Código nuevo pasa `node --check` (sintaxis JS válida).
- [ ] Prueba manual en navegador: login con cada rol, navegación y acciones de escritura.
- [ ] Recargar la página y confirmar persistencia de los datos guardados.
- [ ] Probar al menos en 320 px y 1280 px (dev tools).
- [ ] Verificar navegación con teclado y foco visible.
- [ ] El checklist funcional aplicable de esta sección está tildado.
- [ ] `CHANGELOG.md` actualizado y PR con descripción.
