# Arquitectura — Intranet Escolar

> Descripción del diseño del frontend, los módulos de JavaScript y la simulación de datos.
> Complementa a `CLAUDE.md` y `docs/requerimientos.md`.

---

## 1. Vista general

El proyecto es una **aplicación de una sola página (SPA)** construida exclusivamente con
HTML5, CSS3 puro y Vanilla JavaScript (ES6+), sin dependencias externas. Se abre
directamente en el navegador (doble clic en `index.html`), por lo que **no se usan
módulos ES (`import`/`export`)**: cada archivo JS se carga con `<script>` en orden y
expone su API en el espacio de nombres global `window.IntranetEscolar`.

La persistencia se simula con `localStorage`. No hay servidor real.

### Flujo general

```
index.html (login o app según sesión)
        │
        ▼
js/app.js  → orquestador: sesión, menú por rol, eventos, render de vistas
        │
        ├── js/auth.js      → autenticación y sesión
        ├── js/vistas.js    → generación de HTML de cada vista (por rol)
        ├── js/store.js     → única puerta de acceso a localStorage (+ semilla)
        └── js/utilidades.js→ helpers: escape, fechas, claves, ids
```

---

## 2. Estructura de carpetas

```
/
├── index.html          → login + shell de la aplicación
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── CLAUDE.md           → memoria del agente de IA
├── css/
│   └── estilos.css     → todo el estilo (variables, layout, responsivo)
├── js/
│   ├── utilidades.js   → helpers reutilizables
│   ├── store.js        → capa de datos (localStorage + semilla)
│   ├── auth.js         → login/logout/sesión
│   ├── vistas.js       → render de las vistas por rol
│   └── app.js          → arranque, menú, enrutado y eventos
├── docs/
│   ├── arquitectura.md
│   └── requerimientos.md
└── assets/             → (reservado para imágenes/logos)
```

---

## 3. Modelo de datos

Las entidades se guardan en una sola clave de `localStorage`:

```
intranet_escolar_datos = {
  personas:       [ { id, nombre, rol, usuario, clave, cursoId?, materiaId? } ],
  cursos:         [ { id, nombre } ],
  materias:       [ { id, nombre } ],
  comunicados:    [ { id, titulo, contenido, destinatario, fecha } ],
  calificaciones: [ { id, estudianteId, materiaId, periodo, nota } ],
  asistencias:    [ { id, cursoId, fecha, registros: [{ estudianteId, estado }] } ],
  horarios:       [ { id, cursoId, materiaId, dia, horaInicio, horaFin, aula } ],
  tareas:         [ { id, cursoId, materiaId, titulo, descripcion, fechaEntrega } ]
}
```

Relaciones (por id):

- `persona.rol` → `administracion | docente | estudiante`.
- `persona.cursoId` → `cursos.id` (estudiantes y docentes).
- `persona.materiaId` → `materias.id` (docentes).
- `comunicado.destinatario` → `todos | estudiantes | docentes`.
- `asistencia.estado` → `presente | ausente | tarde`.

---

## 4. Módulos de JavaScript

### 4.1 `js/utilidades.js` — helpers

- `escaparHTML(valor)` — escapa `& < > " '` (previene XSS).
- `generarId(entidad)` — id único por entidad.
- `normalizarTexto(texto)` — minúsculas y sin espacios (para comparar usuarios).
- `hoyISO()`, `fechaDesdeHoy(dias)`, `formatearFecha(iso)` — manejo de fechas.
- `redondear(valor)` — redondeo a 2 decimales.
- `codificarClave` / `compararClave` — codificación simple (no criptográfica, solo demo).

### 4.2 `js/store.js` — capa de datos

Única puerta de acceso a `localStorage` (regla 6 de `CLAUDE.md`).

- `cargar()` — lee `intranet_escolar_datos`; si falta o está corrupto, siembra la demo.
- `obtener(entidad)` / `buscar(entidad, id)` / `filtrar(entidad, criterio)`.
- `insertar(entidad, registro)` / `actualizar(entidad, id, cambios)` / `eliminar(entidad, id)`.
- `restablecer()` — re-siembra los datos de demostración.

