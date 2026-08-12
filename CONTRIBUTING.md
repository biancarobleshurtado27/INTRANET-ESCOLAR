# Contributing — Intranet Escolar

> Guía de ramas, flujo de trabajo en Git y convenciones de commits.
> Leer `CLAUDE.md` completo antes de escribir código.

---

## 1. Ramas

- `main` — rama estable. **Nunca se trabaja directamente sobre ella.**
- Ramas de trabajo — una por funcionalidad o corrección:
  - `feature/<nombre>` para nueva funcionalidad.
  - `fix/<nombre>` para corrección de errores.
  - `docs/<nombre>` para cambios solo de documentación.

La integración a `main` se hace mediante **pull request**; no se permiten pushes
directos ni forzados (`--force`).

## 2. Flujo de trabajo

1. Actualizar la rama base:

   ```bash
   git checkout main
   git pull origin main
   ```

2. Crear la rama de trabajo:

   ```bash
   git checkout -b feature/<nombre>
   ```

3. Implementar en commits pequeños y atómicos (un commit = un cambio lógico).

4. Verificar antes de commitear:

   ```bash
   git status
   git diff
   ```

5. Abrir el pull request contra `main` con: descripción clara, capturas si aplica y
   referencia a `CHANGELOG.md`.

## 3. Convenciones de commits

Mensajes en **español** siguiendo [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<ámbito>): <descripción breve>
```

Tipos permitidos:

| Tipo       | Uso                                        |
|------------|--------------------------------------------|
| `feat:`    | Nueva funcionalidad                        |
| `fix:`     | Corrección de errores                      |
| `docs:`    | Documentación                              |
| `style:`   | Formato, estilos, espacios (sin lógica)    |
| `refactor:`| Cambio de estructura sin cambiar comportamiento |
| `test:`    | Pruebas                                    |

Ejemplos:

```bash
git commit -m "feat(auth): agregar login por roles con sesión local"
git commit -m "fix(store): re-sembrar datos ante localStorage corrupto"
git commit -m "docs: actualizar arquitectura con módulo de horarios"
```

Reglas:

- Mensajes en presente, imperativo y sin mayúsculas innecesarias.
- No mezclar tipos en un mismo commit (ej. refactor + feature se separan).
- No subir archivos temporales, `.DS_Store`, `Thumbs.db` ni credenciales.

## 4. Antes de abrir un pull request

- [ ] `node --check` pasa en todos los archivos `js/*.js`.
- [ ] Probar en navegador: login con los tres roles, acciones de escritura y recarga.
- [ ] Probar en 320 px y 1280 px (dev tools).
- [ ] Navegación con teclado y foco visible funcionando.
- [ ] Checklist de `docs/requerimientos.md` completo para el cambio.
- [ ] `CHANGELOG.md` actualizado.
- [ ] `docs/arquitectura.md` refleja módulos nuevos.

## 5. Deficiones de hecho

Una tarea está terminada cuando: el checklist de `docs/requerimientos.md` aplicable
está tildado, la persistencia fue verificada manualmente, y el cambio quedó
documentado en `CHANGELOG.md`.
