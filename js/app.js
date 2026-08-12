(function () {
    'use strict';

    const U = window.IntranetEscolar.Utilidades;
    const Store = window.IntranetEscolar.Store;
    const Auth = window.IntranetEscolar.Auth;
    const Vistas = window.IntranetEscolar.Vistas;

    const MENU = {
        administracion: [
            { vista: 'tablon', etiqueta: 'Tablón' },
            { vista: 'personas', etiqueta: 'Personas' },
            { vista: 'comunicados', etiqueta: 'Comunicados' }
        ],
        docente: [
            { vista: 'tablon', etiqueta: 'Tablón' },
            { vista: 'calificaciones', etiqueta: 'Calificaciones' },
            { vista: 'asistencia', etiqueta: 'Asistencia' },
            { vista: 'aulas', etiqueta: 'Aulas y horarios' }
        ],
        estudiante: [
            { vista: 'tablon', etiqueta: 'Tablón' },
            { vista: 'notas', etiqueta: 'Mis notas' },
            { vista: 'horarios', etiqueta: 'Mi horario' },
            { vista: 'tareas', etiqueta: 'Tareas' }
        ]
    };

    const estado = {
        vistaActual: 'tablon',
        filtroTablon: 'todos',
        periodoCalificaciones: 2,
        fechaAsistencia: null
    };

    const elLogin = document.getElementById('vista-login');
    const elApp = document.getElementById('vista-app');
    const contenido = document.getElementById('contenido');

    let temporizadorEstado = null;

    function notificar(mensaje, esError = false) {
        const elemento = document.getElementById('estado-sistema');
        elemento.textContent = mensaje;
        elemento.classList.toggle('alerta--error', esError);
        elemento.classList.toggle('alerta--exito', !esError);
        elemento.hidden = false;
        clearTimeout(temporizadorEstado);
        temporizadorEstado = setTimeout(() => { elemento.hidden = true; }, 6000);
    }

    function mostrarErrorForm(form, mensaje) {
        let alerta = form.querySelector('.error-form');
        if (!alerta) {
            alerta = document.createElement('p');
            alerta.className = 'alerta alerta--error error-form';
            alerta.setAttribute('role', 'alert');
            form.insertBefore(alerta, form.firstChild);
        }
        alerta.textContent = mensaje;
    }

    function construirLoginAyuda() {
        const personas = Store.obtener('personas');
        const lista = document.getElementById('lista-ayuda');
        lista.innerHTML = personas.map((persona) => `
            <li>
                <strong>${U.escaparHTML(persona.usuario)}</strong>
                (${Vistas.ROLES[persona.rol]}) — clave
                ${persona.rol === 'administracion' ? 'admin123' : '1234'}
            </li>`).join('');
    }

    function mostrarLogin() {
        Auth.cerrarSesion();
        elApp.hidden = true;
        elLogin.hidden = false;
        document.getElementById('login-usuario').focus();
    }

    function construirMenu(persona) {
        const ul = document.getElementById('menu');
        ul.innerHTML = (MENU[persona.rol] || []).map((item) => `
            <li>
                <a href="#${item.vista}" data-vista="${item.vista}"
                   ${item.vista === estado.vistaActual ? 'aria-current="page"' : ''}>${item.etiqueta}</a>
            </li>`).join('');
    }

    function alternarCamposCondicionales(rol) {
        document.querySelectorAll('[data-condicion]').forEach((campo) => {
            const condiciones = campo.dataset.condicion.split(' ');
            campo.hidden = !condiciones.includes(rol);
        });
        if (rol === 'docente' || rol === 'estudiante') {
            const etiqueta = document.getElementById('persona-curso-label');
            if (etiqueta) {
                etiqueta.textContent = rol === 'docente' ? 'Curso a cargo' : 'Curso';
            }
        }
    }

    function cambiarVista(nombre) {
        const persona = Auth.personaActual();
        if (!persona) {
            mostrarLogin();
            return;
        }

        const permitidas = (MENU[persona.rol] || []).map((item) => item.vista);
        if (!permitidas.includes(nombre)) {
            nombre = permitidas[0] || 'tablon';
        }

        estado.vistaActual = nombre;
        document.getElementById('cabecera-nombre').textContent = persona.nombre;
        construirMenu(persona);

        const renderizador = {
            tablon: () => Vistas.vistaTablon(estado.filtroTablon),
            personas: Vistas.vistaPersonas,
            comunicados: Vistas.vistaComunicados,
            calificaciones: () => Vistas.vistaCalificaciones(estado.periodoCalificaciones),
            asistencia: () => Vistas.vistaAsistencia(estado.fechaAsistencia),
            aulas: Vistas.vistaAulas,
            notas: Vistas.vistaNotas,
            horarios: Vistas.vistaHorarios,
            tareas: Vistas.vistaTareas
        }[nombre];

        contenido.innerHTML = renderizador ? renderizador() : '';

        if (window.location.hash !== '#' + nombre) {
            history.replaceState(null, '', '#' + nombre);
        }
        window.scrollTo({ top: 0 });
    }

    function ingresar(persona) {
        elLogin.hidden = true;
        elApp.hidden = false;
        document.getElementById('cabecera-rol').textContent = Vistas.ROLES[persona.rol];
        cambiarVista('tablon');
    }

    /* ------------------------------------------------------------
       Acciones: personas (admin)
       ------------------------------------------------------------ */

    function editarPersona(id) {
        const persona = Store.buscar('personas', id);
        if (!persona) return;

        const form = document.querySelector('[data-form="persona"]');
        form.querySelector('[name="id"]').value = persona.id;
        form.querySelector('[name="nombre"]').value = persona.nombre;
        form.querySelector('[name="rol"]').value = persona.rol;
        form.querySelector('[name="usuario"]').value = persona.usuario;
        form.querySelector('[name="clave"]').value = '';
        form.querySelector('[name="clave"]').required = false;
        form.querySelector('[name="cursoId"]').value = persona.cursoId || '';
        form.querySelector('[name="materiaId"]').value = persona.materiaId || '';
        form.querySelector('[data-accion="persona-cancelar"]').hidden = false;

        const titulo = document.getElementById('titulo-form-persona');
        if (titulo) titulo.textContent = 'Editar persona';

        alternarCamposCondicionales(persona.rol);
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        form.querySelector('[name="nombre"]').focus();
    }

    function guardarPersona(form) {
        const datosFormulario = new FormData(form);
        const id = String(datosFormulario.get('id') || '');
        const nombre = String(datosFormulario.get('nombre') || '').trim();
        const rol = datosFormulario.get('rol');
        const usuario = String(datosFormulario.get('usuario') || '').trim();
        const clave = String(datosFormulario.get('clave') || '');
        const esEdicion = Boolean(id);

        if (!nombre || !usuario) {
            mostrarErrorForm(form, 'El nombre y el usuario son obligatorios.');
            return;
        }
        if (!esEdicion && !clave) {
            mostrarErrorForm(form, 'La contraseña es obligatoria para nuevas personas.');
            return;
        }
        if (clave && clave.length < 4) {
            mostrarErrorForm(form, 'La contraseña debe tener al menos 4 caracteres.');
            return;
        }
        const duplicado = Store.filtrar('personas',
            (p) => U.normalizarTexto(p.usuario) === U.normalizarTexto(usuario) && p.id !== id)[0];
        if (duplicado) {
            mostrarErrorForm(form, 'Ya existe una persona registrada con ese usuario.');
            return;
        }

        const datos = { nombre, rol, usuario };
        if (clave) {
            datos.clave = U.codificarClave(clave);
        }
        if (rol === 'estudiante') {
            datos.cursoId = String(datosFormulario.get('cursoId') || '');
            datos.materiaId = null;
        } else if (rol === 'docente') {
            datos.cursoId = String(datosFormulario.get('cursoId') || '');
            datos.materiaId = String(datosFormulario.get('materiaId') || '');
        } else {
            datos.cursoId = null;
            datos.materiaId = null;
        }

        let resultado;
        if (esEdicion) {
            resultado = Store.actualizar('personas', id, datos);
        } else {
            resultado = Boolean(Store.insertar('personas', datos));
        }

        if (!resultado) {
            mostrarErrorForm(form, 'No se pudieron guardar los datos (almacenamiento lleno).');
            return;
        }

        notificar(esEdicion ? 'Persona actualizada.' : 'Persona registrada.');
        cambiarVista('personas');
    }

    function eliminarPersona(id) {
        const persona = Store.buscar('personas', id);
        if (!persona) return;
        if (!window.confirm(`¿Eliminar a ${persona.nombre}? Esta acción no se puede deshacer.`)) return;

        const eliminada = Store.eliminar('personas', id);
        notificar(eliminada ? 'Persona eliminada.' : 'No se pudo eliminar (almacenamiento lleno).', !eliminada);
        cambiarVista('personas');
    }

    /* ------------------------------------------------------------
       Acciones: comunicados (admin)
       ------------------------------------------------------------ */

    function editarComunicado(id) {
        const comunicado = Store.buscar('comunicados', id);
        if (!comunicado) return;

        const form = document.querySelector('[data-form="comunicado"]');
        form.querySelector('[name="id"]').value = comunicado.id;
        form.querySelector('[name="titulo"]').value = comunicado.titulo;
        form.querySelector('[name="contenido"]').value = comunicado.contenido;
        form.querySelector('[name="destinatario"]').value = comunicado.destinatario;
        form.querySelector('[data-accion="comunicado-cancelar"]').hidden = false;

        const titulo = document.getElementById('titulo-form-comunicado');
        if (titulo) titulo.textContent = 'Editar comunicado';

        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        form.querySelector('[name="titulo"]').focus();
    }

    function guardarComunicado(form) {
        const datosFormulario = new FormData(form);
        const id = String(datosFormulario.get('id') || '');
        const titulo = String(datosFormulario.get('titulo') || '').trim();
        const contenido = String(datosFormulario.get('contenido') || '').trim();
        const destinatario = datosFormulario.get('destinatario');

        if (!titulo || !contenido) {
            mostrarErrorForm(form, 'El título y el contenido son obligatorios.');
            return;
        }

        const datos = { titulo, contenido, destinatario };
        let resultado;
        if (id) {
            resultado = Store.actualizar('comunicados', id, datos);
        } else {
            resultado = Boolean(Store.insertar('comunicados', { ...datos, fecha: U.hoyISO() }));
        }

        if (!resultado) {
            mostrarErrorForm(form, 'No se pudo guardar el comunicado (almacenamiento lleno).');
            return;
        }

        notificar(id ? 'Comunicado actualizado.' : 'Comunicado publicado.');
        cambiarVista('comunicados');
    }

    function eliminarComunicado(id) {
        const comunicado = Store.buscar('comunicados', id);
        if (!comunicado) return;
        if (!window.confirm(`¿Eliminar el comunicado "${comunicado.titulo}"?`)) return;

        const eliminado = Store.eliminar('comunicados', id);
        notificar(eliminado ? 'Comunicado eliminado.' : 'No se pudo eliminar (almacenamiento lleno).', !eliminado);
        cambiarVista('comunicados');
    }

    function cancelarEdicion(tipo) {
        const form = document.querySelector(`[data-form="${tipo}"]`);
        if (!form) return;
        form.reset();
        form.querySelector('[name="id"]').value = '';

        const cancelar = form.querySelector('[data-accion$="cancelar"]');
        if (cancelar) cancelar.hidden = true;

        if (tipo === 'persona') {
            form.querySelector('[name="clave"]').required = true;
            alternarCamposCondicionales('administracion');
            const titulo = document.getElementById('titulo-form-persona');
            if (titulo) titulo.textContent = 'Nueva persona';
        } else {
            const titulo = document.getElementById('titulo-form-comunicado');
            if (titulo) titulo.textContent = 'Nuevo comunicado';
        }
    }

    /* ------------------------------------------------------------
       Acciones: calificaciones y asistencia (docente)
       ------------------------------------------------------------ */

    function guardarCalificaciones(form) {
        const persona = Auth.personaActual();
        const datosFormulario = new FormData(form);
        const periodo = Number(datosFormulario.get('periodo'));
        let guardadas = 0;
        let invalidas = 0;

        for (const [nombre, valor] of datosFormulario.entries()) {
            if (!nombre.startsWith('nota_')) continue;

            const estudianteId = nombre.slice(5);
            const texto = String(valor).trim();
            const existente = Store.filtrar('calificaciones',
                (c) => c.estudianteId === estudianteId && c.materiaId === persona.materiaId && c.periodo === periodo)[0];

            if (texto === '') {
                if (existente) {
                    Store.eliminar('calificaciones', existente.id);
                    guardadas++;
                }
                continue;
            }

            const nota = Number(texto);
            if (Number.isNaN(nota) || nota < 1 || nota > 10) {
                invalidas++;
                continue;
            }

            if (existente) {
                Store.actualizar('calificaciones', existente.id, { nota });
            } else {
                Store.insertar('calificaciones', { estudianteId, materiaId: persona.materiaId, periodo, nota });
            }
            guardadas++;
        }

        const mensaje = invalidas
            ? `Calificaciones guardadas (${invalidas} con valores inválidos omitidas).`
            : `Calificaciones del ${periodo}° periodo guardadas.`;
        notificar(mensaje, invalidas > 0);
        cambiarVista('calificaciones');
    }

    function guardarAsistencia(form) {
        const persona = Auth.personaActual();
        const datosFormulario = new FormData(form);
        const fecha = String(datosFormulario.get('fecha') || '');

        if (!fecha) {
            mostrarErrorForm(form, 'Seleccione una fecha válida.');
            return;
        }

        const registros = [];
        for (const [nombre, valor] of datosFormulario.entries()) {
            if (nombre.startsWith('asistencia_')) {
                registros.push({ estudianteId: nombre.slice(11), estado: valor });
            }
        }

        const existente = Store.filtrar('asistencias',
            (a) => a.cursoId === persona.cursoId && a.fecha === fecha)[0];

        const resultado = existente
            ? Store.actualizar('asistencias', existente.id, { registros })
            : Boolean(Store.insertar('asistencias', { cursoId: persona.cursoId, fecha, registros }));

        if (!resultado) {
            mostrarErrorForm(form, 'No se pudo guardar la asistencia (almacenamiento lleno).');
            return;
        }

        notificar(`Asistencia del ${U.formatearFecha(fecha)} guardada.`);
        cambiarVista('asistencia');
    }

    /* ------------------------------------------------------------
       Eventos
       ------------------------------------------------------------ */

    document.getElementById('form-login').addEventListener('submit', (evento) => {
        evento.preventDefault();
        const error = document.getElementById('login-error');
        const resultado = Auth.iniciarSesion(
            document.getElementById('login-usuario').value,
            document.getElementById('login-clave').value
        );

        if (!resultado.ok) {
            error.textContent = resultado.mensaje;
            error.hidden = false;
            return;
        }
        error.hidden = true;
        ingresar(resultado.persona);
    });

    document.getElementById('boton-salir').addEventListener('click', () => {
        Auth.cerrarSesion();
        history.replaceState(null, '', window.location.pathname);
        mostrarLogin();
    });

    contenido.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-accion]');
        if (!boton) return;

        switch (boton.dataset.accion) {
            case 'tablon-filtrar':
                estado.filtroTablon = boton.dataset.filtro;
                cambiarVista('tablon');
                break;
            case 'persona-editar':
                editarPersona(boton.dataset.id);
                break;
            case 'persona-eliminar':
                eliminarPersona(boton.dataset.id);
                break;
            case 'persona-cancelar':
                cancelarEdicion('persona');
                break;
            case 'comunicado-editar':
                editarComunicado(boton.dataset.id);
                break;
            case 'comunicado-eliminar':
                eliminarComunicado(boton.dataset.id);
                break;
            case 'comunicado-cancelar':
                cancelarEdicion('comunicado');
                break;
        }
    });

    contenido.addEventListener('submit', (evento) => {
        const form = evento.target.closest('[data-form]');
        if (!form) return;
        evento.preventDefault();

        switch (form.dataset.form) {
            case 'persona':
                guardarPersona(form);
                break;
            case 'comunicado':
                guardarComunicado(form);
                break;
            case 'calificaciones':
                guardarCalificaciones(form);
                break;
            case 'asistencia':
                guardarAsistencia(form);
                break;
        }
    });

    contenido.addEventListener('change', (evento) => {
        if (evento.target.matches('#persona-rol')) {
            alternarCamposCondicionales(evento.target.value);
            return;
        }
        if (evento.target.matches('#calificaciones-periodo')) {
            estado.periodoCalificaciones = Number(evento.target.value);
            cambiarVista('calificaciones');
            return;
        }
        if (evento.target.matches('#asistencia-fecha')) {
            estado.fechaAsistencia = evento.target.value;
            cambiarVista('asistencia');
        }
    });

    window.addEventListener('hashchange', () => {
        if (!Auth.personaActual()) return;
        cambiarVista(window.location.hash.slice(1) || 'tablon');
    });

    /* ------------------------------------------------------------
       Arranque
       ------------------------------------------------------------ */

    function iniciar() {
        Store.cargar();
        construirLoginAyuda();

        const persona = Auth.personaActual();
        if (persona) {
            ingresar(persona);
        } else {
            mostrarLogin();
        }
    }

    document.addEventListener('DOMContentLoaded', iniciar);
})();
