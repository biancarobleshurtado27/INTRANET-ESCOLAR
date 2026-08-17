(function () {
    'use strict';

    const U = window.IntranetEscolar.Utilidades;
    const CLAVE_DATOS = 'intranet_escolar_datos';

    const ENTIDADES = [
        'personas',
        'cursos',
        'materias',
        'comunicados',
        'calificaciones',
        'asistencias',
        'horarios',
        'tareas',
        'eventos'
    ];

    const datos = {
        personas: [],
        cursos: [],
        materias: [],
        comunicados: [],
        calificaciones: [],
        asistencias: [],
        horarios: [],
        tareas: [],
        eventos: []
    };

    function guardar() {
        try {
            localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
            return true;
        } catch (error) {
            return false;
        }
    }

    function slugificarUsuario(nombre) {
        return U.normalizarTexto(nombre)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '.');
    }

    function sembrarDatos() {
        const cursos = ['1° A', '2° A', '3° A'].map((nombre) => ({
            id: U.generarId('curso'),
            nombre
        }));

        const materias = ['Matemáticas', 'Lengua', 'Ciencias Naturales', 'Historia', 'Inglés']
            .map((nombre) => ({ id: U.generarId('materia'), nombre }));

        const estudiantes = [
            ['Sofía Martínez', cursos[1].id],
            ['Juan Gómez', cursos[1].id],
            ['Lucía Fernández', cursos[1].id],
            ['Mateo Silva', cursos[1].id],
            ['Camila Rodríguez', cursos[1].id],
            ['Agustín Herrera', cursos[0].id],
            ['Valentina Castro', cursos[0].id],
            ['Thiago Núñez', cursos[0].id],
            ['Emma Suárez', cursos[0].id],
            ['Bruno López', cursos[2].id],
            ['Milagros Ríos', cursos[2].id],
            ['Santiago Medina', cursos[2].id]
        ].map(([nombre, cursoId]) => ({
            id: U.generarId('persona'),
            nombre,
            rol: 'estudiante',
            usuario: slugificarUsuario(nombre),
            clave: U.codificarClave('1234'),
            cursoId,
            creadoEn: U.fechaDesdeHoy(-Math.floor(Math.random() * 45))
        }));

        const personas = [
            {
                id: U.generarId('persona'),
                nombre: 'Administrador Docente',
                rol: 'docente',
                usuario: 'admin',
                clave: U.codificarClave('1234'),
                materiaId: materias[0].id,
                cursoId: cursos[1].id,
                creadoEn: U.fechaDesdeHoy(-60)
            },
            {
                id: U.generarId('persona'),
                nombre: 'Bianca Robles',
                rol: 'estudiante',
                usuario: 'bianca',
                clave: U.codificarClave('1234'),
                cursoId: cursos[1].id,
                creadoEn: U.fechaDesdeHoy(-45)
            },
            {
                id: U.generarId('persona'),
                nombre: 'Laura Pérez',
                rol: 'docente',
                usuario: 'laura.perez',
                clave: U.codificarClave('1234'),
                materiaId: materias[0].id,
                cursoId: cursos[1].id,
                creadoEn: U.fechaDesdeHoy(-55)
            },
            {
                id: U.generarId('persona'),
                nombre: 'Martín Gómez',
                rol: 'docente',
                usuario: 'martin.gomez',
                clave: U.codificarClave('1234'),
                materiaId: materias[1].id,
                cursoId: cursos[0].id,
                creadoEn: U.fechaDesdeHoy(-50)
            },
            ...estudiantes
        ];

        const comunicados = [
            {
                id: U.generarId('comunicado'),
                titulo: 'Bienvenida al ciclo lectivo',
                contenido: 'Les damos la bienvenida a todas las familias. Les recordamos que el calendario completo estará disponible en la cartelera.',
                destinatario: 'todos',
                fecha: U.fechaDesdeHoy(-10)
            },
            {
                id: U.generarId('comunicado'),
                titulo: 'Reunión de padres de 2° A',
                contenido: 'El próximo viernes a las 18:00 hs se realizará la reunión informativa del primer trimestre en el salón de actos.',
                destinatario: 'estudiantes',
                fecha: U.fechaDesdeHoy(-4)
            },
            {
                id: U.generarId('comunicado'),
                titulo: 'Capacitación docente',
                contenido: 'Se convoca al equipo docente a la capacitación de nuevas herramientas pedagógicas el miércoles en el aula de informática.',
                destinatario: 'docentes',
                fecha: U.fechaDesdeHoy(-2)
            }
        ];

        const calificaciones = [];
        estudiantes.forEach((estudiante) => {
            materias.forEach((materia) => {
                [1, 2].forEach((periodo) => {
                    calificaciones.push({
                        id: U.generarId('calificacion'),
                        estudianteId: estudiante.id,
                        materiaId: materia.id,
                        periodo,
                        nota: Math.floor(6 + Math.random() * 5)
                    });
                });
            });
        });

        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const bloques = [
            { inicio: '08:00', fin: '08:40' },
            { inicio: '08:50', fin: '09:30' },
            { inicio: '09:40', fin: '10:20' },
            { inicio: '10:40', fin: '11:20' }
        ];
        const aulas = ['Aula 101', 'Aula 102', 'Aula 103', 'Laboratorio'];

        const horarios = [];
        cursos.forEach((curso, indiceCurso) => {
            dias.forEach((dia, indiceDia) => {
                bloques.forEach((bloque, indiceBloque) => {
                    const materia = materias[(indiceCurso + indiceDia + indiceBloque) % materias.length];
                    horarios.push({
                        id: U.generarId('horario'),
                        cursoId: curso.id,
                        materiaId: materia.id,
                        dia,
                        horaInicio: bloque.inicio,
                        horaFin: bloque.fin,
                        aula: aulas[(indiceDia + indiceBloque) % aulas.length]
                    });
                });
            });
        });

        const asistencias = [];
        cursos.forEach((curso) => {
            [-1, -2, -3].forEach((diasAtras) => {
                const estados = ['presente', 'presente', 'presente', 'ausente', 'tarde'];
                asistencias.push({
                    id: U.generarId('asistencia'),
                    cursoId: curso.id,
                    fecha: U.fechaDesdeHoy(diasAtras),
                    registros: estudiantes
                        .filter((e) => e.cursoId === curso.id)
                        .map((estudiante) => ({
                            estudianteId: estudiante.id,
                            estado: estados[Math.floor(Math.random() * estados.length)]
                        }))
                });
            });
        });

        const tareas = [];
        cursos.forEach((curso, indiceCurso) => {
            tareas.push(
                {
                    id: U.generarId('tarea'),
                    cursoId: curso.id,
                    materiaId: materias[indiceCurso % materias.length].id,
                    titulo: 'Trabajo práctico: investigación',
                    descripcion: 'Elegir un tema de la unidad y preparar una exposición breve para la clase.',
                    fechaEntrega: U.fechaDesdeHoy(5)
                },
                {
                    id: U.generarId('tarea'),
                    cursoId: curso.id,
                    materiaId: materias[(indiceCurso + 1) % materias.length].id,
                    titulo: 'Ejercitación de la semana',
                    descripcion: 'Resolver los ejercicios del módulo 3 en la carpeta, mostrando el desarrollo completo.',
                    fechaEntrega: U.fechaDesdeHoy(9)
                }
            );
        });

        datos.personas = personas;
        datos.cursos = cursos;
        datos.materias = materias;
        datos.comunicados = comunicados;
        datos.calificaciones = calificaciones;
        datos.asistencias = asistencias;
        datos.horarios = horarios;
        datos.tareas = tareas;
        datos.eventos = [];

        guardar();
    }

    function cargar() {
        let almacenado = null;
        try {
            almacenado = JSON.parse(localStorage.getItem(CLAVE_DATOS));
        } catch (error) {
            almacenado = null;
        }

        if (almacenado && typeof almacenado === 'object') {
            ENTIDADES.forEach((entidad) => {
                datos[entidad] = Array.isArray(almacenado[entidad]) ? almacenado[entidad] : [];
            });
            datos.personas = datos.personas.filter((persona) => persona.rol === 'docente' || persona.rol === 'estudiante');
            
            const tieneAdmin = datos.personas.some((p) => U.normalizarTexto(p.usuario) === 'admin');
            if (!tieneAdmin) {
                datos.personas.unshift({
                    id: U.generarId('persona'),
                    nombre: 'Administrador Docente',
                    rol: 'docente',
                    usuario: 'admin',
                    clave: U.codificarClave('1234'),
                    materiaId: (datos.materias[0] && datos.materias[0].id) || null,
                    cursoId: (datos.cursos[1] && datos.cursos[1].id) || null,
                    creadoEn: U.fechaDesdeHoy(-60)
                });
            }

            const tieneBianca = datos.personas.some((p) => U.normalizarTexto(p.usuario) === 'bianca');
            if (!tieneBianca) {
                datos.personas.push({
                    id: U.generarId('persona'),
                    nombre: 'Bianca Robles',
                    rol: 'estudiante',
                    usuario: 'bianca',
                    clave: U.codificarClave('1234'),
                    cursoId: (datos.cursos[1] && datos.cursos[1].id) || null,
                    creadoEn: U.fechaDesdeHoy(-45)
                });
            }

            guardar();
        } else {
            sembrarDatos();
        }
    }

    const Store = {
        cargar,

        obtener(entidad) {
            return datos[entidad];
        },

        buscar(entidad, id) {
            return datos[entidad].find((registro) => registro.id === id) || null;
        },

        filtrar(entidad, criterio) {
            return datos[entidad].filter(criterio);
        },

        insertar(entidad, registro) {
            const nuevo = { id: U.generarId(entidad), ...registro };
            datos[entidad].push(nuevo);
            if (guardar()) {
                return nuevo;
            }
            datos[entidad].pop();
            return null;
        },

        actualizar(entidad, id, cambios) {
            const registro = this.buscar(entidad, id);
            if (!registro) {
                return false;
            }
            Object.assign(registro, cambios);
            if (guardar()) {
                return true;
            }
            Object.keys(cambios).forEach((clave) => delete registro[clave]);
            return false;
        },

        eliminar(entidad, id) {
            const indice = datos[entidad].findIndex((registro) => registro.id === id);
            if (indice === -1) {
                return false;
            }
            datos[entidad].splice(indice, 1);
            if (guardar()) {
                return true;
            }
            return false;
        },

        restablecer() {
            sembrarDatos();
        }
    };

    window.IntranetEscolar = window.IntranetEscolar || {};
    window.IntranetEscolar.Store = Store;
})();