Todas las escrituras pasan por `guardar()` con `try/catch`; si el almacenamiento está
lleno, las operaciones devuelven `null`/`false` para que la vista informe al usuario.

La **semilla** (`sembrarDatos()`) genera: 3 cursos, 5 materias, 1 admin, 2 docentes,
12 estudiantes, comunicados, calificaciones (periodos 1 y 2), asistencia (3 días),
horario semanal completo por curso y tareas.

### 4.3 `js/auth.js` — autenticación

- `iniciarSesion(usuario, clave)` — valida contra `store` y guarda la sesión en
  `sessionStorage` (caduca al cerrar el navegador; los datos operativos persisten en `localStorage`).
- `cerrarSesion()` — elimina la sesión.
- `personaActual()` — devuelve la persona logueada (o `null`).

### 4.4 `js/vistas.js` — render por rol

Cada función devuelve un string HTML (con valores escapados) para `#contenido`:

| Vista            | Rol           | Descripción                                        |
|------------------|---------------|----------------------------------------------------|
| `vistaTablon`    | todos         | Comunicados con filtro por destinatario            |
| `vistaPersonas`  | administración| CRUD de personas                                   |
| `vistaComunicados` | administración | Publicar/editar/eliminar comunicados             |
| `vistaCalificaciones` | docente  | Notas por materia y periodo                        |
| `vistaAsistencia` | docente      | Asistencia por curso y fecha                       |
| `vistaAulas`     | docente       | Aulas y horarios de su materia                     |
| `vistaNotas`     | estudiante    | Calificaciones y promedio (solo lectura)           |
| `vistaHorarios`  | estudiante    | Horario semanal de su curso                        |
| `vistaTareas`    | estudiante    | Tareas con estado pendiente/vencida                |

### 4.5 `js/app.js` — orquestador

- Decide login vs. app según la sesión al cargar.
- Construye el menú según el rol y valida que la vista solicitada sea permitida.
- Maneja eventos con **delegación** sobre `#contenido` (clicks con `data-accion`,
  envíos de formularios `data-form` y cambios para filtros/selecciones).
- Enrutado por hash (`#tablon`, `#personas`, ...) para volver atrás y compartir vistas.
- `notificar()` anuncia resultados con `role="status"` (`aria-live="polite"`).

---

## 5. Estrategia de render y seguridad

- Todo valor proveniente de datos o del usuario se escapa con `escaparHTML()` antes de
  insertarlo en el HTML; nunca se usa `innerHTML` con datos sin sanitizar.
- Los formularios se validan con atributos HTML5 (`required`, `min`, `maxlength`) y
  validación JS de respaldo.
- No se usa `style=""` ni handlers inline: la apariencia vive en CSS y el comportamiento
  en los listeners de `app.js`.

---

## 6. Estilos (CSS3 puro)

- `css/estilos.css` define variables de diseño (colores, sombras, radios), layout con
  **Grid** (cabecera) y **Flexbox** (menú, formularios, acciones), y breakpoints
  `@media` a 860 px y 480 px.
- Paleta con contraste AA (azul `#1a5276` sobre blanco, texto `#1c2833` sobre `#f4f6f7`).
- Foco visible con `:focus-visible` y estados de error/éxito con clases dedicadas.

---

## 7. Simulación de backend y limitaciones

- `localStorage` tiene un límite (~5 MB); es suficiente para el volumen de la demo.
- La sesión usa `sessionStorage`, por lo que "persistencia de login" es por pestaña y
  sesión del navegador; los datos operativos persisten indefinidamente.
- Si el usuario borra el almacenamiento del sitio, la próxima carga re-siembra la demo.
- Las contraseñas usan codificación simple `base64` (anotada en el código); no es
  criptografía y no debe usarse en producción.
