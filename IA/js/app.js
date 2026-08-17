(function () {
    'use strict';

    const U = window.IntranetEscolar.Utilidades;
    const Store = window.IntranetEscolar.Store;
    const Auth = window.IntranetEscolar.Auth;
    const Vistas = window.IntranetEscolar.Vistas;

    const MENU = {
        docente: [
            { vista: 'tablon', etiqueta: 'Tablón' },
            { vista: 'calificaciones', etiqueta: 'Calificaciones' },
            { vista: 'asistencia', etiqueta: 'Asistencia' },
            { vista: 'aulas', etiqueta: 'Aulas y horarios' },
            { vista: 'usuarios', etiqueta: 'Usuarios' },
            { vista: 'calendario', etiqueta: 'Calendario' },
            { vista: 'materias', etiqueta: 'Materias' },
            { vista: 'tareas-docente', etiqueta: 'Tareas' }
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
        fechaAsistencia: null,
        ordenUsuarios: 'rol',
        filtroRolUsuarios: 'todos',
        filtroCursoUsuarios: 'todos',
        busquedaUsuarios: ''
    };

    const elLogin = document.getElementById('vista-login');
    const elApp = document.getElementById('vista-app');
    const contenido = document.getElementById('contenido');

    const FORMAS_DINAMICAS = [
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M4 5h8v14H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M20 5h-8v14h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 10.18V15h2V9L12 3zM7 15.91V13.1L12 15.5l5-2.4v2.81L12 18.3l-5-2.39z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="3" y="8" width="18" height="8" rx="2"/><path d="M6 8v3M10 8v5M14 8v3M18 8v5"/></svg>',
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.5 6.8L12 17l-6.1 3.3 1.5-6.8L2.2 8.9l6.9-.6L12 2z"/></svg>',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h6v4H9z"/></svg>'
    ];

    function crearFondoDinamico(contenedor, cantidad) {
        if (!contenedor) return;
        for (let i = 0; i < cantidad; i++) {
            const figura = document.createElement('span');
            figura.className = 'fondo-dinamico__forma';
            figura.setAttribute('aria-hidden', 'true');
            figura.innerHTML = FORMAS_DINAMICAS[i % FORMAS_DINAMICAS.length];
            figura.style.left = `${Math.floor(Math.random() * 96)}%`;
            figura.style.top = `${Math.floor(Math.random() * 92)}%`;
            figura.style.fontSize = `${24 + Math.floor(Math.random() * 44)}px`;
            figura.style.opacity = String(0.08 + Math.random() * 0.16);
            figura.style.animationDuration = `${14 + Math.random() * 14}s`;
            figura.style.animationDelay = `${-Math.random() * 20}s`;
            contenedor.appendChild(figura);
        }
    }

    function actualizarCabecera() {
        const ahora = new Date();
        const hora = ahora.getHours();
        const saludo = hora < 12 ? 'Buenos días' : (hora < 19 ? 'Buenas tardes' : 'Buenas noches');
        const elSaludo = document.getElementById('cabecera-saludo');
        const elFecha = document.getElementById('cabecera-fecha');
        if (elSaludo) elSaludo.textContent = saludo;
        if (elFecha) {
            elFecha.textContent = ahora.toLocaleDateString('es-AR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });
        }
    }

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

    function mostrarLogin() {
        Auth.cerrarSesion();
        elApp.hidden = true;
        elLogin.hidden = false;
        document.getElementById('login-docente-usuario').focus();
    }

    function construirMenu(persona) {
        const ul = document.getElementById('menu');
        ul.innerHTML = (MENU[persona.rol] || []).map((item) => `
            <li>
                <a href="#${item.vista}" data-vista="${item.vista}"
                   ${item.vista === estado.vistaActual ? 'aria-current="page"' : ''}>${item.etiqueta}</a>
            </li>`).join('');
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
            calificaciones: () => Vistas.vistaCalificaciones(estado.periodoCalificaciones),
            asistencia: () => Vistas.vistaAsistencia(estado.fechaAsistencia),
            aulas: Vistas.vistaAulas,
            usuarios: () => Vistas.vistaUsuarios(
                estado.ordenUsuarios,
                estado.filtroRolUsuarios,
                estado.filtroCursoUsuarios,
                estado.busquedaUsuarios
            ),
            calendario: Vistas.vistaCalendario,
            materias: Vistas.vistaMaterias,
            'tareas-docente': Vistas.vistaTareasDocente,
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
        actualizarCabecera();
        cambiarVista('tablon');
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

    function guardarUsuario(form) {
        const personaActual = Auth.personaActual();
        if (!personaActual || personaActual.rol !== 'docente') return;
        const datos = new FormData(form);
        const id = String(datos.get('id') || '');
        const nombre = String(datos.get('nombre') || '').trim();
        const usuario = String(datos.get('usuario') || '').trim();
        const cursoId = String(datos.get('cursoId') || '');
        const clave = String(datos.get('clave') || '');
        const persona = Store.buscar('personas', id);

        if (!persona || !nombre || !usuario) {
            mostrarErrorForm(form, 'Nombre y usuario son obligatorios.');
            return;
        }
        const duplicado = Store.filtrar('personas', (p) => p.id !== id && U.normalizarTexto(p.usuario) === U.normalizarTexto(usuario))[0];
        if (duplicado) {
            mostrarErrorForm(form, 'Ese usuario ya está en uso.');
            return;
        }
        if (clave && clave.length < 4) {
            mostrarErrorForm(form, 'La contraseña debe tener al menos 4 caracteres.');
            return;
        }
        const cambios = { nombre, usuario, cursoId: cursoId || null };
        if (clave) cambios.clave = U.codificarClave(clave);
        if (!Store.actualizar('personas', id, cambios)) {
            mostrarErrorForm(form, 'No se pudo guardar el cambio.');
            return;
        }
        notificar('Usuario actualizado.');
        cambiarVista('usuarios');
    }

    function guardarNuevoUsuario(form) {
        const personaActual = Auth.personaActual();
        if (!personaActual || personaActual.rol !== 'docente') return;
        const datos = new FormData(form);
        const nombre = String(datos.get('nombre') || '').trim();
        const usuario = String(datos.get('usuario') || '').trim();
        const rol = String(datos.get('rol') || 'estudiante');
        const cursoId = String(datos.get('cursoId') || '');
        const clave = String(datos.get('clave') || '').trim();

        if (!nombre || !usuario || !clave) {
            mostrarErrorForm(form, 'Por favor completa todos los campos obligatorios.');
            return;
        }

        if (clave.length < 4) {
            mostrarErrorForm(form, 'La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        const duplicado = Store.filtrar('personas', (p) => U.normalizarTexto(p.usuario) === U.normalizarTexto(usuario))[0];
        if (duplicado) {
            mostrarErrorForm(form, 'El nombre de usuario ya existe. Elige otro.');
            return;
        }

        const nuevo = Store.insertar('personas', {
            nombre,
            usuario,
            rol,
            clave: U.codificarClave(clave),
            cursoId: cursoId || null,
            creadoEn: U.fechaDesdeHoy(0)
        });

        if (!nuevo) {
            mostrarErrorForm(form, 'No se pudo guardar el usuario.');
            return;
        }

        notificar(`Usuario "${nombre}" (@${usuario}) creado correctamente.`);
        cambiarVista('usuarios');
    }

    function eliminarUsuario(id) {
        const personaActual = Auth.personaActual();
        if (!personaActual || personaActual.rol !== 'docente') return;
        const personaAEliminar = Store.buscar('personas', id);
        if (!personaAEliminar) return;

        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${personaAEliminar.nombre}" (@${personaAEliminar.usuario})?`)) {
            return;
        }

        const esMismoUsuario = personaActual.id === id;
        Store.eliminar('personas', id);

        if (esMismoUsuario) {
            Auth.cerrarSesion();
            mostrarLogin();
            return;
        }

        notificar(`Usuario "${personaAEliminar.nombre}" eliminado.`);
        cambiarVista('usuarios');
    }

    function guardarEvento(form) {
        const datos = new FormData(form);
        const titulo = String(datos.get('titulo') || '').trim();
        const fecha = String(datos.get('fecha') || '');
        const categoria = String(datos.get('categoria') || 'evento');
        const descripcion = String(datos.get('descripcion') || '').trim();

        if (!titulo || !fecha) {
            mostrarErrorForm(form, 'Indique el título y la fecha de la actividad.');
            return;
        }
        if (!Store.insertar('eventos', { titulo, fecha, categoria, descripcion })) {
            mostrarErrorForm(form, 'No se pudo guardar el evento.');
            return;
        }
        notificar(`Actividad "${titulo}" agregada al calendario.`);
        cambiarVista('calendario');
    }

    /* ------------------------------------------------------------
       Eventos
       ------------------------------------------------------------ */

    document.querySelectorAll('[data-form-login]').forEach((formulario) => {
        formulario.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const error = formulario.querySelector('.login-error');
            const datos = new FormData(formulario);
            const resultado = Auth.iniciarSesion(
                String(datos.get('usuario') || ''),
                String(datos.get('clave') || ''),
                formulario.dataset.formLogin
            );
            if (!resultado.ok) {
                error.textContent = resultado.mensaje;
                error.hidden = false;
                return;
            }
            error.hidden = true;
            ingresar(resultado.persona);
        });
    });

    const botonSalir = document.getElementById('boton-salir');
    if (botonSalir) {
        botonSalir.addEventListener('click', () => {
            Auth.cerrarSesion();
            history.replaceState(null, '', window.location.pathname);
            mostrarLogin();
        });
    }

    const botonSalirLateral = document.getElementById('boton-salir-lateral');
    if (botonSalirLateral) {
        botonSalirLateral.addEventListener('click', () => {
            Auth.cerrarSesion();
            history.replaceState(null, '', window.location.pathname);
            mostrarLogin();
        });
    }

    const interruptorTema = document.getElementById('interruptor-tema');
    if (interruptorTema) {
        interruptorTema.addEventListener('click', () => {
            const oscuro = document.body.classList.toggle('tema-oscuro');
            interruptorTema.setAttribute('aria-pressed', String(oscuro));
            interruptorTema.textContent = oscuro ? 'Modo claro' : 'Modo oscuro';
            try {
                localStorage.setItem('intranet_tema', oscuro ? 'oscuro' : 'claro');
            } catch (e) {
                // Ignorar errores de localStorage deshabilitado
            }
        });
    }

    contenido.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-accion]');
        if (!boton) return;

        switch (boton.dataset.accion) {
            case 'tablon-filtrar':
                estado.filtroTablon = boton.dataset.filtro;
                cambiarVista('tablon');
                break;
            case 'eliminar-usuario': {
                const id = boton.dataset.id;
                eliminarUsuario(id);
                break;
            }
            case 'evento-eliminar':
            case 'eliminar-actividad': {
                const id = boton.dataset.id;
                const tipo = boton.dataset.tipo;
                if (tipo === 'tarea') {
                    Store.eliminar('tareas', id);
                } else {
                    Store.eliminar('eventos', id);
                }
                notificar('Actividad eliminada.');
                cambiarVista('calendario');
                break;
            }
        }
    });

    contenido.addEventListener('submit', (evento) => {
        const form = evento.target.closest('[data-form]');
        if (!form) return;
        evento.preventDefault();

        switch (form.dataset.form) {
            case 'calificaciones':
                guardarCalificaciones(form);
                break;
            case 'asistencia':
                guardarAsistencia(form);
                break;
            case 'usuario':
                guardarUsuario(form);
                break;
            case 'nuevo-usuario':
                guardarNuevoUsuario(form);
                break;
            case 'evento':
                guardarEvento(form);
                break;
        }
    });

    contenido.addEventListener('change', (evento) => {
        if (evento.target.matches('#calificaciones-periodo')) {
            estado.periodoCalificaciones = Number(evento.target.value);
            cambiarVista('calificaciones');
            return;
        }
        if (evento.target.matches('#asistencia-fecha')) {
            estado.fechaAsistencia = evento.target.value;
            cambiarVista('asistencia');
        }
        if (evento.target.matches('#usuarios-orden')) {
            estado.ordenUsuarios = evento.target.value;
            cambiarVista('usuarios');
        }
        if (evento.target.matches('#usuarios-filtro-rol')) {
            estado.filtroRolUsuarios = evento.target.value;
            cambiarVista('usuarios');
        }
        if (evento.target.matches('#usuarios-filtro-curso')) {
            estado.filtroCursoUsuarios = evento.target.value;
            cambiarVista('usuarios');
        }
    });

    contenido.addEventListener('input', (evento) => {
        if (evento.target.matches('#usuarios-busqueda')) {
            estado.busquedaUsuarios = evento.target.value;
            cambiarVista('usuarios');
            const input = document.getElementById('usuarios-busqueda');
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
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
        try {
            if (localStorage.getItem('intranet_tema') === 'oscuro') {
                document.body.classList.add('tema-oscuro');
                document.getElementById('interruptor-tema').setAttribute('aria-pressed', 'true');
                document.getElementById('interruptor-tema').textContent = 'Modo claro';
            }
        } catch (e) {
            // Ignorar si localStorage está bloqueado o deshabilitado
        }

        crearFondoDinamico(document.querySelector('#vista-login .fondo-dinamico'), 10);
        crearFondoDinamico(document.querySelector('#vista-app .fondo-dinamico'), 12);

        document.addEventListener('pointermove', (evento) => {
            document.documentElement.style.setProperty('--cursor-x', `${(evento.clientX / window.innerWidth) * 100}%`);
            document.documentElement.style.setProperty('--cursor-y', `${(evento.clientY / window.innerHeight) * 100}%`);
        }, { passive: true });

        const persona = Auth.personaActual();
        if (persona) {
            ingresar(persona);
        } else {
            mostrarLogin();
        }
    }

    document.addEventListener('DOMContentLoaded', iniciar);
    setInterval(actualizarCabecera, 60000);
})();
