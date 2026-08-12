(function () {
    'use strict';

    const U = window.IntranetEscolar.Utilidades;
    const Store = window.IntranetEscolar.Store;
    const Auth = window.IntranetEscolar.Auth;

    const ROLES = {
        docente: 'Docente',
        estudiante: 'Estudiante / Familia'
    };

    const DESTINATARIOS = {
        todos: 'Todos',
        estudiantes: 'Estudiantes y familias',
        docentes: 'Docentes'
    };

    const ETIQUETAS_ASISTENCIA = {
        presente: 'Presente',
        ausente: 'Ausente',
        tarde: 'Tarde'
    };

    const ORDEN_DIAS = { Lunes: 0, Martes: 1, Miércoles: 2, Jueves: 3, Viernes: 4 };

    function cursoNombre(id) {
        const curso = Store.buscar('cursos', id);
        return curso ? curso.nombre : '—';
    }

    function materiaNombre(id) {
        const materia = Store.buscar('materias', id);
        return materia ? materia.nombre : '—';
    }

    function notaDe(estudianteId, materiaId, periodo) {
        const registro = Store.filtrar('calificaciones',
            (c) => c.estudianteId === estudianteId && c.materiaId === materiaId && c.periodo === periodo)[0];
        return registro ? registro.nota : undefined;
    }

    function ordenarHorarios(lista) {
        return lista.slice().sort((a, b) => {
            const porDia = (ORDEN_DIAS[a.dia] ?? 99) - (ORDEN_DIAS[b.dia] ?? 99);
            return porDia || a.horaInicio.localeCompare(b.horaInicio);
        });
    }

    function vistaTablon(filtro = 'todos') {
        const persona = Auth.personaActual();
        const comunicados = Store.obtener('comunicados')
            .slice()
            .sort((a, b) => b.fecha.localeCompare(a.fecha));

        const visibles = comunicados.filter((comunicado) => {
            if (filtro !== 'todos' && comunicado.destinatario !== filtro && comunicado.destinatario !== 'todos') {
                return false;
            }
            if (persona.rol === 'docente' && comunicado.destinatario === 'estudiantes') {
                return false;
            }
            if (persona.rol === 'estudiante' && comunicado.destinatario === 'docentes') {
                return false;
            }
            return true;
        });

        const botonesFiltro = ['todos', 'estudiantes', 'docentes']
            .map((destinatario) => `
                <button type="button"
                        class="boton boton--pequeno ${filtro === destinatario ? 'boton--primario' : ''}"
                        data-accion="tablon-filtrar"
                        data-filtro="${destinatario}">
                    ${DESTINATARIOS[destinatario]}
                </button>`)
            .join('');

        const lista = visibles.length
            ? visibles.map((comunicado) => `
                <article class="tarjeta comunicado">
                    <div class="comunicado__cabecera">
                        <h3>${U.escaparHTML(comunicado.titulo)}</h3>
                        <span class="comunicado__fecha">${U.formatearFecha(comunicado.fecha)}</span>
                    </div>
                    <p>${U.escaparHTML(comunicado.contenido)}</p>
                    <span class="insignia">Para: ${DESTINATARIOS[comunicado.destinatario]}</span>
                </article>`).join('')
            : '<p class="vacio">No hay comunicados para mostrar.</p>';

        return `
            <h2>Tablón de comunicados</h2>
            <div class="filtros" role="group" aria-label="Filtrar comunicados por destinatario">${botonesFiltro}</div>
            ${lista}`;
    }

    function vistaCalificaciones(periodo = 2) {
        const persona = Auth.personaActual();
        const curso = Store.buscar('cursos', persona.cursoId);
        const materia = Store.buscar('materias', persona.materiaId);
        const estudiantes = Store.filtrar('personas',
            (p) => p.rol === 'estudiante' && p.cursoId === persona.cursoId)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        const filas = estudiantes.map((estudiante) => {
            const nota = notaDe(estudiante.id, persona.materiaId, periodo);
            return `
                <tr>
                    <td>${U.escaparHTML(estudiante.nombre)}</td>
                    <td class="numerico">
                        <input type="number" name="nota_${estudiante.id}" min="1" max="10" step="0.5"
                               value="${nota ?? ''}" placeholder="—" aria-label="Nota de ${U.escaparHTML(estudiante.nombre)}">
                    </td>
                </tr>`;
        }).join('');

        return `
            <h2>Calificaciones</h2>
            <p>Materia: <strong>${U.escaparHTML(materia ? materia.nombre : '')}</strong> ·
               Curso: <strong>${U.escaparHTML(curso ? curso.nombre : '')}</strong></p>

            <form data-form="calificaciones" class="tarjeta" novalidate>
                <div class="campo">
                    <label for="calificaciones-periodo">Periodo</label>
                    <select id="calificaciones-periodo" name="periodo" required>
                        <option value="1" ${periodo === 1 ? 'selected' : ''}>1er periodo</option>
                        <option value="2" ${periodo === 2 ? 'selected' : ''}>2do periodo</option>
                        <option value="3" ${periodo === 3 ? 'selected' : ''}>3er periodo</option>
                    </select>
                </div>
                <div class="tabla-contenedor">
                    <table>
                        <caption>Notas de ${U.escaparHTML(materia ? materia.nombre : '')} · ${U.escaparHTML(curso ? curso.nombre : '')} · ${periodo}er periodo</caption>
                        <thead>
                            <tr><th>Estudiante</th><th class="numerico">Nota</th></tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
                <div class="form-acciones">
                    <button type="submit" class="boton boton--primario">Guardar calificaciones</button>
                </div>
            </form>`;
    }

    function vistaAsistencia(fecha = null) {
        const persona = Auth.personaActual();
        const curso = Store.buscar('cursos', persona.cursoId);
        const estudiantes = Store.filtrar('personas',
            (p) => p.rol === 'estudiante' && p.cursoId === persona.cursoId)
            .sort((a, b) => a.nombre.localeCompare(b.nombre));

        const fechaElegida = fecha || U.hoyISO();
        const registroExistente = Store.filtrar('asistencias',
            (a) => a.cursoId === persona.cursoId && a.fecha === fechaElegida)[0];

        const estadosPorEstudiante = {};
        (registroExistente?.registros || []).forEach((registro) => {
            estadosPorEstudiante[registro.estudianteId] = registro.estado;
        });

        const filas = estudiantes.map((estudiante) => {
            const opciones = ['presente', 'ausente', 'tarde'].map((estado) => {
                const marcado = estadosPorEstudiante[estudiante.id]
                    ? estadosPorEstudiante[estudiante.id] === estado
                    : estado === 'presente';
                return `
                    <label>
                        <input type="radio" name="asistencia_${estudiante.id}" value="${estado}" ${marcado ? 'checked' : ''}>
                        ${ETIQUETAS_ASISTENCIA[estado]}
                    </label>`;
            }).join('');
            return `
                <tr>
                    <td>${U.escaparHTML(estudiante.nombre)}</td>
                    <td>
                        <div class="grupo-opciones">${opciones}</div>
                    </td>
                </tr>`;
        }).join('');

        return `
            <h2>Asistencia</h2>
            <p>Curso: <strong>${U.escaparHTML(curso ? curso.nombre : '')}</strong></p>

            <form data-form="asistencia" class="tarjeta" novalidate>
                <div class="campo">
                    <label for="asistencia-fecha">Fecha</label>
                    <input type="date" id="asistencia-fecha" name="fecha" value="${fechaElegida}" required>
                </div>
                <div class="tabla-contenedor">
                    <table>
                        <caption>Asistencia de ${U.escaparHTML(curso ? curso.nombre : '')} del ${U.formatearFecha(fechaElegida)}</caption>
                        <thead>
                            <tr><th>Estudiante</th><th>Estado</th></tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
                <div class="form-acciones">
                    <button type="submit" class="boton boton--primario">Guardar asistencia</button>
                </div>
            </form>`;
    }

    function vistaAulas() {
        const persona = Auth.personaActual();
        const materia = Store.buscar('materias', persona.materiaId);
        const horarios = ordenarHorarios(Store.filtrar('horarios', (h) => h.materiaId === persona.materiaId));

        const filas = horarios.map((horario) => {
            const curso = Store.buscar('cursos', horario.cursoId);
            return `
                <tr>
                    <td>${U.escaparHTML(curso ? curso.nombre : '—')}</td>
                    <td>${horario.dia}</td>
                    <td>${horario.horaInicio}–${horario.horaFin}</td>
                    <td>${U.escaparHTML(horario.aula)}</td>
                </tr>`;
        }).join('') || '<tr><td colspan="4">Sin horarios asignados.</td></tr>';

        return `
            <h2>Mis aulas y horarios</h2>
            <p>Materia: <strong>${U.escaparHTML(materia ? materia.nombre : '')}</strong></p>

            <section class="tarjeta">
                <div class="tabla-contenedor">
                    <table>
                        <caption>Horarios de ${U.escaparHTML(materia ? materia.nombre : '')}</caption>
                        <thead>
                            <tr><th>Curso</th><th>Día</th><th>Horario</th><th>Aula</th></tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            </section>`;
    }

    function vistaNotas() {
        const persona = Auth.personaActual();
        const materias = Store.obtener('materias');
        const calificaciones = Store.filtrar('calificaciones', (c) => c.estudianteId === persona.id);
        const periodos = [1, 2, 3];

        const filas = materias.map((materia) => {
            const notasMateria = calificaciones.filter((c) => c.materiaId === materia.id);
            const celdas = periodos.map((periodo) => {
                const registro = notasMateria.find((c) => c.periodo === periodo);
                return `<td class="numerico">${registro ? registro.nota : '<span class="nota-pendiente">—</span>'}</td>`;
            }).join('');
            const promedio = notasMateria.length
                ? U.redondear(notasMateria.reduce((total, c) => total + c.nota, 0) / notasMateria.length)
                : '—';
            return `
                <tr>
                    <td>${U.escaparHTML(materia.nombre)}</td>
                    ${celdas}
                    <td class="numerico"><strong>${promedio}</strong></td>
                </tr>`;
        }).join('');

        return `
            <h2>Mis calificaciones</h2>

            <section class="tarjeta">
                <div class="tabla-contenedor">
                    <table>
                        <caption>Calificaciones por materia y periodo</caption>
                        <thead>
                            <tr>
                                <th>Materia</th>
                                <th class="numerico">1er periodo</th>
                                <th class="numerico">2do periodo</th>
                                <th class="numerico">3er periodo</th>
                                <th class="numerico">Promedio</th>
                            </tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            </section>`;
    }

    function vistaHorarios() {
        const persona = Auth.personaActual();
        const curso = Store.buscar('cursos', persona.cursoId);
        const horarios = ordenarHorarios(Store.filtrar('horarios', (h) => h.cursoId === persona.cursoId));

        const filas = horarios.map((horario) => {
            const materia = Store.buscar('materias', horario.materiaId);
            return `
                <tr>
                    <td>${horario.dia}</td>
                    <td>${horario.horaInicio}–${horario.horaFin}</td>
                    <td>${U.escaparHTML(materia ? materia.nombre : '—')}</td>
                    <td>${U.escaparHTML(horario.aula)}</td>
                </tr>`;
        }).join('');

        return `
            <h2>Mi horario</h2>
            <p>Curso: <strong>${U.escaparHTML(curso ? curso.nombre : '')}</strong></p>

            <section class="tarjeta">
                <div class="tabla-contenedor">
                    <table>
                        <caption>Horario semanal de ${U.escaparHTML(curso ? curso.nombre : '')}</caption>
                        <thead>
                            <tr><th>Día</th><th>Horario</th><th>Materia</th><th>Aula</th></tr>
                        </thead>
                        <tbody>${filas}</tbody>
                    </table>
                </div>
            </section>`;
    }

    function vistaTareas() {
        const persona = Auth.personaActual();
        const tareas = Store.filtrar('tareas', (t) => t.cursoId === persona.cursoId)
            .sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
        const hoy = new Date(U.hoyISO());

        const items = tareas.length
            ? tareas.map((tarea) => {
                const materia = Store.buscar('materias', tarea.materiaId);
                const vencida = new Date(tarea.fechaEntrega) < hoy;
                return `
                    <article class="tarjeta">
                        <h3>${U.escaparHTML(tarea.titulo)}</h3>
                        <p>${U.escaparHTML(tarea.descripcion)}</p>
                        <p class="comunicado__fecha">
                            Materia: ${U.escaparHTML(materia ? materia.nombre : '—')} ·
                            Entrega: ${U.formatearFecha(tarea.fechaEntrega)}
                            <span class="insignia ${vencida ? 'insignia--error' : 'insignia--exito'}">${vencida ? 'Vencida' : 'Pendiente'}</span>
                        </p>
                    </article>`;
            }).join('')
            : '<p class="vacio">No hay tareas asignadas.</p>';

        return `<h2>Tareas</h2>${items}`;
    }

    window.IntranetEscolar = window.IntranetEscolar || {};
    window.IntranetEscolar.Vistas = {
        ROLES,
        vistaTablon,
        vistaCalificaciones,
        vistaAsistencia,
        vistaAulas,
        vistaNotas,
        vistaHorarios,
        vistaTareas
    };
})();
