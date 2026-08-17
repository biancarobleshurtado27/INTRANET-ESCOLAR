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

        const tarjetasEstudiantes = estudiantes.map((estudiante) => {
            const nota = notaDe(estudiante.id, persona.materiaId, periodo);
            const notaNum = nota !== undefined ? Number(nota) : null;
            const badgeClass = notaNum !== null 
                ? (notaNum >= 6 ? 'insignia--exito' : 'insignia--error')
                : 'insignia--neutro';
            const estadoTexto = notaNum !== null
                ? (notaNum >= 6 ? 'Aprobado' : 'Insuficiente')
                : 'Sin nota';

            return `
                <div class="tarjeta tarjeta-calificar-estudiante">
                    <div class="tarjeta-calificar-estudiante__info">
                        <span class="tarjeta-calificar-estudiante__avatar">👤</span>
                        <div>
                            <h4>${U.escaparHTML(estudiante.nombre)}</h4>
                            <span class="insignia ${badgeClass}">${estadoTexto}</span>
                        </div>
                    </div>
                    <div class="tarjeta-calificar-estudiante__campo">
                        <label for="nota_${estudiante.id}">Nota (1-10)</label>
                        <input type="number" id="nota_${estudiante.id}" name="nota_${estudiante.id}" 
                               min="1" max="10" step="0.5" value="${nota ?? ''}" 
                               placeholder="—" class="input-nota">
                    </div>
                </div>`;
        }).join('');

        return `
            <h2>Registro de Calificaciones</h2>
            <p>Materia: <strong>${U.escaparHTML(materia ? materia.nombre : '')}</strong> ·
               Curso: <strong>${U.escaparHTML(curso ? curso.nombre : '')}</strong></p>

            <form data-form="calificaciones" novalidate>
                <div class="tarjeta selector-periodo-card">
                    <div class="campo">
                        <label for="calificaciones-periodo">Seleccionar Periodo Académico</label>
                        <select id="calificaciones-periodo" name="periodo" required>
                            <option value="1" ${periodo === 1 ? 'selected' : ''}>1er Periodo</option>
                            <option value="2" ${periodo === 2 ? 'selected' : ''}>2do Periodo</option>
                            <option value="3" ${periodo === 3 ? 'selected' : ''}>3er Periodo</option>
                        </select>
                    </div>
                </div>

                <div class="cuadricula-calificar-estudiantes">
                    ${tarjetasEstudiantes}
                </div>

                <div class="form-acciones-fijo">
                    <button type="submit" class="boton boton--primario boton--amplio">💾 Guardar Calificaciones</button>
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
        const horariosRaw = Store.filtrar('horarios', (h) => h.materiaId === persona.materiaId);
        const horarios = ordenarHorarios(horariosRaw);

        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        const columnasDiasHtml = dias.map((dia) => {
            const horariosDelDia = horarios.filter((h) => h.dia === dia)
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)); // Más pronto a más lejano

            const cubitosHtml = horariosDelDia.length ? horariosDelDia.map((h) => {
                const curso = Store.buscar('cursos', h.cursoId);
                return `
                    <div class="cubito-horario cubito-horario--docente">
                        <div class="cubito-horario__tiempo">
                            <span class="cubito-horario__icono">⏰</span>
                            <span>${h.horaInicio} - ${h.horaFin}</span>
                        </div>
                        <h4 class="cubito-horario__materia">👥 Curso ${U.escaparHTML(curso ? curso.nombre : '—')}</h4>
                        <div class="cubito-horario__detalles">
                            <span class="cubito-horario__aula">📍 ${U.escaparHTML(h.aula)}</span>
                        </div>
                    </div>`;
            }).join('') : '<p class="cubito-horario--vacio">Sin clases asignadas</p>';

            return `
                <div class="columna-dia">
                    <div class="columna-dia__encabezado">
                        <h3>${dia}</h3>
                    </div>
                    <div class="columna-dia__cubitos">
                        ${cubitosHtml}
                    </div>
                </div>`;
        }).join('');

        return `
            <h2>Mis Aulas y Horarios de Clase</h2>
            <p>Materia a cargo: <strong>${U.escaparHTML(materia ? materia.nombre : '')}</strong> — Organizados de la hora más temprana a la más tardía.</p>

            <div class="cuadricula-horarios-cubitos">
                ${columnasDiasHtml}
            </div>`;
    }

    function vistaUsuarios(orden = 'rol', filtroRol = 'todos', filtroCurso = 'todos', busqueda = '') {
        let personas = Store.obtener('personas').slice();

        if (filtroRol !== 'todos') {
            personas = personas.filter((p) => p.rol === filtroRol);
        }

        if (filtroCurso !== 'todos') {
            personas = personas.filter((p) => p.cursoId === filtroCurso);
        }

        if (busqueda.trim()) {
            const query = U.normalizarTexto(busqueda);
            personas = personas.filter((p) => 
                U.normalizarTexto(p.nombre).includes(query) || 
                U.normalizarTexto(p.usuario).includes(query)
            );
        }

        // Ordenar: predestinado por Rol (docentes primero, luego estudiantes)
        personas.sort((a, b) => {
            if (orden === 'rol') {
                const pesoRol = { docente: 1, estudiante: 2 };
                const difRol = (pesoRol[a.rol] || 99) - (pesoRol[b.rol] || 99);
                return difRol || a.nombre.localeCompare(b.nombre, 'es');
            } else if (orden === 'nombre') {
                return a.nombre.localeCompare(b.nombre, 'es');
            } else if (orden === 'curso') {
                const cA = cursoNombre(a.cursoId);
                const cB = cursoNombre(b.cursoId);
                return cA.localeCompare(cB, 'es') || a.nombre.localeCompare(b.nombre, 'es');
            }
            return 0;
        });

        const cursos = Store.obtener('cursos');
        const opcionesFiltroCurso = cursos.map((c) => 
            `<option value="${c.id}" ${c.id === filtroCurso ? 'selected' : ''}>${U.escaparHTML(c.nombre)}</option>`
        ).join('');

        const tarjetas = personas.map((persona) => {
            const curso = Store.buscar('cursos', persona.cursoId);
            const opcionesCursoPersona = cursos.map((opcion) =>
                `<option value="${opcion.id}" ${opcion.id === persona.cursoId ? 'selected' : ''}>${U.escaparHTML(opcion.nombre)}</option>`
            ).join('');

            return `
                <form class="tarjeta usuario-edicion" data-form="usuario" novalidate>
                    <input type="hidden" name="id" value="${persona.id}">
                    <div class="usuario-edicion__encabezado">
                        <div class="usuario-edicion__titulo-grupo">
                            <h3>${U.escaparHTML(persona.nombre)}</h3>
                            <span class="usuario-edicion__subtexto">@${U.escaparHTML(persona.usuario)}</span>
                        </div>
                        <span class="insignia ${persona.rol === 'docente' ? 'insignia--primario' : 'insignia--secundario'}">
                            ${ROLES[persona.rol] || persona.rol}
                        </span>
                    </div>
                    <div class="usuario-edicion__campos">
                        <div class="campo">
                            <label>Nombre completo</label>
                            <input name="nombre" value="${U.escaparHTML(persona.nombre)}" required maxlength="120">
                        </div>
                        <div class="campo">
                            <label>Usuario</label>
                            <input name="usuario" value="${U.escaparHTML(persona.usuario)}" required maxlength="40">
                        </div>
                        <div class="campo">
                            <label>Clase / Curso</label>
                            <select name="cursoId">
                                <option value="">Sin clase asignada</option>
                                ${opcionesCursoPersona}
                            </select>
                        </div>
                        <div class="campo">
                            <label>🔒 Cambiar contraseña</label>
                            <input type="password" name="clave" placeholder="Nueva contraseña (dejar en blanco para no cambiar)" minlength="4">
                        </div>
                    </div>
                    <div class="usuario-edicion__pie">
                        <span class="comunicado__fecha">Clase actual: <strong>${U.escaparHTML(curso ? curso.nombre : 'Sin clase asignada')}</strong></span>
                        <div class="grupo-acciones-usuario">
                            <button type="button" class="boton boton--peligro boton--pequeno" data-accion="eliminar-usuario" data-id="${persona.id}">🗑️ Eliminar</button>
                            <button class="boton boton--primario" type="submit">Guardar cambios</button>
                        </div>
                    </div>
                </form>`;
        }).join('') || '<p class="vacio">No se encontraron usuarios con los filtros seleccionados.</p>';

        const opcionesCursoNuevoUsuario = cursos.map((c) =>
            `<option value="${c.id}">${U.escaparHTML(c.nombre)}</option>`
        ).join('');

        return `
            <h2>Gestión de Usuarios</h2>
            <p>Consulta, clasifica, agrega nuevos usuarios, edita o elimina cuentas existentes.</p>
            
            <section class="tarjeta form-nuevo-usuario-seccion">
                <div class="cabecera-seccion-usuario">
                    <h3>➕ Registrar Nuevo Usuario</h3>
                    <p class="subtitulo-seccion">Completa los datos para crear un nuevo usuario docente o estudiante.</p>
                </div>
                <form data-form="nuevo-usuario" class="form-agregar-usuario" novalidate>
                    <div class="campo">
                        <label for="nuevo-usuario-nombre">Nombre completo</label>
                        <input type="text" id="nuevo-usuario-nombre" name="nombre" placeholder="Ej. Ana María Silva" required maxlength="120">
                    </div>
                    <div class="campo">
                        <label for="nuevo-usuario-username">Nombre de usuario</label>
                        <input type="text" id="nuevo-usuario-username" name="usuario" placeholder="Ej. ana.silva" required maxlength="40">
                    </div>
                    <div class="campo">
                        <label for="nuevo-usuario-rol">Rol de acceso</label>
                        <select id="nuevo-usuario-rol" name="rol" required>
                            <option value="estudiante" selected>Estudiante / Familia</option>
                            <option value="docente">Docente / Personal</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="nuevo-usuario-curso">Clase / Curso</label>
                        <select id="nuevo-usuario-curso" name="cursoId">
                            <option value="">Sin clase asignada</option>
                            ${opcionesCursoNuevoUsuario}
                        </select>
                    </div>
                    <div class="campo">
                        <label for="nuevo-usuario-clave">Contraseña</label>
                        <input type="password" id="nuevo-usuario-clave" name="clave" placeholder="Mínimo 4 caracteres" required minlength="4">
                    </div>
                    <div class="form-acciones-nuevo-usuario">
                        <button type="submit" class="boton boton--primario">✨ Crear Usuario</button>
                    </div>
                </form>
            </section>

            <div class="tarjeta controles-usuarios">
                <div class="grupo-controles">
                    <div class="campo">
                        <label for="usuarios-orden">Clasificar / Ordenar por</label>
                        <select id="usuarios-orden">
                            <option value="rol" ${orden === 'rol' ? 'selected' : ''}>Rol (Predeterminado: Docentes / Estudiantes)</option>
                            <option value="nombre" ${orden === 'nombre' ? 'selected' : ''}>Nombre (A - Z)</option>
                            <option value="curso" ${orden === 'curso' ? 'selected' : ''}>Clase / Curso</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="usuarios-filtro-rol">Filtrar por Rol</label>
                        <select id="usuarios-filtro-rol">
                            <option value="todos" ${filtroRol === 'todos' ? 'selected' : ''}>Todos los Roles</option>
                            <option value="docente" ${filtroRol === 'docente' ? 'selected' : ''}>Docentes / Personal</option>
                            <option value="estudiante" ${filtroRol === 'estudiante' ? 'selected' : ''}>Estudiantes / Familias</option>
                        </select>
                    </div>
                    <div class="campo">
                        <label for="usuarios-filtro-curso">Filtrar por Clase</label>
                        <select id="usuarios-filtro-curso">
                            <option value="todos" ${filtroCurso === 'todos' ? 'selected' : ''}>Todas las Clases</option>
                            ${opcionesFiltroCurso}
                        </select>
                    </div>
                    <div class="campo campo--busqueda">
                        <label for="usuarios-busqueda">Buscar Usuario</label>
                        <input type="search" id="usuarios-busqueda" value="${U.escaparHTML(busqueda)}" placeholder="Nombre o usuario...">
                    </div>
                </div>
            </div>

            <div class="lista-usuarios">${tarjetas}</div>`;
    }

    function vistaCalendario() {
        const tareas = Store.obtener('tareas');
        const eventosAdicionales = Store.obtener('eventos') || [];
        
        const todosEventos = [
            ...tareas.map(t => ({
                id: t.id,
                tipo: 'tarea',
                titulo: t.titulo,
                descripcion: t.descripcion,
                fecha: t.fechaEntrega,
                materiaId: t.materiaId,
                cursoId: t.cursoId
            })),
            ...eventosAdicionales.map(e => ({
                id: e.id,
                tipo: e.categoria || 'evento',
                titulo: e.titulo,
                descripcion: e.descripcion || '',
                fecha: e.fecha,
                materiaId: null,
                cursoId: null
            }))
        ].sort((a, b) => a.fecha.localeCompare(b.fecha));

        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = hoy.getMonth();
        const nombreMes = hoy.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
        
        const primerDiaMes = new Date(anio, mes, 1);
        const ultimoDiaMes = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDiaMes.getDate();
        
        let diaInicioSemana = primerDiaMes.getDay() - 1;
        if (diaInicioSemana === -1) diaInicioSemana = 6;

        let celdaCalendarioHtml = '';
        for (let i = 0; i < diaInicioSemana; i++) {
            celdaCalendarioHtml += `<div class="dia-calendario dia-calendario--vacio"></div>`;
        }

        const isoBaseMes = `${anio}-${String(mes + 1).padStart(2, '0')}`;
        for (let diaNum = 1; diaNum <= diasEnMes; diaNum++) {
            const fechaIsoStr = `${isoBaseMes}-${String(diaNum).padStart(2, '0')}`;
            const esHoy = fechaIsoStr === U.hoyISO();
            
            const eventosDelDia = todosEventos.filter(e => e.fecha === fechaIsoStr);
            const eventosHtml = eventosDelDia.map(e => `
                <div class="evento-pildora evento-pildora--${e.tipo}" title="${U.escaparHTML(e.titulo)}">
                    <span class="evento-pildora__titulo">${U.escaparHTML(e.titulo)}</span>
                </div>
            `).join('');

            celdaCalendarioHtml += `
                <div class="dia-calendario ${esHoy ? 'dia-calendario--hoy' : ''}">
                    <span class="dia-calendario__numero">${diaNum}</span>
                    <div class="dia-calendario__eventos">${eventosHtml}</div>
                </div>`;
        }

        const listaActividades = todosEventos.map((evt) => {
            const materia = evt.materiaId ? Store.buscar('materias', evt.materiaId) : null;
            const curso = evt.cursoId ? Store.buscar('cursos', evt.cursoId) : null;
            return `
                <article class="tarjeta tarjeta-actividad">
                    <div class="tarjeta-actividad__cabecera">
                        <div class="tarjeta-actividad__info">
                            <span class="insignia insignia--${evt.tipo}">${evt.tipo.toUpperCase()}</span>
                            <h3>${U.escaparHTML(evt.titulo)}</h3>
                        </div>
                        <span class="tarjeta-actividad__fecha">📅 ${U.formatearFecha(evt.fecha)}</span>
                    </div>
                    <p class="tarjeta-actividad__desc">${U.escaparHTML(evt.descripcion || 'Sin descripción adicional.')}</p>
                    <div class="tarjeta-actividad__pie">
                        <span class="tarjeta-actividad__contexto">
                            ${materia ? `Materia: <strong>${U.escaparHTML(materia.nombre)}</strong>` : ''} 
                            ${curso ? `· Curso: <strong>${U.escaparHTML(curso.nombre)}</strong>` : ''}
                        </span>
                        <button type="button" class="boton boton--peligro boton--pequeno" data-accion="eliminar-actividad" data-id="${evt.id}" data-tipo="${evt.tipo}">
                            🗑️ Quitar
                        </button>
                    </div>
                </article>`;
        }).join('') || '<p class="vacio">No hay eventos ni actividades programadas.</p>';

        return `
            <h2>Calendario Visual de Eventos y Actividades</h2>
            <p>Visualiza el calendario mensual, agrega nuevas actividades y gestiona los eventos del ciclo escolar.</p>

            <div class="calendario-contenedor tarjeta">
                <div class="calendario-encabezado">
                    <h3 class="calendario-titulo">🗓️ ${nombreMes.toUpperCase()}</h3>
                </div>
                <div class="calendario-rejilla-dias">
                    <div class="nombre-dia">Lun</div>
                    <div class="nombre-dia">Mar</div>
                    <div class="nombre-dia">Mié</div>
                    <div class="nombre-dia">Jue</div>
                    <div class="nombre-dia">Vie</div>
                    <div class="nombre-dia">Sáb</div>
                    <div class="nombre-dia">Dom</div>
                </div>
                <div class="calendario-rejilla-celdas">
                    ${celdaCalendarioHtml}
                </div>
            </div>

            <section class="tarjeta form-actividad-seccion">
                <h3>➕ Agregar Nueva Actividad o Evento</h3>
                <form data-form="evento" class="form-agregar-actividad" novalidate>
                    <div class="campo">
                        <label for="evento-titulo">Título de la Actividad</label>
                        <input type="text" id="evento-titulo" name="titulo" placeholder="Ej. Examen Parcial / Entrega de Proyecto" required>
                    </div>
                    <div class="campo">
                        <label for="evento-fecha">Fecha</label>
                        <input type="date" id="evento-fecha" name="fecha" value="${U.hoyISO()}" required>
                    </div>
                    <div class="campo">
                        <label for="evento-categoria">Categoría</label>
                        <select id="evento-categoria" name="categoria">
                            <option value="examen">Examen / Evaluación</option>
                            <option value="tarea">Tarea escolar</option>
                            <option value="evento" selected>Evento institucional</option>
                            <option value="actividad">Actividad extracurricular</option>
                        </select>
                    </div>
                    <div class="campo campo--ancho">
                        <label for="evento-descripcion">Descripción / Detalles</label>
                        <input type="text" id="evento-descripcion" name="descripcion" placeholder="Agrega instrucciones o notas breves...">
                    </div>
                    <button type="submit" class="boton boton--primario">Guardar en Calendario</button>
                </form>
            </section>

            <section class="seccion-actividades">
                <h3>📋 Lista de Actividades y Eventos</h3>
                <div class="lista-actividades-grid">
                    ${listaActividades}
                </div>
            </section>`;
    }

    function vistaMaterias() {
        const persona = Auth.personaActual();
        const materias = Store.obtener('materias');
        const items = materias.map((materia) => `<article class="tarjeta"><h3>${U.escaparHTML(materia.nombre)}</h3><span class="insignia ${materia.id === persona.materiaId ? 'insignia--exito' : ''}">${materia.id === persona.materiaId ? 'Materia a cargo' : 'Materia del centro educativo'}</span></article>`).join('');
        return `<h2>Materias</h2><p>Materias disponibles en el centro educativo.</p><div class="cuadricula-materias">${items}</div>`;
    }

    function vistaTareasDocente() {
        const persona = Auth.personaActual();
        const tareas = Store.filtrar('tareas', (tarea) => tarea.cursoId === persona.cursoId).sort((a, b) => a.fechaEntrega.localeCompare(b.fechaEntrega));
        const items = tareas.map((tarea) => `<article class="tarjeta"><h3>${U.escaparHTML(tarea.titulo)}</h3><p>${U.escaparHTML(tarea.descripcion)}</p><p class="comunicado__fecha">Entrega: ${U.formatearFecha(tarea.fechaEntrega)}</p></article>`).join('') || '<p class="vacio">No hay tareas para tu clase.</p>';
        return `<h2>Tareas</h2><p>Actividades asignadas para tu clase.</p>${items}`;
    }

    function vistaNotas() {
        const persona = Auth.personaActual();
        const materias = Store.obtener('materias');
        const calificaciones = Store.filtrar('calificaciones', (c) => c.estudianteId === persona.id);
        const periodos = [1, 2, 3];

        let totalNotas = 0;
        let sumaNotas = 0;
        let materiasAprobadas = 0;

        const tarjetasMateriasHtml = materias.map((materia) => {
            const notasMateria = calificaciones.filter((c) => c.materiaId === materia.id);
            
            const periodosPildoras = periodos.map((periodo) => {
                const registro = notasMateria.find((c) => c.periodo === periodo);
                let badgeClass = 'nota-pildora--pendiente';
                let notaTexto = '—';
                if (registro) {
                    notaTexto = Number(registro.nota).toFixed(1);
                    sumaNotas += registro.nota;
                    totalNotas++;
                    badgeClass = registro.nota >= 6 ? 'nota-pildora--aprobado' : 'nota-pildora--reprobado';
                }
                return `
                    <div class="tarjeta-nota__periodo">
                        <span class="tarjeta-nota__periodo-etiqueta">${periodo}° Periodo</span>
                        <span class="nota-pildora ${badgeClass}">${notaTexto}</span>
                    </div>`;
            }).join('');

            const promedioMateriaNum = notasMateria.length
                ? U.redondear(notasMateria.reduce((total, c) => total + c.nota, 0) / notasMateria.length)
                : null;
            
            if (promedioMateriaNum !== null && promedioMateriaNum >= 6) {
                materiasAprobadas++;
            }

            const promedioDisplay = promedioMateriaNum !== null ? promedioMateriaNum.toFixed(2) : '—';
            const estadoMateriaClass = promedioMateriaNum !== null 
                ? (promedioMateriaNum >= 6 ? 'promedio-badge--exito' : 'promedio-badge--alerta')
                : 'promedio-badge--neutro';

            return `
                <div class="tarjeta tarjeta-materia-nota">
                    <div class="tarjeta-materia-nota__cabecera">
                        <div class="tarjeta-materia-nota__icono">📘</div>
                        <h3 class="tarjeta-materia-nota__titulo">${U.escaparHTML(materia.nombre)}</h3>
                    </div>
                    <div class="tarjeta-materia-nota__periodos">
                        ${periodosPildoras}
                    </div>
                    <div class="tarjeta-materia-nota__promedio-contenedor">
                        <span class="tarjeta-materia-nota__promedio-etiqueta">Promedio Materia</span>
                        <span class="promedio-badge ${estadoMateriaClass}">${promedioDisplay}</span>
                    </div>
                </div>`;
        }).join('');

        const promedioGeneral = totalNotas ? U.redondear(sumaNotas / totalNotas).toFixed(2) : '—';

        return `
            <h2>Mis Calificaciones Académicas</h2>
            <p>Resumen detallado de tus notas por materia y periodo académico.</p>

            <div class="resumen-notas-grid">
                <div class="tarjeta resumen-card resumen-card--promedio">
                    <span class="resumen-card__icono">📊</span>
                    <div class="resumen-card__datos">
                        <span class="resumen-card__titulo">Promedio General</span>
                        <span class="resumen-card__valor">${promedioGeneral}</span>
                    </div>
                </div>
                <div class="tarjeta resumen-card resumen-card--aprobadas">
                    <span class="resumen-card__icono">✅</span>
                    <div class="resumen-card__datos">
                        <span class="resumen-card__titulo">Materias Aprobadas</span>
                        <span class="resumen-card__valor">${materiasAprobadas} de ${materias.length}</span>
                    </div>
                </div>
                <div class="tarjeta resumen-card resumen-card--estado">
                    <span class="resumen-card__icono">🎓</span>
                    <div class="resumen-card__datos">
                        <span class="resumen-card__titulo">Estado Académico</span>
                        <span class="resumen-card__valor">${promedioGeneral !== '—' && Number(promedioGeneral) >= 6 ? 'Regular / Aprobado' : 'En seguimiento'}</span>
                    </div>
                </div>
            </div>

            <h3 class="subtitulo-seccion">Detalle por Materia</h3>
            <div class="cuadricula-notas-materias">
                ${tarjetasMateriasHtml}
            </div>`;
    }

    function vistaHorarios() {
        const persona = Auth.personaActual();
        const curso = Store.buscar('cursos', persona.cursoId);
        const horariosRaw = Store.filtrar('horarios', (h) => h.cursoId === persona.cursoId);
        const horarios = ordenarHorarios(horariosRaw);

        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        const columnasDiasHtml = dias.map((dia) => {
            const horariosDelDia = horarios.filter((h) => h.dia === dia)
                .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)); // Más pronto a más lejano

            const cubitosHtml = horariosDelDia.length ? horariosDelDia.map((h) => {
                const materia = Store.buscar('materias', h.materiaId);
                return `
                    <div class="cubito-horario">
                        <div class="cubito-horario__tiempo">
                            <span class="cubito-horario__icono">⏰</span>
                            <span>${h.horaInicio} - ${h.horaFin}</span>
                        </div>
                        <h4 class="cubito-horario__materia">${U.escaparHTML(materia ? materia.nombre : '—')}</h4>
                        <div class="cubito-horario__detalles">
                            <span class="cubito-horario__aula">📍 ${U.escaparHTML(h.aula)}</span>
                        </div>
                    </div>`;
            }).join('') : '<p class="cubito-horario--vacio">Sin clases este día</p>';

            return `
                <div class="columna-dia">
                    <div class="columna-dia__encabezado">
                        <h3>${dia}</h3>
                    </div>
                    <div class="columna-dia__cubitos">
                        ${cubitosHtml}
                    </div>
                </div>`;
        }).join('');

        return `
            <h2>Mi Horario Semanal</h2>
            <p>Curso: <strong>${U.escaparHTML(curso ? curso.nombre : '')}</strong> — Clases ordenadas de la hora más temprana a la más tardía.</p>

            <div class="cuadricula-horarios-cubitos">
                ${columnasDiasHtml}
            </div>`;
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
        vistaUsuarios,
        vistaCalendario,
        vistaMaterias,
        vistaTareasDocente,
        vistaNotas,
        vistaHorarios,
        vistaTareas
    };
})();
