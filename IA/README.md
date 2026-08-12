# INTRANET-ESCOLAR

Intranet escolar para una institución educativa pública: consulta y gestión de
calificaciones, asistencia, horarios, tareas y comunicados, con roles de
Administración, Docente y Estudiante/Familia.

Construido **solo** con HTML5, CSS3 puro (Flexbox/Grid) y Vanilla JavaScript (ES6+),
sin frameworks ni dependencias externas. La persistencia se simula con `localStorage`.

---

## Cómo abrir el proyecto

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/biancarobleshurtado27/INTRANET-ESCOLAR.git
   ```

2. Abrir `index.html` en un navegador moderno (Chrome, Edge, Firefox o Safari
   actualizados). No requiere servidor ni instalación de dependencias.

También se puede servir con cualquier servidor estático si se prefiere (ej.
`python -m http.server`), pero **no es necesario**.

## Cuentas de demostración

| Rol                    | Usuario         | Contraseña |
|------------------------|-----------------|------------|
| Administración         | `admin`         | `admin123` |
| Docente (Matemáticas)  | `laura.perez`   | `1234`     |
| Docente (Lengua)       | `martin.gomez`  | `1234`     |
| Estudiante (2° A)      | `sofia.martinez`| `1234`     |

Estas cuentas son solo para pruebas y **no aparecen en el login**: la administración
gestiona las cuentas desde el apartado **Cuentas** (crear, modificar y eliminar).

## Qué se puede hacer

- **Administración:** gestión de cuentas (alta, baja y edición con su información) y
  publicación, edición y eliminación de comunicados en el tablón.
- **Docente:** registro y consulta de calificaciones por materia y periodo, registro de
  asistencia por curso y consulta de aulas y horarios.
- **Estudiante / Familia:** consulta de notas (con promedio), horario semanal, tareas y
  comunicados, todo en modo solo lectura.

Todos los datos guardados persisten al recargar la página. Si el almacenamiento del
navegador está vacío, se cargan datos ficticios de demostración automáticamente.

## Documentación

- `CLAUDE.md` — memoria del agente de IA (contexto, reglas, restricciones, etc.).
- `docs/requerimientos.md` — requerimientos y checklist de verificación.
- `docs/arquitectura.md` — diseño del frontend y módulos de JS.
- `CONTRIBUTING.md` — flujo de trabajo en Git y convenciones de commits.
- `CHANGELOG.md` — registro de versiones y cambios.

## Stack y reglas

- Únicamente HTML5, CSS3 puro y Vanilla JS (ES6+). Sin frameworks, preprocesadores,
  bundlers ni recursos de CDN.
- Separación estricta: HTML para estructura, CSS para apariencia, JS para comportamiento.
- Accesible (WCAG básicas) y responsivo (móvil, tablet y escritorio).
- Toda escritura a `localStorage` pasa por el módulo `js/store.js`.

## Licencia

Proyecto de formación (semana 5). Datos de demostración ficticios.
